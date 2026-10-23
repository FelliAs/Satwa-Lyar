import { createHash } from 'crypto';

const SALT_FALLBACK = 'satwa-lyar-session-salt';

/**
 * Hash nilai sensitif (session id, token) sebelum disimpan ke log.
 * Session id mentah tidak boleh masuk tabel logs_activity.
 */
export const hashSessionId = (value: string): string => {
  const salt = process.env.JWT_SECRET || SALT_FALLBACK;

  return createHash('sha256')
    .update(`${salt}:${value}`)
    .digest('hex');
};
