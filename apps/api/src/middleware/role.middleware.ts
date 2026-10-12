import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: memastikan user yang login memiliki role 'admin'
 * Harus digunakan SETELAH middleware authenticate
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Akses ditolak. Anda belum login.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang diizinkan.',
    });
    return;
  }

  next();
};
