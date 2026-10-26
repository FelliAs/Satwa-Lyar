import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import { createError } from '../../middleware/error.middleware';

const EVENT_TYPES = [
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
];

const ACTOR_TYPES = ['guest', 'admin', 'system'];

/**
 * GET /api/admin/logs
 * Membaca dan memfilter log aktivitas dengan pagination.
 */
export const getActivityLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const eventType = req.query.event_type as string;
    const actorType = req.query.actor_type as string;
    const actorPublicId = (req.query.actor_public_id as string)?.trim();
    const action = (req.query.action as string)?.trim();
    const endpoint = (req.query.endpoint as string)?.trim();
    const userId = req.query.user_id ? Number(req.query.user_id) : undefined;
    const from = (req.query.from as string)?.trim();
    const to = (req.query.to as string)?.trim();
    const search = (req.query.q as string)?.trim();

    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (eventType && EVENT_TYPES.includes(eventType)) {
      whereClause += ' AND l.event_type = ?';
      params.push(eventType);
    }

    if (actorType && ACTOR_TYPES.includes(actorType)) {
      whereClause += ' AND l.actor_type = ?';
      params.push(actorType);
    }

    if (actorPublicId) {
      whereClause += ' AND l.actor_public_id = ?';
      params.push(actorPublicId);
    }

    if (action) {
      whereClause += ' AND l.action LIKE ?';
      params.push(`%${action}%`);
    }

    if (endpoint) {
      whereClause += ' AND l.endpoint LIKE ?';
      params.push(`%${endpoint}%`);
    }

    if (userId && !isNaN(userId)) {
      whereClause += ' AND l.user_id = ?';
      params.push(userId);
    }

    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      whereClause += ' AND l.created_at >= ?';
      params.push(`${from} 00:00:00`);
    }

    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      whereClause += ' AND l.created_at <= ?';
      params.push(`${to} 23:59:59`);
    }

    if (search) {
      whereClause +=
        ' AND (l.action LIKE ? OR l.endpoint LIKE ? OR l.error_message LIKE ? OR l.actor_public_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM logs_activity l ${whereClause}`,
      params
    );
    const total = Number(countResult[0]?.total || 0);

    const rows = await pool.query(
      `SELECT l.id, l.request_id, l.user_id, l.actor_public_id, l.actor_type,
              l.event_type, l.action, l.http_method, l.endpoint,
              l.resource_type, l.resource_id, l.ip_address, l.user_agent,
              l.session_id_hash, l.http_status, l.success, l.duration_ms,
              l.payload_json, l.payload_size_bytes, l.error_code,
              l.error_message, l.created_at
       FROM logs_activity l
       ${whereClause}
       ORDER BY l.created_at DESC, l.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/logs/summary
 * Ringkasan jumlah log per event type (7 hari terakhir).
 */
export const getActivityLogSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const days = Math.min(90, Math.max(1, Number(req.query.days) || 7));

    const byEvent = await pool.query(
      `SELECT event_type, COUNT(*) AS total
       FROM logs_activity
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY event_type
       ORDER BY total DESC`,
      [days]
    );

    const byActor = await pool.query(
      `SELECT actor_type, COUNT(*) AS total
       FROM logs_activity
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY actor_type
       ORDER BY total DESC`,
      [days]
    );

    const totals = await pool.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS successful,
              SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS failed,
              AVG(duration_ms) AS avg_duration_ms
       FROM logs_activity
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );

    res.status(200).json({
      success: true,
      data: {
        days,
        totals: {
          total: Number(totals[0]?.total || 0),
          successful: Number(totals[0]?.successful || 0),
          failed: Number(totals[0]?.failed || 0),
          avg_duration_ms: Math.round(Number(totals[0]?.avg_duration_ms || 0)),
        },
        by_event_type: byEvent,
        by_actor_type: byActor,
      },
    });
  } catch (error) {
    if ((error as any)?.code === 'ER_NO_SUCH_TABLE') {
      return next(
        createError('Tabel logs_activity belum tersedia. Jalankan `npm run db:migrate`.', 503)
      );
    }
    next(error);
  }
};
