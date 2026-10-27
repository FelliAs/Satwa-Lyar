'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { KeyRound, Loader2, Pencil, Plus, RefreshCw, Search, Shield, Trash2, UserRound } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { adminAccountsApi } from '@/lib/api';
import type { AdminAccount } from '@/lib/types';

type AccountForm = { name: string; email: string; password: string };
const blankForm: AccountForm = { name: '', email: '', password: '' };
const inputClass =
  'mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';
const pageSize = 10;

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeIsError, setNoticeIsError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState<AccountForm>(blankForm);
  const [saving, setSaving] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAccountsApi.list({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        role: 'admin',
      });
      setAccounts(response.data ?? []);
      setTotal(response.pagination?.total ?? 0);
      setTotalPages(Math.max(1, response.pagination?.total_pages ?? 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar administrator.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void loadAccounts();
    });
    return () => {
      cancelled = true;
    };
  }, [loadAccounts]);

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setNotice('');
    setNoticeIsError(false);
    setDialogOpen(true);
  };

  const openEdit = (account: AdminAccount) => {
    setEditing(account);
    setForm({ name: account.name, email: account.email, password: '' });
    setNotice('');
    setNoticeIsError(false);
    setDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setNoticeIsError(false);
    try {
      if (editing) {
        const payload: { name: string; email: string; password?: string; role: 'admin' } = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: 'admin',
        };
        if (form.password) payload.password = form.password;
        const response = await adminAccountsApi.update(editing.id, payload);
        setNotice(response.message || 'Akun administrator berhasil diperbarui.');
      } else {
        const response = await adminAccountsApi.create({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: 'admin',
        });
        setNotice(response.message || 'Administrator berhasil ditambahkan.');
      }
      setDialogOpen(false);
      await loadAccounts();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menyimpan akun administrator.');
      setNoticeIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account: AdminAccount) => {
    if (Number(user?.id) === account.id) {
      setNotice('Akun yang sedang digunakan tidak dapat dihapus.');
      setNoticeIsError(true);
      return;
    }
    if (!window.confirm(`Hapus akses administrator untuk ${account.name}?`)) return;
    setNotice('');
    setNoticeIsError(false);
    try {
      const response = await adminAccountsApi.remove(account.id);
      setNotice(response.message || 'Akun administrator berhasil dihapus.');
      await loadAccounts();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menghapus akun administrator.');
      setNoticeIsError(true);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <AdminLayout
      title="Administrator"
      subtitle="Kelola akun yang memiliki akses ke panel administrasi SATWA LYAR."
    >
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sl-card flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Shield className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Total administrator</p>
              <p className="mt-0.5 text-2xl font-extrabold text-[var(--color-text)]">{total}</p>
            </div>
          </div>
          <div className="sl-card flex items-center justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Akses terjaga</p>
              <p className="mt-1 text-sm font-bold text-emerald-800">Hanya role admin yang ditampilkan</p>
            </div>
            <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><KeyRound className="h-5 w-5" /></span>
          </div>
        </section>

        {notice && <div className={`rounded-xl border px-4 py-3 text-sm ${noticeIsError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} role={noticeIsError ? 'alert' : 'status'}>{notice}</div>}

        <section className="sl-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-bold text-[var(--color-text)]">Akun administrator</h2>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Akun dengan izin untuk mengelola data dan konten.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative min-w-0 sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(event) => handleSearchChange(event.target.value)} className="h-[42px] w-full rounded-xl border border-[var(--color-border)] bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder="Cari nama atau email..." />
                </label>
                <button type="button" onClick={() => void loadAccounts()} disabled={loading} aria-label="Muat ulang administrator" className="inline-flex h-[42px] w-[42px] items-center justify-center self-end rounded-xl border border-[var(--color-border)] text-slate-600 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50 sm:self-auto">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'spinner' : ''}`} />
                </button>
                <button type="button" onClick={openCreate} className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]">
                  <Plus className="h-4 w-4" /> Tambah Admin
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-rose-700">{error}</p>
              <button type="button" onClick={() => void loadAccounts()} className="mt-3 text-sm font-semibold text-emerald-700">Coba lagi</button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-[var(--color-text-muted)]"><Loader2 className="spinner h-5 w-5 text-emerald-600" /> Memuat administrator...</div>
          ) : accounts.length === 0 ? (
            <div className="p-12 text-center">
              <UserRound className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">Tidak ada administrator yang cocok dengan pencarian.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  <tr><th className="px-5 py-3.5 font-semibold">Administrator</th><th className="px-5 py-3.5 font-semibold">Email</th><th className="px-5 py-3.5 font-semibold">Bergabung</th><th className="px-5 py-3.5 text-right font-semibold">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {accounts.map((account) => (
                    <tr key={account.id} className="transition hover:bg-emerald-50/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-extrabold text-white">{account.name.slice(0, 2).toUpperCase()}</span>
                          <div><p className="font-semibold text-[var(--color-text)]">{account.name}</p><p className="mt-0.5 text-xs text-slate-500">{Number(user?.id) === account.id ? 'Akun Anda' : 'Administrator'}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-secondary)]">{account.email}</td>
                      <td className="px-5 py-4 text-xs text-[var(--color-text-muted)]">{account.created_at ? new Date(account.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEdit(account)} aria-label={`Edit ${account.name}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700"><Pencil className="h-4 w-4" /></button>
                          <button type="button" onClick={() => void handleDelete(account)} disabled={Number(user?.id) === account.id} aria-label={`Hapus ${account.name}`} className="rounded-lg border border-slate-200 p-2 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!error && total > 0 && (
            <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-5 py-3.5 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>Menampilkan {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} dari {total} administrator</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Sebelumnya</button>
                <span className="px-2">Halaman {page} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Berikutnya</button>
              </div>
            </div>
          )}
        </section>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <button type="button" aria-label="Tutup form" onClick={() => setDialogOpen(false)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
          <form onSubmit={(event) => void handleSubmit(event)} className="relative z-10 my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-[var(--color-text)]">{editing ? 'Ubah administrator' : 'Tambah administrator'}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Akun ini akan mendapat akses penuh ke panel admin.</p>
            {notice && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{notice}</p>}
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Nama
                <input required maxLength={255} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} placeholder="Nama administrator" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Email
                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClass} placeholder="admin@example.com" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">{editing ? 'Password baru (opsional)' : 'Password'}
                <input required={!editing} type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={inputClass} autoComplete={editing ? 'new-password' : 'new-password'} placeholder="Minimal 8 karakter, huruf besar, kecil, dan angka" />
              </label>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
                Role akun: <strong>Administrator</strong>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDialogOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                {saving && <Loader2 className="spinner h-4 w-4" />}{saving ? 'Menyimpan...' : 'Simpan akun'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
