import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';

// ========================
// GET /api/users/profile
// ========================
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const rows = await pool.query(
      `SELECT id, name, email,
              IF(is_admin = 1, 'admin', 'user') AS role,
              is_admin, created_at, updated_at
       FROM users WHERE id = ?`,
      [userId]
    );

    const user = rows[0];
    if (!user) {
      return next(createError('User tidak ditemukan.', 404));
    }

    // Statistik user
    const favResult = await pool.query(
      'SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?',
      [userId]
    );

    const quizResult = await pool.query(
      `SELECT COUNT(*) AS total_attempts,
              AVG(score) AS avg_score,
              MAX(score) AS highest_score
       FROM quiz_results WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...user,
        stats: {
          total_favorites: Number(favResult[0]?.total || 0),
          total_quiz_attempts: Number(quizResult[0]?.total_attempts || 0),
          average_quiz_score: quizResult[0]?.avg_score !== null ? Math.round(Number(quizResult[0].avg_score)) : 0,
          highest_quiz_score: quizResult[0]?.highest_score !== null ? Number(quizResult[0].highest_score) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// PUT /api/users/profile
// ========================
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?',
      [name, userId]
    );

    const rows = await pool.query(
      `SELECT id, name, email,
              IF(is_admin = 1, 'admin', 'user') AS role,
              is_admin, created_at, updated_at
       FROM users WHERE id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// PUT /api/users/password
// ========================
export const changeUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { current_password, new_password } = req.body;

    const rows = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    const user = rows[0];

    if (!user) {
      return next(createError('User tidak ditemukan.', 404));
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return next(createError('Password saat ini salah.', 400));
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 12);

    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah. Silakan gunakan password baru pada login berikutnya.',
    });
  } catch (error) {
    next(error);
  }
};
