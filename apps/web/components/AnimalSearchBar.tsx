'use client';

import { Loader2, Search, X } from 'lucide-react';

interface AnimalSearchBarProps {
  /** Nilai input pencarian (dikontrol oleh parent). */
  value: string;
  /** Dipanggil setiap kali pengguna mengetik (parent yang melakukan debounce). */
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function AnimalSearchBar({
  value,
  onChange,
  placeholder = 'Cari nama satwa, nama ilmiah, atau deskripsi…',
  loading = false,
}: AnimalSearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Cari data satwa"
        className="w-full rounded-xl border border-[var(--color-border)] bg-white py-2.5 pl-9 pr-9 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
      />
      {loading ? (
        <Loader2 className="spinner absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-primary)]" />
      ) : value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Bersihkan pencarian"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)]"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
