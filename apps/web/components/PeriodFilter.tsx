'use client';

import { CalendarRange } from 'lucide-react';
import { MONTHS_ID, formatPeriodLabel, getYearOptions } from '@/lib/utils';

interface PeriodFilterProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

/**
 * Filter periode (bulan & tahun) untuk analitik kunjungan.
 * Dipakai pada dashboard dan halaman data satwa.
 */
export default function PeriodFilter({ month, year, onChange }: PeriodFilterProps) {
  const years = getYearOptions();

  const selectClass =
    'rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <CalendarRange className="h-4 w-4 text-[var(--color-primary)]" />
        <span>
          Periode aktif:{' '}
          <span className="font-semibold text-[var(--color-text)]">
            {formatPeriodLabel(month, year)}
          </span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="filter-month">
          Bulan
        </label>
        <select
          id="filter-month"
          value={month}
          onChange={(e) => onChange(Number(e.target.value), year)}
          className={selectClass}
        >
          {MONTHS_ID.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="filter-year">
          Tahun
        </label>
        <select
          id="filter-year"
          value={year}
          onChange={(e) => onChange(month, Number(e.target.value))}
          className={selectClass}
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
