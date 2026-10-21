export type ActorType = 'guest' | 'admin' | 'system';

export type ActivityEventType =
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

export interface Identity {
  /** Primary key internal untuk relasi database */
  id: number;
  /** ID yang ditampilkan ke aplikasi, contoh: gst_a81f29c4... atau adm_0001 */
  public_id: string;
  name: string | null;
  email: string | null;
  /** 1 = admin, 0 = guest */
  is_admin: number;
  actor_type: ActorType;
}

export interface AuthError {
  status: number;
  code: string;
  message: string;
}

declare global {
  namespace Express {
    interface Request {
      /** ID korelasi log untuk satu request */
      requestId?: string;
      /** Identitas aktif (guest atau admin) */
      user?: Identity;
      /** Hash session id, bukan token mentah */
      sessionIdHash?: string;
      /** IP client yang sudah dinormalisasi */
      clientIp?: string;
      /** Error autentikasi yang terjadi sebelum route dijalankan */
      authError?: AuthError;
    }
  }
}

export {};
