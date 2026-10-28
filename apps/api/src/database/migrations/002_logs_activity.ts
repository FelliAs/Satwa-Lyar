import { Connection } from 'mariadb';
import { tableExists } from './helpers';

const CREATE_LOGS_ACTIVITY = `
CREATE TABLE IF NOT EXISTS logs_activity (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  request_id        VARCHAR(64) NULL,
  user_id           INT UNSIGNED NULL,
  actor_public_id   VARCHAR(32) NOT NULL,

  actor_type        ENUM('guest', 'admin', 'system') NOT NULL DEFAULT 'guest',

  event_type        ENUM(
    'page_view',
    'api_request',
    'quiz_payload',
    'admin_action',
    'login_success',
    'login_failed',
    'logout',
    'access_denied',
    'application_error',
    'security_event'
  ) NOT NULL DEFAULT 'api_request',

  action            VARCHAR(150) NOT NULL,
  http_method       VARCHAR(10) NULL,
  endpoint          VARCHAR(500) NULL,

  resource_type     VARCHAR(100) NULL,
  resource_id       VARCHAR(100) NULL,

  ip_address        VARCHAR(45) NULL,
  user_agent        TEXT NULL,
  session_id_hash   VARCHAR(128) NULL,

  http_status       SMALLINT UNSIGNED NULL,
  success           TINYINT(1) NULL,
  duration_ms       INT UNSIGNED NULL,

  payload_json      JSON NULL,
  payload_size_bytes INT UNSIGNED NULL,

  error_code        VARCHAR(100) NULL,
  error_message     TEXT NULL,

  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  KEY idx_logs_actor_time (actor_public_id, created_at),
  KEY idx_logs_user_time (user_id, created_at),
  KEY idx_logs_event_time (event_type, created_at),
  KEY idx_logs_endpoint_time (endpoint(191), created_at),
  KEY idx_logs_request_id (request_id),

  CONSTRAINT fk_logs_activity_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

/**
 * Migration 002 - Membuat tabel `logs_activity` sebagai pusat pencatatan
 * aktivitas Guest, audit Admin, error aplikasi, dan monitoring payload quiz.
 */
export const up = async (conn: Connection): Promise<void> => {
  if (!(await tableExists(conn, 'users'))) {
    // Tabel users harus ada lebih dulu karena ada foreign key.
    throw new Error('Tabel `users` belum ada. Jalankan migration 001 terlebih dahulu.');
  }

  await conn.query(CREATE_LOGS_ACTIVITY);
};
