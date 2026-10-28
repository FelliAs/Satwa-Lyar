"use client";

import { useMemo, useState } from "react";

const reptiles = [
  {
    name: "Komodo",
    category: "Kadal",
    scientific: "Varanus komodoensis",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/202306_Varanus_komodoensis.jpg/1280px-202306_Varanus_komodoensis.jpg",
    description:
      "Kadal terbesar di dunia yang berasal dari Indonesia dan hidup di beberapa pulau Nusa Tenggara.",
    habitat: "Pulau-pulau Nusa Tenggara",
  },
  {
    name: "Buaya Muara",
    category: "Buaya",
    scientific: "Crocodylus porosus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/SaltwaterCrocodile%28%27Maximo%27%29.jpg/1280px-SaltwaterCrocodile%28%27Maximo%27%29.jpg",
    description:
      "Reptil besar yang dapat ditemukan di wilayah pesisir, muara sungai, dan perairan payau.",
    habitat: "Pesisir dan muara sungai",
  },
  {
    name: "Iguana",
    category: "Kadal",
    scientific: "Iguana iguana",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Iguana_iguana_%28male_resting%29.jpg/1280px-Iguana_iguana_%28male_resting%29.jpg",
    description:
      "Reptil yang banyak menghabiskan waktu di pepohonan dan memakan tumbuhan.",
    habitat: "Pepohonan hutan tropis",
  },
  {
    name: "Penyu Hijau",
    category: "Penyu",
    scientific: "Chelonia mydas",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg/1280px-Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg",
    description:
      "Reptil laut yang berperan menjaga keseimbangan ekosistem padang lamun.",
    habitat: "Laut tropis dan padang lamun",
  },
  {
    name: "Sanca Batik",
    category: "Ular",
    scientific: "Malayopython reticulatus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Python_reticulatus_%D1%81%D0%B5%D1%82%D1%87%D0%B0%D1%82%D1%8B%D0%B9_%D0%BF%D0%B8%D1%82%D0%BE%D0%BD-2.jpg/1280px-Python_reticulatus_%D1%81%D0%B5%D1%82%D1%87%D0%B0%D1%82%D1%8B%D0%B9_%D0%BF%D0%B8%D1%82%D0%BE%D0%BD-2.jpg",
    description:
      "Salah satu ular terpanjang di dunia yang hidup di berbagai habitat tropis.",
    habitat: "Hutan tropis Indonesia",
  },
  {
    name: "Kura-Kura",
    category: "Kura-kura",
    scientific: "Testudines",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Galapagos_giant_tortoise_Geochelone_elephantopus.jpg/1280px-Galapagos_giant_tortoise_Geochelone_elephantopus.jpg",
    description:
      "Reptil bercangkang yang memiliki beragam spesies dengan habitat darat maupun air tawar.",
    habitat: "Darat dan air tawar",
  },
];

const categories = [
  "Semua",
  "Kadal",
  "Buaya",
  "Penyu",
  "Ular",
  "Kura-kura",
];

const facts = [
  {
    number: "01",
    title: "Jenis yang beragam",
    description:
      "Dari kadal, buaya, ular, hingga penyu, reptil menghuni daratan maupun perairan Indonesia.",
  },
  {
    number: "02",
    title: "Menjaga rantai makanan",
    description:
      "Reptil membantu menjaga keseimbangan populasi satwa lain di dalam habitatnya.",
  },
  {
    number: "03",
    title: "Habitat perlu dilindungi",
    description:
      "Pelestarian habitat alami menjadi kunci keberlangsungan spesies reptil endemik Indonesia.",
  },
];

export default function ReptilesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filteredReptiles = useMemo(() => {
    return reptiles.filter((reptile) => {
      const matchesSearch =
        `${reptile.name} ${reptile.scientific} ${reptile.habitat}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "Semua" || reptile.category === activeCategory;

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
              "url('https://tamanmini.com/taman_jelajah_indonesia/wp-content/uploads/2023/09/Museum-Komodo-_-Taman-Reptilia-scaled.jpg')",
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
              Eksplorasi Alam • Museum Komodo
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              Sang Penguasa,
              <br />
              <span className="text-[#b7d9ba]">Warisan Nusantara.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              Jelajahi dunia reptil, kenali kehidupan komodo, dan pelajari
              keunikan satwa yang menjadi bagian penting dari kekayaan alam
              Indonesia.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#jelajahi"
                className="rounded-full bg-[#c5dfb6] px-6 py-3.5 text-sm font-bold text-[#193c30] transition hover:bg-white"
              >
                Jelajahi Koleksi <span className="ml-2">↘</span>
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
                <p className="mt-1 font-bold text-white">Dunia reptil</p>
              </div>

              <div>
                <p className="text-sm text-white/60">Pelajari</p>
                <p className="mt-1 font-bold text-white">
                  Habitat dan ekosistem
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
            Komodo, kebanggaan Indonesia.
          </h2>
        </div>

        <div>
          <p className="leading-8 text-[#73796e]">
            Komodo merupakan kadal terbesar yang masih hidup dan habitat
            alaminya berada di Indonesia. Pelestarian habitatnya penting
            untuk menjaga keberlangsungan spesies unik ini.
          </p>

          <p className="mt-4 leading-8 text-[#73796e]">
            Melalui halaman ini, lu bisa mengenal berbagai jenis reptil,
            mempelajari habitatnya, dan memahami mengapa kelestarian reptil
            penting bagi keseimbangan alam.
          </p>
        </div>
      </section>

      {/* REPTILE EXPLORER */}
      <section id="jelajahi" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
                Ensiklopedia Satwa
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Kenali Dunia Reptil
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-[#73796e]">
                Temukan berbagai jenis reptil dan keunikan kehidupannya.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <label
                htmlFor="search-reptile"
                className="mb-2 block text-sm font-semibold"
              >
                Cari reptil
              </label>

              <div className="flex items-center gap-3 rounded-full border border-[#e5e7dc] bg-[#faf9f4] px-4 py-3 focus-within:border-[#64815c]">
                <span aria-hidden="true">⌕</span>

                <input
                  id="search-reptile"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama reptil..."
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
            {filteredReptiles.map((reptile, index) => (
              <article
                key={reptile.name}
                className="group overflow-hidden rounded-2xl border border-[#e9e9df] bg-[#faf9f4] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden bg-[#e5e9df]">
                  <img
                    src={reptile.image}
                    alt={reptile.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-[#faf9f4]/95 px-3 py-1.5 text-xs font-bold text-[#315b40]">
                    {reptile.category}
                  </span>

                  <span className="absolute bottom-3 right-4 text-sm font-bold text-white drop-shadow">
                    0{index + 1}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold">{reptile.name}</h3>

                  <p className="mt-1 text-sm italic text-[#858b7e]">
                    {reptile.scientific}
                  </p>

                  <p className="mt-4 text-sm leading-7 text-[#73796e]">
                    {reptile.description}
                  </p>

                  <div className="mt-5 border-t border-[#e5e7dc] pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#858b7e]">
                      Habitat
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#315b40]">
                      {reptile.habitat}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredReptiles.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d9dfd2] py-14 text-center">
              <p className="text-lg font-bold">
                Reptil tidak ditemukan. Coba kata kunci lain, ya!
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

      {/* EDUCATION */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
              Kenapa Penting?
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              Menjaga reptil berarti menjaga keseimbangan alam.
            </h2>

            <p className="mt-5 leading-8 text-[#73796e]">
              Reptil menghadapi berbagai ancaman, mulai dari hilangnya
              habitat hingga perdagangan ilegal. Mengenali peran reptil
              merupakan salah satu langkah untuk meningkatkan kepedulian
              terhadap pelestarian satwa.
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
              Komodo, kebanggaan Indonesia yang perlu dijaga.
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
