
"use client";

import { useState } from "react";

const categories = [
  {
    name: "Air Tawar",
    icon: "🐟",
    description: "Jelajahi kehidupan di perairan tawar.",
    image:
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=700&q=80",
    color: "bg-cyan-50",
    href: "/freshwater",
  },
  {
    name: "Serangga",
    icon: "🦋",
    description: "Kenali serangga unik di sekitar kita.",
    image:
      "https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=700&q=80",
    color: "bg-amber-50",
    href: "/insects",
  },
  {
    name: "Reptil",
    icon: "🦎",
    description: "Pelajari reptil dan habitatnya.",
    image:
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=700&q=80",
    color: "bg-green-50",
    href: "/reptiles",
  },
  {
    name: "Burung",
    icon: "🦜",
    description: "Temukan keanekaragaman dunia burung.",
    image:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=700&q=80",
    color: "bg-sky-50",
    href: "/birds",
  },
];

const animals = [
  {
    name: "Ikan Arwana",
    scientific: "Scleropages formosus",
    category: "Air Tawar",
    image:
      "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=700&q=80",
    description: "Ikan air tawar yang dikenal dengan sisiknya yang indah.",
  },
  {
    name: "Kupu-kupu",
    scientific: "Rhopalocera",
    category: "Serangga",
    image:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=700&q=80",
    description: "Serangga bersayap indah yang membantu penyerbukan.",
  },
  {
    name: "Komodo",
    scientific: "Varanus komodoensis",
    category: "Reptil",
    image:
      "https://images.unsplash.com/photo-1570741066052-817c6de995c8?w=700&q=80",
    description: "Kadal besar asli Indonesia yang hidup di kawasan tertentu.",
  },
  {
    name: "Burung Macaw",
    scientific: "Ara macao",
    category: "Burung",
    image:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=700&q=80",
    description: "Burung tropis dengan bulu berwarna cerah.",
  },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  const filteredAnimals = animals.filter((animal) =>
    `${animal.name} ${animal.category} ${animal.scientific}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#f8faf7] text-slate-800">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#e5e7dc] bg-[#faf9f4]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[82px] max-w-[1400px] items-center justify-between gap-6 px-5 lg:px-10">

          {/* LOGO */}
          <a href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#254d38] text-xl text-white">
              🌿
            </span>

            <span className="text-lg font-black tracking-tight text-[#254d38] sm:text-xl">
              SATWA <span className="text-[#a16b3b]">LYAR</span>
            </span>
          </a>

          {/* NAVIGATION DESKTOP */}
          <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
            <a
              href="/"
              className="whitespace-nowrap border-b-2 border-[#315b40] py-2 text-sm font-bold text-[#315b40]"
            >
              Beranda
            </a>

            <a
              href="/freshwater"
              className="whitespace-nowrap py-2 text-sm font-medium text-[#555b50] transition hover:text-[#315b40]"
            >
              Dunia Air Tawar
            </a>

            <a
              href="/insects"
              className="whitespace-nowrap py-2 text-sm font-medium text-[#555b50] transition hover:text-[#315b40]"
            >
              Dunia Serangga
            </a>

            <a
              href="/reptiles"
              className="whitespace-nowrap py-2 text-sm font-medium text-[#555b50] transition hover:text-[#315b40]"
            >
              Museum Komodo
            </a>

            <a
              href="/birds"
              className="whitespace-nowrap py-2 text-sm font-medium text-[#555b50] transition hover:text-[#315b40]"
            >
              Taman Burung
            </a>

          </nav>


          {/* NAVIGASI MOBILE */}
          <details className="relative lg:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[#dce2d6] text-2xl text-[#315b40] transition hover:bg-[#edf0e7]">
              ☰
            </summary>

            <nav className="absolute right-0 top-14 w-[min(85vw,320px)] overflow-hidden rounded-2xl border border-[#e5e7dc] bg-[#faf9f4] p-3 shadow-xl">
              <a
                href="/"
                className="block rounded-xl bg-[#e9eee4] px-4 py-3 font-semibold text-[#315b40]"
              >
                Beranda
              </a>

              <a
                href="/freshwater"
                className="block rounded-xl px-4 py-3 text-sm text-[#555b50] transition hover:bg-[#edf0e7]"
              >
                Dunia Air Tawar
              </a>

              <a
                href="/insects"
                className="block rounded-xl px-4 py-3 text-sm text-[#555b50] transition hover:bg-[#edf0e7]"
              >
                Dunia Serangga
              </a>

              <a
                href="/reptiles"
                className="block rounded-xl px-4 py-3 text-sm text-[#555b50] transition hover:bg-[#edf0e7]"
              >
                Museum Komodo
              </a>

              <a
                href="/birds"
                className="block rounded-xl px-4 py-3 text-sm text-[#555b50] transition hover:bg-[#edf0e7]"
              >
                Taman Burung
              </a>

            </nav>
          </details>

        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-green-950">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=2000&q=85')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-950/95 via-green-950/75 to-green-950/20" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-24 md:grid-cols-2 md:py-32 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-green-100">
              🌱 Platform Edukasi Keanekaragaman Hayati
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Kenali Satwa,
              <br />
              <span className="text-lime-300">Jaga Alam Kita.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-green-50/90 sm:text-lg">
              Temukan fakta menarik tentang berbagai satwa, pelajari
              habitatnya, dan kenali keanekaragaman hayati Indonesia
              bersama SATWA LYAR.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#zona"
                className="rounded-xl bg-lime-400 px-6 py-3.5 font-bold text-green-950 transition hover:bg-lime-300"
              >
                Jelajahi Satwa →
              </a>
              <a
                href="#quiz"
                className="rounded-xl border border-white/40 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Mulai Quiz
              </a>
            </div>

            <div className="mt-12 flex gap-8 text-white">
              <div>
                <p className="text-3xl font-extrabold">4</p>
                <p className="mt-1 text-sm text-green-100">Zona Satwa</p>
              </div>
              <div className="border-l border-white/30 pl-8">
                <p className="text-3xl font-extrabold">∞</p>
                <p className="mt-1 text-sm text-green-100">
                  Pengetahuan
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-auto max-w-sm rounded-3xl border border-white/30 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
              <img
                src="https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=85"
                alt="Hutan hijau sebagai habitat berbagai satwa"
                className="h-64 w-full rounded-2xl object-cover"
              />
              <p className="mt-5 text-sm text-lime-300">
                TAHUKAH KAMU?
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                Setiap satwa punya peran penting dalam ekosistem.
              </h2>
              <p className="mt-2 text-sm leading-6 text-green-50/80">
                Kenali kehidupan mereka untuk memahami pentingnya
                menjaga keseimbangan alam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section id="zona" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-bold uppercase tracking-widest text-green-700">
              Jelajahi Dunia Satwa
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Pilih Zona Favoritmu
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-500">
              Mulai petualanganmu dengan mengenal empat kelompok satwa
              yang tersedia di SATWA LYAR.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.href}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <span className="absolute left-4 top-4 rounded-xl bg-white px-3 py-2 text-xl shadow">
                  {category.icon}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold">{category.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                  {category.description}
                </p>
                <p className="mt-4 font-bold text-green-700">
                  Jelajahi zona <span aria-hidden="true">→</span>
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ANIMALS */}
      <section id="satwa" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-bold uppercase tracking-widest text-green-700">
                Ensiklopedia Satwa
              </p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Kenali Satwa Lebih Dekat
              </h2>
              <p className="mt-3 text-slate-500">
                Cari tahu nama dan informasi menarik tentang satwa.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <label htmlFor="animal-search" className="sr-only">
                Cari satwa
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-green-600">
                <span aria-hidden="true">🔎</span>
                <input
                  id="animal-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau zona satwa..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredAnimals.map((animal) => (
              <article
                key={animal.name}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-lg"
              >
                <div className="h-52 overflow-hidden bg-slate-100">
                  <img
                    src={animal.image}
                    alt={animal.name}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                    {animal.category}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{animal.name}</h3>
                  <p className="mt-1 text-sm italic text-slate-400">
                    {animal.scientific}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {animal.description}
                  </p>
                  <a
                    href="/animals"
                    className="mt-5 inline-block font-semibold text-green-700 hover:text-green-900"
                  >
                    Pelajari lebih lanjut →
                  </a>
                </div>
              </article>
            ))}
          </div>

          {filteredAnimals.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg font-bold">Satwa tidak ditemukan.</p>
              <p className="mt-2 text-slate-500">
                Coba kata kunci atau nama zona yang berbeda.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* QUIZ CTA */}
      <section id="quiz" className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-green-800 px-6 py-12 sm:px-12 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-3xl">🧠</span>
              <h2 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl">
                Seberapa Kenal Kamu dengan Satwa?
              </h2>
              <p className="mt-4 leading-7 text-green-100">
                Uji pengetahuanmu lewat quiz interaktif dan temukan
                fakta baru tentang dunia satwa.
              </p>
            </div>
            <a
              href="/quiz"
              className="shrink-0 rounded-xl bg-lime-400 px-7 py-4 font-bold text-green-950 transition hover:bg-lime-300"
            >
              Coba Quiz Sekarang →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <a href="/" className="text-lg font-extrabold">
            SATWA <span className="text-green-700">LYAR</span>
          </a>
          <p className="text-sm text-slate-500">
            Mengenal satwa, memahami alam, menjaga masa depan.
          </p>
          <p className="text-sm text-slate-400">
            {new Date().getFullYear()} SATWA LYAR
          </p>
        </div>
      </footer>
    </main>
  );
}
