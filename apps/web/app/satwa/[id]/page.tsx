'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Animal } from '@/lib/types';

const FALLBACK_IMAGE = '/ahay.png';

type AnimalDetail = Animal & {
  category?: { name?: string; slug?: string };
  related_animals?: Array<{ id: number; name: string; image_url?: string | null }>;
};

export default function AnimalDetailPage({ params }: { params: { id: string } }) {
  const [animal, setAnimal] = useState<AnimalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    apiRequest<{ data: AnimalDetail }>(`/api/animals/${encodeURIComponent(params.id)}`, {
      signal: controller.signal,
      skipAuthRedirect: true,
    })
      .then((response) => setAnimal(response.data))
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError(reason instanceof Error ? reason.message : 'Detail satwa gagal dimuat.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [params.id]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#faf9f4] text-[#315b40]">Memuat detail satwa…</main>;
  if (error || !animal) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf9f4] px-5 text-center"><p className="text-rose-700">{error || 'Satwa tidak ditemukan.'}</p><Link href="/" className="rounded-full bg-[#315b40] px-5 py-2.5 font-semibold text-white">Kembali ke beranda</Link></main>;

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#27352b]">
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-8">
        <img src={animal.image_url || FALLBACK_IMAGE} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} alt={animal.name} className="h-[360px] w-full rounded-3xl object-cover shadow-lg sm:h-[480px]" />
        <div>
          <Link href="/" className="text-sm font-semibold text-[#64815c]">← Kembali</Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">{animal.category?.name || 'Satwa'}</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">{animal.name}</h1>
          <p className="mt-2 text-lg italic text-[#858b7e]">{animal.scientific_name || 'Nama ilmiah belum tersedia'}</p>
          <p className="mt-7 leading-8 text-[#73796e]">{animal.description || 'Deskripsi satwa belum tersedia.'}</p>
          {animal.habitat && <div className="mt-7 border-t border-[#e5e7dc] pt-5"><p className="text-xs font-bold uppercase tracking-wider text-[#858b7e]">Habitat</p><p className="mt-1 font-semibold text-[#315b40]">{animal.habitat}</p></div>}
        </div>
      </section>
    </main>
  );
}
