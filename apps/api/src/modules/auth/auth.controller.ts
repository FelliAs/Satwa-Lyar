import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';

// ========================
// POST /api/auth/register
// ========================
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Cek apakah email sudah terdaftar
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing[0]) {
      return next(createError('Email sudah terdaftar. Silakan gunakan email lain.', 409));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Simpan user baru dengan role default 'user'
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    const newUserId = result.insertId;

    // Ambil data user yang baru dibuat
    const rows = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    const newUser = rows[0];

    // Buat JWT token
    const payload = { id: newUser.id, email: newUser.email, role: newUser.role };
    const jwtSecret = process.env.JWT_SECRET!;
    const jwtExpiry = (process.env.JWT_EXPIRES_IN || '7d') as Parameters<typeof jwt.sign>[2] extends { expiresIn?: infer T } ? T : string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry as any });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Selamat datang di SATWA LYAR!',
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// POST /api/auth/login
// ========================
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const rows = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    const user = rows[0];

    if (!user) {
      return next(createError('Email atau password salah.', 401));
    }

    // Bandingkan password dengan hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createError('Email atau password salah.', 401));
    }

    // Generate JWT
    const payload = { id: user.id, email: user.email, role: user.role };
    const jwtSecret = process.env.JWT_SECRET!;
    const jwtExpiry = (process.env.JWT_EXPIRES_IN || '7d') as Parameters<typeof jwt.sign>[2] extends { expiresIn?: infer T } ? T : string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry as any });

    res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// POST /api/auth/logout
// ========================
export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout berhasil.',
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// GET /api/auth/me
// ========================
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rows = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user!.id]
    );

    const user = rows[0];
    if (!user) {
      return next(createError('User tidak ditemukan.', 404));
    }

    // Ambil statistik user untuk dashboard / profil
    const favCount = await pool.query(
      'SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?',
      [req.user!.id]
    );
    const quizCount = await pool.query(
      'SELECT COUNT(*) AS total, AVG(score) AS avg_score FROM quiz_results WHERE user_id = ?',
      [req.user!.id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...user,
        total_favorites: Number(favCount[0]?.total || 0),
        total_quiz_attempts: Number(quizCount[0]?.total || 0),
        average_quiz_score: quizCount[0]?.avg_score !== null ? Math.round(Number(quizCount[0].avg_score)) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
