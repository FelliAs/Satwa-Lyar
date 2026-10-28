import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { R2_PUBLIC_URL } from '../../config/r2';
import { createError } from '../../middleware/error.middleware';

const LOCATIONS = ['landing-page', 'air-tawar', 'burung', 'farmhouse', 'reptil', 'serangga'] as const;

export const getHighlights = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const animals = await pool.query(`SELECT a.id, a.name, a.scientific_name, a.image_key,
      c.name AS category_name FROM animals a LEFT JOIN categories c ON c.id = a.category_id ORDER BY a.name ASC`);
    const highlights = await pool.query(`SELECT h.id, h.animal_id, h.location, h.is_active, h.priority,
      h.created_at, h.updated_at FROM animal_highlights h ORDER BY h.location ASC, h.priority ASC, h.id ASC`);
    const data = (animals as any[]).map((animal) => ({
      ...animal,
      image_url: animal.image_key ? `${R2_PUBLIC_URL}/${animal.image_key}` : null,
      highlights: (highlights as any[])
        .filter((item) => Number(item.animal_id) === Number(animal.id))
        .map((item) => ({ ...item, is_active: Boolean(item.is_active) })),
    }));
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const createHighlight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { animal_id, location, is_active = true, priority = 0 } = req.body;
    if (!Number.isInteger(Number(animal_id))) return next(createError('animal_id wajib berupa angka.', 400));
    if (!LOCATIONS.includes(location)) return next(createError('Lokasi highlight tidak valid.', 400));
    if (!Number.isInteger(Number(priority))) return next(createError('Priority wajib berupa angka bulat.', 400));
    const animals = await pool.query('SELECT id FROM animals WHERE id = ?', [Number(animal_id)]);
    if (!animals[0]) return next(createError('Satwa tidak ditemukan.', 404));
    const duplicate = await pool.query('SELECT id FROM animal_highlights WHERE animal_id = ? AND location = ?', [Number(animal_id), location]);
    if (duplicate[0]) return next(createError('Satwa sudah memiliki highlight pada lokasi tersebut.', 409));
    const result = await pool.query('INSERT INTO animal_highlights (animal_id, location, is_active, priority) VALUES (?, ?, ?, ?)', [Number(animal_id), location, is_active ? 1 : 0, Number(priority)]);
    const rows = await pool.query(`SELECT h.*, a.name AS animal_name, a.image_key, c.name AS category_name FROM animal_highlights h JOIN animals a ON a.id = h.animal_id LEFT JOIN categories c ON c.id = a.category_id WHERE h.id = ?`, [result.insertId]);
    const row = rows[0];
    res.status(201).json({ success: true, message: 'Highlight berhasil ditambahkan.', data: { ...row, is_active: Boolean(row.is_active), image_url: row.image_key ? `${R2_PUBLIC_URL}/${row.image_key}` : null } });
  } catch (error: any) {
    if (error?.errno === 1062) return next(createError('Satwa sudah memiliki highlight pada lokasi tersebut.', 409));
    next(error);
  }
};

export const updateHighlight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM animal_highlights WHERE id = ?', [id]);
    if (!existing[0]) return next(createError('Highlight tidak ditemukan.', 404));
    const animalId = req.body.animal_id === undefined ? existing[0].animal_id : Number(req.body.animal_id);
    const location = req.body.location === undefined ? existing[0].location : req.body.location;
    const isActive = req.body.is_active === undefined ? Boolean(existing[0].is_active) : Boolean(req.body.is_active);
    const priority = req.body.priority === undefined ? Number(existing[0].priority) : Number(req.body.priority);
    if (!Number.isInteger(animalId)) return next(createError('animal_id wajib berupa angka.', 400));
    if (!LOCATIONS.includes(location)) return next(createError('Lokasi highlight tidak valid.', 400));
    if (!Number.isInteger(priority)) return next(createError('Priority wajib berupa angka bulat.', 400));
    const animals = await pool.query('SELECT id FROM animals WHERE id = ?', [animalId]);
    if (!animals[0]) return next(createError('Satwa tidak ditemukan.', 404));
    const duplicate = await pool.query('SELECT id FROM animal_highlights WHERE animal_id = ? AND location = ? AND id <> ?', [animalId, location, Number(id)]);
    if (duplicate[0]) return next(createError('Satwa sudah memiliki highlight pada lokasi tersebut.', 409));
    await pool.query('UPDATE animal_highlights SET animal_id = ?, location = ?, is_active = ?, priority = ? WHERE id = ?', [animalId, location, isActive ? 1 : 0, priority, Number(id)]);
    const rows = await pool.query(`SELECT h.*, a.name AS animal_name, a.image_key, c.name AS category_name FROM animal_highlights h JOIN animals a ON a.id = h.animal_id LEFT JOIN categories c ON c.id = a.category_id WHERE h.id = ?`, [Number(id)]);
    const row = rows[0];
    res.status(200).json({ success: true, message: 'Konfigurasi highlight berhasil diperbarui.', data: { ...row, is_active: Boolean(row.is_active), image_url: row.image_key ? `${R2_PUBLIC_URL}/${row.image_key}` : null } });
  } catch (error: any) {
    if (error?.errno === 1062) return next(createError('Satwa sudah memiliki highlight pada lokasi tersebut.', 409));
    next(error);
  }
};

export const deleteHighlight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await pool.query('DELETE FROM animal_highlights WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return next(createError('Highlight tidak ditemukan.', 404));
    res.status(200).json({ success: true, message: 'Highlight berhasil dihapus.' });
  } catch (error) { next(error); }
};
