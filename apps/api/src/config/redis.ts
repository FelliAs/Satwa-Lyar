import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

/**
 * Konfigurasi Upstash Redis.
 *
 * Mendukung dua skema penamaan environment variable:
 *  - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (nama standar Upstash)
 *  - `REDIS_URL` / `REDIS_TOKEN` (alias lama, tetap dipakai agar .env lama jalan)
 *
 * Konfigurasi dibaca saat runtime (bukan saat modul di-load) supaya nilai
 * dari .env maupun dari platform (Vercel) selalu terpakai.
 */
interface RedisConfig {
  url: string;
  token: string;
}

let warnedMissingConfig = false;

const resolveConfig = (): RedisConfig | null => {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || ''
  ).trim();
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN || ''
  ).trim();

  if (!url || !token) {
    if (!warnedMissingConfig && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Redis Cache] Upstash Redis tidak dikonfigurasi. Cache dinonaktifkan. ' +
          'Isi UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN (atau REDIS_URL & REDIS_TOKEN).'
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  // Hilangkan trailing slash agar URL tidak menjadi "...//get/..."
  return { url: url.replace(/\/+$/, ''), token };
};

/**
 * Cek apakah Upstash Redis telah dikonfigurasi pada environment variables.
 */
export const isRedisAvailable = (): boolean => resolveConfig() !== null;

/**
 * Ambil data dari Upstash Redis REST API
 */
export const getCache = async <T = any>(key: string): Promise<T | null> => {
  const config = resolveConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.url}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
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
  const config = resolveConfig();
  if (!config) return;

  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const endpoint = ttlSeconds > 0
      ? `${config.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(stringValue)}?ex=${ttlSeconds}`
      : `${config.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(stringValue)}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });

    if (!res.ok && process.env.NODE_ENV !== 'production') {
      console.warn(
        `[Redis Cache SET Error] ${key}: HTTP ${res.status} ${res.statusText}`
      );
    }
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
  const config = resolveConfig();
  if (!config) return;

  try {
    await fetch(`${config.url}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Redis Cache DEL Error] ${key}:`, err);
    }
  }
};

const CACHE_VERSION_KEY = 'satwa_cache_version';

/**
 * Versi cache saat ini. Nomor ini ikut disisipkan pada cache key sehingga
 * invalidasi cukup menaikkan versi (tanpa perlu SCAN/DEL per key).
 */
export const getCacheVersion = async (): Promise<number> => {
  const config = resolveConfig();
  if (!config) return 0;

  try {
    const res = await fetch(`${config.url}/get/${CACHE_VERSION_KEY}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });

    if (!res.ok) return 0;

    const data = (await res.json()) as { result: string | null };
    const value = Number(data?.result ?? 0);

    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

/**
 * Naikkan versi cache => seluruh key versi lama otomatis dianggap basi
 * (masih tersedia di Redis sampai TTL habis, tapi tidak pernah dipakai lagi).
 * Dipanggil setiap kali admin mengubah data konten.
 */
export const bumpCacheVersion = async (): Promise<void> => {
  const config = resolveConfig();
  if (!config) return;

  try {
    await fetch(`${config.url}/incr/${CACHE_VERSION_KEY}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Redis Cache VERSION Error]:', err);
    }
  }
};

export default {
  isRedisAvailable,
  getCache,
  setCache,
  delCache,
  getCacheVersion,
  bumpCacheVersion,
};
