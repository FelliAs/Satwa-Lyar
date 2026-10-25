'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Menu } from 'lucide-react';
import { findNavItem } from '@/lib/navigation';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function AdminTopbar({ title, subtitle, onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const navItem = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-emerald-950/10 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-3.5 lg:px-8">
        {/* Tombol menu mobile */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Buka menu navigasi"
          className="rounded-xl p-2 text-emerald-950/70 transition hover:bg-emerald-50 hover:text-emerald-950 lg:hidden border border-emerald-950/10"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb & Judul Halaman */}
        <div className="min-w-0 flex-1">
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800/60">
            <span>Portal Admin</span>
            {navItem && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-950 font-bold">{navItem.label}</span>
              </>
            )}
          </nav>
          <h1 className="truncate text-lg sm:text-xl font-extrabold text-emerald-950">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden truncate text-xs text-emerald-900/60 sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Status Sistem & Profil Admin */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span>Online</span>
          </div>

          {/* User Badge */}
          <div className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-emerald-950/10 bg-white p-1.5 pr-3.5 shadow-xs">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-extrabold text-white shadow-xs">
              {getInitials(user?.name)}
            </span>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold leading-tight text-emerald-950">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                Admin Konservasi
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
