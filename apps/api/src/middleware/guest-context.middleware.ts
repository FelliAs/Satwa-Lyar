import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { getCookie, serializeCookie } from '../utils/cookie';
import { createGuestPublicId, isGuestPublicId } from '../utils/public-id';
import { hashSessionId } from '../utils/hash';

const GUEST_COOKIE_NAME = process.env.GUEST_COOKIE_NAME || 'satwa_guest';
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 tahun

const sameSiteSetting = (): 'strict' | 'lax' | 'none' => {
  const configured = (process.env.GUEST_COOKIE_SAMESITE || '').toLowerCase();
  if (configured === 'strict' || configured === 'lax' || configured === 'none') {
    return configured;
  }

  // Frontend dan API berada di domain berbeda pada deployments Vercel,
  // sehingga cookie harus SameSite=None + Secure.
  return process.env.NODE_ENV === 'production' ? 'none' : 'lax';
};

interface JwtPayload {
  id: number;
  public_id?: string;
  email?: string;
  is_admin?: number;
}

const loadIdentity = async (publicId: string) => {
  const rows = await pool.query(
    'SELECT id, public_id, name, email, is_admin FROM users WHERE public_id = ?',
    [publicId]
  );

  return (rows as any[])[0] || null;
};

/**
 * Middleware: menentukan identitas aktif untuk setiap request.
 *
 * 1. Authorization: Bearer <token> -> identitas admin (JWT diverifikasi ke database).
 * 2. Cookie guest -> identitas guest yang sudah pernah dibuat.
 * 3. Tidak ada -> buat identitas guest baru dan terbitkan cookie.
 *
 * Guest ID hanya untuk tracking, bukan token akses admin.
 */
export const guestContext = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Token admin
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const rows = await pool.query(
          'SELECT id, public_id, name, email, is_admin FROM users WHERE id = ?',
          [decoded.id]
        );
        const user = (rows as any[])[0];

        if (!user) {
          req.authError = {
            status: 401,
            code: 'INVALID_TOKEN',
            message: 'Token tidak valid atau sudah kadaluarsa.',
          };
          return next();
        }

        if (Number(user.is_admin) !== 1) {
          req.authError = {
            status: 403,
            code: 'NOT_ADMIN',
            message: 'Akses ditolak. Akun ini bukan administrator.',
          };
          return next();
        }

        req.user = {
          id: Number(user.id),
          public_id: user.public_id,
          name: user.name,
          email: user.email,
          is_admin: 1,
          actor_type: 'admin',
        };
        req.sessionIdHash = hashSessionId(token);

        return next();
      } catch {
        req.authError = {
          status: 401,
          code: 'INVALID_TOKEN',
          message: 'Token tidak valid atau sudah kadaluarsa.',
        };
        return next();
      }
    }

    // Health check dan banner root tidak memerlukan identitas
    if (req.path === '/api/health' || req.path === '/') {
      return next();
    }

    // 2. Identitas guest dari cookie
    const guestId = getCookie(req, GUEST_COOKIE_NAME);
    if (guestId && isGuestPublicId(guestId)) {
      const guest = await loadIdentity(guestId);

      if (guest && Number(guest.is_admin) === 0) {
        req.user = {
          id: Number(guest.id),
          public_id: guest.public_id,
          name: null,
          email: null,
          is_admin: 0,
          actor_type: 'guest',
        };
        req.sessionIdHash = hashSessionId(guest.public_id);

        return next();
      }
    }

    // 3. Buat identitas guest baru
    const publicId = createGuestPublicId();
    const result = await pool.query(
      'INSERT INTO users (public_id, is_admin) VALUES (?, 0)',
      [publicId]
    );

    req.user = {
      id: Number(result.insertId),
      public_id: publicId,
      name: null,
      email: null,
      is_admin: 0,
      actor_type: 'guest',
    };
    req.sessionIdHash = hashSessionId(publicId);

    res.setHeader(
      'Set-Cookie',
      serializeCookie(GUEST_COOKIE_NAME, publicId, {
        maxAge: GUEST_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: sameSiteSetting(),
        path: '/',
      })
    );

    next();
  } catch (error) {
    next(error);
  }
};
