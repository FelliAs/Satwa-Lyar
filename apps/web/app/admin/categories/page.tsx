'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { FolderTree, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/lib/types';

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  icon: string;
};

const emptyForm: CategoryForm = { name: '', slug: '', description: '', icon: '' };
const inputClass =
  'mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat kategori.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void loadCategories();
    });
    return () => {
      cancelled = true;
    };
  }, [loadCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setNotice('');
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      icon: category.icon ?? '',
    });
    setNotice('');
    setDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        icon: form.icon.trim(),
      };
      const response = editing
        ? await categoriesApi.update(editing.id, payload)
        : await categoriesApi.create(payload);
      setNotice(response.message || (editing ? 'Kategori diperbarui.' : 'Kategori ditambahkan.'));
      setDialogOpen(false);
      await loadCategories();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menyimpan kategori.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;
    setNotice('');
    try {
      const response = await categoriesApi.remove(category.id);
      setNotice(response.message || 'Kategori berhasil dihapus.');
      await loadCategories();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Gagal menghapus kategori.');
    }
  };

  return (
    <AdminLayout
      title="Kelola Kategori"
      subtitle="Atur kategori dan wahana yang digunakan untuk mengelompokkan data satwa."
    >
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sl-card flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <FolderTree className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Total kategori</p>
              <p className="mt-0.5 text-2xl font-extrabold text-[var(--color-text)]">
                {categories.length}
              </p>
            </div>
          </div>
          <div className="sl-card flex items-center justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Data terbaru</p>
              <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                Kelola kategori satwa
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadCategories()}
              disabled={loading}
              aria-label="Muat ulang kategori"
              className="rounded-xl border border-[var(--color-border)] p-2.5 text-[var(--color-text-secondary)] transition hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'spinner' : ''}`} />
            </button>
          </div>
        </section>

        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
            {notice}
          </div>
        )}

        <section className="sl-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[var(--color-text)]">Daftar kategori</h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Kategori yang terhubung dengan data fauna.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
            >
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </button>
          </div>
          {error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-rose-700">{error}</p>
              <button type="button" onClick={() => void loadCategories()} className="mt-3 text-sm font-semibold text-emerald-700">
                Coba lagi
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-[var(--color-text-muted)]">
              <Loader2 className="spinner h-5 w-5 text-emerald-600" /> Memuat kategori...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">
              Belum ada kategori. Tambahkan kategori pertama untuk mulai mengelompokkan satwa.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Kategori</th>
                    <th className="px-5 py-3.5 font-semibold">Slug</th>
                    <th className="px-5 py-3.5 font-semibold">Jumlah satwa</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {categories.map((category) => (
                    <tr key={category.id} className="transition hover:bg-emerald-50/40">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[var(--color-text)]">{category.name}</p>
                        {category.description && (
                          <p className="mt-1 max-w-md truncate text-xs text-[var(--color-text-muted)]">
                            {category.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[var(--color-text-secondary)]">{category.slug}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          {category.total_animals} satwa
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEdit(category)} aria-label={`Edit ${category.name}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => void handleDelete(category)} aria-label={`Hapus ${category.name}`} className="rounded-lg border border-slate-200 p-2 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <button type="button" aria-label="Tutup form" onClick={() => setDialogOpen(false)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
          <form onSubmit={(event) => void handleSubmit(event)} className="relative z-10 my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-[var(--color-text)]">{editing ? 'Ubah kategori' : 'Tambah kategori'}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Informasi ini akan digunakan pada data dan filter satwa.</p>
            {notice && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{notice}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Nama kategori
                <input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} placeholder="Contoh: Mamalia" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Slug
                <input required maxLength={100} pattern="[a-z0-9-]+" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase().replace(/\s+/g, '-') })} className={inputClass} placeholder="mamalia" />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Deskripsi
                <textarea maxLength={500} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} placeholder="Deskripsi singkat kategori..." />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Ikon (opsional)
                <input maxLength={255} value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} className={inputClass} placeholder="Nama ikon atau URL ikon" />
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDialogOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                {saving && <Loader2 className="spinner h-4 w-4" />}
                {saving ? 'Menyimpan...' : 'Simpan kategori'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
