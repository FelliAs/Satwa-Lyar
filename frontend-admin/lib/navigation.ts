import {
  Activity,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  PawPrint,
  Shield,
  Star,
  type LucideIcon,
} from 'lucide-react';

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
  {
    label: 'Kelola Kategori',
    shortLabel: 'Kategori',
    href: '/admin/categories',
    icon: FolderTree,
    description: 'Kelola kategori dan wahana satwa',
  },
  {
    label: 'Highlight Satwa',
    shortLabel: 'Highlight',
    href: '/admin/highlights',
    icon: Star,
    description: 'Kelola satwa unggulan dan lokasi tampil',
  },
  {
    label: 'Kelola Quiz',
    shortLabel: 'Quiz',
    href: '/admin/quiz',
    icon: ClipboardList,
    description: 'Kelola quiz dan pertanyaannya',
  },
  {
    label: 'Administrator',
    shortLabel: 'Admin',
    href: '/admin/users',
    icon: Shield,
    description: 'Kelola akun administrator',
  },
  {
    label: 'Activity Logs',
    shortLabel: 'Logs',
    href: '/admin/logs',
    icon: Activity,
    description: 'Pantau aktivitas dan permintaan sistem',
  },
];

export const findNavItem = (pathname: string): NavItem | undefined =>
  NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
