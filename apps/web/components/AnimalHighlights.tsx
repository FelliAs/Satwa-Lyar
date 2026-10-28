'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { highlightsApi } from '@/lib/api';
import type { AnimalHighlight } from '@/lib/types';

const FALLBACK_IMAGE = '/ahay.png';

interface AnimalHighlightsProps {
  location: string;
  title?: string;
  description?: string;
}

export default function AnimalHighlights({
  location,
  title = 'Highlight Satwa',
  description = 'Kenali satwa pilihan yang telah disiapkan untuk dijelajahi.',
}: AnimalHighlightsProps) {
  const [items, setItems] = useState<AnimalHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    highlightsApi.list(location, controller.signal)
      .then((response) => setItems(response.data ?? []))
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError(reason instanceof Error ? reason.message : 'Highlight satwa gagal dimuat.');
        setItems([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [location]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:px-8" aria-labelledby={`${location}-highlights`}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">PILIHAN UNTUKMU</p>
        <h2 id={`${location}-highlights`} className="section-title">{title}</h2>
        <p className="section-description mx-auto">{description}</p>
      </div>

      {loading && (
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-96 animate-pulse rounded-2xl bg-[#e8ebe2]" />)}
        </div>
      )}

      {!loading && error && (
        <div className="mt-9 rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-5 py-12 text-center text-sm text-rose-700" role="alert">{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-9 rounded-2xl border border-dashed border-[#d9dfd2] py-14 text-center text-sm text-[#73796e]">Belum ada highlight satwa untuk lokasi ini.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((animal, index) => (
            <Link key={`${animal.id}-${animal.priority}`} href={`/satwa/${animal.id}`} className="group overflow-hidden rounded-2xl border border-[#e9e9df] bg-[#faf9f4] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-56 overflow-hidden bg-[#e5e9df]">
                <img src={animal.image_url || FALLBACK_IMAGE} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} alt={animal.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-full bg-[#faf9f4]/95 px-3 py-1.5 text-xs font-bold text-[#315b40]">{animal.category.name}</span>
                <span className="absolute bottom-3 right-4 text-sm font-bold text-white drop-shadow">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold">{animal.name}</h3>
                <p className="mt-1 text-sm italic text-[#858b7e]">{animal.scientific_name || 'Nama ilmiah belum tersedia'}</p>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#73796e]">{animal.description || 'Deskripsi satwa belum tersedia.'}</p>
                <span className="mt-5 inline-flex text-sm font-bold text-[#315b40]">Lihat detail <span className="ml-2">↗</span></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
