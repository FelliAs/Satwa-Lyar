'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Loader2, Pencil, Plus, RefreshCw, Star, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { highlightsApi } from '@/lib/api';
import type { AnimalHighlight, HighlightAnimalRow, HighlightLocation, HighlightPayload } from '@/lib/types';

const locations: { value: HighlightLocation; label: string }[] = [
  { value: 'landing-page', label: 'Landing page' }, { value: 'air-tawar', label: 'Air Tawar' },
  { value: 'burung', label: 'Burung' }, { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'reptil', label: 'Reptil' }, { value: 'serangga', label: 'Serangga' },
];
const locationLabel = (value: HighlightLocation) => locations.find((item) => item.value === value)?.label ?? value;
const emptyForm: HighlightPayload = { animal_id: 0, location: 'landing-page', is_active: true, priority: 0 };

export default function HighlightsPage() {
  const [animals, setAnimals] = useState<HighlightAnimalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AnimalHighlight | null>(null);
  const [form, setForm] = useState<HighlightPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await highlightsApi.getAll(); setAnimals(response.data ?? []); }
    catch (err) { setError(err instanceof Error ? err.message : 'Gagal memuat highlight satwa.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 1500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openCreate = (animalId = 0) => { setEditing(null); setForm({ ...emptyForm, animal_id: animalId }); setNotice(''); setDialogOpen(true); };
  const openEdit = (animalId: number, item: AnimalHighlight) => {
    setEditing(item); setForm({ animal_id: animalId, location: item.location, is_active: item.is_active, priority: item.priority }); setNotice(''); setDialogOpen(true);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setNotice('');
    try {
      const response = editing ? await highlightsApi.update(editing.id, form) : await highlightsApi.create(form);
      setNotice(response.message || 'Highlight berhasil disimpan.'); setDialogOpen(false); await load();
      if (response.data?.animal_id) {
        setAnimals((current) => {
          const moved = current.find((animal) => animal.id === response.data.animal_id);
          return moved ? [moved, ...current.filter((animal) => animal.id !== moved.id)] : current;
        });
      }
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Gagal menyimpan highlight.'); }
    finally { setSaving(false); }
  };
  const toggle = async (item: AnimalHighlight) => {
    setNotice('');
    try { await highlightsApi.update(item.id, { is_active: !item.is_active }); setNotice(item.is_active ? 'Highlight dinonaktifkan.' : 'Highlight diaktifkan.'); await load();
      setAnimals((current) => {
        const moved = current.find((animal) => animal.id === item.animal_id);
        return moved ? [moved, ...current.filter((animal) => animal.id !== moved.id)] : current;
      }); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Gagal mengubah status highlight.'); }
  };
  const remove = async (item: AnimalHighlight) => {
    if (!window.confirm('Hapus highlight satwa ini?')) return;
    setNotice('');
    try { const response = await highlightsApi.remove(item.id); setNotice(response.message || 'Highlight berhasil dihapus.'); await load(); }
    catch (err) { setNotice(err instanceof Error ? err.message : 'Gagal menghapus highlight.'); }
  };

  const highlightedCount = animals.reduce((total, animal) => total + animal.highlights.length, 0);
  const activeCount = animals.reduce((total, animal) => total + animal.highlights.filter((item) => item.is_active).length, 0);

  return <AdminLayout title="Highlight Satwa" subtitle="Atur satwa unggulan pada landing page dan zona wisata.">
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-3">
        {[['Total satwa', animals.length], ['Konfigurasi highlight', highlightedCount], ['Highlight aktif', activeCount]].map(([label, value]) => <div key={String(label)} className="sl-card flex items-center gap-4 p-5"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Star className="h-6 w-6" /></span><div><p className="text-sm text-[var(--color-text-muted)]">{label}</p><p className="text-2xl font-extrabold">{value}</p></div></div>)}
      </section>
      {notice && <div className={`rounded-xl border px-4 py-3 text-sm ${/gagal|tidak|ditolak|sudah memiliki/i.test(notice) ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} role="status">{notice}</div>}
      <section className="sl-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-bold">Daftar Satwa & Highlight</h2><p className="mt-1 text-xs text-[var(--color-text-muted)]">Satu satwa dapat aktif pada beberapa lokasi sekaligus.</p></div>
          <div className="flex gap-2"><button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-[var(--color-border)] p-2.5 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'spinner' : ''}`} /></button><button type="button" onClick={() => openCreate()} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Tambah Highlight</button></div>
        </div>
        {error ? <div className="p-8 text-center"><p className="text-sm text-rose-700">{error}</p><button type="button" onClick={() => void load()} className="mt-3 text-sm font-semibold text-emerald-700">Coba lagi</button></div>
          : loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-[var(--color-text-muted)]"><Loader2 className="spinner h-5 w-5 text-emerald-600" />Memuat highlight...</div>
          : animals.length === 0 ? <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">Belum ada data satwa.</div>
          : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-text-muted)]"><tr><th className="px-5 py-3.5">Satwa</th><th className="px-5 py-3.5">Lokasi & Status</th><th className="px-5 py-3.5">Priority</th><th className="px-5 py-3.5 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-[var(--color-border)]">
          {animals.map((animal) => <tr key={animal.id} className="align-top hover:bg-emerald-50/40"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">{animal.image_url && <img src={animal.image_url} alt={animal.name} className="h-full w-full object-cover" />}</div><div><p className="font-semibold">{animal.name}</p><p className="text-xs text-[var(--color-text-muted)]">{animal.scientific_name || animal.category_name || '-'}</p></div></div></td><td className="px-5 py-4">{animal.highlights.length ? <div className="space-y-2">{animal.highlights.map((item) => <div key={item.id} className="flex items-center gap-2"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold">{locationLabel(item.location)}</span><span className={`rounded-full px-2 py-1 text-xs font-bold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{item.is_active ? 'Aktif' : 'Nonaktif'}</span></div>)}</div> : <span className="text-xs text-[var(--color-text-muted)]">Belum di-highlight</span>}</td><td className="px-5 py-4">{animal.highlights.length ? animal.highlights.map((item) => <div key={item.id} className="h-[30px] py-1 text-xs font-semibold">{item.priority}</div>) : '-'}</td><td className="px-5 py-4"><div className="flex flex-col items-end gap-1">{animal.highlights.map((item) => <div key={item.id} className="flex gap-1"><button type="button" onClick={() => void toggle(item)} className="rounded-lg border px-2 py-1 text-xs font-semibold">{item.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button><button type="button" onClick={() => openEdit(animal.id, item)} className="rounded-lg border p-1.5" title="Edit"><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={() => void remove(item)} className="rounded-lg border p-1.5 text-rose-600" title="Hapus"><Trash2 className="h-3.5 w-3.5" /></button></div>)}<button type="button" onClick={() => openCreate(animal.id)} className="mt-1 text-xs font-semibold text-emerald-700">Tambah lokasi</button></div></td></tr>)}</tbody></table></div>}
      </section>
    </div>
    {dialogOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold">{editing ? 'Edit Highlight' : 'Tambah Highlight'}</h3><button type="button" onClick={() => setDialogOpen(false)} className="text-xl text-slate-400">×</button></div><label className="block text-sm font-semibold">Satwa<select required value={form.animal_id} onChange={(e) => setForm({ ...form, animal_id: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border px-3 py-2.5"><option value={0}>Pilih satwa</option>{animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.name}</option>)}</select></label><label className="mt-3 block text-sm font-semibold">Lokasi highlight<select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value as HighlightLocation })} className="mt-1.5 w-full rounded-xl border px-3 py-2.5">{locations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="mt-3 block text-sm font-semibold">Priority<input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" /></label><label className="mt-3 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />Aktifkan highlight</label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDialogOpen(false)} className="rounded-xl border px-4 py-2.5 text-sm">Batal</button><button type="submit" disabled={saving || !form.animal_id} className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white">{saving ? 'Menyimpan...' : 'Simpan'}</button></div></form></div>}
  </AdminLayout>;
}
