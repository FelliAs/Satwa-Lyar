"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin, getAdminToken } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAdminToken()) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login gagal. Coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8faf7] px-5 py-16 text-slate-800">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#254d38] text-xl text-white">
              🌿
            </span>
            <span className="text-lg font-black tracking-tight text-[#254d38]">
              SATWA <span className="text-[#a16b3b]">LYAR</span>
            </span>
          </a>
        </div>

        <div className="rounded-2xl border border-[#e5e7dc] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-black tracking-tight text-[#254d38]">
            Akses Administrator
          </h1>
          <p className="mt-2 text-sm text-[#73796e]">
            Halaman ini hanya untuk administrator SATWA LYAR. Pengunjung umum
            tidak perlu login untuk menjelajahi satwa.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-[#315b40]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#e5e7dc] bg-[#faf9f4] px-4 py-3 text-sm outline-none transition focus:border-[#315b40]"
                placeholder="admin@satwalyar.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-[#315b40]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#e5e7dc] bg-[#faf9f4] px-4 py-3 text-sm outline-none transition focus:border-[#315b40]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#254d38] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#315b40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk sebagai Admin"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#73796e]">
          <a href="/" className="underline underline-offset-4 hover:text-[#315b40]">
            Kembali ke halaman utama
          </a>
        </p>
      </div>
    </main>
  );
}
