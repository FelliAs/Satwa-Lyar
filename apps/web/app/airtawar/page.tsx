"use client";

import AnimalHighlights from "@/components/AnimalHighlights";

import { useState } from "react";

const airtawarAnimals = [
  {
    name: "Ikan Arwana",
    scientific: "Scleropages formosus",
    type: "Ikan",
    image:
      "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=900&q=85",
    description:
      "Ikan air tawar tropis yang dikenal dengan sisiknya yang berkilau dan gerakannya yang anggun.",
    habitat: "Sungai dan rawa",
  },
  {
    name: "Arapaima",
    scientific: "Arapaima gigas",
    type: "Ikan",
    image:
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=900&q=85",
    description:
      "Ikan air tawar berukuran besar yang berasal dari kawasan sungai Amazon di Amerika Selatan.",
    habitat: "Sungai Amazon",
  },
  {
    name: "Berang-berang",
    scientific: "Lutrinae",
    type: "Mamalia",
    image:
      "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=900&q=85",
    description:
      "Mamalia semiakuatik yang pandai berenang dan berperan dalam keseimbangan ekosistem.",
    habitat: "Sungai dan danau",
  },
  {
    name: "Ikan Koi",
    scientific: "Cyprinus rubrofuscus",
    type: "Ikan",
    image:
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=900&q=85",
    description:
      "Ikan hias air tawar yang memiliki beragam pola dan warna pada tubuhnya.",
    habitat: "Kolam dan perairan tenang",
  },
];

const facts = [
  {
    number: "01",
    title: "Sumber kehidupan",
    description:
      "Sungai, danau, dan rawa menyediakan air serta habitat bagi banyak organisme.",
  },
  {
    number: "02",
    title: "Ekosistem yang saling terhubung",
    description:
      "Ikan, tumbuhan air, serangga, dan mikroorganisme saling berinteraksi dalam rantai makanan.",
  },
  {
    number: "03",
    title: "Perlu dijaga bersama",
    description:
      "Pencemaran dan kerusakan habitat dapat mengancam kelangsungan hidup satwa air tawar.",
  },
];

export default function airtawarPage() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("Semua");

  const filteredAnimals = airtawarAnimals.filter((animal) => {
    const matchesSearch = `${animal.name} ${animal.scientific} ${animal.habitat}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      activeType === "Semua" || animal.type === activeType;

    return matchesSearch && matchesType;
  });

  return (
    <main className="font-serif-headings min-h-screen bg-[#faf9f4] text-[#27352b]">
      {/* HERO */}
      <section className="relative isolate min-h-[520px] overflow-hidden bg-[#163d3b] sm:min-h-[580px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://image.idn.media/post/20200422/new-8-2016-aria-amazon-cruise-1-low-resolution-cfb9877f8c8c161382920d818ef0711f.jpg')",
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
              SATWA LYAR / JELAJAHI HABITAT
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              Dunia
              <br />
              <span className="text-[#b7d9ba]">Air Tawar.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              Dari sungai yang mengalir hingga danau yang tenang, temukan
              kehidupan satwa yang menjadikan air tawar sebagai rumahnya.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#jelajahi"
                className="rounded-full bg-[#c5dfb6] px-6 py-3.5 text-sm font-bold text-[#193c30] transition hover:bg-white"
              >
                Jelajahi Satwa <span className="ml-2">↘</span>
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
                <p className="mt-1 font-bold text-white">Satwa air tawar</p>
              </div>

              <div>
                <p className="text-sm text-white/60">Pelajari</p>
                <p className="mt-1 font-bold text-white">Habitat alami</p>
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
            Air yang tenang menyimpan kehidupan yang luar biasa.
          </h2>
        </div>

        <div>
          <p className="leading-8 text-[#73796e]">
            Ekosistem air tawar mencakup sungai, danau, rawa, dan berbagai
            perairan dengan kadar garam yang rendah. Setiap habitat memiliki
            karakteristik berbeda yang mendukung kehidupan ikan, tumbuhan,
            amfibi, serangga, dan satwa lainnya.
          </p>
          <p className="mt-4 leading-8 text-[#73796e]">
            Melalui halaman ini, lu bisa mengenal satwa, mempelajari
            habitatnya, dan memahami mengapa ekosistem air tawar perlu
            dilestarikan.
          </p>
        </div>
      </section>

      <AnimalHighlights location="air-tawar" title="Highlight Satwa" description="Kenali satwa pilihan dari zona ini dan jelajahi informasi lengkapnya." />
      {false && (
      <section id="jelajahi" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64815c]">
                Ensiklopedia Satwa
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Penghuni Air Tawar
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-[#73796e]">
                Kenali satwa, ciri khas, dan lingkungan tempat mereka hidup.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <label
                htmlFor="search-animal"
                className="mb-2 block text-sm font-semibold"
              >
                Cari satwa
              </label>

              <div className="flex items-center gap-3 rounded-full border border-[#e5e7dc] bg-[#faf9f4] px-4 py-3 focus-within:border-[#64815c]">
                <span aria-hidden="true">⌕</span>

                <input
                  id="search-animal"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nama satwa atau habitat..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* FILTER */}
          <div className="mt-7 flex flex-wrap gap-2">
            {["Semua", "Ikan", "Mamalia"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeType === type
                    ? "bg-[#315b40] text-white"
                    : "border border-[#e5e7dc] bg-white text-[#60685d] hover:bg-[#edf0e7]"
                }`}
              >
                {type}
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
                    {animal.type}
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
              <p className="text-lg font-bold">Satwa belum ditemukan.</p>
              <p className="mt-2 text-sm text-[#73796e]">
                Coba nama lain atau pilih filter Semua.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setActiveType("Semua");
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
              Menjaga air berarti menjaga kehidupan.
            </h2>

            <p className="mt-5 leading-8 text-[#73796e]">
              Ekosistem air tawar menghadapi berbagai tekanan, mulai dari
              pencemaran hingga perubahan habitat. Mengenali kehidupan di
              dalamnya merupakan langkah awal untuk ikut menjaganya.
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
