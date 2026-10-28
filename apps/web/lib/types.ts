/**
 * Types untuk SATWA LYAR Admin Frontend.
 *
 * Seluruh bentuk data di bawah ini mengikuti response API backend
 * (`apps/api` / deployment `satwa-lyar-api.vercel.app`) secara langsung.
 */

/* =========================
 * GENERIK
 * ========================= */

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiSuccess<T> {
  success: boolean;
  message?: string;
  request_id?: string;
  data: T;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  request_id?: string;
}

/* =========================
 * AUTH
 * ========================= */

/**
 * Backend menyimpan role admin sebagai flag boolean `is_admin`
 * (bukan enum `role`), dan profil non-admin di-anonymisasi menjadi
 * `guest` (name/email bernilai null).
 */
export interface AdminUser {
  id: number;
  public_id?: string;
  name: string | null;
  email: string | null;
  is_admin?: 0 | 1 | boolean;
  role?: 'admin' | 'user' | string;
  actor_type?: 'guest' | 'admin' | 'system';
  created_at?: string;
  total_favorites?: number;
  total_quiz_attempts?: number;
  average_quiz_score?: number;
}

export interface LoginPayload {
  token: string;
  user: AdminUser;
}

export interface LoginResponse extends ApiSuccess<LoginPayload> {
  message: string;
}

export type RegisterResponse = LoginResponse;

/* =========================
 * KATEGORI / WAHANA
 * ========================= */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  total_animals: number;
  created_at?: string;
}

export interface AdminAccount {
  id: number;
  public_id?: string;
  name: string;
  email: string;
  is_admin: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id?: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  order_num: number;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  is_active: number | boolean;
  total_questions?: number;
  created_at?: string;
  questions?: QuizQuestion[];
}

/* =========================
 * SATWA
 * ========================= */

export type ConservationStatus =
  | 'EX'
  | 'EW'
  | 'CR'
  | 'EN'
  | 'VU'
  | 'NT'
  | 'LC'
  | 'DD'
  | 'NE';

/**
 * Bentuk data satwa yang sudah dinormalisasi di `lib/api.ts`.
 *
 * - `GET /api/admin/animals` mengembalikan `category_id` + `category_name`.
 * - `GET /api/animals` (publik, dipakai untuk list + filter server-side)
 *   mengembalikan `category: { id, name, slug, icon }`.
 *
 * Keduanya dinormalisasi menjadi bentuk di bawah agar tabel & form
 * konsisten.
 */
export interface Animal {
  id: number;
  name: string;
  scientific_name?: string | null;
  description?: string | null;
  physical_traits?: string | null;
  habitat?: string | null;
  food?: string | null;
  conservation_status?: ConservationStatus | null;
  image_key?: string | null;
  image_url?: string | null;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  category_icon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AnimalHighlight {
  id: number;
  name: string;
  scientific_name?: string | null;
  description?: string | null;
  priority: number;
  image_url?: string | null;
  image_key?: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
  };
}

export interface AnimalListResponse extends ApiSuccess<Animal[]> {
  pagination: Pagination;
}

export type AnimalDetailResponse = ApiSuccess<Animal>;

export interface AnimalMutationResponse extends ApiSuccess<Animal> {
  message: string;
}

/** Field form mengikuti kolom tabel `animals` pada database. */
export interface AnimalFormValues {
  category_id: number | '';
  name: string;
  scientific_name: string;
  description: string;
  physical_traits: string;
  habitat: string;
  food: string;
  conservation_status: ConservationStatus | '';
}

export type AnimalFormErrors = Partial<Record<keyof AnimalFormValues | 'image', string>>;

/* =========================
 * DASHBOARD
 * ========================= */

export interface DashboardStats {
  total_animals: number;
  total_categories: number;
  total_quizzes: number;
  total_guests: number;
  total_admins: number;
  total_users: number;
  total_24h: number;
  errors_24h: number;
  quiz_payloads_24h: number;
}

export interface RecentAnimal {
  id: number;
  name: string;
  scientific_name?: string | null;
  image_key?: string | null;
  category_name?: string | null;
  created_at: string;
}

export interface RecentGuest {
  id: number;
  public_id: string;
  created_at: string;
}

export interface AnimalsByCategory {
  category_name: string;
  total: number;
}

export interface UsersByType {
  is_admin: 0 | 1 | boolean;
  total: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_animals: RecentAnimal[];
  recent_guests: RecentGuest[];
  animals_by_category: AnimalsByCategory[];
  users_by_type: UsersByType[];
}

export type DashboardResponse = ApiSuccess<DashboardData>;

/* =========================
 * LOGS / ANALYTICS KUNJUNGAN
 * ========================= */

export type LogEventType =
  | 'page_view'
  | 'api_request'
  | 'quiz_payload'
  | 'admin_action'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'access_denied'
  | 'application_error'
  | 'security_event';

export interface LogEntry {
  id: number;
  request_id?: string | null;
  user_id?: number | null;
  actor_public_id: string;
  actor_type: 'guest' | 'admin' | 'system';
  event_type: LogEventType;
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
  payload_json?: string | null;
  payload_size_bytes?: number | null;
  error_code?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface LogsResponse extends ApiSuccess<LogEntry[]> {
  pagination: Pagination;
}

/** Satu titik data pada grafik kunjungan harian. */
export interface DailyVisit {
  /** Tanggal hari dalam format YYYY-MM-DD (mengikuti zona waktu server). */
  date: string;
  /** Label tanggal untuk sumbu horizontal, contoh: "1", "15", "31". */
  label: string;
  /** Jumlah kunjungan pada tanggal tersebut. */
  visits: number;
}
