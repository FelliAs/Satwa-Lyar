'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  itemLabel?: string;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  itemLabel = 'data',
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 1), safeTotalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);

  // Nomor halaman yang ditampilkan (±1 dari halaman aktif + terakhir).
  const pages: number[] = [];
  const push = (n: number) => {
    if (!pages.includes(n) && n >= 1 && n <= safeTotalPages) pages.push(n);
  };
  push(1);
  for (let n = currentPage - 1; n <= currentPage + 1; n += 1) push(n);
  push(safeTotalPages);
  pages.sort((a, b) => a - b);

  const buttonBase =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-xs text-[var(--color-text-secondary)]">
          Menampilkan <span className="font-semibold text-[var(--color-text)]">{formatNumber(from)}</span>
          –<span className="font-semibold text-[var(--color-text)]">{formatNumber(to)}</span> dari{' '}
          <span className="font-semibold text-[var(--color-text)]">{formatNumber(total)}</span> {itemLabel}
        </p>
        {onLimitChange && (
          <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            Tampilkan
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-xs font-semibold text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
              aria-label="Jumlah data per halaman"
            >
              {LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`${buttonBase} border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)]`}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((n, index) => {
          const previous = pages[index - 1];
          const showGap = previous !== undefined && n - previous > 1;
          return (
            <span key={n} className="flex items-center gap-1">
              {showGap && (
                <span className="px-1 text-xs text-[var(--color-text-muted)]">…</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(n)}
                aria-current={n === currentPage ? 'page' : undefined}
                className={`${buttonBase} ${
                  n === currentPage
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                    : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)]'
                }`}
              >
                {n}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          className={`${buttonBase} border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)]`}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
