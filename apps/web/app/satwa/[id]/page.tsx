'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { ApiError, animalsApi } from '@/lib/api';
import type { Animal } from '@/lib/types';
import { CONSERVATION_STATUS_MAP } from '@/lib/utils';

type PageState = 'loading' | 'ready' | 'error' | 'not-found';

const fallbackImage = '/aha.png';

export default function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [state, setState] = useState<PageState>('loading');

  const loadAnimal = useCallback(async (signal?: AbortSignal) => {
    if (!id || !/^\d+$/.test(id)) {
      setState('not-found');
      return;
    }

    setState('loading');
    try {
      const response = await animalsApi.getPublicById(id, signal);
      setAnimal(response.data);
      setState('ready');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setState(error instanceof ApiError && error.status === 404 ? 'not-found' : 'error');
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    void loadAnimal(controller.signal);
    return () => controller.abort();
  }, [id, loadAnimal]);

  if (state === 'loading') {
    return (
      <main className="min-h-screen bg-[#faf9f4] px-5 py-24 text-[#27352b]">
        <div className="mx-auto max-w-6xl animate-pulse space-y-8">
          <div className="h-5 w-32 rounded bg-[#dfe8dc]" />
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-[4/3] rounded-3xl bg-[#dfe8dc]" />
            <div className="space-y-5"><div className="h-12 w-3/4 rounded bg-[#dfe8dc]" /><div className="h-5 w-1/2 rounded bg-[#dfe8dc]" /><div className="h-28 rounded bg-[#dfe8dc]" /></div>
          </div>
        </div>
      </main>
    );
  }

  if (state === 'not-found') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f4] px-5 text-center text-[#27352b]">
        <div><p className="text-sm font-bold uppercase tracking-[0.22em] text-[#64815c]">404</p><h1 className="mt-3 text-3xl font-bold">Satwa tidak ditemukan</h1><p className="mt-3 text-[#73796e]">Data satwa yang kamu cari tidak tersedia.</p><Link href="/" className="mt-7 inline-flex rounded-full bg-[#193c30] px-5 py-3 font-semibold text-white">Kembali ke daftar satwa</Link></div>
      </main>
    );
  }

  if (state === 'error' || !animal) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f4] px-5 text-center text-[#27352b]">
        <div><p className="text-3xl font-bold">Detail satwa belum dapat dimuat</p><p className="mt-3 text-[#73796e]">Periksa koneksi lalu coba lagi.</p><button type="button" onClick={() => void loadAnimal()} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#193c30] px-5 py-3 font-semibold text-white"><RefreshCw className="h-4 w-4" /> Coba lagi</button></div>
      </main>
    );
  }

  const status = animal.conservation_status ? CONSERVATION_STATUS_MAP[animal.conservation_status] : null;

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#27352b]">
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:pt-32 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#64815c] transition hover:text-[#193c30]"><ArrowLeft className="h-4 w-4" /> Kembali ke daftar satwa</Link>
        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-start md:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#e8eee5] shadow-sm">
            <img src={animal.image_url || fallbackImage} alt={animal.name} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} />
          </div>
          <article>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">Detail Satwa</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{animal.name}</h1>
            <p className="mt-3 text-lg italic text-[#73796e]">{animal.scientific_name || 'Nama ilmiah belum diisi'}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-[#dfead9] px-4 py-2 text-sm font-semibold text-[#315b40]">{animal.category_name || 'Tanpa kategori'}</span>
              {status && <span className="rounded-full px-4 py-2 text-sm font-semibold" style={{ color: status.color, backgroundColor: status.bg }}>{status.label} ({status.short})</span>}
            </div>
            <p className="mt-8 whitespace-pre-line leading-8 text-[#59665b]">{animal.description || 'Informasi lengkap satwa belum tersedia.'}</p>
          </article>
        </div>
      </section>
      <section className="border-y border-[#e5e7dc] bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:px-10">
          <Info title="Habitat" value={animal.habitat} />
          <Info title="Lokasi persebaran" value={animal.habitat} icon={<MapPin className="h-4 w-4" />} />
          <Info title="Makanan" value={animal.food} />
          <Info title="Ciri fisik" value={animal.physical_traits} />
        </div>
      </section>
    </main>
  );
}

function Info({ title, value, icon }: { title: string; value?: string | null; icon?: ReactNode }) {
  return <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#64815c]">{icon}{title}</p><p className="mt-3 whitespace-pre-line leading-7 text-[#59665b]">{value || 'Informasi belum tersedia.'}</p></div>;
}
