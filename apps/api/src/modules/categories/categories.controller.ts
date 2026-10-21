import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { recordAdminAction } from '../../modules/logs/logs.service';
import { bumpCacheVersion } from '../../config/redis';

// ========================
// GET /api/admin/categories
// ========================
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rows = await pool.query(
      `SELECT c.id, c.name, c.slug, c.description, c.icon,
              COUNT(a.id) AS total_animals, c.created_at
       FROM categories c
       LEFT JOIN animals a ON a.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// GET /api/admin/categories/:id
// ========================
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const rows = await pool.query(
      `SELECT id, name, slug, description, icon, created_at, updated_at
       FROM categories WHERE id = ?`,
      [id]
    );

    if (!rows[0]) {
      return next(createError('Kategori tidak ditemukan.', 404));
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// POST /api/admin/categories
// ========================
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, description, icon } = req.body;

    // Cek apakah slug sudah ada
    const existing = await pool.query(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    );
    if (existing[0]) {
      return next(createError('Slug sudah digunakan. Gunakan slug lain.', 409));
    }

    const result = await pool.query(
      `INSERT INTO categories (name, slug, description, icon)
       VALUES (?, ?, ?, ?)`,
      [name, slug, description || null, icon || null]
    );

    const newCategory = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    await recordAdminAction(req, {
      action: 'CREATE_CATEGORY',
      resource_type: 'category',
      resource_id: result.insertId,
      payload: { name, slug, icon: icon || null },
      after: {
        id: Number(result.insertId),
        name,
        slug,
        description: description || null,
        icon: icon || null,
      },
    });

    // Kategori baru -> invalidasi cache zona fauna
    await bumpCacheVersion();

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat.',
      data: newCategory[0],
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// PUT /api/admin/categories/:id
// ========================
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon } = req.body;

    // Cek apakah kategori ada
    const existing = await pool.query(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );
    if (!existing[0]) {
      return next(createError('Kategori tidak ditemukan.', 404));
    }

    // Cek slug tidak dipakai kategori lain
    if (slug) {
      const slugCheck = await pool.query(
        'SELECT id FROM categories WHERE slug = ? AND id != ?',
        [slug, id]
      );
      if (slugCheck[0]) {
        return next(createError('Slug sudah digunakan kategori lain.', 409));
      }
    }

    await pool.query(
      `UPDATE categories
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           description = COALESCE(?, description),
           icon = COALESCE(?, icon),
           updated_at = NOW()
       WHERE id = ?`,
      [name, slug, description, icon, id]
    );

    const updated = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    await recordAdminAction(req, {
      action: 'UPDATE_CATEGORY',
      resource_type: 'category',
      resource_id: id,
      payload: {
        ...(name !== undefined ? { name } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(icon !== undefined ? { icon } : {}),
      },
      before: {
        name: existing[0].name,
        slug: existing[0].slug,
        description: existing[0].description,
        icon: existing[0].icon,
      },
      after: {
        name: updated[0]?.name,
        slug: updated[0]?.slug,
        description: updated[0]?.description,
        icon: updated[0]?.icon,
      },
    });

    // Kategori berubah -> invalidasi cache zona fauna
    await bumpCacheVersion();

    res.status(200).json({
      success: true,
      message: 'Kategori berhasil diperbarui.',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// DELETE /api/admin/categories/:id
// ========================
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await pool.query(
      'SELECT id, name, slug, description, icon FROM categories WHERE id = ?',
      [id]
    );

    if (!existing[0]) {
      return next(createError('Kategori tidak ditemukan.', 404));
    }

    // Cek apakah ada fauna yang menggunakan kategori ini
    const animalCheck = await pool.query(
      'SELECT COUNT(*) AS total FROM animals WHERE category_id = ?',
      [id]
    );
    if (animalCheck[0].total > 0) {
      return next(
        createError(
          `Tidak dapat menghapus kategori. Masih ada ${animalCheck[0].total} fauna yang menggunakan kategori ini.`,
          400
        )
      );
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    await recordAdminAction(req, {
      action: 'DELETE_CATEGORY',
      resource_type: 'category',
      resource_id: id,
      before: {
        name: existing[0].name,
        slug: existing[0].slug,
        description: existing[0].description,
        icon: existing[0].icon,
      },
    });

    // Kategori dihapus -> invalidasi cache zona fauna
    await bumpCacheVersion();

    res.status(200).json({
      success: true,
      message: 'Kategori berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
