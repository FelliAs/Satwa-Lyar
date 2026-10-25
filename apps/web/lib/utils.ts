/**
 * Utility formatting untuk SATWA LYAR Admin Frontend.
 *
 * CATATAN PENTING SOAL TANGGAL
 * ----------------------------
 * Backend menyimpan `created_at` dalam zona waktu UTC dan menSerialisasinya
 * sebagai ISO-8601 berakhiran `Z` (contoh: `2026-10-21T08:37:51.000Z`).
 * Karena itu seluruh perhitungan periode di file ini memakai *string* tanggal
 * (`YYYY-MM-DD` / `YYYY-MM`) apa adanya, tanpa `new Date(...)` atau
 * `toISOString()` yang bisa menggeser bulan Boundaries.
 */

export const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export const MONTHS_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

/**
 * Daftar tahun yang dapat dipilih.
 * Termasuk tahun berjalan dan tahun-tahun mendatang (mis. 2026 & 2027),
 * bukan hanya tahun saat ini.
 */
export const getYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear - 2; y <= currentYear + 2; y += 1) {
    years.push(y);
  }
  return years;
};

/** Label periode yang mudah dibaca, contoh: "November 2026". */
export const formatPeriodLabel = (month: number, year: number): string =>
  `${MONTHS_ID[month - 1]} ${year}`;

/** Jumlah hari pada bulan tertentu (mengiwa tahun kabisat dengan benar). */
export const getDaysInMonth = (month: number, year: number): number => {
  // new Date(Date.UTC(year, month, 0)) → hari terakhir pada bulan tersebut.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

/** Kunci periode `YYYY-MM` dari month (1-12) + year. */
export const getPeriodKey = (month: number, year: number): string =>
  `${year}-${String(month).padStart(2, '0')}`;

/**
 * Rentang periode dalam bentuk half-open `[start, endExclusive)`.
 * Contoh: November 2026 → `2026-11-01` sampai sebelum `2026-12-01`.
 */
export const getPeriodRange = (
  month: number,
  year: number
): { start: string; endExclusive: string } => {
  const start = `${getPeriodKey(month, year)}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return { start, endExclusive: `${getPeriodKey(nextMonth, nextYear)}-01` };
};

/**
 * Ambil tanggal (`YYYY-MM-DD`) dari timestamp ISO backend.
 * Tidak ada konversi zona waktu sehingga tanggal tidak pernah bergeser.
 */
export const toDayKey = (isoDate: string): string => {
  if (!isoDate) return '';
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(isoDate);
  return match ? match[1] : '';
};

/** Format angka gaya Indonesia, contoh: 1.234. */
export const formatNumber = (value: number | string | null | undefined): string => {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n === null || n === undefined || Number.isNaN(n)) return '0';
  return n.toLocaleString('id-ID');
};

/** Format tanggal lengkap (UTC, tanpa pergeseran hari). */
export const formatDate = (isoDate?: string | null): string => {
  if (!isoDate) return '-';
  const dayKey = toDayKey(isoDate);
  if (!dayKey) return isoDate;
  const [year, month, day] = dayKey.split('-');
  return `${day}/${month}/${year}`;
};

/** Potong teks panjang dengan elipsis. */
export const truncate = (value: string | null | undefined, maxLength: number): string => {
  if (!value) return '';
  const text = value.trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
};

/** Inisial untuk avatar. */
export const getInitials = (name?: string | null): string => {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'A';
};

/** Status konservasi IUCN — label + warna. */
export interface ConservationStatusMeta {
  label: string;
  short: string;
  color: string;
  bg: string;
}

export const CONSERVATION_STATUS_MAP: Record<string, ConservationStatusMeta> = {
  EX: { label: 'Punah', short: 'EX', color: '#1f2937', bg: '#f3f4f6' },
  EW: { label: 'Punah di Alam', short: 'EW', color: '#374151', bg: '#e5e7eb' },
  CR: { label: 'Kritis', short: 'CR', color: '#991b1b', bg: '#fee2e2' },
  EN: { label: 'Genting', short: 'EN', color: '#c2410c', bg: '#ffedd5' },
  VU: { label: 'Rentan', short: 'VU', color: '#b45309', bg: '#fef3c7' },
  NT: { label: 'Hampir Terancam', short: 'NT', color: '#065f46', bg: '#d1fae5' },
  LC: { label: 'Risiko Rendah', short: 'LC', color: '#166534', bg: '#dcfce7' },
  DD: { label: 'Data Kurang', short: 'DD', color: '#6b7280', bg: '#f9fafb' },
  NE: { label: 'Belum Dievaluasi', short: 'NE', color: '#6b7280', bg: '#f9fafb' },
};

export const CONSERVATION_STATUS_OPTIONS = Object.entries(CONSERVATION_STATUS_MAP).map(
  ([code, meta]) => ({ code, label: meta.label })
);

/** Palet warna konsisten untuk visualisasi per wahana. */
export const EXHIBIT_COLOR_PALETTE = [
  { solid: '#16a34a', soft: '#dcfce7', text: '#15803d' },
  { solid: '#0891b2', soft: '#cffafe', text: '#0e7490' },
  { solid: '#ca8a04', soft: '#fef9c3', text: '#a16207' },
  { solid: '#7c3aed', soft: '#ede9fe', text: '#6d28d9' },
  { solid: '#db2777', soft: '#fce7f3', text: '#be185d' },
  { solid: '#ea580c', soft: '#ffedd5', text: '#c2410c' },
];

export const getExhibitColor = (index: number) =>
  EXHIBIT_COLOR_PALETTE[index % EXHIBIT_COLOR_PALETTE.length];
