import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';

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

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
