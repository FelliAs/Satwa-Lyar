'use client';

import { CalendarDays, ImageOff, Pencil, Trash2 } from 'lucide-react';
import type { Animal } from '@/lib/types';
import ConservationBadge from './ConservationBadge';
import { formatDate, truncate } from '@/lib/utils';

interface AnimalTableProps {
  animals: Animal[];
  loading: boolean;
  onEdit: (animal: Animal) => void;
  onDelete: (animal: Animal) => void;
}

export default function AnimalTable({
  animals,
  loading,
  onEdit,
  onDelete,
}: AnimalTableProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
              <div className="h-2.5 w-1/4 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Satwa
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Wahana
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Status Konservasi
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Deskripsi
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Ditambahkan
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {animals.map((animal) => (
            <tr key={animal.id} className="transition hover:bg-[var(--color-surface-alt)]">
              {/* Satwa */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {animal.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={animal.image_url}
                      alt={animal.name}
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-[var(--color-border)]"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary)]">
                      <ImageOff className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {animal.name}
                    </p>
                    <p className="truncate text-xs italic text-[var(--color-text-muted)]">
                      {animal.scientific_name || 'Nama ilmiah belum diisi'}
                    </p>
                  </div>
                </div>
              </td>

              {/* Wahana */}
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-[var(--color-primary-50)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary-dark)]">
                  {animal.category_name || 'Tanpa kategori'}
                </span>
              </td>

              {/* Status konservasi */}
              <td className="px-4 py-3">
                <ConservationBadge status={animal.conservation_status} />
              </td>

              {/* Deskripsi */}
              <td className="max-w-[260px] px-4 py-3">
                <p
                  className="truncate text-xs text-[var(--color-text-secondary)]"
                  title={animal.description || ''}
                >
                  {animal.description
                    ? truncate(animal.description, 90)
                    : 'Deskripsi belum diisi'}
                </p>
              </td>

              {/* Tanggal */}
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[var(--color-text-secondary)]">
                  <CalendarDays className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  {formatDate(animal.created_at)}
                </span>
              </td>

              {/* Aksi */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(animal)}
                    aria-label={`Ubah ${animal.name}`}
                    title="Ubah data"
                    className="rounded-lg p-2 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(animal)}
                    aria-label={`Hapus ${animal.name}`}
                    title="Hapus data"
                    className="rounded-lg p-2 text-[var(--color-text-secondary)] transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
