import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { R2_PUBLIC_URL } from '../../config/r2';
import { getCache, setCache } from '../../config/redis';
import { createError } from '../../middleware/error.middleware';

// ============================================
// GET /api/categories (Public categories / zona list)
// Menampilkan 4 zona fauna dan total fauna masing-masing zona
// ============================================
export const getPublicCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cacheKey = 'public_categories_list';
    const cached = await getCache(cacheKey);
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    const rows = await pool.query(
      `SELECT c.id, c.name, c.slug, c.description, c.icon,
              COUNT(a.id) AS total_animals
       FROM categories c
       LEFT JOIN animals a ON a.category_id = c.id
       GROUP BY c.id
       ORDER BY c.id ASC`
    );

    const formattedData = (rows as any[]).map((cat) => ({
      ...cat,
      total_animals: Number(cat.total_animals || 0),
    }));

    const responsePayload = {
      success: true,
      data: formattedData,
    };

    await setCache(cacheKey, responsePayload, 600); // cache 10 menit

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET /api/categories/:identifier (Public category detail by ID or Slug)
// ============================================
export const getPublicCategoryByIdOrSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const query = isNumeric
      ? 'SELECT * FROM categories WHERE id = ?'
      : 'SELECT * FROM categories WHERE slug = ?';

    const rows = await pool.query(query, [identifier]);
    const category = rows[0];

    if (!category) {
      return next(createError('Kategori atau zona fauna tidak ditemukan.', 404));
    }

    // Ambil daftar fauna di zona ini
    const animalsRows = await pool.query(
      `SELECT id, name, scientific_name, conservation_status, image_key, description
       FROM animals
       WHERE category_id = ?
       ORDER BY created_at DESC`,
      [category.id]
    );

    const animals = (animalsRows as any[]).map((animal) => ({
      ...animal,
      image_url: animal.image_key
        ? `${R2_PUBLIC_URL}/${animal.image_key}`
        : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...category,
        total_animals: animals.length,
        animals,
      },
    });
  } catch (error) {
    next(error);
  }
};
