/**
 * API Client terpusat untuk JSN-EDU Admin Frontend.
 *
 * Semua request ke backend melewati fungsi `apiRequest` di file ini sehingga
 * base URL, header Authorization, penanganan error, dan redirect saat sesi
 * kedaluwarsa hanya terpusat di satu tempat.
 *
 * Kontrak endpoint (diverifikasi langsung ke backend):
 *   POST   /api/auth/login            -> { data: { token, user } }
 *   POST   /api/auth/logout           -> { success, message }
 *   GET    /api/auth/me               -> { data: AdminUser }
 *   GET    /api/admin/dashboard       -> { data: DashboardData }
 *   GET    /api/admin/categories      -> { data: Category[] }
 *   GET    /api/admin/logs            -> { data: LogEntry[], pagination }
 *   GET    /api/admin/animals         -> { data: Animal[], pagination }
 *   GET    /api/admin/animals/:id     -> { data: Animal }
 *   POST   /api/admin/animals         -> { data: Animal }
 *   PUT    /api/admin/animals/:id     -> { data: Animal }
 *   DELETE /api/admin/animals/:id     -> { success, message }
 *   DELETE /api/admin/animals/:id/image -> { success, message }
 *   GET    /api/animals               -> { data: Animal[], pagination }
 *        (endpoint ini satu-satunya yang mendukung filter `status` dan
 *         `sort` di sisi server, sehingga dipakai untuk tabel + filter)
 */

import type {
  AdminUser,
  AdminAccount,
  AdminHighlight,
  Animal,
  AnimalListResponse,
  AnimalMutationResponse,
  AnimalHighlight,
  ApiSuccess,
  Category,
  DashboardResponse,
  FavoriteEntry,
  LoginResponse,
  LogsResponse,
  Pagination,
  PublicAnimal,
  PublicQuiz,
  Quiz,
  QuizHistoryEntry,
  QuizLeaderboardEntry,
  QuizQuestion,
  QuizSubmitResult,
  UserProfile,
} from './types';

export const API_BASE_URL = (
  typeof window !== 'undefined'
    ? '' // di browser client, gunakan relative proxy Next.js agar terbebas dari kendala CORS
    : (process.env.NEXT_PUBLIC_API_URL || 'https://satwa-lyar-api.vercel.app')
).replace(/\/+$/, '');

export const TOKEN_STORAGE_KEY = 'satwa_lyar_admin_token';
export const USER_STORAGE_KEY = 'satwa_lyar_admin_user';

/** Event yang dipancarkan ketika backend menolak sesi (401/403). */
export const UNAUTHORIZED_EVENT = 'satwa:unauthorized';

/* =========================
 * TOKEN STORAGE
 * ========================= */

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
};

export const getStoredUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: AdminUser): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
};

/* =========================
 * ERROR
 * ========================= */

export class ApiError extends Error {
  status: number;
  details?: Array<{ field?: string; message?: string }>;

  constructor(
    message: string,
    status: number,
    details?: Array<{ field?: string; message?: string }>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/* =========================
 * CORE REQUEST
 * ========================= */

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: BodyInit | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Jangan trigger redirect otomatis (dipakai oleh request auth/me). */
  skipAuthRedirect?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers: extraHeaders, signal, skipAuthRedirect } = options;

  const headers: Record<string, string> = { Accept: 'application/json', ...extraHeaders };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Jangan set Content-Type untuk FormData (browser yang menentukan boundary).
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ?? undefined,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(
      'Tidak dapat terhubung ke server JSN-EDU. Periksa koneksi internet Anda.',
      0
    );
  }

  const rawText = await response.text();
  let payload: unknown = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      (payload as { message?: string } | null)?.message ||
      `Permintaan gagal (HTTP ${response.status}).`;

    if ((response.status === 401 || response.status === 403) && !skipAuthRedirect) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }

    const details = Array.isArray((payload as { errors?: unknown } | null)?.errors)
      ? ((payload as { errors: Array<{ field?: string; message?: string }> }).errors)
      : undefined;

    throw new ApiError(message, response.status, details);
  }

  return payload as T;
}

/* =========================
 * NORMALISASI DATA SATWA
 * ========================= */

/**
 * `GET /api/animals` mengembalikan `category` sebagai objek nested,
 * sedangkan `GET /api/admin/animals` mengembalikan `category_id` +
 * `category_name`. Keduanya dinormalisasi ke satu bentuk `Animal`.
 */
function normalizeAnimal(raw: Record<string, unknown>): Animal {
  const category = raw.category as
    | { id?: number; name?: string; slug?: string; icon?: string | null }
    | undefined;

  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    scientific_name: (raw.scientific_name as string | null) ?? null,
    description: (raw.description as string | null) ?? null,
    physical_traits: (raw.physical_traits as string | null) ?? null,
    habitat: (raw.habitat as string | null) ?? null,
    food: (raw.food as string | null) ?? null,
    conservation_status: (raw.conservation_status as Animal['conservation_status']) ?? null,
    image_key: (raw.image_key as string | null) ?? null,
    image_url: (raw.image_url as string | null) ?? null,
    category_id: Number(category?.id ?? raw.category_id ?? 0),
    category_name: category?.name ?? (raw.category_name as string | undefined),
    category_slug: category?.slug,
    category_icon: category?.icon ?? null,
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

/* =========================
 * QUERY BUILDER
 * ========================= */

type QueryParams = Record<string, string | number | undefined | null>;

const buildQuery = (params: QueryParams | LogsQuery | AnimalListParams): string => {
  const search = new URLSearchParams();
  Object.entries(params as QueryParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

/* =========================
 * AUTH
 * ========================= */

export const authApi = {
  login: (email: string, password: string, signal?: AbortSignal) =>
    apiRequest<LoginResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        signal,
        skipAuthRedirect: true,
      }
    ),

  logout: (signal?: AbortSignal) =>
    apiRequest<ApiSuccess<null>>('/api/auth/logout', {
      method: 'POST',
      signal,
      skipAuthRedirect: true,
    }),

  me: (signal?: AbortSignal) =>
    apiRequest<ApiSuccess<AdminUser>>('/api/auth/me', { signal, skipAuthRedirect: true }),
};

/* =========================
 * DASHBOARD
 * ========================= */

export const dashboardApi = {
  getStats: (signal?: AbortSignal) =>
    apiRequest<DashboardResponse>('/api/admin/dashboard', { signal }),
};

/* =========================
 * KATEGORI / WAHANA
 * ========================= */

export const categoriesApi = {
  getAll: (signal?: AbortSignal) =>
    apiRequest<ApiSuccess<Category[]>>('/api/admin/categories', { signal }),
  create: (input: Pick<Category, 'name' | 'slug'> & Partial<Pick<Category, 'description' | 'icon'>>, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<Category>>('/api/admin/categories', { method: 'POST', body: JSON.stringify(input), signal }),
  update: (id: number, input: Partial<Pick<Category, 'name' | 'slug' | 'description' | 'icon'>>, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<Category>>(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(input), signal }),
  remove: (id: number, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<null>>(`/api/admin/categories/${id}`, { method: 'DELETE', signal }),

  /** Daftar zona/kategori publik (tanpa token admin). */
  getPublic: (signal?: AbortSignal) =>
    apiRequest<ApiSuccess<Category[]>>('/api/categories', { signal, skipAuthRedirect: true }),

  /** Detail zona + daftar satwa di dalamnya (id numerik atau slug). */
  getPublicByIdentifier: (identifier: string | number, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<Category & { animals: PublicAnimal[] }>>(
      `/api/categories/${encodeURIComponent(String(identifier))}`,
      { signal, skipAuthRedirect: true }
    ),
};

export interface QuizQuestionInput {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: QuizQuestion['correct_answer'];
  order_num?: number;
}

export const quizApi = {
  list: (signal?: AbortSignal) => apiRequest<ApiSuccess<Quiz[]>>('/api/admin/quiz', { signal }),
  getById: (id: number, signal?: AbortSignal) => apiRequest<ApiSuccess<Quiz>>(`/api/admin/quiz/${id}`, { signal }),
  create: (input: { title: string; description?: string; category_id?: number | null; is_active: boolean }, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<Quiz>>('/api/admin/quiz', { method: 'POST', body: JSON.stringify(input), signal }),
  update: (id: number, input: { title: string; description?: string; category_id?: number | null; is_active: boolean }, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<Quiz>>(`/api/admin/quiz/${id}`, { method: 'PUT', body: JSON.stringify(input), signal }),
  remove: (id: number, signal?: AbortSignal) => apiRequest<ApiSuccess<null>>(`/api/admin/quiz/${id}`, { method: 'DELETE', signal }),
  createQuestion: (id: number, input: QuizQuestionInput, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<QuizQuestion>>(`/api/admin/quiz/${id}/questions`, { method: 'POST', body: JSON.stringify(input), signal }),
  updateQuestion: (id: number, questionId: number, input: QuizQuestionInput, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<QuizQuestion>>(`/api/admin/quiz/${id}/questions/${questionId}`, { method: 'PUT', body: JSON.stringify(input), signal }),
  removeQuestion: (id: number, questionId: number, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<null>>(`/api/admin/quiz/${id}/questions/${questionId}`, { method: 'DELETE', signal }),
};

export interface AdminAccountsQuery {
  page?: number;
  limit?: number;
  search?: string;
  scope?: 'admin' | 'guest' | 'all';
}

export const adminAccountsApi = {
  list: (params: AdminAccountsQuery, signal?: AbortSignal) =>
    apiRequest<{ success: boolean; data: AdminAccount[]; pagination: Pagination }>(`/api/admin/users${buildQuery(params)}`, { signal }),
  create: (input: { name: string; email: string; password: string }, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<AdminAccount>>('/api/admin/users', { method: 'POST', body: JSON.stringify(input), signal }),
  update: (id: number, input: Partial<{ name: string; email: string; password: string }>, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<AdminAccount>>(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(input), signal }),
  remove: (id: number, signal?: AbortSignal) => apiRequest<ApiSuccess<null>>(`/api/admin/users/${id}`, { method: 'DELETE', signal }),
};

/* =========================
 * LOGS / ANALYTICS
 * ========================= */

export interface LogsQuery {
  page?: number;
  limit?: number;
  event_type?: string;
  actor_type?: string;
  action?: string;
}

export const logsApi = {
  list: (params: LogsQuery, signal?: AbortSignal) =>
    apiRequest<LogsResponse>(`/api/admin/logs${buildQuery(params)}`, { signal }),
};

/* =========================
 * SATWA
 * ========================= */

export interface AnimalListParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  /** Filter status konservasi (IUCN) — didukung oleh `GET /api/animals`. */
  status?: string;
  /** `newest` | `oldest` | `name_asc` | `name_desc`. */
  sort?: string;
  /** Filter kategori berdasarkan slug zona, contoh: `air-tawar`. */
  zone?: string;
}

export const animalsApi = {
  /**
   * Daftar satwa untuk tabel admin.
   *
   *Menggunakan `GET /api/animals` karena hanya endpoint ini yang mendukung
   * `search`, `category_id`, `status` (konservasi) dan `sort` sekaligus di
   * sisi server, sehingga filter & pagination selalu konsisten dengan
   * keseluruhan data (bukan hanya satu halaman).
   *
   * Token admin tetap dikirim pada setiap request, sehingga `req.user` terisi
   * di backend dan halaman pertama tidak pernah dilayani dari cache Redis
   * yang bersama dipakai pengunjung umum (cache hanya aktif bila request
   * tidak membawa token).
   */
  list: async (params: AnimalListParams, signal?: AbortSignal): Promise<AnimalListResponse> => {
    const query = buildQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      category_id: params.category_id,
      status: params.status,
      sort: params.sort,
    });

    const response = await apiRequest<{
      success: boolean;
      data: Record<string, unknown>[];
      pagination: AnimalListResponse['pagination'];
    }>(`/api/animals${query}`, { signal });

    return {
      ...response,
      data: (response.data ?? []).map(normalizeAnimal),
    };
  },

  /** Detail satwa publik. Tidak membutuhkan sesi admin. */
  getPublicById: async (id: string, signal?: AbortSignal) => {
    const response = await apiRequest<{ success: boolean; data: Record<string, unknown> }>(
      `/api/animals/${encodeURIComponent(id)}`,
      { signal, skipAuthRedirect: true }
    );
    return { ...response, data: normalizeAnimal(response.data) };
  },

  /** Detail satwa (field lengkap: habitat, makanan, ciri fisik). */
  getById: async (id: number, signal?: AbortSignal) => {
    const response = await apiRequest<{ success: boolean; data: Record<string, unknown> }>(
      `/api/admin/animals/${id}`,
      { signal }
    );
    return { ...response, data: normalizeAnimal(response.data) };
  },

  create: async (formData: FormData, signal?: AbortSignal): Promise<AnimalMutationResponse> => {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: Record<string, unknown>;
    }>('/api/admin/animals', { method: 'POST', body: formData, signal });
    return { ...response, data: normalizeAnimal(response.data) };
  },

  update: async (
    id: number,
    formData: FormData,
    signal?: AbortSignal
  ): Promise<AnimalMutationResponse> => {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: Record<string, unknown>;
    }>(`/api/admin/animals/${id}`, { method: 'PUT', body: formData, signal });
    return { ...response, data: normalizeAnimal(response.data) };
  },

  remove: (id: number, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<null>>(`/api/admin/animals/${id}`, { method: 'DELETE', signal }),

  removeImage: (id: number, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<null>>(`/api/admin/animals/${id}/image`, { method: 'DELETE', signal }),
};

export const highlightsApi = {
  list: (location: string, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<AnimalHighlight[]>>(
      `/api/highlights?location=${encodeURIComponent(location)}`,
      { signal, skipAuthRedirect: true }
    ),
};

/* =========================
 * SATWA PUBLIK (PENGUNJUNG)
 * ========================= */

/**
 * Daftar satwa untuk halaman zona & daftar publik.
 *
 * Berbeda dengan `animalsApi.list` (dipakai panel admin), versi ini memakai
 * `skipAuthRedirect` sehingga 401/403 tidak memaksa admin keluar dari panel,
 * dan mengembalikan `is_favorite` untuk identitas yang sedang aktif.
 */
export const publicAnimalsApi = {
  list: async (
    params: AnimalListParams,
    signal?: AbortSignal
  ): Promise<AnimalListResponse & { data: PublicAnimal[] }> => {
    const query = buildQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      category_id: params.category_id,
      status: params.status,
      sort: params.sort,
      zone: params.zone,
    });

    const response = await apiRequest<{
      success: boolean;
      data: Record<string, unknown>[];
      pagination: Pagination;
    }>(`/api/animals${query}`, { signal, skipAuthRedirect: true });

    return {
      ...response,
      data: (response.data ?? []).map((raw) => ({
        ...normalizeAnimal(raw),
        is_favorite: Boolean(raw.is_favorite),
      })),
    };
  },

  /** Detail satwa publik lengkap dengan status favorit & satwa terkait. */
  getById: async (id: string | number, signal?: AbortSignal) => {
    const response = await apiRequest<{
      success: boolean;
      data: Record<string, unknown>;
    }>(`/api/animals/${encodeURIComponent(String(id))}`, {
      signal,
      skipAuthRedirect: true,
    });

    return { ...response, data: normalizeAnimal(response.data) };
  },
};

/* =========================
 * FAVORIT
 * ========================= */

export const favoritesApi = {
  list: (params: { page?: number; limit?: number } = {}, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<FavoriteEntry[]> & { pagination: Pagination }>(
      `/api/favorites${buildQuery(params)}`,
      { signal, skipAuthRedirect: true }
    ),

  /** Status favorit satu satwa. */
  check: (animalId: number, signal?: AbortSignal) =>
    apiRequest<{ success: boolean; animal_id: number; is_favorite: boolean }>(
      `/api/favorites/check/${animalId}`,
      { signal, skipAuthRedirect: true }
    ),

  add: (animalId: number, signal?: AbortSignal) =>
    apiRequest<{ success: boolean; message?: string; is_favorite: boolean }>(
      `/api/favorites/${animalId}`,
      { method: 'POST', signal, skipAuthRedirect: true }
    ),

  remove: (animalId: number, signal?: AbortSignal) =>
    apiRequest<{ success: boolean; message?: string; is_favorite: boolean }>(
      `/api/favorites/${animalId}`,
      { method: 'DELETE', signal, skipAuthRedirect: true }
    ),
};

/* =========================
 * KUIS PUBLIK & PENGGUNA
 * ========================= */

export const publicQuizApi = {
  /** Daftar kuis aktif (dapat disaring per zona). */
  list: (params: { category_id?: number; zone?: string } = {}, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<PublicQuiz[]>>(
      `/api/quiz${buildQuery({ category_id: params.category_id, zone: params.zone })}`,
      { signal, skipAuthRedirect: true }
    ),

  /** Soal kuis tanpa kunci jawaban. */
  getById: (id: number, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<PublicQuiz>>(`/api/quiz/${id}`, {
      signal,
      skipAuthRedirect: true,
    }),

  /** Kirim jawaban, backend menghitung skor dan menyimpan riwayat. */
  submit: (
    id: number,
    input: { display_name: string; answers: Array<{ question_id: number; answer: string }> },
    signal?: AbortSignal
  ) =>
    apiRequest<ApiSuccess<QuizSubmitResult>>(`/api/quiz/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
      skipAuthRedirect: true,
    }),

  /** Riwayat pengerjaan kuis milik identitas aktif. */
  history: (params: { page?: number; limit?: number } = {}, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<QuizHistoryEntry[]> & { pagination: Pagination }>(
      `/api/quiz/history${buildQuery(params)}`,
      { signal, skipAuthRedirect: true }
    ),
  leaderboard: (id: number, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<QuizLeaderboardEntry[]>>(`/api/quiz/${id}/leaderboard`, {
      signal,
      skipAuthRedirect: true,
    }),
};

/* =========================
 * PROFIL PENGGUNA
 * ========================= */

export const usersApi = {
  /** Profil + statistik aktivitas identitas aktif (admin atau guest). */
  getProfile: (signal?: AbortSignal) =>
    apiRequest<ApiSuccess<UserProfile>>('/api/users/profile', {
      signal,
      skipAuthRedirect: true,
    }),

  /** Ubah nama profil — hanya admin yang memiliki profil yang dapat diubah. */
  updateProfile: (name: string, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<AdminUser>>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
      signal,
      skipAuthRedirect: true,
    }),

  /** Ganti password — hanya admin yang memiliki password. */
  changePassword: (
    currentPassword: string,
    newPassword: string,
    signal?: AbortSignal
  ) =>
    apiRequest<ApiSuccess<null>>('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
      signal,
      skipAuthRedirect: true,
    }),
};

/* =========================
 * HIGHLIGHT (ADMIN)
 * ========================= */

export const adminHighlightsApi = {
  list: (location?: string, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<AdminHighlight[]>>(
      `/api/admin/highlights${buildQuery({ location })}`,
      { signal }
    ),

  create: (
    input: {
      animal_id: number;
      location: string;
      is_active?: boolean;
      priority?: number;
    },
    signal?: AbortSignal
  ) =>
    apiRequest<ApiSuccess<AdminHighlight>>('/api/admin/highlights', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    }),

  update: (
    id: number,
    input: Partial<{
      animal_id: number;
      location: string;
      is_active: boolean;
      priority: number;
    }>,
    signal?: AbortSignal
  ) =>
    apiRequest<ApiSuccess<AdminHighlight>>(`/api/admin/highlights/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      signal,
    }),

  remove: (id: number, signal?: AbortSignal) =>
    apiRequest<ApiSuccess<null>>(`/api/admin/highlights/${id}`, {
      method: 'DELETE',
      signal,
    }),
};

/* =========================
 * HELPER
 * ========================= */

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';
