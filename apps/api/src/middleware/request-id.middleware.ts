import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,64}$/;

/**
 * Middleware: membuat ID korelasi untuk setiap request.
 * Dipakai untuk menghubungkan log aktivitas, audit, dan error satu request.
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const incoming = req.headers['x-request-id'];
  const candidate = Array.isArray(incoming) ? incoming[0] : incoming;

  const id =
    candidate && SAFE_REQUEST_ID.test(candidate) ? candidate : randomUUID();

  req.requestId = id;
  res.setHeader('X-Request-Id', id);

  next();
};
