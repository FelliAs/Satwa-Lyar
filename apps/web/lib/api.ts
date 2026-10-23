export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message?: string;
  request_id?: string;
  data?: T;
  pagination?: Pagination;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  status: number;
  requestId?: string;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.requestId = requestId;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

/**
 * Wrapper fetch untuk komunikasi dengan backend SATWA LYAR.
 * Selalu mengirim cookie (credentials: include) supaya identitas guest
 * yang dibuat backend ikut terbawa.
 */
export const apiRequest = async <T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiEnvelope<T>> => {
  const { method = 'GET', body, token, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      credentials: 'include',
      cache: 'no-store',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'Tidak dapat terhubung ke server SATWA LYAR. Coba lagi nanti.',
      0
    );
  }

  let payload: ApiEnvelope<T> | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.success === false) {
    throw new ApiError(
      payload?.message || `Permintaan gagal (${response.status}).`,
      response.status,
      payload?.request_id
    );
  }

  return payload;
};
