'use client';

import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';

/* ---------- Loading ---------- */
export function LoadingState({ label = 'Memuat data…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14">
      <Loader2 className="spinner h-7 w-7 text-[var(--color-primary)]" />
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}

/* ---------- Error ---------- */
export function ErrorState({
  message = 'Terjadi kesalahan saat memuat data.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
        <AlertTriangle className="h-6 w-6 text-rose-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--color-text)]">Gagal memuat data</p>
        <p className="mt-1 max-w-md text-sm text-[var(--color-text-secondary)]">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
        >
          <RefreshCw className="h-4 w-4" />
          Coba lagi
        </button>
      )}
    </div>
  );
}

/* ---------- Empty ---------- */
export function EmptyState({
  title = 'Belum ada data',
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)]">
        <Inbox className="h-6 w-6 text-[var(--color-primary)]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
        {description && (
          <p className="mt-1 max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
