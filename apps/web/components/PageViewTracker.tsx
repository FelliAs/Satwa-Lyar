"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiRequest } from "@/lib/api";

const SKIP_PREFIXES = ["/akses-admin", "/admin"];

/**
 * Mengirim notifikasi kunjungan halaman ke backend
 * agar tercatat sebagai event page_view pada logs_activity.
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return;

    void apiRequest("/api/track/page-view", {
      method: "POST",
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {
      // tracking bersifat best-effort, tidak boleh mengganggu halaman
    });
  }, [pathname]);

  return null;
}
