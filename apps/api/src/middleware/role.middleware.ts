import { Request, Response, NextFunction } from 'express';
import { recordActivity } from '../modules/logs/logs.service';

/**
 * Middleware: memastikan identitas yang mengakses adalah admin.
 * Harus digunakan SETELAH middleware authenticate.
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
      request_id: req.requestId,
    });
    return;
  }

  if (Number(req.user.is_admin) !== 1) {
    void recordActivity(req, {
      event_type: 'access_denied',
      action: 'UNAUTHORIZED_ADMIN_ACCESS',
      resource_type: 'endpoint',
      resource_id: req.originalUrl?.split('?')[0]?.slice(0, 100) ?? null,
      http_status: 403,
      success: 0,
    });

    res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang diizinkan.',
      request_id: req.requestId,
    });
    return;
  }

  next();
};
