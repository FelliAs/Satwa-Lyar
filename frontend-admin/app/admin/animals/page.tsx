'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AnimalFilters from '@/components/AnimalFilters';
import AnimalForm from '@/components/AnimalForm';
import AnimalSearchBar from '@/components/AnimalSearchBar';
import AnimalTable from '@/components/AnimalTable';
import DeleteAnimalDialog from '@/components/DeleteAnimalDialog';
import ExhibitSelector from '@/components/ExhibitSelector';
import Pagination from '@/components/Pagination';
import Toast, { type ToastMessage } from '@/components/Toast';
import { EmptyState, ErrorState } from '@/components/StateComponents';
import { animalsApi, categoriesApi } from '@/lib/api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Animal, Category } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

const DEFAULT_LIMIT = 10;

export default function AnimalsPage() {
  /* ---------------- state data ---------------- */
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  /* ---------------- state filter ---------------- */
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  /* ---------------- state ui ---------------- */
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [deletingAnimal, setDeletingAnimal] = useState<Animal | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const listAbortRef = useRef<AbortController | null>(null);
  const categoriesAbortRef = useRef<AbortController | null>(null);

  /**
   * Pencarian di-debounce 400 ms. `onDebounced` dipakai untuk mengembalikan
   * nomor halaman ke 1 setiap kali pencarian baru diterapkan.
   */
  const handleSearchApplied = useCallback(() => {
    setPage(1);
    setLoading(true);
  }, []);

  const search = useDebouncedValue(searchInput, 400, handleSearchApplied);

  /* ---------------- pemuatan kategori ---------------- */
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    categoriesAbortRef.current = controller;

    const load = async () => {
      try {
        const res = await categoriesApi.getAll(controller.signal);
        if (cancelled) return;
        setCategories(res.data ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat daftar wahana.');
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [reloadKey]);

  /* ---------------- pemuatan daftar satwa ---------------- */
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    listAbortRef.current = controller;

    const load = async () => {
      try {
        const res = await animalsApi.list(
          {
            page,
            limit,
            search: search || undefined,
            category_id: categoryId ?? undefined,
            status: status || undefined,
            sort,
          },
          controller.signal
        );

        if (cancelled) return;

        setAnimals(res.data ?? []);
        setTotal(res.pagination?.total ?? 0);

        const pages = res.pagination?.total_pages ?? 1;
        setTotalPages(pages);
        setError('');

        // Halaman saat ini sudah tidak valid (mis. data dihapus).
        if (pages < page) setPage(pages);
      } catch (err) {
        if (cancelled) return;
        setAnimals([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : 'Gagal memuat data satwa.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, limit, search, status, sort, categoryId, reloadKey]);

  /* ---------------- handler filter ---------------- */
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
    setLoading(true);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
    setLoading(true);
  };

  const handleCategoryChange = (value: number | null) => {
    setCategoryId(value);
    setPage(1);
    setLoading(true);
  };

  const handleResetFilters = () => {
    setStatus('');
    setSort('newest');
    setCategoryId(null);
    setSearchInput('');
    setPage(1);
    setLoading(true);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
    setLoading(true);
  };

  /* ---------------- handler CRUD ---------------- */
  const handleSubmit = async (formData: FormData) => {
    if (editingAnimal) {
      const res = await animalsApi.update(editingAnimal.id, formData);
      setToast({ type: 'success', text: res.message || 'Data satwa berhasil diperbarui.' });
    } else {
      const res = await animalsApi.create(formData);
      setToast({ type: 'success', text: res.message || 'Data satwa berhasil ditambahkan.' });
    }

    setFormOpen(false);
    setEditingAnimal(null);
    setPage(1);
    setSort('newest');

    // Muat ulang data agar tampilan konsisten dengan server.
    setReloadKey((key) => key + 1);
  };

  const handleEdit = async (animal: Animal) => {
    setDetailLoading(true);
    try {
      // Detail lengkap (habitat, makanan, ciri fisik) hanya tersedia di
      // endpoint admin — endpoint publik `/api/animals/:id` bermasalah.
      const res = await animalsApi.getById(animal.id);
      setEditingAnimal(res.data);
      setFormOpen(true);
    } catch (err) {
      setToast({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal memuat detail satwa.',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (animal: Animal) => {
    const res = await animalsApi.remove(animal.id);
    setDeletingAnimal(null);
    setToast({ type: 'success', text: res.message || 'Data satwa berhasil dihapus.' });
    setReloadKey((key) => key + 1);
  };

  const handleRefresh = () => {
    setLoading(true);
    setLoadingCategories(true);
    setReloadKey((key) => key + 1);
  };

  const activeCategory = categories.find((c) => c.id === categoryId);
  const filteredTotal = activeCategory?.total_animals ?? total;

  return (
    <AdminLayout
      title="Kelola Data Satwa"
      subtitle="Tambah, ubah, hapus, dan filter seluruh data satwa SATWA LYAR."
    >
      <div className="space-y-4">
        {/* Pemilih wahana (dinamis mengikuti data backend) */}
        <ExhibitSelector
          categories={categories}
          activeId={categoryId}
          onSelect={handleCategoryChange}
          loading={loadingCategories}
          totalAnimals={filteredTotal}
        />

        {/* Panel tabel */}
        <section className="sl-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-4 lg:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <AnimalSearchBar
                value={searchInput}
                onChange={handleSearchChange}
                loading={loading && !error}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  aria-label="Muat ulang data"
                  className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'spinner' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingAnimal(null);
                    setFormOpen(true);
                  }}
                  className="inline-flex h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] lg:flex-none"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Satwa
                </button>
              </div>
            </div>

            <AnimalFilters
              status={status}
              onStatusChange={handleStatusChange}
              sort={sort}
              onSortChange={handleSortChange}
              categoryId={categoryId}
              onCategoryChange={handleCategoryChange}
              categories={categories}
              onReset={handleResetFilters}
            />
          </div>

          {/* Tabel */}
          {error ? (
            <ErrorState message={error} onRetry={handleRefresh} />
          ) : animals.length === 0 && !loading ? (
            <EmptyState
              title="Data satwa tidak ditemukan"
              description={
                search || status || categoryId
                  ? 'Coba ubah kata kunci atau filter yang digunakan.'
                  : 'Belum ada satwa yang terdaftar. Klik "Tambah Satwa" untuk membuat data pertama.'
              }
              action={
                <button
                  type="button"
                  onClick={() => {
                    setEditingAnimal(null);
                    setFormOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Satwa
                </button>
              }
            />
          ) : (
            <AnimalTable
              animals={animals}
              loading={loading}
              onEdit={handleEdit}
              onDelete={setDeletingAnimal}
            />
          )}

          {!error && (animals.length > 0 || loading) && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={handleLimitChange}
              itemLabel="satwa"
            />
          )}
        </section>

        {/* Ringkasan ringkas */}
        <p className="px-1 text-xs text-[var(--color-text-muted)]">
          Menampilkan {formatNumber(total)} data satwa pada halaman ini.
        </p>
      </div>

      {/* Modal form */}
      {formOpen && (
        <AnimalForm
          key={editingAnimal?.id ?? 'new-animal'}
          animal={editingAnimal}
          categories={categories}
          onClose={() => {
            setFormOpen(false);
            setEditingAnimal(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {/* Modal hapus */}
      {deletingAnimal && (
        <DeleteAnimalDialog
          animal={deletingAnimal}
          onClose={() => setDeletingAnimal(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Overlay saat memuat detail untuk edit */}
      {detailLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] shadow-lg">
            <Loader2 className="spinner h-4 w-4 text-[var(--color-primary)]" />
            Memuat detail satwa…
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </AdminLayout>
  );
}
