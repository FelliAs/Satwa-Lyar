'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, CalendarDays, TrendingUp } from 'lucide-react';
import type { DailyVisit } from '@/lib/types';
import { averageVisits, peakVisit, sumVisits } from '@/lib/analytics';
import { formatNumber } from '@/lib/utils';

interface VisitAnalyticsChartProps {
  data: DailyVisit[];
  loading?: boolean;
  /** Label periode terpilih, contoh: "Oktober 2026". */
  periodLabel?: string;
}

interface TooltipPayloadItem {
  payload?: DailyVisit;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {point.date}
      </p>
      <p className="mt-0.5 text-sm font-bold text-[var(--color-primary-dark)]">
        {formatNumber(point.visits)} kunjungan
      </p>
    </div>
  );
}

export default function VisitAnalyticsChart({
  data,
  loading = false,
  periodLabel,
}: VisitAnalyticsChartProps) {
  const total = sumVisits(data);
  const average = averageVisits(data);
  const peak = peakVisit(data);

  const summary = [
    {
      label: 'Total kunjungan',
      value: formatNumber(total),
      icon: Activity,
      tone: 'bg-[var(--color-primary-100)] text-[var(--color-primary-dark)]',
    },
    {
      label: 'Rata-rata / hari',
      value: average.toLocaleString('id-ID', { maximumFractionDigits: 1 }),
      icon: TrendingUp,
      tone: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Puncak kunjungan',
      value: peak && peak.visits > 0 ? `${peak.label} (${formatNumber(peak.visits)})` : '—',
      icon: CalendarDays,
      tone: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <section className="sl-card p-4 lg:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">Analitik Kunjungan</h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {periodLabel
              ? `Jumlah kunjungan halaman per hari — ${periodLabel}`
              : 'Jumlah kunjungan halaman per hari'}
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-[11px] font-semibold text-[var(--color-primary-dark)]">
          Sumber: log <code className="font-mono">page_view</code>
        </span>
      </div>

      {/* Ringkasan */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-[var(--color-text-muted)]">
                  {item.label}
                </p>
                <p className="truncate text-sm font-bold text-[var(--color-text)]">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grafik */}
      <div className="h-[260px] w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ece7" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#8a9a92' }}
                tickLine={false}
                axisLine={{ stroke: '#e6ece7' }}
                interval="preserveStartEnd"
                minTickGap={12}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#8a9a92' }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#cbd8cf' }} />
              <ReferenceLine
                y={Math.round(average)}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'Rata-rata',
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: '#b45309',
                }}
              />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="var(--color-primary)"
                strokeWidth={2.2}
                fill="url(#visitGradient)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                name="Kunjungan"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
