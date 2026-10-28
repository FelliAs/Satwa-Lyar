'use client';

import { CONSERVATION_STATUS_MAP } from '@/lib/utils';

interface ConservationBadgeProps {
  status?: string | null;
  size?: 'sm' | 'md';
}

export default function ConservationBadge({ status, size = 'sm' }: ConservationBadgeProps) {
  const code = (status || '').toUpperCase();
  const meta = CONSERVATION_STATUS_MAP[code];

  if (!meta) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
        Belum dinilai
      </span>
    );
  }

  const sizeClass =
    size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      title={meta.label}
      className={`inline-flex items-center gap-1 rounded-full font-bold ${sizeClass}`}
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      {meta.short}
      {size === 'md' && <span className="font-medium">· {meta.label}</span>}
    </span>
  );
}
