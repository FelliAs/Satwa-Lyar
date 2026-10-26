'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
  X,
  FileImage,
} from 'lucide-react';
import type { Animal, Category } from '@/lib/types';
import { CONSERVATION_STATUS_OPTIONS, formatNumber } from '@/lib/utils';
import AnimalImageCropDialog from './AnimalImageCropDialog';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB — sesuai batas backend

interface AnimalFormProps {
  animal: Animal | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

const buildInitialForm = (animal: Animal | null) => ({
  name: animal?.name ?? '',
  scientific_name: animal?.scientific_name ?? '',
  description: animal?.description ?? '',
  physical_traits: animal?.physical_traits ?? '',
  habitat: animal?.habitat ?? '',
  food: animal?.food ?? '',
  conservation_status: animal?.conservation_status ?? '',
  category_id: animal?.category_id ? String(animal.category_id) : '',
});

export default function AnimalForm({
  animal,
  categories,
  onClose,
  onSubmit,
}: AnimalFormProps) {
  const [form, setForm] = useState(() => buildInitialForm(animal));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(animal?.image_url ?? '');
  const [removeImage, setRemoveImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!animal;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting && !pendingCropFile) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [submitting, pendingCropFile, onClose]);

  useEffect(() => {
    if (!imageFile || !preview.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(preview);
  }, [imageFile, preview]);

  const updateField = (
    key: keyof ReturnType<typeof buildInitialForm>,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Validasi & pemrosesan file gambar
  const processSelectedFile = (file: File) => {
    // Validasi apakah file merupakan gambar (lewat mime atau ekstensi)
    const isImageMime = file.type.startsWith('image/');
    const isImageExt = /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);

    if (!isImageMime && !isImageExt) {
      setError('Format file harus berupa gambar (JPG, PNG, WEBP, atau GIF).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran gambar melebihi batas maksimal 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    setPendingCropFile(file);
  };

  const handleCropConfirm = (croppedFile: File) => {
    setRemoveImage(false);
    setImageFile(croppedFile);
    setPreview(URL.createObjectURL(croppedFile));
    setPendingCropFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview('');
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Nama satwa wajib diisi.';
    if (!form.category_id) errors.category_id = 'Wahana wajib dipilih.';
    if (form.name.length > 255) errors.name = 'Nama maksimal 255 karakter.';
    if (form.description.length > 5000) errors.description = 'Deskripsi maksimal 5000 karakter.';
    if (form.physical_traits.length > 2000) errors.physical_traits = 'Ciri fisik maksimal 2000 karakter.';
    if (form.habitat.length > 1000) errors.habitat = 'Habitat maksimal 1000 karakter.';
    if (form.food.length > 1000) errors.food = 'Makanan maksimal 1000 karakter.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('category_id', form.category_id);
    formData.append('scientific_name', form.scientific_name.trim());
    formData.append('description', form.description.trim());
    formData.append('physical_traits', form.physical_traits.trim());
    formData.append('habitat', form.habitat.trim());
    formData.append('food', form.food.trim());
    formData.append('conservation_status', form.conservation_status.trim());
    if (imageFile) formData.append('image', imageFile);
    if (removeImage && !imageFile) formData.append('remove_image', '1');

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Gagal menyimpan data satwa.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (key: string) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/35 focus:ring-4 focus:ring-emerald-600/10 ${
      fieldErrors[key]
        ? 'border-rose-400 focus:border-rose-500'
        : 'border-emerald-950/15 focus:border-emerald-600'
    }`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fade-in-overlay absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => !submitting && onClose()}
        aria-hidden="true"
      />

      <div className="fade-in relative z-10 flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl border border-emerald-950/10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-emerald-950/10 px-6 py-4.5 bg-emerald-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-emerald-950">
              {isEdit ? 'Perbarui Data Satwa' : 'Tambah Satwa Baru'}
            </h2>
            <p className="mt-0.5 text-xs text-emerald-900/60">
              {isEdit
                ? `Edit informasi spesimen ${animal?.name}`
                : 'Lengkapi formulir untuk menambahkan satwa ke dalam katalog edukasi.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup formulir"
            className="rounded-xl p-2 text-emerald-950/50 transition hover:bg-emerald-100/60 hover:text-emerald-950 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4.5 overflow-y-auto px-6 py-5">
            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 shadow-2xs">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* SECTION 1: UPLOAD GAMBAR SATWA (Dropzone Interaktif) */}
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                Foto / Gambar Satwa
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl border-2 border-dashed p-4.5 transition-all duration-200 cursor-pointer ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/80 ring-4 ring-emerald-500/15'
                    : 'border-emerald-950/15 bg-emerald-50/30 hover:border-emerald-600 hover:bg-emerald-50/60'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-950/10 bg-white shadow-xs">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="Pratinjau satwa"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-emerald-900/40">
                      <ImagePlus className="h-8 w-8 text-emerald-600/70" />
                      <span className="text-[10px] font-semibold text-emerald-900/50">Belum ada foto</span>
                    </div>
                  )}
                </div>

                {/* Upload Guide & Actions */}
                <div className="flex flex-1 flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-950 mb-1">
                    <UploadCloud className="h-4 w-4 text-emerald-600" />
                    <span>{preview ? 'Klik untuk Mengganti Foto' : 'Klik atau Seret Foto ke Sini'}</span>
                  </div>
                  <p className="text-xs text-emerald-900/60 mb-3">
                    Mendukung format JPG, PNG, WEBP, atau GIF (Maks. 5 MB)
                  </p>

                  <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-emerald-950/15 px-3 py-1.5 text-xs font-bold text-emerald-950 shadow-2xs transition hover:bg-emerald-50 hover:border-emerald-600 active:scale-95"
                    >
                      <FileImage className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{preview ? 'Pilih Berkas Lain' : 'Pilih Berkas Gambar'}</span>
                    </button>

                    {preview && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>

                  {imageFile && (
                    <p className="mt-2 text-[11px] font-medium text-emerald-700">
                      ✓ Terpilih: <strong>{imageFile.name}</strong> ({formatNumber(Math.round(imageFile.size / 1024))} KB)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Nama & Nama Ilmiah */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Nama Satwa <span className="text-rose-500">*</span>
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Contoh: Arwana Asia"
                  className={inputClass('name')}
                  required
                />
                {fieldErrors.name && (
                  <span className="mt-1 block text-xs text-rose-600">{fieldErrors.name}</span>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Nama Ilmiah / Latin
                </span>
                <input
                  type="text"
                  value={form.scientific_name}
                  onChange={(e) => updateField('scientific_name', e.target.value)}
                  placeholder="Contoh: Scleropages formosus"
                  className={inputClass('scientific_name')}
                />
              </label>
            </div>

            {/* Wahana & Status Konservasi */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Zona Wahana <span className="text-rose-500">*</span>
                </span>
                <select
                  value={form.category_id}
                  onChange={(e) => updateField('category_id', e.target.value)}
                  className={inputClass('category_id')}
                  required
                >
                  <option value="">Pilih zona wahana…</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.category_id && (
                  <span className="mt-1 block text-xs text-rose-600">
                    {fieldErrors.category_id}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Status Konservasi (IUCN)
                </span>
                <select
                  value={form.conservation_status}
                  onChange={(e) => updateField('conservation_status', e.target.value)}
                  className={inputClass('conservation_status')}
                >
                  <option value="">Belum dievaluasi</option>
                  {CONSERVATION_STATUS_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} · {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Deskripsi */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                Deskripsi Fauna
              </span>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                placeholder="Penjelasan edukasi mengenai satwa ini…"
                className={`${inputClass('description')} resize-y`}
              />
              <span className="mt-1 block text-right text-[11px] text-emerald-900/50">
                {formatNumber(form.description.length)} / 5000 karakter
              </span>
            </label>

            {/* Ciri Fisik & Habitat */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Ciri Fisik & Morfologi
                </span>
                <textarea
                  value={form.physical_traits}
                  onChange={(e) => updateField('physical_traits', e.target.value)}
                  rows={2}
                  placeholder="Warna sisik, rentang sayap, ciri khas…"
                  className={`${inputClass('physical_traits')} resize-y`}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Habitat Alami
                </span>
                <textarea
                  value={form.habitat}
                  onChange={(e) => updateField('habitat', e.target.value)}
                  rows={2}
                  placeholder="Rawa gambut, hutan hujan, sungai tenang…"
                  className={`${inputClass('habitat')} resize-y`}
                />
              </label>
            </div>

            {/* Makanan */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                Pakan & Diet
              </span>
              <textarea
                value={form.food}
                onChange={(e) => updateField('food', e.target.value)}
                rows={2}
                placeholder="Karnivora: ikan kecil, serangga air, udang…"
                className={`${inputClass('food')} resize-y`}
              />
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse gap-2.5 border-t border-emerald-950/10 bg-emerald-50/40 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-emerald-950/15 bg-white px-5 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-md shadow-emerald-950/15 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="spinner h-4 w-4" />
                  <span>Mengunggah & Menyimpan…</span>
                </>
              ) : isEdit ? (
                'Simpan Perubahan'
              ) : (
                'Tambahkan ke Katalog'
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
      {pendingCropFile && (
        <AnimalImageCropDialog
          file={pendingCropFile}
          onCancel={() => {
            setPendingCropFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  );
}
