import { Request, Response, NextFunction } from 'express';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database';
import r2Client, { R2_BUCKET_NAME, R2_PUBLIC_URL } from '../../config/r2';
import { createError } from '../../middleware/error.middleware';

// ========================
// GET /api/admin/animals
// ========================
export const getAllAnimals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const categoryId = req.query.category_id as string;

    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (search) {
      whereClause += ' AND (a.name LIKE ? OR a.scientific_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      whereClause += ' AND a.category_id = ?';
      params.push(categoryId);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM animals a ${whereClause}`,
      params
    );

    const rows = await pool.query(
      `SELECT a.id, a.name, a.scientific_name, a.conservation_status,
              a.image_key, a.created_at,
              c.id AS category_id, c.name AS category_name
       FROM animals a
       LEFT JOIN categories c ON c.id = a.category_id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = Number(countResult[0].total);

    // Tambahkan URL publik gambar
    const data = (rows as any[]).map((animal) => ({
      ...animal,
      image_url: animal.image_key
        ? `${R2_PUBLIC_URL}/${animal.image_key}`
        : null,
    }));

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// GET /api/admin/animals/:id
// ========================
export const getAnimalById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const rows = await pool.query(
      `SELECT a.*, c.name AS category_name
       FROM animals a
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.id = ?`,
      [id]
    );

    if (!rows[0]) {
      return next(createError('Fauna tidak ditemukan.', 404));
    }

    const animal = {
      ...rows[0],
      image_url: rows[0].image_key
        ? `${R2_PUBLIC_URL}/${rows[0].image_key}`
        : null,
    };

    res.status(200).json({
      success: true,
      data: animal,
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// POST /api/admin/animals
// ========================
export const createAnimal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category_id,
      name,
      scientific_name,
      description,
      physical_traits,
      habitat,
      food,
      conservation_status,
    } = req.body;

    // Validasi category ada
    const catCheck = await pool.query(
      'SELECT id FROM categories WHERE id = ?',
      [category_id]
    );
    if (!catCheck[0]) {
      return next(createError('Kategori tidak ditemukan.', 404));
    }

    let image_key: string | null = null;

    // Upload gambar ke R2 jika ada file
    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      image_key = `fauna/${uuidv4()}.${ext}`;

      await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: image_key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
    }

    const result = await pool.query(
      `INSERT INTO animals
         (category_id, name, scientific_name, description, physical_traits,
          habitat, food, conservation_status, image_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        scientific_name || null,
        description || null,
        physical_traits || null,
        habitat || null,
        food || null,
        conservation_status || null,
        image_key,
      ]
    );

    const newAnimal = await pool.query(
      `SELECT a.*, c.name AS category_name
       FROM animals a LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Fauna berhasil ditambahkan.',
      data: {
        ...newAnimal[0],
        image_url: image_key ? `${R2_PUBLIC_URL}/${image_key}` : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// PUT /api/admin/animals/:id
// ========================
export const updateAnimal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      scientific_name,
      description,
      physical_traits,
      habitat,
      food,
      conservation_status,
    } = req.body;

    // Ambil data animal lama
    const existing = await pool.query(
      'SELECT * FROM animals WHERE id = ?',
      [id]
    );
    if (!existing[0]) {
      return next(createError('Fauna tidak ditemukan.', 404));
    }

    let image_key = existing[0].image_key;

    // Jika ada file baru, upload ke R2 & hapus yang lama
    if (req.file) {
      // Hapus gambar lama dari R2
      if (image_key) {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: image_key,
          })
        );
      }

      // Upload gambar baru
      const ext = req.file.originalname.split('.').pop();
      image_key = `fauna/${uuidv4()}.${ext}`;

      await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: image_key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
    }

    await pool.query(
      `UPDATE animals SET
         category_id = COALESCE(?, category_id),
         name = COALESCE(?, name),
         scientific_name = COALESCE(?, scientific_name),
         description = COALESCE(?, description),
         physical_traits = COALESCE(?, physical_traits),
         habitat = COALESCE(?, habitat),
         food = COALESCE(?, food),
         conservation_status = COALESCE(?, conservation_status),
         image_key = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [
        category_id,
        name,
        scientific_name,
        description,
        physical_traits,
        habitat,
        food,
        conservation_status,
        image_key,
        id,
      ]
    );

    const updated = await pool.query(
      `SELECT a.*, c.name AS category_name
       FROM animals a LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Fauna berhasil diperbarui.',
      data: {
        ...updated[0],
        image_url: image_key ? `${R2_PUBLIC_URL}/${image_key}` : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// DELETE /api/admin/animals/:id
// ========================
export const deleteAnimal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT * FROM animals WHERE id = ?',
      [id]
    );
    if (!existing[0]) {
      return next(createError('Fauna tidak ditemukan.', 404));
    }

    // Hapus gambar dari R2 jika ada
    if (existing[0].image_key) {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: existing[0].image_key,
        })
      );
    }

    await pool.query('DELETE FROM animals WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Fauna berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// DELETE /api/admin/animals/:id/image
// ========================
export const deleteAnimalImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT id, image_key FROM animals WHERE id = ?',
      [id]
    );
    if (!existing[0]) {
      return next(createError('Fauna tidak ditemukan.', 404));
    }

    if (!existing[0].image_key) {
      return next(createError('Fauna ini tidak memiliki gambar.', 400));
    }

    // Hapus dari R2
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: existing[0].image_key,
      })
    );

    // Kosongkan image_key di database
    await pool.query(
      'UPDATE animals SET image_key = NULL, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Gambar fauna berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
