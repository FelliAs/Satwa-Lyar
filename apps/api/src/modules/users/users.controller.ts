import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { recordAdminAction } from '../../modules/logs/logs.service';
import { allocateAdminPublicId } from './admin-sequence';

// ========================
// GET /api/admin/users
// scope=admin (default) | guest | all
// ========================
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const search = (req.query.search as string)?.trim();
    const scope = (req.query.scope as string) || 'admin';

    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (scope === 'admin') {
      whereClause += ' AND is_admin = 1';
    } else if (scope === 'guest') {
      whereClause += ' AND is_admin = 0';
    } else if (scope !== 'all') {
      return next(createError('Scope harus admin, guest, atau all.', 400));
    }

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR public_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${whereClause}`,
      params
    );

    const rows = await pool.query(
      `SELECT id, public_id, name, email, is_admin, created_at, updated_at
       FROM users ${whereClause}
       ORDER BY is_admin DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = Number(countResult[0]?.total || 0);

    res.status(200).json({
      success: true,
      data: rows,
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
      `SELECT id, public_id, name, email, is_admin, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );

    if (!rows[0]) {
      return next(createError('Identitas tidak ditemukan.', 404));
    }

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
        total_favorites: Number(favCount[0]?.total || 0),
        total_quiz_attempts: Number(quizCount[0]?.total || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// POST /api/admin/users
// Membuat akun admin baru dengan public_id berurutan (adm_XXXX)
// ========================
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing[0]) {
      return next(createError('Email sudah terdaftar.', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const conn = await pool.getConnection();
    let newUserId: number;
    let publicId: string;

    try {
      await conn.beginTransaction();

      publicId = await allocateAdminPublicId(conn);

      const result = await conn.query(
        `INSERT INTO users (public_id, name, email, password, is_admin)
         VALUES (?, ?, ?, ?, 1)`,
        [publicId, name, email, hashedPassword]
      );
      newUserId = Number(result.insertId);

      await conn.commit();
    } catch (txError) {
      await conn.rollback();
      throw txError;
    } finally {
      conn.release();
    }

    const newUser = await pool.query(
      'SELECT id, public_id, name, email, is_admin, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    await recordAdminAction(req, {
      action: 'CREATE_ADMIN',
      resource_type: 'user',
      resource_id: publicId,
      payload: { name, email },
      after: { public_id: publicId, name, email, is_admin: 1 },
    });

    res.status(201).json({
      success: true,
      message: `Administrator berhasil dibuat dengan ID ${publicId}.`,
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
    const { name, email, password } = req.body;

    const existing = await pool.query(
      'SELECT id, public_id, name, email, is_admin FROM users WHERE id = ?',
      [id]
    );

    const current = (existing as any[])[0];
    if (!current) {
      return next(createError('Identitas tidak ditemukan.', 404));
    }

    if (Number(current.is_admin) !== 1) {
      return next(
        createError(
          'Identitas guest tidak dapat diedit melalui endpoint ini.',
          400
        )
      );
    }

    if (email && email !== current.email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck[0]) {
        return next(createError('Email sudah digunakan identitas lain.', 409));
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
         password = COALESCE(?, password),
         updated_at = NOW()
       WHERE id = ?`,
      [name, email, hashedPassword, id]
    );

    const updated = await pool.query(
      'SELECT id, public_id, name, email, is_admin, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    await recordAdminAction(req, {
      action: 'UPDATE_ADMIN',
      resource_type: 'user',
      resource_id: current.public_id,
      payload: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(password ? { password_changed: true } : {}),
      },
      before: { name: current.name, email: current.email },
      after: { name: updated[0]?.name, email: updated[0]?.email },
    });

    res.status(200).json({
      success: true,
      message: 'Administrator berhasil diperbarui.',
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
      return next(
        createError('Anda tidak dapat menghapus akun Anda sendiri.', 400)
      );
    }

    const existing = await pool.query(
      'SELECT id, public_id, name, email, is_admin FROM users WHERE id = ?',
      [id]
    );

    const current = (existing as any[])[0];
    if (!current) {
      return next(createError('Identitas tidak ditemukan.', 404));
    }

    if (Number(current.is_admin) !== 1) {
      return next(
        createError(
          'Identitas guest tidak dapat dihapus melalui endpoint ini.',
          400
        )
      );
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    await recordAdminAction(req, {
      action: 'DELETE_ADMIN',
      resource_type: 'user',
      resource_id: current.public_id,
      before: {
        public_id: current.public_id,
        name: current.name,
        email: current.email,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Administrator berhasil dihapus.',
    });
  } catch (error) {
    next(error);
  }
};
