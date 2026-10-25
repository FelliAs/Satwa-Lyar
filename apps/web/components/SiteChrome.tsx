"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminSurface =
    pathname === "/login" ||
    pathname === "/akses-admin" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isAdminSurface) return <>{children}</>;

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
