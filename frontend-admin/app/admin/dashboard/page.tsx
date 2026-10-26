import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

/**
 * Halaman dashboard.
 *
 * Komponen utama berada di dalam `<Suspense>` karena membutuhkan tanggal
 * berjalan (bulan/tahun default) yang nilainya harus dihitung ulang pada
 * setiap kunjungan, bukan saat proses build.
 */
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            Menyiapkan dashboard…
          </p>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
