export default function Loading() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-[#faf9f4] px-5" aria-live="polite" aria-busy="true">
      <div className="text-center">
        <div className="loading-pulse mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#e9eee4] text-3xl" aria-hidden="true">🌿</div>
        <p className="mt-5 text-sm font-bold tracking-wide text-[#315b40]">Menyiapkan dunia satwa...</p>
        <div className="mx-auto mt-4 h-1.5 w-36 overflow-hidden rounded-full bg-[#e5e7dc]"><div className="loading-bar h-full rounded-full bg-[#6b8e5d]" /></div>
        <span className="sr-only">Halaman sedang dimuat</span>
      </div>
    </main>
  );
}
