'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** Event internal untuk menyinkronkan nilai localStorage antar tab/komponen. */
const STORAGE_EVENT = 'satwa:storage-change';

/**
 * Baca/tulis boolean di `localStorage` tanpa menyebabkan hydration mismatch.
 *
 * `useSyncExternalStore` memastikan nilai server (`defaultValue`) dipakai
 * saat proses render pertama, lalu nilai sebenarnya diambil di sisi klien.
 */
export function useLocalStorageFlag(
  key: string,
  defaultValue = false
): [boolean, (next: boolean) => void] {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener('storage', onStoreChange);
    window.addEventListener(STORAGE_EVENT, onStoreChange);
    return () => {
      window.removeEventListener('storage', onStoreChange);
      window.removeEventListener(STORAGE_EVENT, onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? defaultValue : raw === 'true';
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(key, String(next));
      } catch {
        // Penyimpanan mungkin dinonaktifkan — abaikan, state tetap di memori.
      }
      window.dispatchEvent(new Event(STORAGE_EVENT));
    },
    [key]
  );

  return [value, setValue];
}

export default useLocalStorageFlag;
