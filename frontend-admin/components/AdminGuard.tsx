'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Proteksi halaman admin.
 *
 * - Sesi belum diverifikasi → tampilkan spinner.
 * - Tidak terautentikasi / bukan admin → arahkan ke `/login` sambil
 *   menyimpan tujuan awal agar admin kembali ke halaman yang dituju.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/admin/dashboard')}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-bg)]">
        <Loader2 className="spinner h-8 w-8 text-[var(--color-primary)]" />
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Memverifikasi sesi admin…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-bg)]">
        <Loader2 className="spinner h-8 w-8 text-[var(--color-primary)]" />
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Mengalihkan ke halaman masuk…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
