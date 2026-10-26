'use client';

import { Grid2x2 } from 'lucide-react';
import type { Category } from '@/lib/types';
import { getExhibitIcon } from '@/lib/exhibits';
import { formatNumber, getExhibitColor } from '@/lib/utils';

interface ExhibitSelectorProps {
  categories: Category[];
  activeId: number | null;
  onSelect: (categoryId: number | null) => void;
  loading?: boolean;
  totalAnimals?: number;
}

export default function ExhibitSelector({
  categories,
  activeId,
  onSelect,
  loading = false,
  totalAnimals,
}: ExhibitSelectorProps) {
  return (
    <section className="sl-card p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-emerald-950">
              5 Zona Wahana Edukasi
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-emerald-900/60">
            Pilih salah satu zona untuk menyaring data fauna secara spesifik
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
            activeId === null
              ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950/20'
              : 'border border-emerald-950/15 bg-white text-emerald-900/70 hover:border-emerald-600 hover:text-emerald-950'
          }`}
        >
          <Grid2x2 className="h-4 w-4" />
          <span>Tampilkan Semua Zona</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-emerald-950/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, index) => {
            const { emoji, fallback: FallbackIcon } = getExhibitIcon(category);
            const palette = getExhibitColor(index);
            const isActive = activeId === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelect(isActive ? null : category.id)}
                aria-pressed={isActive}
                className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200 ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-lg shadow-emerald-950/10 ring-2 ring-emerald-600/20 -translate-y-1'
                    : 'border-emerald-950/10 bg-white hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-emerald-50/30 hover:shadow-md'
                }`}
              >
                {/* Badge Indicator jika aktif */}
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-600" />
                )}

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-110 shadow-xs ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-emerald-950/5 border border-emerald-950/10'
                  }`}
                >
                  {emoji ? (
                    <span aria-hidden="true">{emoji}</span>
                  ) : (
                    <FallbackIcon className="h-6 w-6 text-emerald-800" />
                  )}
                </div>

                <div className="min-w-0 w-full">
                  <p
                    className={`truncate text-xs font-bold ${
                      isActive ? 'text-emerald-950 font-extrabold' : 'text-emerald-950'
                    }`}
                    title={category.name}
                  >
                    {category.name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-emerald-800/60">
                    {formatNumber(category.total_animals)} Spesies
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {typeof totalAnimals === 'number' && categories.length > 0 && (
        <div className="mt-4 pt-3 border-t border-emerald-950/5 flex items-center justify-between text-xs text-emerald-900/60">
          <span>Menampilkan fauna terpilih</span>
          <span className="font-bold text-emerald-950">{formatNumber(totalAnimals)} Data Satwa</span>
        </div>
      )}
    </section>
  );
}
