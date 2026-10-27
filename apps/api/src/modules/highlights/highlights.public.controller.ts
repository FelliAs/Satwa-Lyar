import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { R2_PUBLIC_URL } from '../../config/r2';
import { getCache, getCacheVersion, setCache } from '../../config/redis';
import { createError } from '../../middleware/error.middleware';

export const getPublicHighlights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const location = String(req.query.location || '').trim();
    const cacheKey = `v${await getCacheVersion()}:public_highlights_${location}`;
    const cached = await getCache<{ success: boolean; data: unknown[] }>(cacheKey);

    if (cached) {
      res.status(200).json(cached);
      return;
    }

    const rows = await pool.query(
      `SELECT h.id AS highlight_id, h.location, h.is_active, h.priority,
              a.id, a.name, a.scientific_name, a.description,
              a.conservation_status, a.image_key,
              c.id AS category_id, c.name AS category_name,
              c.slug AS category_slug, c.icon AS category_icon
       FROM animal_highlights h
       INNER JOIN animals a ON a.id = h.animal_id
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE h.location = ? AND h.is_active = 1
       ORDER BY h.priority ASC, h.created_at DESC`,
      [location]
    );

    const data = (rows as any[]).map((row) => ({
      highlight_id: row.highlight_id,
      location: row.location,
      priority: Number(row.priority),
      id: row.id,
      name: row.name,
      scientific_name: row.scientific_name,
      description: row.description,
      conservation_status: row.conservation_status,
      image_key: row.image_key,
      image_url: row.image_key ? `${R2_PUBLIC_URL}/${row.image_key}` : null,
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        icon: row.category_icon,
      },
    }));

    const responsePayload = { success: true, data };
    await setCache(cacheKey, responsePayload, 180);
    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

export const validatePublicHighlightLocation = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const location = String(req.query.location || '').trim();
  if (location !== 'landing' && !/^[a-z0-9-]+$/.test(location)) {
    next(createError('Lokasi highlight tidak valid.', 422));
    return;
  }
  next();
};
