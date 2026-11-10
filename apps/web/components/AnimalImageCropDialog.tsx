'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Check, Loader2, X } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const CROP_SIZE = 900;

interface AnimalImageCropDialogProps {
  file: File;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type CropInteraction = {
  mode: 'move' | 'resize';
  handle?: string;
  startX: number;
  startY: number;
  rect: CropRect;
};

export default function AnimalImageCropDialog({
  file,
  onCancel,
  onConfirm,
}: AnimalImageCropDialogProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<CropInteraction | null>(null);
  const [imageSrc, setImageSrc] = useState('');
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [cropAreaSize, setCropAreaSize] = useState({ width: 450, height: 360 });
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const imageScale = dimensions
    ? Math.min(cropAreaSize.width / dimensions.width, cropAreaSize.height / dimensions.height)
    : 1;
  const displayWidth = dimensions ? dimensions.width * imageScale : cropAreaSize.width;
  const displayHeight = dimensions ? dimensions.height * imageScale : cropAreaSize.height;
  const imageLeft = (cropAreaSize.width - displayWidth) / 2;
  const imageTop = (cropAreaSize.height - displayHeight) / 2;

  useEffect(() => {
    const image = new Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      setError('');
      setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setCropRect(null);
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
        setCropRect((current) => current ?? {
          x: width * 0.1,
          y: height * 0.1,
          width: width * 0.8,
          height: height * 0.8,
        });
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

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!dimensions || !cropRect || saving) return;
    const pointX = event.clientX - event.currentTarget.getBoundingClientRect().left;
    const pointY = event.clientY - event.currentTarget.getBoundingClientRect().top;
    const handle = (event.target as HTMLElement).dataset.handle;
    const isInside = pointX >= cropRect.x && pointX <= cropRect.x + cropRect.width && pointY >= cropRect.y && pointY <= cropRect.y + cropRect.height;
    if (!handle && !isInside) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    interactionRef.current = {
      mode: handle ? 'resize' : 'move',
      handle,
      startX: pointX,
      startY: pointY,
      rect: cropRect,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    if (!interaction || !cropRect) return;
    const box = event.currentTarget.getBoundingClientRect();
    const pointX = event.clientX - box.left;
    const pointY = event.clientY - box.top;
    const dx = pointX - interaction.startX;
    const dy = pointY - interaction.startY;
    const minSize = 48;
    const bounds = { left: imageLeft, top: imageTop, right: imageLeft + displayWidth, bottom: imageTop + displayHeight };
    let next = interaction.rect;

    if (interaction.mode === 'move') {
      next = {
        ...next,
        x: Math.max(bounds.left, Math.min(bounds.right - next.width, next.x + dx)),
        y: Math.max(bounds.top, Math.min(bounds.bottom - next.height, next.y + dy)),
      };
    } else {
      const handle = interaction.handle || '';
      let left = next.x;
      let top = next.y;
      let right = next.x + next.width;
      let bottom = next.y + next.height;
      if (handle.includes('w')) left = Math.max(bounds.left, Math.min(right - minSize, next.x + dx));
      if (handle.includes('e')) right = Math.min(bounds.right, Math.max(left + minSize, next.x + next.width + dx));
      if (handle.includes('n')) top = Math.max(bounds.top, Math.min(bottom - minSize, next.y + dy));
      if (handle.includes('s')) bottom = Math.min(bounds.bottom, Math.max(top + minSize, next.y + next.height + dy));
      next = { x: left, y: top, width: right - left, height: bottom - top };
    }
    setCropRect(next);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    interactionRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const createCroppedFile = async (): Promise<File> => {
    const image = imageRef.current;
    if (!image || !dimensions) {
      throw new Error('Foto belum siap untuk dipotong.');
    }
    if (!image.complete || image.naturalWidth === 0) {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Foto tidak dapat dibuka. Silakan pilih berkas gambar lain.'));
      });
    }

    if (!cropRect) throw new Error('Area crop foto belum siap.');
    const sourceX = Math.max(0, (cropRect.x - imageLeft) / imageScale);
    const sourceY = Math.max(0, (cropRect.y - imageTop) / imageScale);
    const cropWidth = Math.min(dimensions.width - sourceX, cropRect.width / imageScale);
    const cropHeight = Math.min(dimensions.height - sourceY, cropRect.height / imageScale);
    const canvas = document.createElement('canvas');
    canvas.width = CROP_SIZE;
    canvas.height = Math.max(1, Math.round(CROP_SIZE * (cropHeight / cropWidth)));

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Browser tidak dapat memproses hasil crop foto.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.88)
    );
    if (!blob) throw new Error('Gagal membuat hasil crop foto.');
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error('Hasil crop melebihi batas maksimal 5 MB. Perkecil area crop lalu coba lagi.');
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
              Geser dan ubah ukuran kotak untuk menyesuaikan bagian foto.
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
            className="relative mx-auto aspect-square max-h-[55vh] w-full max-w-[450px] touch-none select-none overflow-hidden rounded-xl bg-slate-950"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            aria-label="Area crop foto, geser kotak dan tarik sudutnya untuk mengubah ukuran"
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
                  left: imageLeft,
                  top: imageTop,
                  transform: 'none',
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
            {cropRect && (
              <>
                <div className="absolute border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,.45)]" style={{ left: cropRect.x, top: cropRect.y, width: cropRect.width, height: cropRect.height }}>
                  <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, transparent 33.1%, rgba(255,255,255,.6) 33.3%, transparent 33.5%, transparent 66.1%, rgba(255,255,255,.6) 66.3%, transparent 66.5%), linear-gradient(to bottom, transparent 33.1%, rgba(255,255,255,.6) 33.3%, transparent 33.5%, transparent 66.1%, rgba(255,255,255,.6) 66.3%, transparent 66.5%)' }} />
                  {['nw', 'ne', 'sw', 'se'].map((handle) => (
                    <span key={handle} data-handle={handle} className={`absolute h-4 w-4 border-white ${handle.includes('n') ? 'top-[-2px] border-t-4' : 'bottom-[-2px] border-b-4'} ${handle.includes('w') ? 'left-[-2px] border-l-4' : 'right-[-2px] border-r-4'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          <p className="mt-3 text-center text-xs font-medium text-slate-500">
            Rasio 1:1 · Hasil crop 900 × 900 px
          </p>

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
