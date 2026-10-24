'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Debounce nilai secara aman.
 *
 * Timer dibersihkan otomatis ketika:
 *  - nilai berubah (request lama dibatalkan), dan
 *  - komponen di-unmount (tidak ada setState setelah unmount).
 *
 * Nilai input tetap dikontrol oleh pemanggil, sehingga teks di kotak pencarian
 * tidak ikut tertunda.
 *
 * `onDebounced` dipanggil di dalam callback timer — dipakai untuk mereset
 * nomor halaman setiap kali pencarian baru diterapkan.
 */
export function useDebouncedValue<T>(
  value: T,
  delay = 400,
  onDebounced?: (value: T) => void
): T {
  const [debounced, setDebounced] = useState<T>(value);
  const callbackRef = useRef<((value: T) => void) | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = onDebounced;
  }, [onDebounced]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
      callbackRef.current?.(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
