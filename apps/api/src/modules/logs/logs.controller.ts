import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';

const EVENT_TYPES = new Set([
  'page_view',
  'api_request',
  'quiz_payload',
  'admin_action',
  'login_success',
  'login_failed',
  'logout',
  'access_denied',
  'application_error',
  'security_event',
]);

const ACTOR_TYPES = new Set(['guest', 'admin', 'system']);

export const getActivityLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requestedPage = Number.parseInt(String(req.query.page ?? '1'), 10);
    const requestedLimit = Number.parseInt(String(req.query.limit ?? '20'), 10);
    const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(100, Math.max(1, requestedLimit))
      : 20;
    const offset = (page - 1) * limit;
    const filters: string[] = [];
    const params: (string | number)[] = [];
    const eventType = String(req.query.event_type ?? '');
    const actorType = String(req.query.actor_type ?? '');
    const action = String(req.query.action ?? '').trim();

    if (eventType && !EVENT_TYPES.has(eventType)) {
      res.status(400).json({ success: false, message: 'Jenis aktivitas tidak valid.' });
      return;
    }
    if (actorType && !ACTOR_TYPES.has(actorType)) {
      res.status(400).json({ success: false, message: 'Jenis aktor tidak valid.' });
      return;
    }

    if (EVENT_TYPES.has(eventType)) {
      filters.push('event_type = ?');
      params.push(eventType);
    }
    if (ACTOR_TYPES.has(actorType)) {
      filters.push('actor_type = ?');
      params.push(actorType);
    }
    if (action) {
      filters.push('action LIKE ?');
      params.push(`%${action}%`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const countRows = await pool.query(
      `SELECT COUNT(*) AS total FROM logs_activity ${whereClause}`,
      params
    );
    const rows = await pool.query(
      `SELECT * FROM logs_activity ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = Number(countRows[0]?.total ?? 0);
    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
