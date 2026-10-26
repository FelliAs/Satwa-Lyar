'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Tab mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // State Form Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // State Form Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getNextPath = (): string => {
    if (typeof window === 'undefined') return '/admin/dashboard';
    const param = new URLSearchParams(window.location.search).get('next');
    return param && param.startsWith('/admin') ? param : '/admin/dashboard';
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getNextPath());
    }
  }, [isAuthenticated, isLoading, router]);

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await login(loginEmail.trim(), loginPassword);
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

  // Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (regPassword.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(regPassword)) {
      setError('Kata sandi harus mengandung kombinasi huruf besar, huruf kecil, dan angka.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await register(regName.trim(), regEmail.trim(), regPassword);
      setSuccessMessage(res.message || 'Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
      setLoginEmail(regEmail.trim());
      setLoginPassword(regPassword);
      setMode('login');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Pendaftaran gagal. Silakan gunakan email lain atau periksa koneksi Anda.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh-nature">
        <div className="flex flex-col items-center gap-3.5">
          <Loader2 className="spinner h-8 w-8 text-emerald-600" />
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-900/60">
            Memuat Sistem…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-mesh-nature p-4 sm:p-6 lg:p-12 overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-48 -left-48 h-[550px] w-[550px] rounded-full bg-emerald-400/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[550px] w-[550px] rounded-full bg-teal-500/15 blur-[130px]" />

      {/* Main Container */}
      <div className="relative w-full max-w-[440px] z-10">
        {/* Brand Header */}
        <div className="mb-7 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 shadow-xl shadow-emerald-950/20 border border-white/25 text-white mb-3.5 transition-transform hover:scale-105 duration-300">
            <Leaf className="h-7 w-7 text-emerald-200" strokeWidth={2.3} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 font-sans">
            SATWA LYAR
          </h1>
          <p className="mt-1 text-xs font-medium tracking-wide text-emerald-900/60">
            Portal Administrasi Pengelolaan Data Fauna
          </p>
        </div>

        {/* Card Box */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative">
          {/* Minimalist Tab Navigation */}
          <div className="flex items-center justify-center p-1 rounded-2xl bg-emerald-950/[0.04] border border-emerald-950/[0.06] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-900/50 hover:text-emerald-950'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-900/50 hover:text-emerald-950'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6 text-left">
            <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950">
              {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
            </h2>
            <p className="mt-0.5 text-xs text-emerald-900/60 leading-relaxed">
              {mode === 'login'
                ? 'Masukkan kredensial Anda untuk mengakses dashboard admin.'
                : 'Lengkapi formulir di bawah ini untuk mendaftarkan akun.'}
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/90 p-3.5 text-xs text-rose-800 shadow-2xs">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-3.5 text-xs text-emerald-900 shadow-2xs">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="leading-snug">{successMessage}</div>
            </div>
          )}

          {/* ================= FORM LOGIN ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-xs font-bold text-emerald-950 tracking-wide uppercase"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-900/40">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@satwalyar.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-emerald-950/15 bg-white/80 py-3 pl-10 pr-4 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 shadow-2xs disabled:opacity-60"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-xs font-bold text-emerald-950 tracking-wide uppercase"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-900/40">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-emerald-950/15 bg-white/80 py-3 pl-10 pr-11 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 shadow-2xs disabled:opacity-60"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-emerald-900/40 hover:text-emerald-950 transition"
                    aria-label={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 pb-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-emerald-900/70 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-md border-emerald-950/20 text-emerald-600 focus:ring-emerald-500/30 accent-emerald-600"
                  />
                  <span>Ingat sesi saya</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-md shadow-emerald-950/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
          )}

          {/* ================= FORM REGISTER ================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="reg-name"
                  className="mb-1 block text-xs font-bold text-emerald-950 tracking-wide uppercase"
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-900/40">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nama Lengkap"
                    autoComplete="name"
                    className="w-full rounded-2xl border border-emerald-950/15 bg-white/80 py-3 pl-10 pr-4 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 shadow-2xs disabled:opacity-60"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="mb-1 block text-xs font-bold text-emerald-950 tracking-wide uppercase"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-900/40">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-emerald-950/15 bg-white/80 py-3 pl-10 pr-4 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 shadow-2xs disabled:opacity-60"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="mb-1 block text-xs font-bold text-emerald-950 tracking-wide uppercase"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-900/40">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-emerald-950/15 bg-white/80 py-3 pl-10 pr-11 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 shadow-2xs disabled:opacity-60"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-emerald-900/40 hover:text-emerald-950 transition"
                    aria-label={showRegPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-emerald-900/50">
                  Gunakan minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, dan angka.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm"
                  className="mb-1 block text-xs font-bold text-emerald-950 tracking-wide uppercase"
                >
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-900/40">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-confirm"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-emerald-950/15 bg-white/80 py-3 pl-10 pr-4 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 shadow-2xs disabled:opacity-60"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-md shadow-emerald-950/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="spinner h-4 w-4" />
                    <span>Mendaftarkan Akun…</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Akun Baru</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Subtle Security Badge */}
          <div className="mt-6 pt-4 border-t border-emerald-950/[0.06] flex items-center justify-center gap-2 text-[11px] font-medium text-emerald-900/50">
            <Shield className="h-3.5 w-3.5 text-emerald-600/70" />
            <span>Koneksi aman dengan enkripsi SSL 256-bit</span>
          </div>
        </div>

        {/* Outer Footer */}
        <p className="mt-6 text-center text-xs text-emerald-950/40 font-medium">
          © SATWA LYAR 2026. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
