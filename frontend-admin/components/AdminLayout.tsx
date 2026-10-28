'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminGuard from './AdminGuard';
import { useLocalStorageFlag } from '@/hooks/useLocalStorageFlag';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorageFlag(
    'satwa_lyar_sidebar_collapsed',
    false
  );

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
        <AdminSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopbar
            title={title}
            subtitle={subtitle}
            onMenuClick={() => setMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
