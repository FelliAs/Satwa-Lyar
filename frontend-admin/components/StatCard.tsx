'use client';

import type { LucideIcon } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export type StatTone = 'primary' | 'amber' | 'sky' | 'violet' | 'rose' | 'slate';

const TONE_STYLES: Record<StatTone, { iconBg: string; iconColor: string }> = {
  primary: { iconBg: 'bg-[var(--color-primary-100)]', iconColor: 'text-[var(--color-primary-dark)]' },
  amber: { iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
  sky: { iconBg: 'bg-sky-100', iconColor: 'text-sky-700' },
  violet: { iconBg: 'bg-violet-100', iconColor: 'text-violet-700' },
  rose: { iconBg: 'bg-rose-100', iconColor: 'text-rose-700' },
  slate: { iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  tone?: StatTone;
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  description,
  tone = 'primary',
  loading = false,
}: StatCardProps) {
  const styles = TONE_STYLES[tone] || TONE_STYLES.primary;

  return (
    <div className="sl-card sl-card-hover p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
          ) : (
            <p className="mt-1.5 text-2xl font-bold leading-tight text-[var(--color-text)] lg:text-[28px]">
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
          )}
          {description && (
            <p className="mt-1 truncate text-xs text-[var(--color-text-secondary)]">{description}</p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}
        >
          <Icon className={`h-5 w-5 ${styles.iconColor}`} strokeWidth={2.1} />
        </div>
      </div>
    </div>
  );
}
