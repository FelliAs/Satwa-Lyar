import { Request } from 'express';

export interface CookieOptions {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  domain?: string;
}

/**
 * Parser cookie sederhana tanpa dependency tambahan.
 * Mengembalikan object { namaCookie: nilaiCookie }.
 */
export const parseCookies = (header?: string): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!header) return result;

  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;

    const name = part.slice(0, index).trim();
    const rawValue = part.slice(index + 1).trim();

    if (!name) continue;

    try {
      result[name] = decodeURIComponent(rawValue);
    } catch {
      result[name] = rawValue;
    }
  }

  return result;
};

/**
 * Serialisasi cookie untuk dikirim melalui header Set-Cookie.
 */
export const serializeCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): string => {
  const {
    maxAge,
    httpOnly = true,
    secure = false,
    sameSite = 'lax',
    path = '/',
    domain,
  } = options;

  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`];

  if (domain) parts.push(`Domain=${domain}`);
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  parts.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`);

  return parts.join('; ');
};

/**
 * Ambil cookie dari request berdasarkan nama.
 */
export const getCookie = (req: Request, name: string): string | undefined => {
  return parseCookies(req.headers.cookie)[name];
};
