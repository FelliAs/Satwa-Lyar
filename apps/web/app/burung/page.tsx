"use client";

import { useState } from "react";
import AnimalHighlights from "@/components/AnimalHighlights";

const birds = [
  {
    name: "Cenderawasih",
    scientific: "Paradisaeidae",
    category: "Burung Hias",
    image:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=900&q=85",
    description:
      "Burung khas Papua yang terkenal dengan bulu indah dan perilaku uniknya. Cenderawasih menjadi salah satu kekayaan keanekaragaman hayati Indonesia.",
    habitat: "Hutan tropis Papua",
  },
  {
    name: "Elang Jawa",
    scientific: "Nisaetus bartelsi",
    category: "Burung Pemangsa",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900&q=85",
    description:
      "Burung pemangsa yang memiliki penglihatan tajam dan cakar kuat. Elang Jawa merupakan salah satu satwa endemik Indonesia yang dilindungi.",
    habitat: "Hutan pegunungan Jawa",
  },
  {
    name: "Merak Hijau",
    scientific: "Pavo muticus",
    category: "Burung Hias",
    image:
      "https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=900&q=85",
    description:
      "Burung dengan bulu ekor yang mencolok dan indah. Merak menggunakan tampilan bulunya dalam perilaku menarik pasangan.",
    habitat: "Hutan terbuka dan padang rumput",
  },
  {
    name: "Kakatua",
    scientific: "Cacatuidae",
    category: "Burung Hias",
    image:
      "https://images.unsplash.com/photo-1549608276-5786777e6587?w=900&q=85",
    description:
      "Burung cerdas dengan jambul khas yang dapat ditegakkan. Kakatua memiliki kemampuan belajar dan berinteraksi dengan lingkungannya.",
    habitat: "Hutan tropis dan kawasan berhutan",
  },
  {
    name: "Burung Hantu",
    scientific: "Strigiformes",
    category: "Burung Nokturnal",
    image:
      "https://images.unsplash.com/photo-1579448659766-6f3f2f7f9c3e?w=900&q=85",
    description:
      "Burung yang umumnya aktif pada malam hari. Pendengaran dan penglihatannya membantu menemukan mangsa dalam kondisi cahaya rendah.",
    habitat: "Hutan, kebun, dan pepohonan",
  },
  {
    name: "Flamingo",
    scientific: "Phoenicopteridae",
    category: "Burung Air",
    image:
      "https://images.unsplash.com/photo-1497206365907-f5e630693df0?w=900&q=85",
    description:
      "Burung berkaki panjang yang mencari makanan di perairan dangkal. Warna merah muda pada bulunya berkaitan dengan pigmen dari makanan.",
    habitat: "Danau dangkal dan lahan basah",
  },
];

const categories = [
  "Semua",
  "Burung Hias",
  "Burung Pemangsa",
  "Burung Nokturnal",
  "Burung Air",
];

const facts = [
  {
    number: "01",
    title: "Penjaga keseimbangan alam",
    description:
      "Burung pemangsa membantu mengendalikan populasi hewan lain sehingga keseimbangan rantai makanan tetap terjaga.",
  },
  {
    number: "02",
    title: "Penyebar biji alami",
    description:
      "Banyak burung memakan buah dan membantu menyebarkan biji ke tempat lain, mendukung regenerasi tumbuhan di hutan.",
  },
  {
    number: "03",
    title: "Habitat perlu dilindungi",
    description:
      "Kerusakan hutan, perburuan, dan perdagangan satwa ilegal dapat mengancam populasi burung serta kelestarian spesiesnya.",
  },
];

export default function BirdsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filteredBirds = birds.filter((bird) => {
    const matchesSearch = `${bird.name} ${bird.scientific} ${bird.habitat}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "Semua" ||
      bird.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="font-serif-headings min-h-screen bg-[#faf9f4] text-[#27352b]">
      {/* HERO */}
      <section className="relative isolate min-h-[520px] overflow-hidden bg-[#163d3b] sm:min-h-[580px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://tamanmini.com/taman_jelajah_indonesia/wp-content/uploads/2023/09/Taman-Burung.jpg')",
          }}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102e2c]/95 via-[#102e2c]/75 to-[#102e2c]/25" />

        <div className="mx-auto flex min-h-[520px] max-w-7xl items-center px-5 py-20 sm:min-h-[580px] lg:px-10">
          <div className="max-w-2xl">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white"
            >
              <span>←</span> Kembali ke Beranda
            </a>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-[#b7d9ba] sm:text-sm">
              JSN-EDU / JELAJAHI HABITAT
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="text-[#b7d9ba]">Taman Burung</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              Dari hutan tropis hingga kawasan lahan basah, kenali
              keanekaragaman burung, karakteristik uniknya, dan peran
              pentingnya dalam menjaga keseimbangan ekosistem.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#jelajahi"
                className="rounded-full bg-[#c5dfb6] px-6 py-3.5 text-sm font-bold text-[#193c30] transition hover:bg-white"
              >
                Jelajahi Burung <span className="ml-2">↘</span>
              </a>

              <a
                href="#tentang"
                className="rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Tentang Habitat
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/20 pt-6">
              <div>
                <p className="text-sm text-white/60">Kenali</p>
                <p className="mt-1 font-bold text-white">
                  Keanekaragaman burung
                </p>
              </div>

              <div>
                <p className="text-sm text-white/60">Pelajari</p>
                <p className="mt-1 font-bold text-white">
                  Habitat dan perilaku
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section
        id="tentang"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-20 md:grid-cols-2 md:items-center lg:px-10"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
            Mengenal Ekosistem
          </p>

          <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Setiap kepakan sayap memiliki peran bagi alam.
          </h2>
        </div>

        <div>
          <p className="leading-8 text-[#73796e]">
            Burung hidup di beragam habitat, mulai dari hutan tropis,
            pegunungan, padang rumput, hingga perairan. Setiap spesies
            memiliki karakteristik dan cara beradaptasi yang berbeda
            sesuai lingkungannya.
          </p>

          <p className="mt-4 leading-8 text-[#73796e]">
            Melalui halaman ini, lu bisa mengenal berbagai jenis burung,
            mempelajari habitatnya, dan memahami mengapa kelestarian
            burung penting bagi keseimbangan alam.
          </p>
        </div>
      </section>

      {/* BIRD EXPLORER */}
      <AnimalHighlights location="burung" title="Highlight Satwa" description="Kenali satwa pilihan dari zona ini dan jelajahi informasi lengkapnya." />
      {false && (
      <section id="jelajahi" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
                Ensiklopedia Satwa
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Penghuni Taman Burung
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-[#73796e]">
                Kenali burung, ciri khas, dan lingkungan tempat mereka hidup.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <label
                htmlFor="search-bird"
                className="mb-2 block text-sm font-semibold"
              >
                Cari burung
              </label>

              <div className="flex items-center gap-3 rounded-full border border-[#e5e7dc] bg-[#faf9f4] px-4 py-3 focus-within:border-[#64815c]">
                <span aria-hidden="true">⌕</span>

                <input
                  id="search-bird"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nama burung atau habitat..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* FILTER */}
          <div className="mt-7 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveCategory(item)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeCategory === item
                    ? "bg-[#315b40] text-white"
                    : "border border-[#e5e7dc] bg-white text-[#60685d] hover:bg-[#edf0e7]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* CARDS */}
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredBirds.map((bird, index) => (
              <article
                key={bird.name}
                className="group overflow-hidden rounded-2xl border border-[#e9e9df] bg-[#faf9f4] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden bg-[#e5e9df]">
                  <img
                    src={bird.image}
                    alt={bird.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-[#faf9f4]/95 px-3 py-1.5 text-xs font-bold text-[#315b40]">
                    {bird.category}
                  </span>

                  <span className="absolute bottom-3 right-4 text-sm font-bold text-white drop-shadow">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold">{bird.name}</h3>

                  <p className="mt-1 text-sm italic text-[#858b7e]">
                    {bird.scientific}
                  </p>

                  <p className="mt-4 text-sm leading-7 text-[#73796e]">
                    {bird.description}
                  </p>

                  <div className="mt-5 border-t border-[#e5e7dc] pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#858b7e]">
                      Habitat
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#315b40]">
                      {bird.habitat}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredBirds.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d9dfd2] py-14 text-center">
              <p className="text-lg font-bold">Burung belum ditemukan.</p>

              <p className="mt-2 text-sm text-[#73796e]">
                Coba nama lain atau pilih filter Semua.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("Semua");
                }}
                className="mt-5 rounded-full bg-[#315b40] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Reset pencarian
              </button>
            </div>
          )}
        </div>
      </section>
      )}

      {/* EDUCATION */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
              Kenapa Penting?
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              Menjaga burung berarti menjaga keseimbangan kehidupan.
            </h2>

            <p className="mt-5 leading-8 text-[#73796e]">
              Burung menghadapi berbagai ancaman, mulai dari kehilangan
              habitat hingga perburuan ilegal. Mengenali peran burung
              merupakan salah satu langkah untuk meningkatkan kepedulian
              terhadap kelestarian satwa.
            </p>
          </div>

          <div className="space-y-3">
            {facts.map((fact) => (
              <article
                key={fact.number}
                className="grid grid-cols-[48px_1fr] gap-4 rounded-2xl border border-[#e5e7dc] bg-white p-5 sm:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9eee4] text-sm font-bold text-[#315b40]">
                  {fact.number}
                </span>

                <div>
                  <h3 className="font-bold">{fact.title}</h3>

                  <p className="mt-2 text-sm leading-7 text-[#73796e]">
                    {fact.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="px-5 pb-16 sm:pb-20 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 overflow-hidden rounded-3xl bg-[#234b3c] p-7 sm:p-10 md:flex-row md:items-center md:justify-between md:p-14">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b7d9ba]">
              Terus Jelajahi
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Masih banyak kehidupan yang menunggu untuk dikenal.
            </h2>

            <p className="mt-4 leading-7 text-white/70">
              Lanjutkan petualanganmu dan temukan dunia satwa lainnya di
              JSN-EDU.
            </p>
          </div>

          <a
            href="/"
            className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-full bg-[#c5dfb6] px-6 py-3.5 text-sm font-bold text-[#193c30] transition hover:bg-white md:self-center"
          >
            Jelajahi Zona Lain <span>↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}
