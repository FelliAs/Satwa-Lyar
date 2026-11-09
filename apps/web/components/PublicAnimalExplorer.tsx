'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { animalsApi, isAbortError } from '@/lib/api';
import type { Animal } from '@/lib/types';

const FALLBACK_IMAGE = '/ahay.png';

interface PublicAnimalExplorerProps {
  zone: string;
  title?: string;
}

export default function PublicAnimalExplorer({
  zone,
  title = 'Ensiklopedia Satwa',
}: PublicAnimalExplorerProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    animalsApi
      .list({ zone, search: search.trim(), limit: 50, sort: 'name_asc' }, controller.signal)
      .then((response) => setAnimals(response.data ?? []))
      .catch((reason) => {
        if (isAbortError(reason)) return;
        setError(reason instanceof Error ? reason.message : 'Data satwa gagal dimuat.');
        setAnimals([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, zone]);

  return (
    <section id="jelajahi" className="bg-white px-5 py-16 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">Data dari SATWA LYAR</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-lg leading-7 text-[#73796e]">Data ini terhubung langsung dengan katalog backend dan dapat dikelola dari panel admin.</p>
          </div>
          <label className="w-full md:max-w-sm">
            <span className="mb-2 block text-sm font-semibold">Cari satwa</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nama atau deskripsi satwa..."
              className="w-full rounded-full border border-[#e5e7dc] bg-[#faf9f4] px-5 py-3 text-sm outline-none focus:border-[#64815c]"
            />
          </label>
        </div>

        {loading && <p className="mt-9 text-sm text-[#73796e]" aria-live="polite">Memuat data satwa...</p>}
        {!loading && error && <p className="mt-9 rounded-2xl bg-rose-50 p-5 text-sm text-rose-700" role="alert">{error}</p>}
        {!loading && !error && animals.length === 0 && <p className="mt-9 rounded-2xl border border-dashed border-[#d9dfd2] py-14 text-center text-sm text-[#73796e]">Belum ada satwa untuk zona ini.</p>}

        {!loading && !error && animals.length > 0 && (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {animals.map((animal) => (
              <Link key={animal.id} href={`/satwa/${animal.id}`} className="group overflow-hidden rounded-2xl border border-[#e9e9df] bg-[#faf9f4] transition hover:-translate-y-1 hover:shadow-xl">
                <div className="h-56 overflow-hidden bg-[#e5e9df]">
                  <img src={animal.image_url || FALLBACK_IMAGE} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} alt={animal.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64815c]">{animal.category_name || 'Satwa'}</p>
                  <h3 className="mt-2 text-xl font-bold">{animal.name}</h3>
                  <p className="mt-1 text-sm italic text-[#858b7e]">{animal.scientific_name || 'Nama ilmiah belum tersedia'}</p>
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#73796e]">{animal.description || 'Deskripsi satwa belum tersedia.'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
