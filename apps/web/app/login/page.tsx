'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  Lock,
  Mail,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getNextPath = (): string => {
    if (typeof window === 'undefined') return '/admin/dashboard';
    const next = new URLSearchParams(window.location.search).get('next');
    return next && next.startsWith('/admin') ? next : '/admin/dashboard';
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace(getNextPath());
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(email.trim(), password);
      router.replace(getNextPath());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login gagal. Periksa kembali email dan kata sandi Anda.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh-nature">
        <Loader2 className="spinner h-8 w-8 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-mesh-nature p-4 sm:p-6 lg:p-12">
      <div className="pointer-events-none absolute -left-48 -top-48 h-[550px] w-[550px] rounded-full bg-emerald-400/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[550px] w-[550px] rounded-full bg-teal-500/15 blur-[130px]" />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="mb-7 text-center">
          <div className="mb-3.5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white shadow-xl shadow-emerald-950/20">
            <Leaf className="h-7 w-7 text-emerald-200" strokeWidth={2.3} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
            SATWA LYAR
          </h1>
          <p className="mt-1 text-xs font-medium tracking-wide text-emerald-900/60">
            Portal Administrasi Pengelolaan Data Fauna
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-emerald-950 sm:text-xl">
              Masuk ke Akun Anda
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-emerald-900/60">
              Masukkan kredensial Anda untuk mengakses dashboard admin.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/90 p-3.5 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-950">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-900/40" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@jsnedu.web.id"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-emerald-950/15 bg-white/80 py-3 pl-10 pr-4 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 disabled:opacity-60"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-emerald-950">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-900/40" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-emerald-950/15 bg-white/80 py-3 pl-10 pr-11 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 disabled:opacity-60"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-emerald-900/40 hover:text-emerald-950"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-md shadow-emerald-950/15 transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="spinner h-4 w-4" />
                  <span>Memverifikasi…</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-emerald-950/[0.06] pt-4 text-[11px] font-medium text-emerald-900/50">
            <Shield className="h-3.5 w-3.5 text-emerald-600/70" />
            <span>Koneksi aman dengan enkripsi SSL 256-bit</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-emerald-950/40">
          © SATWA LYAR 2026. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
