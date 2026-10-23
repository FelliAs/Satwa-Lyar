import { Request } from 'express';
import { insertActivityLog, ActivityLogEntry } from './logs.repository';
import type { ActivityEventType } from '../../types/express';

const SENSITIVE_KEYS = new Set([
  'password',
  'new_password',
  'current_password',
  'password_hash',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'cookie',
  'secret',
  'jwt',
  'api_key',
]);

const MAX_PAYLOAD_BYTES = 8 * 1024;
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_ITEMS = 100;
const MAX_DEPTH = 3;

/**
 * Membersihkan payload dari field sensitif sebelum disimpan ke log.
 */
export const sanitizeValue = (value: unknown, depth = 0): unknown => {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}...`
      : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    if (depth >= MAX_DEPTH) return '[nested]';

    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      output[key] = SENSITIVE_KEYS.has(key.toLowerCase())
        ? '[REDACTED]'
        : sanitizeValue(item, depth + 1);
    }
    return output;
  }

  return null;
};

/**
 * Menyiapkan payload aman + ukuran byte-nya untuk disimpan.
 */
export const preparePayload = (
  payload: unknown
): { payload: unknown | null; sizeBytes: number | null } => {
  if (payload === undefined || payload === null) {
    return { payload: null, sizeBytes: null };
  }

  const sanitized = sanitizeValue(payload);
  const serialized = JSON.stringify(sanitized) ?? '';
  const sizeBytes = Buffer.byteLength(serialized, 'utf8');

  if (sizeBytes > MAX_PAYLOAD_BYTES) {
    return {
      payload: {
        truncated: true,
        original_size_bytes: sizeBytes,
        preview: serialized.slice(0, 1000),
      },
      sizeBytes,
    };
  }

  return { payload: sanitized, sizeBytes };
};

const resolveClientIp = (req: Request): string | null => {
  if (req.clientIp) return req.clientIp;

  const forwarded = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim().slice(0, 45);
  }

  return (req.ip || req.socket?.remoteAddress || null)?.toString().slice(0, 45) ?? null;
};

export interface RecordActivityOptions {
  event_type: ActivityEventType;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  payload?: unknown;
  http_status?: number | null;
  success?: number | null;
  duration_ms?: number | null;
  error_code?: string | null;
  error_message?: string | null;
  actor_public_id?: string;
  actor_type?: 'guest' | 'admin' | 'system';
}

/**
 * Mencatat aktivitas/request ke tabel logs_activity berdasarkan konteks request.
 */
export const recordActivity = async (
  req: Request,
  options: RecordActivityOptions
): Promise<void> => {
  const { payload, sizeBytes } = preparePayload(options.payload);

  const entry: ActivityLogEntry = {
    request_id: req.requestId ?? null,
    user_id: req.user?.id ?? null,
    actor_public_id:
      options.actor_public_id ?? req.user?.public_id ?? 'system',
    actor_type: options.actor_type ?? req.user?.actor_type ?? 'system',
    event_type: options.event_type,
    action: options.action,
    http_method: req.method,
    endpoint: req.originalUrl ? req.originalUrl.split('?')[0].slice(0, 500) : req.path,
    resource_type: options.resource_type ?? null,
    resource_id: options.resource_id ?? null,
    ip_address: resolveClientIp(req),
    user_agent: (req.headers['user-agent'] || '').slice(0, 1000) || null,
    session_id_hash: req.sessionIdHash ?? null,
    http_status: options.http_status ?? null,
    success: options.success ?? null,
    duration_ms: options.duration_ms ?? null,
    payload_json: payload,
    payload_size_bytes: sizeBytes,
    error_code: options.error_code ?? null,
    error_message: options.error_message ?? null,
  };

  await insertActivityLog(entry);
};

export interface AdminActionOptions {
  action: string;
  resource_type: string;
  resource_id?: string | number | null;
  payload?: unknown;
  before?: unknown;
  after?: unknown;
}

/**
 * Mencatat audit tindakan admin (CRUD konten, upload, dll).
 * Ringkasan perubahan tidak boleh memuat password hash, token, atau rahasia.
 */
export const recordAdminAction = async (
  req: Request,
  options: AdminActionOptions
): Promise<void> => {
  await recordActivity(req, {
    event_type: 'admin_action',
    action: options.action,
    resource_type: options.resource_type,
    resource_id:
      options.resource_id === null || options.resource_id === undefined
        ? null
        : String(options.resource_id),
    payload: {
      ...(options.payload ? { payload: options.payload } : {}),
      ...(options.before !== undefined ? { before: options.before } : {}),
      ...(options.after !== undefined ? { after: options.after } : {}),
    },
  });
};

export interface QuizPayloadEntry {
  question_id: number;
  selected_option: string;
}

/**
 * Monitoring payload quiz: hanya menyimpan jawaban yang dipilih pengguna.
 * Kunci jawaban benar tidak pernah masuk ke log.
 */
export const recordQuizPayload = async (
  req: Request,
  quizId: number,
  answers: QuizPayloadEntry[]
): Promise<void> => {
  await recordActivity(req, {
    event_type: 'quiz_payload',
    action: 'QUIZ_SUBMIT_PAYLOAD',
    resource_type: 'quiz',
    resource_id: String(quizId),
    payload: {
      quiz_id: quizId,
      answer_count: answers.length,
      answers,
    },
  });
};
