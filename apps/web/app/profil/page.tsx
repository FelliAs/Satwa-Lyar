'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Heart,
  KeyRound,
  Loader2,
  Pencil,
  RefreshCw,
  UserRound,
} from 'lucide-react';
import { isAbortError, usersApi } from '@/lib/api';
import type { UserProfile } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const isAdmin = profile?.is_admin === 1 || profile?.is_admin === true;

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const response = await usersApi.getProfile(signal);
      setProfile(response.data);
      setName(response.data.name ?? '');
    } catch (err) {
      if (isAbortError(err)) return;
      setError(err instanceof Error ? err.message : 'Gagal memuat profil.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const saveName = async () => {
    if (!name.trim()) {
      setNotice('Nama tidak boleh kosong.');
      return;
    }
    setSavingName(true);
    setNotice('');
    try {
      await usersApi.updateProfile(name.trim());
      setNotice('Nama profil berhasil diperbarui.');
      setEditingName(false);
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menyimpan nama.');
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      setNotice('Konfirmasi password tidak cocok.');
      return;
    }
    setSavingPassword(true);
    setNotice('');
    try {
      const response = await usersApi.changePassword(
        currentPassword,
        newPassword
      );
      setNotice(response.message || 'Password berhasil diubah.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal mengganti password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#27352b]">
      <section className="mx-auto max-w-4xl px-5 pb-16 pt-28 sm:pt-32 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#64815c] transition hover:text-[#193c30]"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
            Identitas Pengunjung
          </p>
          <h1 className="mt-3 flex items-center gap-3 text-4xl font-black tracking-tight sm:text-5xl">
            <UserRound className="h-9 w-9 text-[#315b40]" /> Profil Saya
          </h1>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-10 space-y-4" aria-busy="true">
            <div className="h-32 animate-pulse rounded-2xl bg-[#e8ebe2]" />
            <div className="h-48 animate-pulse rounded-2xl bg-[#e8ebe2]" />
          </div>
        ) : profile ? (
          <div className="mt-10 space-y-6">
            {/* KARTU IDENTITAS */}
            <section className="rounded-2xl border border-[#e5e7dc] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-[#315b40]">
                    {profile.public_id}
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {profile.name || 'Pengunjung Tanpa Nama'}
                  </p>
                  <p className="mt-1 text-sm text-[#73796e]">
                    {profile.email || 'Tidak ada email (identitas tamu)'}
                  </p>
                  <p className="mt-3 text-xs text-[#858b7e]">
                    Bergabung sejak {formatDate(profile.created_at)} ·{' '}
                    {isAdmin ? 'Administrator' : 'Tamu'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void load()}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e5e7dc] bg-white px-4 py-2 text-sm font-semibold text-[#60685d] transition hover:bg-[#edf0e7]"
                >
                  <RefreshCw className="h-4 w-4" /> Muat ulang
                </button>
              </div>
            </section>

            {/* STATISTIK */}
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#e5e7dc] bg-white p-5">
                <Heart className="h-5 w-5 text-rose-500" />
                <p className="mt-3 text-2xl font-black">
                  {formatNumber(profile.stats.total_favorites)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#858b7e]">
                  Satwa Favorit
                </p>
              </div>

              <div className="rounded-2xl border border-[#e5e7dc] bg-white p-5">
                <Award className="h-5 w-5 text-amber-500" />
                <p className="mt-3 text-2xl font-black">
                  {formatNumber(profile.stats.total_quiz_attempts)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#858b7e]">
                  Kuis Dikerjakan
                </p>
              </div>

              <div className="rounded-2xl border border-[#e5e7dc] bg-white p-5">
                <Award className="h-5 w-5 text-emerald-600" />
                <p className="mt-3 text-2xl font-black">
                  {formatNumber(profile.stats.average_quiz_score)}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#858b7e]">
                  Rata-rata Skor
                </p>
              </div>
            </section>


            {notice && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
                {notice}
              </p>
            )}

            {isAdmin && (
              <>
                <section className="rounded-2xl border border-[#e5e7dc] bg-white p-6">
                  <div className="flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-[#315b40]" />
                    <h2 className="text-lg font-bold">Ubah Nama</h2>
                  </div>
                  {!editingName ? (
                    <button type="button" onClick={() => setEditingName(true)} className="mt-4 rounded-full bg-[#315b40] px-5 py-2.5 text-sm font-semibold text-white">Edit nama profil</button>
                  ) : (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input value={name} onChange={(event) => setName(event.target.value)} className="flex-1 rounded-xl border border-[#e5e7dc] px-4 py-2.5 text-sm outline-none focus:border-[#315b40]" maxLength={255} />
                      <button type="button" onClick={() => void saveName()} disabled={savingName} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#315b40] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{savingName && <Loader2 className="spinner h-4 w-4" />} Simpan</button>
                      <button type="button" onClick={() => setEditingName(false)} className="rounded-full border border-[#e5e7dc] px-5 py-2.5 text-sm font-semibold text-[#60685d]">Batal</button>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-[#e5e7dc] bg-white p-6">
                  <div className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-[#315b40]" /><h2 className="text-lg font-bold">Ganti Password</h2></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <input type="password" placeholder="Password saat ini" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="rounded-xl border border-[#e5e7dc] px-4 py-2.5 text-sm outline-none focus:border-[#315b40]" />
                    <input type="password" placeholder="Password baru" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="rounded-xl border border-[#e5e7dc] px-4 py-2.5 text-sm outline-none focus:border-[#315b40]" />
                    <input type="password" placeholder="Konfirmasi password baru" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="rounded-xl border border-[#e5e7dc] px-4 py-2.5 text-sm outline-none focus:border-[#315b40]" />
                  </div>
                  <button type="button" onClick={() => void savePassword()} disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#315b40] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{savingPassword && <Loader2 className="spinner h-4 w-4" />} Simpan password</button>
                </section>
              </>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

