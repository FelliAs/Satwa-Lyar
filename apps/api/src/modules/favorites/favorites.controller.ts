import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { R2_PUBLIC_URL } from '../../config/r2';
import { createError } from '../../middleware/error.middleware';

// ============================================
// GET /api/favorites (User favorite fauna list)
// ============================================
export const getUserFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    // Total favorit user
    const countResult = await pool.query(
      'SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?',
      [userId]
    );
    const total = Number(countResult[0]?.total || 0);

    // Ambil daftar fauna yang difavoritkan
    const rows = await pool.query(
      `SELECT f.id AS favorite_id, f.created_at AS favorited_at,
              a.id, a.name, a.scientific_name, a.description,
              a.conservation_status, a.image_key,
              c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
       FROM favorites f
       JOIN animals a ON a.id = f.animal_id
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const formattedData = (rows as any[]).map((row) => ({
      favorite_id: row.favorite_id,
      favorited_at: row.favorited_at,
      animal: {
        id: row.id,
        name: row.name,
        scientific_name: row.scientific_name,
        description: row.description,
        conservation_status: row.conservation_status,
        category: {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          icon: row.category_icon,
        },
        image_key: row.image_key,
        image_url: row.image_key ? `${R2_PUBLIC_URL}/${row.image_key}` : null,
      },
      is_favorite: true,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// POST /api/favorites/:animalId atau POST /api/favorites (body: { animal_id })
// Tambah fauna ke daftar favorit user
// ============================================
export const addFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const animalId = Number(req.params.animalId || req.body.animal_id);

    if (!animalId || isNaN(animalId)) {
      return next(createError('ID fauna tidak valid.', 400));
    }

    // Pastikan fauna ada
    const animalExists = await pool.query(
      'SELECT id, name FROM animals WHERE id = ?',
      [animalId]
    );

    if (!animalExists[0]) {
      return next(createError('Fauna tidak ditemukan.', 404));
    }

    // Cek apakah sudah pernah difavoritkan
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND animal_id = ?',
      [userId, animalId]
    );

    if (existing[0]) {
      res.status(200).json({
        success: true,
        message: 'Fauna sudah ada di dalam daftar favorit Anda.',
        is_favorite: true,
      });
      return;
    }

    // Insert ke tabel favorites
    await pool.query(
      'INSERT INTO favorites (user_id, animal_id, created_at) VALUES (?, ?, NOW())',
      [userId, animalId]
    );

    res.status(201).json({
      success: true,
      message: `Fauna '${animalExists[0].name}' berhasil ditambahkan ke favorit.`,
      is_favorite: true,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// DELETE /api/favorites/:animalId
// Hapus fauna dari daftar favorit user
// ============================================
export const removeFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const animalId = Number(req.params.animalId);

    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND animal_id = ?',
      [userId, animalId]
    );

    if (result.affectedRows === 0) {
      return next(createError('Fauna tidak ada dalam daftar favorit Anda.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Fauna berhasil dihapus dari daftar favorit.',
      is_favorite: false,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET /api/favorites/check/:animalId
// Cek status apakah fauna difavoritkan user
// ============================================
export const checkFavoriteStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const animalId = Number(req.params.animalId);

    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND animal_id = ?',
      [userId, animalId]
    );

    res.status(200).json({
      success: true,
      animal_id: animalId,
      is_favorite: Boolean(existing[0]),
    });
  } catch (error) {
    next(error);
  }
};
