import { randomBytes } from 'crypto';

const GUEST_PREFIX = 'gst_';
const ADMIN_PREFIX = 'adm_';

/**
 * Public ID Guest: gst_<24 hex> (total 28 karakter, muat di VARCHAR(32)).
 * Hanya untuk tracking, bukan token akses.
 */
export const createGuestPublicId = (): string => {
  return `${GUEST_PREFIX}${randomBytes(12).toString('hex')}`;
};

/**
 * Public ID Admin: adm_0001, adm_0002, ... (nomor urut transaksional).
 */
export const formatAdminPublicId = (sequence: number): string => {
  return `${ADMIN_PREFIX}${String(sequence).padStart(4, '0')}`;
};

export const isGuestPublicId = (value: string): boolean => {
  // gst_<24 hex> = guest baru, gst_m<12 digit> = hasil migrasi identitas lama
  return /^gst_(m\d{12}|[0-9a-f]{24})$/.test(value);
};

export const isAdminPublicId = (value: string): boolean => {
  return /^adm_\d{4,}$/.test(value);
};

export const isPublicId = (value: string): boolean => {
  return isGuestPublicId(value) || isAdminPublicId(value);
};
