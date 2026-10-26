'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bird,
  Bug,
  ClipboardList,
  Fish,
  LayoutGrid,
  PawPrint,
  Rabbit,
  RefreshCw,
  Turtle,
  Users,
  UserPlus,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import ExhibitSummaryChart from '@/components/ExhibitSummaryChart';
import PeriodFilter from '@/components/PeriodFilter';
import StatCard from '@/components/StatCard';
import VisitAnalyticsChart from '@/components/VisitAnalyticsChart';
import { ErrorState } from '@/components/StateComponents';
import { dashboardApi } from '@/lib/api';
import { buildDailyVisits, fetchPageViewEvents } from '@/lib/analytics';
import type { DashboardData, LogEntry } from '@/lib/types';
import { formatDate, formatNumber, formatPeriodLabel } from '@/lib/utils';

export default function DashboardClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [year, setYear] = useState(now.getUTCFullYear());

  const [data, setData] = useState<DashboardData | null>(null);
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  /* ---------------- muat statistik dashboard ---------------- */
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await dashboardApi.getStats(controller.signal);
        if (cancelled) return;
        setData(res.data);
        setError('');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [reloadKey]);

  /* ---------------- muat log kunjungan ---------------- */
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        const dataset = await fetchPageViewEvents(controller.signal);
        if (cancelled) return;
        setEvents(dataset.events);
        setTruncated(dataset.truncated);
      } catch {
        if (cancelled) return;
        setEvents([]);
      } finally {
        if (!cancelled) setVisitsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [reloadKey]);

  /* ---------------- turunan grafik ---------------- */
  const daily = useMemo(() => buildDailyVisits(events, month, year), [events, month, year]);

  const exhibitData = useMemo(
    () =>
      (data?.animals_by_category ?? []).map((item) => ({
        name: item.category_name,
        total: item.total,
      })),
    [data]
  );

  const categoryCountMap = useMemo(() => {
    const map = new Map<string, number>();
    (data?.animals_by_category ?? []).forEach((c) => {
      map.set(c.category_name.toLowerCase().trim(), Number(c.total));
    });
    return map;
  }, [data]);

  const stats = data?.stats;

  if (error) {
    return (
      <AdminLayout title="Dashboard" subtitle="Ringkasan data dan analitik kunjungan">
        <div className="sl-card">
          <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Ringkasan data SATWA LYAR dan analitik kunjungan pengunjung."
    >
      <div className="space-y-4">
        {/* Filter periode */}
        <section className="sl-card p-4 lg:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text)]">
                Filter Periode Analitik
              </h2>
              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                Grafik kunjungan di bawah mengikuti periode yang dipilih.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setVisitsLoading(true);
                setReloadKey((key) => key + 1);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
            >
              <RefreshCw className={`h-4 w-4 ${loading || visitsLoading ? 'spinner' : ''}`} />
              Muat Ulang
            </button>
          </div>

          <PeriodFilter
            month={month}
            year={year}
            onChange={(nextMonth, nextYear) => {
              setMonth(nextMonth);
              setYear(nextYear);
            }}
          />
        </section>

        {/* Kartu statistik */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total Satwa"
            value={stats?.total_animals ?? 0}
            icon={PawPrint}
            description="Satwa terdaftar"
            loading={loading}
          />
          <StatCard
            label="Total Wahana"
            value={stats?.total_categories ?? 0}
            icon={LayoutGrid}
            description="Kategori satwa"
            tone="amber"
            loading={loading}
          />
          <StatCard
            label="Total Pengunjung"
            value={stats?.total_guests ?? 0}
            icon={Users}
            description="Pengguna anonim"
            tone="sky"
            loading={loading}
          />
          <StatCard
            label="Total Admin"
            value={stats?.total_admins ?? 0}
            icon={UserPlus}
            description="Akun pengelola"
            tone="violet"
            loading={loading}
          />
          <StatCard
            label="Total Kuis"
            value={stats?.total_quizzes ?? 0}
            icon={ClipboardList}
            description="Kuis interaktif"
            tone="rose"
            loading={loading}
          />
          <StatCard
            label="Error 24 Jam"
            value={stats?.errors_24h ?? 0}
            icon={AlertTriangle}
            description="Gangguan 24 jam terakhir"
            tone="slate"
            loading={loading}
          />
        </div>

        {/* Grafik */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <VisitAnalyticsChart
              data={daily}
              loading={visitsLoading}
              periodLabel={formatPeriodLabel(month, year)}
            />
            {truncated && (
              <p className="mt-2 px-1 text-xs text-amber-700">
                Perhatian: jumlah log kunjungan melebihi batas pengambilan sehingga
                grafik hanya menampilkan sebagian data.
              </p>
            )}
          </div>

          <div className="xl:col-span-2">
            <ExhibitSummaryChart data={exhibitData} loading={loading} />
          </div>
        </div>

        {/* Aktivitas terbaru */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Satwa terbaru */}
          <section className="sl-card overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
              <h2 className="text-sm font-bold text-[var(--color-text)]">Satwa Terbaru</h2>
              <span className="rounded-full bg-[var(--color-primary-50)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-primary-dark)]">
                {data?.recent_animals?.length ?? 0} data
              </span>
            </div>
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : (data?.recent_animals?.length ?? 0) === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">
                Belum ada satwa yang terdaftar.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {data?.recent_animals.map((animal) => (
                  <li key={animal.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary)]">
                      <PawPrint className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                        {animal.name}
                      </p>
                      <p className="truncate text-xs text-[var(--color-text-muted)]">
                        {animal.category_name || 'Tanpa kategori'} ·{' '}
                        {formatDate(animal.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Pengunjung terbaru */}
          <section className="sl-card overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
              <h2 className="text-sm font-bold text-[var(--color-text)]">
                Pengunjung Terbaru
              </h2>
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                {data?.recent_guests?.length ?? 0} data
              </span>
            </div>
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : (data?.recent_guests?.length ?? 0) === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">
                Belum ada pengunjung yang tercatat.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {data?.recent_guests.map((guest) => (
                  <li key={guest.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                      <Users className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs font-semibold text-[var(--color-text)]">
                        {guest.public_id}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Bergabung {formatDate(guest.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Ringkasan pengguna */}
        {(data?.users_by_type?.length ?? 0) > 0 && (
          <section className="sl-card p-4 lg:p-5">
            <h2 className="text-base font-bold text-[var(--color-text)]">
              Komposisi Pengguna
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              Total {formatNumber(stats?.total_users ?? 0)} pengguna terdaftar
              {' · '}
              {formatNumber(stats?.total_24h ?? 0)} aktif dalam 24 jam terakhir
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data?.users_by_type.map((item) => (
                <div
                  key={String(item.is_admin)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {item.is_admin ? 'Admin' : 'Pengunjung'}
                  </p>
                  <p className="mt-1 text-xl font-bold text-[var(--color-text)]">
                    {formatNumber(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
}
