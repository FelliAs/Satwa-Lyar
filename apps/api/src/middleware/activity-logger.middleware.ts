import { Request, Response, NextFunction } from 'express';
import { recordActivity } from '../modules/logs/logs.service';

const SKIP_PATHS = new Set(['/', '/api/health']);

/**
 * Middleware: mencatat aktivitas request ke tabel logs_activity.
 *
 * Record ditulis setelah response selesai agar status HTTP dan durasi
 * sudah diketahui. Pencatatan bersifat best-effort dan tidak boleh
 * memperlambat response.
 */
export const activityLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startedAt = Date.now();

  res.on('finish', () => {
    if (SKIP_PATHS.has(req.path)) return;

    const durationMs = Date.now() - startedAt;

    void recordActivity(req, {
      event_type: 'api_request',
      action: `${req.method} ${req.path}`.slice(0, 150),
      http_status: res.statusCode,
      success: res.statusCode < 400 ? 1 : 0,
      duration_ms: durationMs,
    });
  });

  next();
};
