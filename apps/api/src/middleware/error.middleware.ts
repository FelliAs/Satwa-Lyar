import { Request, Response, NextFunction } from 'express';
import { recordActivity } from '../modules/logs/logs.service';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handling middleware
 * Harus didaftarkan PALING AKHIR di app.ts
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada server.';
  const isDatabaseError = (err as any)?.code === 'ER_' || (err as any)?.errno !== undefined;

  // Error operasional (4xx yang memang diharapkan, mis. kredensial salah)
  // sudah dicatat oleh event khusus (login_failed, access_denied) dan oleh
  // api_request, jadi tidak perlu masuk lagi ke application_error.
  const isOperational =
    err.isOperational === true || (statusCode >= 400 && statusCode < 500);

  const errorCode = isDatabaseError ? 'DATABASE_QUERY_ERROR' : 'APPLICATION_ERROR';

  // Log error selalu berjalan (termasuk production) agar masalah bisa ditelusuri.
  console.error('🔴 Error:', {
    request_id: req.requestId,
    message: err.message,
    status_code: statusCode,
    path: req.originalUrl?.split('?')[0],
    method: req.method,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });

  if (!isOperational) {
    void recordActivity(req, {
      event_type: 'application_error',
      action: errorCode,
      resource_type: 'endpoint',
      resource_id: req.originalUrl?.split('?')[0]?.slice(0, 100) ?? null,
      http_status: statusCode,
      success: 0,
      error_code: errorCode,
      error_message: err.message?.slice(0, 1000) ?? null,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    request_id: req.requestId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware: tangkap route yang tidak ditemukan (404)
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' tidak ditemukan.`,
    request_id: req.requestId,
  });
};

/**
 * Helper: buat error dengan status code tertentu
 */
export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
