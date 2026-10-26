'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PawPrint } from 'lucide-react';
import { getExhibitColor } from '@/lib/utils';

export interface ExhibitDatum {
  name: string;
  total: number;
}

interface ExhibitSummaryChartProps {
  data: ExhibitDatum[];
  loading?: boolean;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: ExhibitDatum }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Wahana
      </p>
      <p className="mt-0.5 text-sm font-bold text-[var(--color-text)]">{point.name}</p>
      <p className="text-xs text-[var(--color-text-secondary)]">
        {point.total} satwa
      </p>
    </div>
  );
}

export default function ExhibitSummaryChart({ data, loading = false }: ExhibitSummaryChartProps) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <section className="sl-card p-4 lg:p-5">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[var(--color-text)]">Distribusi Satwa per Wahana</h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          Jumlah satwa pada setiap wahana berdasarkan data yang tercatat
        </p>
      </div>

      <div className="h-[260px] w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" />
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <PawPrint className="h-7 w-7 text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              Belum ada data satwa per wahana.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 16, right: 8, left: -22, bottom: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ece7" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#8a9a92' }}
                tickLine={false}
                axisLine={{ stroke: '#e6ece7' }}
                interval={0}
                height={38}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#8a9a92' }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(22,163,74,0.06)' }} />
              <Bar dataKey="total" radius={[8, 8, 0, 0]} name="Jumlah satwa" maxBarSize={56}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={getExhibitColor(index).solid} />
                ))}
                <LabelList
                  dataKey="total"
                  position="top"
                  style={{ fontSize: 11, fontWeight: 700, fill: '#4a5b52' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && data.length > 0 && (
        <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
          Total {total} satwa terdaftar pada {data.length} wahana
        </p>
      )}
    </section>
  );
}
