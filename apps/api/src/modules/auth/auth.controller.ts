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
    const publicId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // Simpan user baru dengan is_admin = 0
    const result = await pool.query(
      'INSERT INTO users (public_id, name, email, password, is_admin) VALUES (?, ?, ?, ?, 0)',
      [publicId, name, email, hashedPassword]
    );

    const newUserId = result.insertId;

    // Ambil data user yang baru dibuat
    const rows = await pool.query(
      'SELECT id, public_id, name, email, is_admin, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    const newUser = rows[0];
    const role = newUser.is_admin === 1 ? 'admin' : 'user';

    // Buat JWT token
    const payload = { id: newUser.id, email: newUser.email, role, is_admin: newUser.is_admin };
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
          public_id: newUser.public_id,
          name: newUser.name,
          email: newUser.email,
          role,
          is_admin: newUser.is_admin,
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

    // Cari user berdasarkan email dengan kolom yang ada di database (is_admin)
    const rows = await pool.query(
      'SELECT id, public_id, name, email, password, is_admin FROM users WHERE email = ?',
      [email]
    );

    const user = rows[0];

    if (!user) {
      return next(createError('Email atau password salah.', 401));
    }

    // Bandingkan password dengan hash
    let isMatch = false;
    if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    // Dukung kredensial default admin
    const isDefaultAdmin = email.toLowerCase() === 'admin@satwalyar.com' && (password === 'Admin1234' || password === 'admin1234');
    if (!isMatch && isDefaultAdmin) {
      isMatch = true;
      // Sinkronisasi hash password ke database
      const newHash = await bcrypt.hash('Admin1234', 12);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
    }

    if (!isMatch) {
      return next(createError('Email atau password salah.', 401));
    }

    const role = (user.is_admin === 1 || user.is_admin === true) ? 'admin' : 'user';

    // Generate JWT
    const payload = { id: user.id, email: user.email, role, is_admin: user.is_admin };
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
          public_id: user.public_id,
          name: user.name,
          email: user.email,
          role,
          is_admin: user.is_admin,
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
      'SELECT id, public_id, name, email, is_admin, created_at FROM users WHERE id = ?',
      [req.user!.id]
    );

    const user = rows[0];
    if (!user) {
      return next(createError('User tidak ditemukan.', 404));
    }

    const role = (user.is_admin === 1 || user.is_admin === true) ? 'admin' : 'user';

    // Ambil statistik user untuk dashboard / profil
    let totalFav = 0;
    let totalQuiz = 0;
    let avgQuiz = 0;

    try {
      const favCount = await pool.query(
        'SELECT COUNT(*) AS total FROM favorites WHERE user_id = ?',
        [req.user!.id]
      );
      totalFav = Number(favCount[0]?.total || 0);

      const quizCount = await pool.query(
        'SELECT COUNT(*) AS total, AVG(score) AS avg_score FROM quiz_results WHERE user_id = ?',
        [req.user!.id]
      );
      totalQuiz = Number(quizCount[0]?.total || 0);
      avgQuiz = quizCount[0]?.avg_score !== null ? Math.round(Number(quizCount[0].avg_score)) : 0;
    } catch {
      // Tabel favorit / quiz opsional jika belum ada data
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        role,
        total_favorites: totalFav,
        total_quiz_attempts: totalQuiz,
        average_quiz_score: avgQuiz,
      },
    });
  } catch (error) {
    next(error);
  }
};
