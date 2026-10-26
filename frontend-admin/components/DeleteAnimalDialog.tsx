'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import type { Animal } from '@/lib/types';

interface DeleteAnimalDialogProps {
  animal: Animal;
  onClose: () => void;
  onConfirm: (animal: Animal) => Promise<void>;
}

export default function DeleteAnimalDialog({
  animal,
  onClose,
  onConfirm,
}: DeleteAnimalDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setDeleting(true);
    setError('');
    try {
      await onConfirm(animal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus data satwa.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="fade-in-overlay absolute inset-0 bg-black/50"
        onClick={() => !deleting && onClose()}
        aria-hidden="true"
      />

      <div className="fade-in relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-[var(--color-text)]">
              Hapus Data Satwa?
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Data <span className="font-semibold text-[var(--color-text)]">{animal.name}</span>{' '}
              akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="spinner h-4 w-4" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleting ? 'Menghapus…' : 'Hapus Permanen'}
          </button>
        </div>
      </div>
    </div>
  );
}
