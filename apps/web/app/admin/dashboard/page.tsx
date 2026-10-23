"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getAdminToken, getAdminUser, logoutAdmin } from "@/lib/auth";

interface DashboardStats {
  total_animals: number;
  total_categories: number;
  total_quizzes: number;
  total_guests: number;
  total_admins: number;
  total_users: number;
  total_24h: number;
  errors_24h: number;
  quiz_payloads_24h: number;
}

interface RecentGuest {
  id: number;
  public_id: string;
  created_at: string;
}

interface ActivityLog {
  id: number;
  actor_public_id: string;
  actor_type: string;
  event_type: string;
  action: string;
  endpoint: string | null;
  http_status: number | null;
  created_at: string;
}

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [guests, setGuests] = useState<RecentGuest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const user = getAdminUser();

  useEffect(() => {
    const token = getAdminToken();

    if (!token) {
      router.replace("/akses-admin");
      return;
    }

    const load = async () => {
      try {
        const [dashboard, activity] = await Promise.all([
          apiRequest<{
            stats: DashboardStats;
            recent_guests: RecentGuest[];
          }>("/api/admin/dashboard", { token }),
          apiRequest<ActivityLog[]>("/api/admin/logs?limit=10", { token }),
        ]);

        setStats(dashboard.data?.stats ?? null);
        setGuests(dashboard.data?.recent_guests ?? []);
        setLogs(activity.data ?? []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal memuat data dashboard.";

        if (message.toLowerCase().includes("akses ditolak")) {
          router.replace("/akses-admin");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/akses-admin");
  };

  const cards = stats
    ? [
        { label: "Total Fauna", value: stats.total_animals, icon: "🦎" },
        { label: "Kategori/Zona", value: stats.total_categories, icon: "🗂️" },
        { label: "Total Kuis", value: stats.total_quizzes, icon: "🧠" },
        { label: "Pengunjung", value: stats.total_guests, icon: "👥" },
        { label: "Administrator", value: stats.total_admins, icon: "🛡️" },
        { label: "Log 24 Jam", value: stats.total_24h, icon: "🗒️" },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#f8faf7] px-5 py-10 text-slate-800 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#a16b3b]">
              Dashboard Admin
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#254d38]">
              Halo, {user?.name ?? "Administrator"}
            </h1>
            <p className="mt-1 text-sm text-[#73796e]">
              ID Administrator:{" "}
              <span className="font-mono font-bold text-[#315b40]">
                {user?.public_id ?? "-"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-xl border border-[#e5e7dc] bg-white px-4 py-2.5 text-sm font-bold text-[#315b40] transition hover:border-[#315b40]"
            >
              Lihat Situs
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-[#254d38] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#315b40]"
            >
              Keluar
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[#73796e]">Memuat data dashboard...</p>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-[#e5e7dc] bg-white p-5"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {card.icon}
                  </span>
                  <p className="mt-3 text-2xl font-black text-[#254d38]">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#73796e]">
                    {card.label}
                  </p>
                </div>
              ))}
            </section>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-[#e5e7dc] bg-white p-6">
                <h2 className="text-base font-black text-[#254d38]">
                  Pengunjung Terbaru
                </h2>
                <p className="mt-1 text-xs text-[#73796e]">
                  Identitas guest dibuat otomatis saat pengunjung pertama
                  kali membuka situs.
                </p>

                {guests.length === 0 ? (
                  <p className="mt-5 text-sm text-[#73796e]">
                    Belum ada data pengunjung.
                  </p>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {guests.map((guest) => (
                      <li
                        key={guest.id}
                        className="flex items-center justify-between gap-3 border-b border-[#eef0e6] pb-2 last:border-0"
                      >
                        <span className="truncate font-mono text-sm text-[#315b40]">
                          {guest.public_id}
                        </span>
                        <span className="shrink-0 text-xs text-[#73796e]">
                          {formatDate(guest.created_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-[#e5e7dc] bg-white p-6">
                <h2 className="text-base font-black text-[#254d38]">
                  Aktivitas Terbaru
                </h2>
                <p className="mt-1 text-xs text-[#73796e]">
                  bersumber dari tabel{" "}
                  <span className="font-mono">logs_activity</span>
                </p>

                {logs.length === 0 ? (
                  <p className="mt-5 text-sm text-[#73796e]">
                    Belum ada aktivitas tercatat.
                  </p>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {logs.map((log) => (
                      <li
                        key={log.id}
                        className="border-b border-[#eef0e6] pb-2 last:border-0"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-bold text-[#315b40]">
                            {log.action}
                          </span>
                          <span className="shrink-0 rounded-full bg-[#eef0e6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#555b50]">
                            {log.event_type}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-[#73796e]">
                          {log.actor_public_id} · {log.endpoint ?? "-"} ·{" "}
                          {formatDate(log.created_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
