'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Check, Loader2, Minus, Plus, RotateCcw, X } from 'lucide-react';

const CROP_WIDTH = 900;
const CROP_HEIGHT = 224;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface AnimalImageCropDialogProps {
  file: File;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

interface ImageDimensions {
  width: number;
  height: number;
}

export default function AnimalImageCropDialog({
  file,
  onCancel,
  onConfirm,
}: AnimalImageCropDialogProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [imageSrc, setImageSrc] = useState('');
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [cropAreaSize, setCropAreaSize] = useState({ width: 450, height: 112 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const scale = dimensions
    ? Math.max(
        cropAreaSize.width / dimensions.width,
        cropAreaSize.height / dimensions.height
      ) * zoom
    : 1;
  const displayWidth = dimensions ? dimensions.width * scale : cropAreaSize.width;
  const displayHeight = dimensions ? dimensions.height * scale : cropAreaSize.height;

  useEffect(() => {
    const image = new Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setImageSrc(source);
    };
    image.onerror = () => {
      setError('Foto tidak dapat dibuka. Silakan pilih berkas gambar lain.');
      URL.revokeObjectURL(source);
    };
    image.src = source;

    return () => URL.revokeObjectURL(source);
  }, [file]);

  useEffect(() => {
    const cropArea = cropAreaRef.current;
    if (!cropArea) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setCropAreaSize({ width, height });
      }
    });
    observer.observe(cropArea);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, saving]);

  const clampOffset = (x: number, y: number, currentZoom = zoom) => {
    if (!dimensions) return { x: 0, y: 0 };
    const currentScale =
      Math.max(
        cropAreaSize.width / dimensions.width,
        cropAreaSize.height / dimensions.height
      ) * currentZoom;
    const width = dimensions.width * currentScale;
    const height = dimensions.height * currentScale;
    return {
      x: Math.max(-(width - cropAreaSize.width) / 2, Math.min((width - cropAreaSize.width) / 2, x)),
      y: Math.max(-(height - cropAreaSize.height) / 2, Math.min((height - cropAreaSize.height) / 2, y)),
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!dimensions || saving) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setOffset(
      clampOffset(
        dragRef.current.offsetX + event.clientX - dragRef.current.x,
        dragRef.current.offsetY + event.clientY - dragRef.current.y
      )
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const changeZoom = (nextZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3, nextZoom));
    setZoom(clampedZoom);
    setOffset((current) => clampOffset(current.x, current.y, clampedZoom));
  };

  const createCroppedFile = async (): Promise<File> => {
    const image = imageRef.current;
    if (!image || !dimensions) {
      throw new Error('Foto belum siap untuk dipotong.');
    }
    await image.decode();

    const cropWidth = cropAreaSize.width / scale;
    const cropHeight = cropAreaSize.height / scale;
    const sourceX = Math.max(
      0,
      Math.min(dimensions.width - cropWidth, (dimensions.width - cropWidth) / 2 - offset.x / scale)
    );
    const sourceY = Math.max(
      0,
      Math.min(dimensions.height - cropHeight, (dimensions.height - cropHeight) / 2 - offset.y / scale)
    );
    const canvas = document.createElement('canvas');
    canvas.width = CROP_WIDTH;
    canvas.height = CROP_HEIGHT;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Browser tidak dapat memproses hasil crop foto.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, CROP_WIDTH, CROP_HEIGHT);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      CROP_WIDTH,
      CROP_HEIGHT
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.88)
    );
    if (!blob) throw new Error('Gagal membuat hasil crop foto.');
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error('Hasil crop melebihi batas maksimal 5 MB. Kurangi zoom lalu coba lagi.');
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto-satwa';
    return new File([blob], `${baseName}-crop.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError('');
    try {
      onConfirm(await createCroppedFile());
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : 'Gagal memotong foto.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Tutup crop foto"
        onClick={onCancel}
        disabled={saving}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm disabled:cursor-wait"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="animal-image-crop-title"
        className="relative z-10 my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-emerald-950/10 bg-emerald-50/50 px-5 py-4">
          <div>
            <h2 id="animal-image-crop-title" className="font-bold text-emerald-950">
              Sesuaikan Foto Satwa
            </h2>
            <p className="mt-1 text-xs text-emerald-900/60">
              Geser foto untuk mengatur posisi, lalu sesuaikan zoom.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Batal crop"
            className="rounded-lg p-1.5 text-emerald-950/50 transition hover:bg-emerald-100 hover:text-emerald-950 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-5">
          <div
            ref={cropAreaRef}
            className="relative mx-auto aspect-[225/56] w-full max-w-[450px] touch-none select-none overflow-hidden rounded-xl bg-slate-950"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label="Area crop foto rasio 900 banding 224, geser untuk mengatur posisi"
          >
            {dimensions ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Foto yang akan di-crop"
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
                style={{
                  width: displayWidth,
                  height: displayHeight,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                {error ? (
                  <p className="px-5 text-center text-sm text-rose-300">{error}</p>
                ) : (
                  <Loader2 className="spinner h-7 w-7 text-emerald-300" />
                )}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.38)]" />
          </div>
          <p className="mt-3 text-center text-xs font-medium text-slate-500">
            Rasio 900:224 · Hasil crop 900 × 224 px
          </p>

          <div className="mx-auto mt-5 flex max-w-xs items-center gap-3">
            <button
              type="button"
              onClick={() => changeZoom(zoom - 0.1)}
              disabled={!dimensions || zoom <= 1 || saving}
              aria-label="Perkecil foto"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(event) => changeZoom(Number(event.target.value))}
              disabled={!dimensions || saving}
              aria-label="Zoom foto"
              className="h-2 flex-1 cursor-pointer accent-emerald-700 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => changeZoom(zoom + 0.1)}
              disabled={!dimensions || zoom >= 3 || saving}
              aria-label="Perbesar foto"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              disabled={!dimensions || saving}
              aria-label="Atur ulang crop"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {error && dimensions && (
            <p className="mt-3 text-center text-xs font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-emerald-950/10 bg-emerald-50/40 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-emerald-950/15 bg-white px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!dimensions || saving}
            className="btn-primary-gradient inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="spinner h-4 w-4" /> : <Check className="h-4 w-4" />}
            {saving ? 'Memproses...' : 'Gunakan Foto'}
          </button>
        </footer>
      </section>
    </div>
  );
}
