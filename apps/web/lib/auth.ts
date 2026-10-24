import { apiRequest, ApiError } from './api';

const TOKEN_KEY = 'satwa_lyar_admin_token';
const USER_KEY = 'satwa_lyar_admin_user';

export interface AdminUser {
  id: number;
  public_id: string;
  name: string | null;
  email: string | null;
  is_admin: number;
}

const isBrowser = () => typeof window !== 'undefined';

export const getAdminToken = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const getAdminUser = (): AdminUser | null => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
};

export const saveAdminSession = (token: string, user: AdminUser): void => {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAdminSession = (): void => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};

/**
 * Login admin. Backend hanya menerima akun dengan is_admin = 1.
 */
export const loginAdmin = async (
  email: string,
  password: string
): Promise<AdminUser> => {
  const response = await apiRequest<{ data: { token: string; user: AdminUser } }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );

  const user = response.data?.user;

  if (!user || Number(user.is_admin) !== 1) {
    throw new ApiError(
      'Akses ditolak. Hanya administrator yang dapat masuk.',
      403
    );
  }

  saveAdminSession(response.data.token, user);

  return user;
};

export const logoutAdmin = async (): Promise<void> => {
  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
      headers: getAdminToken()
        ? { Authorization: `Bearer ${getAdminToken()}` }
        : undefined,
    });
  } catch {
    // logout tetap membersihkan sesi lokal
  }

  clearAdminSession();
};
