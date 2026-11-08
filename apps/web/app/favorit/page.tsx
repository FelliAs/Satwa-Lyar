'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { favoritesApi, isAbortError } from '@/lib/api';
import type { FavoriteEntry } from '@/lib/types';

const FALLBACK_IMAGE = '/ahay.png';

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const response = await favoritesApi.list({ limit: 50 }, signal);
      setItems(response.data ?? []);
    } catch (err) {
      if (isAbortError(err)) return;
      setError(
        err instanceof Error ? err.message : 'Gagal memuat daftar favorit.'
      );
      setItems([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const removeFavorite = async (animalId: number) => {
    setRemovingId(animalId);
    try {
      await favoritesApi.remove(animalId);
      setItems((current) =>
        current.filter((entry) => entry.animal.id !== animalId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus favorit.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#27352b]">
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-28 sm:pt-32 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#64815c] transition hover:text-[#193c30]"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
            Koleksi Pribadi
          </p>
          <h1 className="mt-3 flex items-center gap-3 text-4xl font-black tracking-tight sm:text-5xl">
            <Heart className="h-9 w-9 fill-rose-600 text-rose-600" /> Favorit Saya
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-[#73796e]">
            Satwa yang kamu simpan dari halaman zona. Daftar ini tersimpan pada
            server dan bisa dibuka kembali kapan saja dari perangkat yang sama.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl bg-[#e8ebe2]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#d9dfd2] py-16 text-center">
            <Heart className="mx-auto h-10 w-10 text-[#b9c1b0]" />
            <p className="mt-4 text-lg font-bold">Belum ada satwa favorit.</p>
            <p className="mt-2 text-sm text-[#73796e]">
              Tekan ikon hati pada kartu satwa untuk menyimpannya di sini.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-[#315b40] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#193c30]"
            >
              Jelajahi Satwa
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {items.map((entry) => (
              <article
                key={entry.favorite_id}
                className="flex gap-4 rounded-2xl border border-[#e5e7dc] bg-white p-4"
              >
                <Link
                  href={`/satwa/${entry.animal.id}`}
                  className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#e5e9df]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.animal.image_url || FALLBACK_IMAGE}
                    alt={entry.animal.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/satwa/${entry.animal.id}`}>
                    <h2 className="truncate text-lg font-bold hover:text-[#315b40]">
                      {entry.animal.name}
                    </h2>
                  </Link>

                  <p className="mt-0.5 truncate text-sm italic text-[#858b7e]">
                    {entry.animal.scientific_name || 'Nama ilmiah belum tersedia'}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#64815c]">
                    {entry.animal.category.name}
                  </p>

                  <button
                    type="button"
                    onClick={() => void removeFavorite(entry.animal.id)}
                    disabled={removingId === entry.animal.id}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    {removingId === entry.animal.id ? (
                      <Loader2 className="spinner h-3.5 w-3.5" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Hapus dari favorit
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5e7dc] bg-white px-5 py-2.5 text-sm font-semibold text-[#60685d] transition hover:bg-[#edf0e7]"
            >
              <RefreshCw className="h-4 w-4" /> Muat ulang
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

