/**
 * Utilitas analytics kunjungan website.
 *
 * SUMBER DATA
 * -----------
 * Backend tidak menyediakan endpoint ringkasan harian. Data kunjungan
 * disimpan pada tabel `logs_activity` dengan `event_type = 'page_view'` dan
 * dapat dibaca lewat `GET /api/admin/logs?event_type=page_view`.
 *
 * Endpoint tersebut tidak mendukung filter tanggal, sehingga seluruh event
 * `page_view` diambil (dengan pagination) lalu dikelompokkan per hari
 * di sisi frontend. Pengelompokan memakai tanggal UTC apa adanya, sama
 * seperti `DATE(created_at)` di database, sehingga tidak ada pergeseran hari
 * atau bulan.
 *
 * Event `api_request` TIDAK dihitung — hanya `page_view` yang mewakili
 * satu kunjungan pengunjung.
 */

import { logsApi } from './api';
import type { DailyVisit, LogEntry } from './types';
import { getDaysInMonth, toDayKey } from './utils';

/** Batas jumlah halaman yang diambil dalam satu siklus pemuatan. */
const MAX_PAGES = 40;
/** Batas event yang diproses (100 per halaman). */
const MAX_EVENTS = MAX_PAGES * 100;

export interface PageViewDataset {
  events: LogEntry[];
  /** Event yang tidak berhasil diambil karena melewati batas paging. */
  truncated: boolean;
}

/**
 * Ambil seluruh event `page_view` dari backend.
 */
export const fetchPageViewEvents = async (
  signal?: AbortSignal
): Promise<PageViewDataset> => {
  const events: LogEntry[] = [];
  let total = 0;
  let truncated = false;

  // Halaman pertama untuk mengetahui total event.
  const first = await logsApi.list({ event_type: 'page_view', page: 1, limit: 100 }, signal);
  total = first.pagination?.total ?? 0;
  events.push(...(first.data ?? []));

  const totalPages = first.pagination?.total_pages ?? 1;

  for (let p = 2; p <= totalPages; p += 1) {
    if (events.length >= MAX_EVENTS) {
      truncated = true;
      break;
    }
    const res = await logsApi.list({ event_type: 'page_view', page: p, limit: 100 }, signal);
    events.push(...(res.data ?? []));
  }

  if (events.length >= MAX_EVENTS && total > events.length) {
    truncated = true;
  }

  return { events, truncated: truncated || total > events.length };
};

/**
 * Kelompokkan event `page_view` menjadi deret harian untuk satu periode
 * (bulan + tahun). Hari tanpa kunjungan bernilai 0 — bukan angka rekaan.
 */
export const buildDailyVisits = (
  events: LogEntry[],
  month: number,
  year: number
): DailyVisit[] => {
  const daysInMonth = getDaysInMonth(month, year);
  const prefix = `${year}-${String(month).padStart(2, '0')}`;

  const counters = new Map<string, number>();
  events.forEach((event) => {
    const dayKey = toDayKey(event.created_at);
    if (!dayKey || !dayKey.startsWith(prefix)) return;
    counters.set(dayKey, (counters.get(dayKey) ?? 0) + 1);
  });

  const daily: DailyVisit[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${prefix}-${String(day).padStart(2, '0')}`;
    daily.push({
      date,
      label: String(day),
      visits: counters.get(date) ?? 0,
    });
  }

  return daily;
};

/** Total kunjungan pada satu periode. */
export const sumVisits = (daily: DailyVisit[]): number =>
  daily.reduce((total, item) => total + item.visits, 0);

/** Rata-rata kunjungan per hari pada periode terpilih. */
export const averageVisits = (daily: DailyVisit[]): number =>
  daily.length === 0 ? 0 : sumVisits(daily) / daily.length;

/** Hari dengan kunjungan terbanyak pada periode terpilih. */
export const peakVisit = (daily: DailyVisit[]): DailyVisit | null => {
  if (daily.length === 0) return null;
  return daily.reduce((peak, item) => (item.visits > peak.visits ? item : peak), daily[0]);
};
