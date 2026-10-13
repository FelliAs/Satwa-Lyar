import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

const REDIS_URL = process.env.REDIS_URL;
const REDIS_TOKEN = process.env.REDIS_TOKEN;

/**
 * Cek apakah Upstash Redis telah dikonfigurasi pada environment variables.
 */
export const isRedisAvailable = (): boolean => {
  return Boolean(REDIS_URL && REDIS_TOKEN);
};

/**
 * Ambil data dari Upstash Redis REST API
 */
export const getCache = async <T = any>(key: string): Promise<T | null> => {
  if (!isRedisAvailable()) return null;

  try {
    const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { result: string | null };
    if (!data || data.result === null) return null;

    try {
      return JSON.parse(data.result) as T;
    } catch {
      return data.result as unknown as T;
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Redis Cache GET Error] ${key}:`, err);
    }
    return null;
  }
};

/**
 * Simpan data ke Upstash Redis REST API dengan optional TTL (dalam detik)
 */
export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> => {
  if (!isRedisAvailable()) return;

  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const endpoint = ttlSeconds > 0
      ? `${REDIS_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(stringValue)}?ex=${ttlSeconds}`
      : `${REDIS_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(stringValue)}`;

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Redis Cache SET Error] ${key}:`, err);
    }
  }
};

/**
 * Hapus key dari Upstash Redis
 */
export const delCache = async (key: string): Promise<void> => {
  if (!isRedisAvailable()) return;

  try {
    await fetch(`${REDIS_URL}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Redis Cache DEL Error] ${key}:`, err);
    }
  }
};

export default {
  isRedisAvailable,
  getCache,
  setCache,
  delCache,
};
