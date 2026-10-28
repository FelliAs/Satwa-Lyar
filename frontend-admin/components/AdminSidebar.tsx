'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#061e12] via-[#051a10] to-[#03140c] text-emerald-100 border-r border-emerald-950/40">
      {/* Brand Header */}
      <div
        className={`flex items-center gap-3 border-b border-white/[0.07] px-5 py-5 ${
          collapsed ? 'justify-center px-2' : ''
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/40 border border-white/20">
          <Leaf className="h-6 w-6 text-white" strokeWidth={2.4} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold tracking-wide text-white">
              SATWA LYAR
            </p>
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
              Admin Dashboard
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-xl p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Tutup navigasi"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-5">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/50">
            Navigasi Utama
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                collapsed ? 'justify-center px-2' : ''
              } ${
                active
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/40 font-bold'
                  : 'text-white/70 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-emerald-300" />
              )}
              <Icon
                className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                  active ? 'text-white' : 'text-emerald-400/80 group-hover:text-emerald-300'
                }`}
                strokeWidth={2.2}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout Section */}
      <div className="border-t border-white/[0.07] p-3.5 bg-black/15">
        <div
          className={`mb-2.5 flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3 border border-white/[0.05] ${
            collapsed ? 'justify-center p-2' : ''
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-800/80 text-xs font-extrabold text-emerald-200 border border-emerald-600/30 shadow-xs">
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">
                {user?.name || 'Administrator'}
              </p>
              <p className="truncate text-[11px] text-emerald-400/60 font-mono">
                {user?.email || 'admin@satwalyar.com'}
              </p>
            </div>
          )}
          {!collapsed && (
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Keluar' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-300/80 transition hover:bg-rose-500/15 hover:text-rose-200 ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={2.2} />
          {!collapsed && <span>Keluar dari Panel</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block ${
          collapsed ? 'w-[80px]' : 'w-[270px]'
        }`}
      >
        <div className="relative h-full">
          {sidebarContent}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="absolute -right-3.5 top-20 z-30 hidden h-7 w-7 items-center justify-center rounded-full border border-emerald-950/20 bg-white text-emerald-950 shadow-md transition hover:bg-emerald-50 hover:scale-110 lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fade-in-overlay absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="slide-in-left absolute inset-y-0 left-0 w-[270px] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
