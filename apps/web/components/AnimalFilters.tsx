'use client';

import { Filter, RotateCcw } from 'lucide-react';
import type { Category } from '@/lib/types';
import { CONSERVATION_STATUS_OPTIONS } from '@/lib/utils';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'name_asc', label: 'Nama (A–Z)' },
  { value: 'name_desc', label: 'Nama (Z–A)' },
];

interface AnimalFiltersProps {
  status: string;
  onStatusChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  categoryId: number | null;
  onCategoryChange: (value: number | null) => void;
  categories: Category[];
  onReset: () => void;
}

const selectClass =
  'w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15';

export default function AnimalFilters({
  status,
  onStatusChange,
  sort,
  onSortChange,
  categoryId,
  onCategoryChange,
  categories,
  onReset,
}: AnimalFiltersProps) {
  const activeCount =
    (status ? 1 : 0) + (sort !== 'newest' ? 1 : 0) + (categoryId ? 1 : 0);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="flex items-center gap-2 lg:hidden">
        <Filter className="h-4 w-4 text-[var(--color-text-muted)]" />
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Filter
          {activeCount > 0 && ` (${activeCount})`}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
            Wahana
          </span>
          <select
            value={categoryId ?? ''}
            onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">Semua Wahana</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
            Status Konservasi
          </span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Semua Status</option>
            {CONSERVATION_STATUS_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.code} · {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
            Urutkan
          </span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className={selectClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filter
        </button>
      )}
    </div>
  );
}
