import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: memastikan request memiliki identitas aktif.
 *
 * Identitas dapat berupa admin (JWT Bearer) atau guest (cookie identitas).
 * Guest dibuat otomatis oleh middleware guestContext.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.authError) {
    res.status(req.authError.status).json({
      success: false,
      message: req.authError.message,
      request_id: req.requestId,
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Akses ditolak. Identitas tidak ditemukan.',
      request_id: req.requestId,
    });
    return;
  }

  next();
};

/**
 * Middleware: autentikasi opsional.
 * Identitas sudahresolved oleh guestContext, jadi middleware ini hanya
 * memastikan request tetap diproses walaupun identitas tidak ada.
 */
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next();
};
