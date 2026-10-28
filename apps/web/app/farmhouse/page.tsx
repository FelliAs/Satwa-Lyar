"use client";

import { useMemo, useState } from "react";
import AnimalHighlights from "@/components/AnimalHighlights";

const animals = [
  {
    name: "Sapi",
    category: "Hewan Ternak",
    scientific: "Bos taurus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg/1280px-Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg",
    description:
      "Hewan ternak yang dipelihara untuk menghasilkan susu dan menjadi bagian penting dalam kehidupan peternakan.",
    habitat: "Kandang dan padang rumput",
  },
  {
    name: "Kambing",
    category: "Hewan Ternak",
    scientific: "Capra hircus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hausziege_04.jpg/1280px-Hausziege_04.jpg",
    description:
      "Hewan pemakan tumbuhan yang dapat hidup di berbagai lingkungan dan dipelihara untuk susu maupun daging.",
    habitat: "Peternakan dan lahan kering",
  },
  {
    name: "Domba",
    category: "Hewan Ternak",
    scientific: "Ovis aries",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flock_of_sheep.jpg/1280px-Flock_of_sheep.jpg",
    description:
      "Dikenal dengan bulunya yang dapat dimanfaatkan sebagai bahan serat alami.",
    habitat: "Padang rumput dan perbukitan",
  },
  {
    name: "Kelinci",
    category: "Hewan Peliharaan",
    scientific: "Oryctolagus cuniculus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Heimtier_004_2023_08_26.jpg/1280px-Heimtier_004_2023_08_26.jpg",
    description:
      "Mamalia herbivora yang senang mengunyah tumbuhan dan membutuhkan lingkungan yang nyaman.",
    habitat: "Kandang dan area berumput",
  },
  {
    name: "Ayam",
    category: "Unggas",
    scientific: "Gallus gallus domesticus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Male_and_female_chicken_sitting_together.jpg/1280px-Male_and_female_chicken_sitting_together.jpg",
    description:
      "Unggas yang dipelihara untuk menghasilkan telur dan menjadi bagian dari sistem peternakan.",
    habitat: "Kandang dan pekarangan",
  },
  {
    name: "Bebek",
    category: "Unggas",
    scientific: "Anas platyrhynchos domesticus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Taiwanese_duck_farm.jpg/1280px-Taiwanese_duck_farm.jpg",
    description:
      "Unggas yang menyukai lingkungan berair dan memiliki kaki berselaput untuk membantu berenang.",
    habitat: "Rawa, kolam, dan sawah",
  },
];

const categories = [
  "Semua",
  "Hewan Ternak",
  "Hewan Peliharaan",
  "Unggas",
];

const facts = [
  {
    number: "01",
    title: "Kebutuhan dasar hewan",
    description:
      "Makanan yang sesuai, air bersih, dan tempat tinggal yang layak adalah kebutuhan dasar setiap satwa.",
  },
  {
    number: "02",
    title: "Tempat hidup yang nyaman",
    description:
      "Kandang yang bersih dan nyaman menjaga hewan tetap sehat dan tidak mudah stres.",
  },
  {
    number: "03",
    title: "Perawatan yang bertanggung jawab",
    description:
      "Perawatan yang baik membangun hubungan manusia yang lebih tanggung jawab dengan alam.",
  },
];

export default function FarmHousePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchesSearch =
        `${animal.name} ${animal.scientific} ${animal.habitat}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "Semua" || animal.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <main className="font-serif-headings min-h-screen bg-[#faf9f4] text-[#27352b]">
      {/* HERO */}
      <section className="relative isolate min-h-[520px] overflow-hidden bg-[#163d3b] sm:min-h-[580px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2000&q=85')",
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
              Eksplorasi Alam • Farm House
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              Dekat dengan Alam,
              <br />
              <span className="text-[#b7d9ba]">
                Kenali Sahabat Satwa.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              Kenali berbagai hewan peternakan, pelajari karakteristiknya,
              dan temukan bagaimana manusia dapat merawat satwa dengan baik
              serta menjaga lingkungan sekitarnya.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#jelajahi"
                className="rounded-full bg-[#c5dfb6] px-6 py-3.5 text-sm font-bold text-[#193c30] transition hover:bg-white"
              >
                Jelajahi Farm House <span className="ml-2">↘</span>
              </a>

              <a
                href="#tentang"
                className="rounded-full border bg-[#c5dfb6] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Tentang Habitat
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/20 pt-6">
              <div>
                <p className="text-sm text-white/60">Kenali</p>
                <p className="mt-1 font-bold text-white">Sahabat satwa</p>
              </div>

              <div>
                <p className="text-sm text-white/60">Pelajari</p>
                <p className="mt-1 font-bold text-white">Perawatan hewan</p>
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
            Merawat satwa adalah tanggung jawab bersama.
          </h2>
        </div>

        <div>
          <p className="leading-8 text-[#73796e]">
            Hewan membutuhkan makanan yang sesuai, air bersih, tempat
            tinggal yang layak, dan perawatan yang baik. Mengenal kebutuhan
            satwa adalah langkah awal untuk merawat mereka dengan tepat.
          </p>

          <p className="mt-4 leading-8 text-[#73796e]">
            Melalui halaman ini, lu bisa mengenal berbagai hewan peternakan,
            mempelajari habitatnya, dan memahami mengapa merawat satwa
            membantu membangun hubungan yang lebih bertanggung jawab dengan
            alam.
          </p>
        </div>
      </section>

      <AnimalHighlights location="farmhouse" title="Highlight Farm House" description="Kenali satwa pilihan dari Farm House dan jelajahi informasi lengkapnya." />
      {false && (
      <section id="jelajahi" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
                Ensiklopedia Satwa
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Kenali Hewan Farm House
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-[#73796e]">
                Cari hewan berdasarkan nama, kelompok, atau habitatnya.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <label
                htmlFor="search-animal"
                className="mb-2 block text-sm font-semibold"
              >
                Cari hewan
              </label>

              <div className="flex items-center gap-3 rounded-full border border-[#e5e7dc] bg-[#faf9f4] px-4 py-3 focus-within:border-[#64815c]">
                <span aria-hidden="true">⌕</span>

                <input
                  id="search-animal"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nama hewan atau habitat..."
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
            {filteredAnimals.map((animal, index) => (
              <article
                key={animal.name}
                className="group overflow-hidden rounded-2xl border border-[#e9e9df] bg-[#faf9f4] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden bg-[#e5e9df]">
                  <img
                    src={animal.image}
                    alt={animal.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-[#faf9f4]/95 px-3 py-1.5 text-xs font-bold text-[#315b40]">
                    {animal.category}
                  </span>

                  <span className="absolute bottom-3 right-4 text-sm font-bold text-white drop-shadow">
                    0{index + 1}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold">{animal.name}</h3>

                  <p className="mt-1 text-sm italic text-[#858b7e]">
                    {animal.scientific}
                  </p>

                  <p className="mt-4 text-sm leading-7 text-[#73796e]">
                    {animal.description}
                  </p>

                  <div className="mt-5 border-t border-[#e5e7dc] pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#858b7e]">
                      Habitat
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#315b40]">
                      {animal.habitat}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredAnimals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d9dfd2] py-14 text-center">
              <p className="text-lg font-bold">
                Hewan tidak ditemukan. Coba kata kunci lain, ya!
              </p>

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
              Menjaga kesejahteraan hewan berarti menjaga lingkungan.
            </h2>

            <p className="mt-5 leading-8 text-[#73796e]">
              Hewan peternakan menghadapi berbagai risiko jika tidak
              dirawat dengan baik. Mengenali kebutuhan mereka merupakan
              salah satu langkah untuk meningkatkan kepedulian terhadap
              kesejahteraan satwa.
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
              SATWA LYAR.
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
