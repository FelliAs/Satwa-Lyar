import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';
import { recordActivity } from '../../modules/logs/logs.service';

// ========================
// POST /api/auth/login (Admin)
// Identitas guest dibuat otomatis oleh middleware guestContext,
// sehingga pengunjung publik tidak perlu login.
// ========================
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Cari akun admin berdasarkan email
    const rows = await pool.query(
      'SELECT id, public_id, name, email, password, is_admin FROM users WHERE email = ?',
      [email]
    );

    const user = (rows as any[])[0];

    const rejectLogin = async (reason: string): Promise<void> => {
      await recordActivity(req, {
        event_type: 'login_failed',
        action: 'ADMIN_LOGIN_FAILED',
        resource_type: 'auth',
        http_status: 401,
        success: 0,
        payload: { reason },
      });
    };

    if (!user || !user.password) {
      await rejectLogin('invalid_credentials');
      return next(createError('Email atau password salah.', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await rejectLogin('invalid_credentials');
      return next(createError('Email atau password salah.', 401));
    }

    if (Number(user.is_admin) !== 1) {
      await recordActivity(req, {
        event_type: 'access_denied',
        action: 'UNAUTHORIZED_ADMIN_ACCESS',
        resource_type: 'auth',
        http_status: 403,
        success: 0,
        payload: { reason: 'not_admin' },
      });
      return next(
        createError('Akses ditolak. Hanya administrator yang dapat masuk.', 403)
      );
    }

    const payload = {
      id: Number(user.id),
      public_id: user.public_id,
      email: user.email,
      is_admin: 1,
    };

    const jwtSecret = process.env.JWT_SECRET!;
    const jwtExpiry = (process.env.JWT_EXPIRES_IN || '7d') as Parameters<
      typeof jwt.sign
    >[2] extends { expiresIn?: infer T }
      ? T
      : string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry as any });

    await recordActivity(req, {
      event_type: 'login_success',
      action: 'ADMIN_LOGIN',
      resource_type: 'auth',
      resource_id: user.public_id,
      http_status: 200,
      success: 1,
      actor_public_id: user.public_id,
      actor_type: 'admin',
    });

    res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      request_id: req.requestId,
      data: {
        token,
        user: {
          id: Number(user.id),
          public_id: user.public_id,
          name: user.name,
          email: user.email,
          is_admin: 1,
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await recordActivity(req, {
      event_type: 'logout',
      action: req.user?.is_admin === 1 ? 'ADMIN_LOGOUT' : 'GUEST_LOGOUT',
      resource_type: 'auth',
      resource_id: req.user?.public_id ?? null,
      http_status: 200,
      success: 1,
    });

    res.status(200).json({
      success: true,
      message: 'Logout berhasil.',
      request_id: req.requestId,
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// GET /api/auth/me
// Identitas aktif: admin (JWT) atau guest (cookie)
// ========================
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identity = req.user!;

    const rows = await pool.query(
      'SELECT id, public_id, name, email, is_admin, created_at FROM users WHERE id = ?',
      [identity.id]
    );

    const user = (rows as any[])[0];
    if (!user) {
      return next(createError('Identitas tidak ditemukan.', 404));
    }

    // Statistik untuk dashboard / profil
    const favCount = await pool.query(
      'SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?',
      [identity.id]
    );
    const quizCount = await pool.query(
      'SELECT COUNT(*) AS total, AVG(score) AS avg_score FROM quiz_results WHERE user_id = ?',
      [identity.id]
    );

    res.status(200).json({
      success: true,
      request_id: req.requestId,
      data: {
        id: Number(user.id),
        public_id: user.public_id,
        name: user.name,
        email: user.email,
        is_admin: Number(user.is_admin),
        actor_type: identity.actor_type,
        created_at: user.created_at,
        total_favorites: Number(favCount[0]?.total || 0),
        total_quiz_attempts: Number(quizCount[0]?.total || 0),
        average_quiz_score:
          quizCount[0]?.avg_score !== null
            ? Math.round(Number(quizCount[0].avg_score))
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
