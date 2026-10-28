import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { R2_PUBLIC_URL } from '../../config/r2';
import { getCache, setCache, getCacheVersion } from '../../config/redis';
import { createError } from '../../middleware/error.middleware';

// ============================================
// GET /api/animals (Public fauna list)
// Mendukung search, filter zona/kategori, pagination, status konservasi
// ============================================
export const getPublicAnimals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    const search = (req.query.search as string)?.trim();
    const categoryId = req.query.category_id ? Number(req.query.category_id) : undefined;
    const categorySlug = (req.query.zone || req.query.category) as string;
    const conservationStatus = (req.query.status || req.query.conservation_status) as string;
    const sort = (req.query.sort as string) || 'newest';

    const userId = req.user?.id;

    // Cache key hanya untuk request default (tanpa filter pencarian).
    // limit & sort ikut masuk key agar hasil cache tidak pernah berbeda
    // dengan hasil query database. Versi cache memastikan data basi
    // (setelah ada perubahan dari admin) tidak pernah dipakai.
    const cacheVersion = await getCacheVersion();
    const cacheKey =
      !search && !conservationStatus && !categoryId && !categorySlug && page === 1
        ? `v${cacheVersion}:public_animals_p1_limit_${limit}_sort_${sort}`
        : null;

    let cachedPayload: { data: any[]; pagination: any } | null = null;
    if (cacheKey) {
      cachedPayload = await getCache<{ data: any[]; pagination: any }>(cacheKey);
    }

    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];

    // Filter Search
    if (search) {
      whereClause += ' AND (a.name LIKE ? OR a.scientific_name LIKE ? OR a.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filter Kategori by ID
    if (categoryId) {
      whereClause += ' AND a.category_id = ?';
      params.push(categoryId);
    }

    // Filter Kategori by Slug (contoh: air-tawar, serangga, reptil, burung)
    if (categorySlug) {
      whereClause += ' AND c.slug = ?';
      params.push(categorySlug);
    }

    // Filter Status Konservasi
    if (conservationStatus) {
      whereClause += ' AND a.conservation_status = ?';
      params.push(conservationStatus.toUpperCase());
    }

    // Order By
    let orderBy = 'a.created_at DESC';
    if (sort === 'oldest') {
      orderBy = 'a.created_at ASC';
    } else if (sort === 'name_asc') {
      orderBy = 'a.name ASC';
    } else if (sort === 'name_desc') {
      orderBy = 'a.name DESC';
    }

    let formattedData: any[] = [];
    let pagination = {
      total: 0,
      page,
      limit,
      total_pages: 1,
    };

    if (cachedPayload) {
      formattedData = cachedPayload.data || [];
      pagination = cachedPayload.pagination || pagination;
    } else {
      // Hitung total data
      const countSql = `
        SELECT COUNT(*) AS total
        FROM animals a
        LEFT JOIN categories c ON c.id = a.category_id
        ${whereClause}
      `;
      const countResult = await pool.query(countSql, params);
      const total = Number(countResult[0]?.total || 0);

      const dataSql = `
        SELECT a.id, a.name, a.scientific_name, a.description,
               a.conservation_status, a.image_key, a.created_at,
               c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
        FROM animals a
        LEFT JOIN categories c ON c.id = a.category_id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `;

      const rows = await pool.query(dataSql, [...params, limit, offset]);

      formattedData = (rows as any[]).map((animal) => ({
        id: animal.id,
        name: animal.name,
        scientific_name: animal.scientific_name,
        description: animal.description,
        conservation_status: animal.conservation_status,
        category: {
          id: animal.category_id,
          name: animal.category_name,
          slug: animal.category_slug,
          icon: animal.category_icon,
        },
        image_key: animal.image_key,
        image_url: animal.image_key ? `${R2_PUBLIC_URL}/${animal.image_key}` : null,
        is_favorite: false,
        created_at: animal.created_at,
      }));

      pagination = {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit) || 1,
      };

      // Simpan ke cache (tanpa status favorit, karena itu per identitas)
      if (cacheKey) {
        await setCache(cacheKey, { data: formattedData, pagination }, 180); // cache 3 menit
      }
    }

    // Status favorit diambil terpisah agar hasil cache tetap bisa dipakai
    if (userId && formattedData.length > 0) {
      const animalIds = formattedData.map((animal) => animal.id);
      const favRows = await pool.query(
        `SELECT animal_id FROM favorites
         WHERE user_id = ? AND animal_id IN (${animalIds.map(() => '?').join(', ')})`,
        [userId, ...animalIds]
      );

      const favoriteIds = new Set((favRows as any[]).map((row) => Number(row.animal_id)));
      formattedData = formattedData.map((animal) => ({
        ...animal,
        is_favorite: favoriteIds.has(Number(animal.id)),
      }));
    }

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET /api/animals/:id (Public fauna detail)
// Detail lengkap fauna beserta status favorit dan rekomendasi satwa sejenis
// ============================================
export const getPublicAnimalById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const rows = await pool.query(
      `SELECT a.*,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon, c.description AS category_description
       FROM animals a
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.id = ?`,
      [id]
    );

    const animal = rows[0];
    if (!animal) {
      return next(createError('Data satwa tidak ditemukan.', 404));
    }

    // Cek status favorit jika user sedang login
    let isFavorite = false;
    if (userId) {
      const favCheck = await pool.query(
        'SELECT id FROM favorites WHERE user_id = ? AND animal_id = ?',
        [userId, id]
      );
      isFavorite = Boolean(favCheck[0]);
    }

    // Rekomendasi satwa lain di kategori/zona yang sama
    const relatedRows = await pool.query(
      `SELECT a.id, a.name, a.scientific_name, a.image_key, a.conservation_status
       FROM animals a
       WHERE a.category_id = ? AND a.id != ?
       ORDER BY RAND()
       LIMIT 4`,
      [animal.category_id, id]
    );

    const relatedAnimals = (relatedRows as any[]).map((rel) => ({
      id: rel.id,
      name: rel.name,
      scientific_name: rel.scientific_name,
      conservation_status: rel.conservation_status,
      image_url: rel.image_key ? `${R2_PUBLIC_URL}/${rel.image_key}` : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        id: animal.id,
        name: animal.name,
        scientific_name: animal.scientific_name,
        description: animal.description,
        physical_traits: animal.physical_traits,
        habitat: animal.habitat,
        food: animal.food,
        conservation_status: animal.conservation_status,
        image_key: animal.image_key,
        image_url: animal.image_key
          ? `${R2_PUBLIC_URL}/${animal.image_key}`
          : null,
        category: {
          id: animal.category_id,
          name: animal.category_name,
          slug: animal.category_slug,
          icon: animal.category_icon,
          description: animal.category_description,
        },
        is_favorite: isFavorite,
        related_animals: relatedAnimals,
        created_at: animal.created_at,
        updated_at: animal.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};
