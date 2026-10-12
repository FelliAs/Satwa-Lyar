import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';

// ========================
// GET /api/admin/users
// ========================
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const role = req.query.role as string;

    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role && ['admin', 'user'].includes(role)) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${whereClause}`,
      params
    );

    const rows = await pool.query(
      `SELECT id, name, email, role, created_at, updated_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = Number(countResult[0].total);

    res.status(200).json({
      success: true,
      data: rows,
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
// GET /api/admin/users/:id
// ========================
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const rows = await pool.query(
      `SELECT id, name, email, role, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );

    if (!rows[0]) {
      return next(createError('User tidak ditemukan.', 404));
    }

    // Tambahkan statistik user
    const favCount = await pool.query(
      'SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?',
      [id]
    );
    const quizCount = await pool.query(
      'SELECT COUNT(*) AS total FROM quiz_results WHERE user_id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...rows[0],
        total_favorites: Number(favCount[0].total),
        total_quiz_attempts: Number(quizCount[0].total),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// POST /api/admin/users (Admin membuat user baru)
// ========================
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Cek email sudah dipakai
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing[0]) {
      return next(createError('Email sudah terdaftar.', 409));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role]
    );

    const newUser = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat.',
      data: newUser[0],
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// PUT /api/admin/users/:id
// ========================
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing[0]) {
      return next(createError('User tidak ditemukan.', 404));
    }

    // Cek email tidak dipakai user lain
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck[0]) {
        return next(createError('Email sudah digunakan user lain.', 409));
      }
    }

    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    await pool.query(
      `UPDATE users SET
         name = COALESCE(?, name),
         email = COALESCE(?, email),
         role = COALESCE(?, role),
         password = COALESCE(?, password),
         updated_at = NOW()
       WHERE id = ?`,
      [name, email, role, hashedPassword, id]
    );

    const updated = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'User berhasil diperbarui.',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// DELETE /api/admin/users/:id
// ========================
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Admin tidak bisa menghapus dirinya sendiri
    if (Number(id) === req.user!.id) {
      return next(createError('Anda tidak dapat menghapus akun Anda sendiri.', 400));
    }

    const existing = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing[0]) {
      return next(createError('User tidak ditemukan.', 404));
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'User berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
