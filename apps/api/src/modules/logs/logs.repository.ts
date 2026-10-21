import pool from '../../config/database';
import type { ActivityEventType, ActorType } from '../../types/express';

export interface ActivityLogEntry {
  request_id?: string | null;
  user_id?: number | null;
  actor_public_id: string;
  actor_type: ActorType;
  event_type: ActivityEventType;
  action: string;
  http_method?: string | null;
  endpoint?: string | null;
  resource_type?: string | null;
  resource_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  session_id_hash?: string | null;
  http_status?: number | null;
  success?: number | null;
  duration_ms?: number | null;
  payload_json?: unknown | null;
  payload_size_bytes?: number | null;
  error_code?: string | null;
  error_message?: string | null;
}

/**
 * Menyimpan satu baris aktivitas ke tabel logs_activity.
 * Kegagalan pencatatan tidak boleh menggagalkan request utama,
 * karena tabel log boleh belum tersedia pada instalasi lama.
 */
export const insertActivityLog = async (entry: ActivityLogEntry): Promise<void> => {
  try {
    const payload =
      entry.payload_json === undefined || entry.payload_json === null
        ? null
        : typeof entry.payload_json === 'string'
          ? entry.payload_json
          : JSON.stringify(entry.payload_json);

    await pool.query(
      `INSERT INTO logs_activity (
         request_id, user_id, actor_public_id, actor_type, event_type, action,
         http_method, endpoint, resource_type, resource_id,
         ip_address, user_agent, session_id_hash,
         http_status, success, duration_ms,
         payload_json, payload_size_bytes,
         error_code, error_message
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.request_id ?? null,
        entry.user_id ?? null,
        entry.actor_public_id,
        entry.actor_type,
        entry.event_type,
        entry.action,
        entry.http_method ?? null,
        entry.endpoint ?? null,
        entry.resource_type ?? null,
        entry.resource_id ?? null,
        entry.ip_address ?? null,
        entry.user_agent ?? null,
        entry.session_id_hash ?? null,
        entry.http_status ?? null,
        entry.success ?? null,
        entry.duration_ms ?? null,
        payload,
        entry.payload_size_bytes ?? null,
        entry.error_code ?? null,
        entry.error_message ?? null,
      ]
    );
  } catch (error) {
    // intentionally ignored: pencatatan log tidak boleh memblokir aplikasi
  }
};
