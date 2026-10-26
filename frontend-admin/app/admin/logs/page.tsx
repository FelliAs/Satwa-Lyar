'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Loader2, RefreshCw, Search } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { logsApi } from '@/lib/api';
import type { LogEntry, LogEventType } from '@/lib/types';

const pageSize = 20;
const eventTypes: { value: LogEventType | ''; label: string }[] = [
  { value: '', label: 'Semua aktivitas' },
  { value: 'page_view', label: 'Kunjungan halaman' },
  { value: 'api_request', label: 'Permintaan API' },
  { value: 'quiz_payload', label: 'Aktivitas quiz' },
  { value: 'admin_action', label: 'Aksi admin' },
  { value: 'login_success', label: 'Login berhasil' },
  { value: 'login_failed', label: 'Login gagal' },
  { value: 'logout', label: 'Logout' },
  { value: 'access_denied', label: 'Akses ditolak' },
  { value: 'application_error', label: 'Error aplikasi' },
  { value: 'security_event', label: 'Event keamanan' },
];
const actorTypes = [
  { value: '', label: 'Semua aktor' },
  { value: 'admin', label: 'Administrator' },
  { value: 'guest', label: 'Pengunjung' },
  { value: 'system', label: 'Sistem' },
];
const eventLabels: Record<LogEventType, string> = {
  page_view: 'Kunjungan halaman',
  api_request: 'Permintaan API',
  quiz_payload: 'Aktivitas quiz',
  admin_action: 'Aksi admin',
  login_success: 'Login berhasil',
  login_failed: 'Login gagal',
  logout: 'Logout',
  access_denied: 'Akses ditolak',
  application_error: 'Error aplikasi',
  security_event: 'Event keamanan',
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState('');
  const [actorType, setActorType] = useState('');
  const [action, setAction] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await logsApi.list({
        page,
        limit: pageSize,
        event_type: eventType || undefined,
        actor_type: actorType || undefined,
        action: action.trim() || undefined,
      });
      setLogs(response.data ?? []);
      setTotal(response.pagination?.total ?? 0);
      setTotalPages(Math.max(1, response.pagination?.total_pages ?? 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat activity logs.');
    } finally {
      setLoading(false);
    }
  }, [page, eventType, actorType, action]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void loadLogs();
    });
    return () => {
      cancelled = true;
    };
  }, [loadLogs]);

  const applyFilters = () => {
    setPage(1);
    setAction(searchInput.trim());
  };

  const resetFilters = () => {
    setEventType('');
    setActorType('');
    setAction('');
    setSearchInput('');
    setPage(1);
  };

  const eventColor = (type: LogEventType) => {
    if (type === 'login_failed' || type === 'access_denied' || type === 'application_error' || type === 'security_event') {
      return 'bg-rose-50 text-rose-700';
    }
    if (type === 'admin_action' || type === 'login_success') return 'bg-emerald-50 text-emerald-800';
    if (type === 'quiz_payload') return 'bg-violet-50 text-violet-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <AdminLayout
      title="Activity Logs"
      subtitle="Pantau riwayat aktivitas administrator, pengunjung, dan permintaan sistem."
    >
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sl-card flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Activity className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Aktivitas tercatat</p>
              <p className="mt-0.5 text-2xl font-extrabold text-[var(--color-text)]">{total.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="sl-card flex items-center justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Halaman saat ini</p>
              <p className="mt-1 text-sm font-bold text-[var(--color-text)]">Log terbaru ditampilkan lebih dahulu</p>
            </div>
            <button type="button" onClick={() => void loadLogs()} disabled={loading} aria-label="Muat ulang logs" className="rounded-xl border border-[var(--color-border)] p-2.5 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'spinner' : ''}`} />
            </button>
          </div>
        </section>

        <section className="sl-card overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-4">
            <div>
              <h2 className="font-bold text-[var(--color-text)]">Riwayat aktivitas</h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Gunakan filter untuk menemukan aktivitas tertentu.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto_auto]">
              <select value={eventType} onChange={(event) => { setEventType(event.target.value); setPage(1); }} className="h-[42px] rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                {eventTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <select value={actorType} onChange={(event) => { setActorType(event.target.value); setPage(1); }} className="h-[42px] rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                {actorTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <label className="relative sm:col-span-2 xl:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applyFilters(); }} className="h-[42px] w-full rounded-xl border border-[var(--color-border)] bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="Cari aksi..." />
              </label>
              <button type="button" onClick={applyFilters} className="h-[42px] rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800">Terapkan</button>
              <button type="button" onClick={resetFilters} className="h-[42px] rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Reset</button>
            </div>
          </div>

          {error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-rose-700">{error}</p>
              <button type="button" onClick={() => void loadLogs()} className="mt-3 text-sm font-semibold text-emerald-700">Coba lagi</button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-[var(--color-text-muted)]"><Loader2 className="spinner h-5 w-5 text-emerald-600" /> Memuat aktivitas...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">Tidak ada aktivitas yang sesuai dengan filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  <tr><th className="px-5 py-3.5 font-semibold">Aktivitas</th><th className="px-5 py-3.5 font-semibold">Aktor</th><th className="px-5 py-3.5 font-semibold">Endpoint</th><th className="px-5 py-3.5 font-semibold">Status</th><th className="px-5 py-3.5 font-semibold">Waktu</th><th className="px-5 py-3.5 text-right font-semibold">Detail</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {logs.map((log) => (
                    <LogRows
                      key={log.id}
                      log={log}
                      expanded={expandedId === log.id}
                      onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      colorClass={eventColor(log.event_type)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!error && total > 0 && (
            <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-5 py-3.5 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>Menampilkan {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} dari {total} aktivitas</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Sebelumnya</button>
                <span className="px-2">Halaman {page} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Berikutnya</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function LogRows({
  log,
  expanded,
  onToggle,
  colorClass,
}: {
  log: LogEntry;
  expanded: boolean;
  onToggle: () => void;
  colorClass: string;
}) {
  return (
    <>
      <tr className="transition hover:bg-emerald-50/40">
        <td className="px-5 py-4">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${colorClass}`}>
            {eventLabels[log.event_type] || log.event_type}
          </span>
          <p className="mt-1.5 max-w-sm truncate font-semibold text-[var(--color-text)]">{log.action}</p>
        </td>
        <td className="px-5 py-4">
          <p className="font-medium capitalize text-[var(--color-text)]">{log.actor_type}</p>
          {log.user_id && <p className="mt-1 text-xs text-[var(--color-text-muted)]">ID #{log.user_id}</p>}
        </td>
        <td className="px-5 py-4">
          <p className="font-mono text-xs font-semibold text-slate-700">{log.http_method || '—'} {log.endpoint || ''}</p>
          {log.resource_type && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{log.resource_type}{log.resource_id ? ` · ${log.resource_id}` : ''}</p>}
        </td>
        <td className="px-5 py-4">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${(log.success === 1 || log.http_status === 200 || log.http_status === 201) ? 'bg-emerald-50 text-emerald-800' : log.success === 0 || (log.http_status && log.http_status >= 400) ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
            {log.http_status ?? (log.success === 1 ? 'Berhasil' : log.success === 0 ? 'Gagal' : '—')}
          </span>
        </td>
        <td className="px-5 py-4 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">{formatDateTime(log.created_at)}</td>
        <td className="px-5 py-4 text-right">
          <button type="button" onClick={onToggle} aria-label={expanded ? 'Tutup detail log' : 'Lihat detail log'} className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/70">
          <td colSpan={6} className="px-5 py-4">
            <div className="grid gap-3 text-xs sm:grid-cols-2 xl:grid-cols-4">
              <Detail label="Request ID" value={log.request_id} />
              <Detail label="Alamat IP" value={log.ip_address} />
              <Detail label="Durasi" value={log.duration_ms != null ? `${log.duration_ms} ms` : null} />
              <Detail label="Kode error" value={log.error_code} />
              <Detail label="Pesan error" value={log.error_message} />
              <Detail label="Aktor publik" value={log.actor_public_id} />
              <Detail label="User agent" value={log.user_agent} />
              <Detail label="Payload" value={log.payload_json} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="min-w-0">
      <p className="font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-all text-slate-700">{value || '—'}</p>
    </div>
  );
}
