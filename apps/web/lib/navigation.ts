import { LayoutDashboard, PawPrint, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

/**
 * Menu navigasi panel admin.
 * Halaman di luar daftar ini otomatis mendapat breadcrumb "Admin".
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Ringkasan data dan analitik kunjungan',
  },
  {
    label: 'Kelola Data Satwa',
    shortLabel: 'Data Satwa',
    href: '/admin/animals',
    icon: PawPrint,
    description: 'Tambah, ubah, dan hapus data satwa',
  },
];

export const findNavItem = (pathname: string): NavItem | undefined =>
  NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
