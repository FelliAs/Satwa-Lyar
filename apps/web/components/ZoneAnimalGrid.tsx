'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Heart, RefreshCw } from 'lucide-react';
import { favoritesApi, isAbortError, publicAnimalsApi } from '@/lib/api';
import type { PublicAnimal } from '@/lib/types';

const FALLBACK_IMAGE = '/ahay.png';

/** Opsi filter lokal per zona. Nilai `value` dibandingkan dengan `category_name`. */
export interface ZoneFilterOption {
  label: string;
  value: string;
}

interface ZoneAnimalGridProps {
  /** Slug kategori/zona di backend, contoh: `air-tawar`. */
  zone: string;
  /** Opsi filter tambahan. Default: hanya "Semua". */
  filters?: ZoneFilterOption[];
  /** Placeholder kolom pencarian. */
  searchPlaceholder?: string;
  /** Label pada badge kartu. */
  badgeLabel?: (animal: PublicAnimal, activeFilter: string) => string;
}

const PAGE_SIZE = 12;

/**
 * Daftar satwa pada halaman zona.
 *
 * Data diambil dari `GET /api/animals?zone=<slug>` sehingga isi halaman selalu
 * sama dengan data yang dikelola admin lewat panel. Pencarian dilakukan di
 * sisi server (backend mendukung `search`), sedangkan filter turunan label
 * dicocokkan pada `category_name`.
 */
export default function ZoneAnimalGrid({
  zone,
  filters,
  searchPlaceholder = 'Nama satwa atau habitat...',
  badgeLabel,
}: ZoneAnimalGridProps) {
  const [animals, setAnimals] = useState<PublicAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const options = useMemo<ZoneFilterOption[]>(
    () => filters ?? [{ label: 'Semua', value: 'Semua' }],
    [filters]
  );

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      try {
        const response = await publicAnimalsApi.list(
          {
            zone,
            search: search.trim() || undefined,
            page,
            limit: PAGE_SIZE,
          },
          signal
        );
        setAnimals(response.data ?? []);
        setTotal(response.pagination?.total ?? 0);
        setTotalPages(response.pagination?.total_pages ?? 1);
      } catch (err) {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat data satwa.');
        setAnimals([]);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [zone, search, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Filter label turunan (mis. "Ikan", "Mamalia") dicocokkan pada nama kategori.
  const visibleAnimals = useMemo(() => {
    if (activeFilter === 'Semua') return animals;
    return animals.filter((animal) => animal.category_name === activeFilter);
  }, [animals, activeFilter]);

  const toggleFavorite = async (animal: PublicAnimal) => {
    // Optimistic update; request gagal mengembalikan state sebelumnya.
    const previous = animal.is_favorite;
    setAnimals((current) =>
      current.map((item) =>
        item.id === animal.id ? { ...item, is_favorite: !previous } : item
      )
    );

    try {
      if (previous) {
        await favoritesApi.remove(animal.id);
      } else {
        await favoritesApi.add(animal.id);
      }
    } catch {
      setAnimals((current) =>
        current.map((item) =>
          item.id === animal.id ? { ...item, is_favorite: previous } : item
        )
      );
    }
  };

  return (
    <>
      {/* SEARCH */}
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <label
          htmlFor={`search-animal-${zone}`}
          className="block text-xs font-bold uppercase tracking-[0.18em] text-[#858b7e]"
        >
          Cari satwa
        </label>

        <div className="mt-3 flex items-center gap-3 rounded-full border border-[#e5e7dc] bg-[#faf9f4] px-4 py-3 focus-within:border-[#64815c]">
          <span aria-hidden="true">⌕</span>

          <input
            id={`search-animal-${zone}`}
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {/* FILTER */}
      {options.length > 1 && (
        <div className="mx-auto mt-7 flex max-w-7xl flex-wrap gap-2 px-5 lg:px-10">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setActiveFilter(option.value);
                setPage(1);
              }}
              aria-pressed={activeFilter === option.value}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeFilter === option.value
                  ? 'bg-[#315b40] text-white'
                  : 'border border-[#e5e7dc] bg-white text-[#60685d] hover:bg-[#edf0e7]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* CARDS */}
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        {loading ? (
          <div
            className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-live="polite"
            aria-busy="true"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl bg-[#e8ebe2]"
              />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-9 rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-5 py-12 text-center text-sm text-rose-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#315b40] px-4 py-2 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" /> Coba lagi
            </button>
          </div>
        ) : visibleAnimals.length === 0 ? (
          <div className="mt-9 rounded-2xl border border-dashed border-[#d9dfd2] py-14 text-center">
            <p className="text-lg font-bold">Satwa belum ditemukan.</p>
            <p className="mt-2 text-sm text-[#73796e]">
              Coba nama lain atau pilih filter Semua.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setActiveFilter('Semua');
                setPage(1);
              }}
              className="mt-5 rounded-full bg-[#315b40] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reset pencarian
            </button>
          </div>
        ) : (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visibleAnimals.map((animal, index) => (
              <article
                key={animal.id}
                className="group relative overflow-hidden rounded-2xl border border-[#e9e9df] bg-[#faf9f4] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={`/satwa/${animal.id}`} className="block">
                  <div className="relative h-56 overflow-hidden bg-[#e5e9df]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={animal.image_url || FALLBACK_IMAGE}
                      alt={animal.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <span className="absolute left-4 top-4 rounded-full bg-[#faf9f4]/95 px-3 py-1.5 text-xs font-bold text-[#315b40]">
                      {badgeLabel
                        ? badgeLabel(animal, activeFilter)
                        : animal.category_name || 'Satwa'}
                    </span>

                    <span className="absolute bottom-3 right-4 text-sm font-bold text-white drop-shadow">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold">{animal.name}</h3>

                    <p className="mt-1 text-sm italic text-[#858b7e]">
                      {animal.scientific_name || 'Nama ilmiah belum tersedia'}
                    </p>

                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#73796e]">
                      {animal.description || 'Deskripsi satwa belum tersedia.'}
                    </p>

                    <div className="mt-5 border-t border-[#e5e7dc] pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#858b7e]">
                        Habitat
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#315b40]">
                        {animal.habitat || 'Informasi habitat belum tersedia'}
                      </p>
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => void toggleFavorite(animal)}
                  aria-label={
                    animal.is_favorite
                      ? `Hapus ${animal.name} dari favorit`
                      : `Simpan ${animal.name} ke favorit`
                  }
                  aria-pressed={Boolean(animal.is_favorite)}
                  className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#faf9f4]/95 shadow-sm transition hover:scale-110 ${
                    animal.is_favorite ? 'text-rose-600' : 'text-[#858b7e]'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${animal.is_favorite ? 'fill-rose-600' : ''}`}
                  />
                </button>
              </article>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-full border border-[#e5e7dc] bg-white px-4 py-2 text-sm font-semibold text-[#60685d] transition hover:bg-[#edf0e7] disabled:opacity-40"
            >
              Sebelumnya
            </button>

            <span className="text-sm text-[#73796e]">
              Halaman {page} dari {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-full border border-[#e5e7dc] bg-white px-4 py-2 text-sm font-semibold text-[#60685d] transition hover:bg-[#edf0e7] disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        )}

        {!loading && !error && total > 0 && (
          <p className="mt-6 text-center text-xs text-[#858b7e]">
            Menampilkan {visibleAnimals.length} dari {total} satwa pada zona ini.
          </p>
        )}
      </div>
    </>
  );
}
