import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { recordAdminAction } from '../logs/logs.service';
import { bumpCacheVersion } from '../../config/redis';
import { R2_PUBLIC_URL } from '../../config/r2';

const formatHighlight = (row: any) => ({
  id: row.highlight_id ?? row.id,
  animal_id: row.animal_id,
  animal: {
    id: row.animal_id,
    name: row.animal_name,
    scientific_name: row.scientific_name,
    image_url: row.image_key ? `${R2_PUBLIC_URL}/${row.image_key}` : null,
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
    },
  },
  location: row.location,
  is_active: Boolean(row.is_active),
  priority: Number(row.priority),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const highlightSelect = `
  SELECT h.id AS highlight_id, h.animal_id, h.location, h.is_active, h.priority,
         h.created_at, h.updated_at, a.name AS animal_name,
         a.scientific_name, a.image_key, c.id AS category_id,
         c.name AS category_name, c.slug AS category_slug
  FROM animal_highlights h
  INNER JOIN animals a ON a.id = h.animal_id
  LEFT JOIN categories c ON c.id = a.category_id`;

const ensureLocationExists = async (location: string): Promise<void> => {
  if (location === 'landing') return;

  const category = await pool.query('SELECT id FROM categories WHERE slug = ?', [location]);
  if (!category[0]) {
    throw createError('Zona/kategori untuk lokasi highlight tidak ditemukan.', 404);
  }
};

const ensureAnimalExists = async (animalId: number): Promise<void> => {
  const animal = await pool.query('SELECT id FROM animals WHERE id = ?', [animalId]);
  if (!animal[0]) throw createError('Satwa tidak ditemukan.', 404);
};

export const getAdminHighlights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
    const where = location ? ' WHERE h.location = ?' : '';
    const rows = await pool.query(`${highlightSelect}${where} ORDER BY h.location ASC, h.priority ASC, h.created_at DESC`, location ? [location] : []);

    res.status(200).json({
      success: true,
      data: (rows as any[]).map(formatHighlight),
    });
  } catch (error) {
    next(error);
  }
};

export const createHighlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const animalId = Number(req.body.animal_id);
    const location = String(req.body.location).trim();
    const isActive = req.body.is_active === undefined ? 1 : (req.body.is_active ? 1 : 0);
    const priority = req.body.priority === undefined ? 0 : Number(req.body.priority);

    await ensureAnimalExists(animalId);
    await ensureLocationExists(location);

    const duplicate = await pool.query(
      'SELECT id FROM animal_highlights WHERE animal_id = ? AND location = ?',
      [animalId, location]
    );
    if (duplicate[0]) throw createError('Satwa tersebut sudah menjadi highlight di lokasi ini.', 409);

    const result = await pool.query(
      `INSERT INTO animal_highlights (animal_id, location, is_active, priority)
       VALUES (?, ?, ?, ?)`,
      [animalId, location, isActive, priority]
    );
    const rows = await pool.query(`${highlightSelect} WHERE h.id = ?`, [result.insertId]);

    await recordAdminAction(req, {
      action: 'CREATE_ANIMAL_HIGHLIGHT',
      resource_type: 'animal_highlight',
      resource_id: result.insertId,
      payload: { animal_id: animalId, location, is_active: Boolean(isActive), priority },
      after: formatHighlight(rows[0]),
    });
    await bumpCacheVersion();

    res.status(201).json({
      success: true,
      message: 'Highlight satwa berhasil dibuat.',
      data: formatHighlight(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

export const updateHighlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const existingRows = await pool.query(`${highlightSelect} WHERE h.id = ?`, [id]);
    if (!existingRows[0]) throw createError('Highlight satwa tidak ditemukan.', 404);

    const existing = existingRows[0];
    const animalId = req.body.animal_id === undefined ? Number(existing.animal_id) : Number(req.body.animal_id);
    const location = req.body.location === undefined ? existing.location : String(req.body.location).trim();
    const isActive = req.body.is_active === undefined ? Number(existing.is_active) : (req.body.is_active ? 1 : 0);
    const priority = req.body.priority === undefined ? Number(existing.priority) : Number(req.body.priority);

    await ensureAnimalExists(animalId);
    await ensureLocationExists(location);

    const duplicate = await pool.query(
      'SELECT id FROM animal_highlights WHERE animal_id = ? AND location = ? AND id != ?',
      [animalId, location, id]
    );
    if (duplicate[0]) throw createError('Satwa tersebut sudah menjadi highlight di lokasi ini.', 409);

    await pool.query(
      `UPDATE animal_highlights
       SET animal_id = ?, location = ?, is_active = ?, priority = ?, updated_at = NOW()
       WHERE id = ?`,
      [animalId, location, isActive, priority, id]
    );
    const updatedRows = await pool.query(`${highlightSelect} WHERE h.id = ?`, [id]);

    await recordAdminAction(req, {
      action: 'UPDATE_ANIMAL_HIGHLIGHT',
      resource_type: 'animal_highlight',
      resource_id: id,
      before: formatHighlight(existing),
      after: formatHighlight(updatedRows[0]),
    });
    await bumpCacheVersion();

    res.status(200).json({
      success: true,
      message: 'Highlight satwa berhasil diperbarui.',
      data: formatHighlight(updatedRows[0]),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHighlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const rows = await pool.query(`${highlightSelect} WHERE h.id = ?`, [id]);
    if (!rows[0]) throw createError('Highlight satwa tidak ditemukan.', 404);

    await pool.query('DELETE FROM animal_highlights WHERE id = ?', [id]);
    await recordAdminAction(req, {
      action: 'DELETE_ANIMAL_HIGHLIGHT',
      resource_type: 'animal_highlight',
      resource_id: id,
      before: formatHighlight(rows[0]),
    });
    await bumpCacheVersion();

    res.status(200).json({ success: true, message: 'Highlight satwa berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};
