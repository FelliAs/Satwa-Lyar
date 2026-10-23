
"use client";

import { useMemo, useState } from "react";

const reptiles = [
  {
    name: "Komodo",
    category: "Kadal",
    scientific: "Varanus komodoensis",
    emoji: "🦎",
    description:
      "Kadal terbesar di dunia yang berasal dari Indonesia dan hidup di beberapa pulau Nusa Tenggara.",
  },
  {
    name: "Buaya Muara",
    category: "Buaya",
    scientific: "Crocodylus porosus",
    emoji: "🐊",
    description:
      "Reptil besar yang dapat ditemukan di wilayah pesisir, muara sungai, dan perairan payau.",
  },
  {
    name: "Iguana",
    category: "Kadal",
    scientific: "Iguana iguana",
    emoji: "🦎",
    description:
      "Reptil yang banyak menghabiskan waktu di pepohonan dan memakan tumbuhan.",
  },
  {
    name: "Penyu Hijau",
    category: "Penyu",
    scientific: "Chelonia mydas",
    emoji: "🐢",
    description:
      "Reptil laut yang berperan menjaga keseimbangan ekosistem padang lamun.",
  },
  {
    name: "Sanca Batik",
    category: "Ular",
    scientific: "Malayopython reticulatus",
    emoji: "🐍",
    description:
      "Salah satu ular terpanjang di dunia yang hidup di berbagai habitat tropis.",
  },
  {
    name: "Kura-Kura",
    category: "Kura-kura",
    scientific: "Testudines",
    emoji: "🐢",
    description:
      "Reptil bercangkang yang memiliki beragam spesies dengan habitat darat maupun air tawar.",
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

export default function ReptilesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const filteredReptiles = useMemo(() => {
    return reptiles.filter((reptile) => {
      const matchesSearch =
        reptile.name.toLowerCase().includes(search.toLowerCase()) ||
        reptile.scientific.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "Semua" || reptile.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#254d38]">
      {/* HERO */}
      <section
        className="relative overflow-hidden bg-cover bg-center px-5 py-16 sm:py-24 lg:px-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1535338454770-8be927b5a00b?w=2000&q=85')",
        }}
      >
        <div className="absolute inset-0 bg-[#172d20]/65" />

        <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2">
          <div className="text-white">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#e5c69b]">
              Eksplorasi Alam • Museum Komodo
            </p>

            <h1 className="text-4xl font-black leading-tight sm:text-6xl">
              Sang Penguasa,
              <span className="block text-[#e5c69b]">
                Warisan Nusantara.
              </span>
            </h1>

            <p className="mt-6 max-w-xl leading-7 text-white/85">
              Jelajahi dunia reptil, kenali kehidupan komodo, dan pelajari
              keunikan satwa yang menjadi bagian penting dari kekayaan alam
              Indonesia.
            </p>

            <a
              href="#koleksi"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-[#254d38] transition hover:bg-[#e9eee4]"
            >
              Jelajahi Koleksi ↓
            </a>
          </div>

          <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 p-8 backdrop-blur-sm sm:min-h-[380px]">
            <span className="text-8xl sm:text-9xl">🦎</span>
          </div>
        </div>
      </section>

      {/* KOLEKSI */}
      <section
        id="koleksi"
        className="border-t border-[#e5e7dc] bg-white px-5 py-16 lg:px-10"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-[#a16b3b]">
              Koleksi Edukasi
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Kenali Dunia Reptil
            </h2>

            <p className="mt-3 text-[#62685d]">
              Temukan berbagai jenis reptil dan keunikan kehidupannya.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama reptil..."
            className="mb-5 w-full rounded-2xl border border-[#dce2d6] bg-[#faf9f4] px-5 py-4 outline-none focus:border-[#315b40] sm:max-w-md"
          />

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === item
                    ? "bg-[#315b40] text-white"
                    : "border border-[#dce2d6] bg-white text-[#555b50] hover:bg-[#edf0e7]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReptiles.map((reptile) => (
              <article
                key={reptile.name}
                className="rounded-3xl border border-[#e5e7dc] bg-[#faf9f4] p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-32 items-center justify-center rounded-2xl bg-[#edf0e7]">
                  <span className="text-6xl">{reptile.emoji}</span>
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#a16b3b]">
                  {reptile.category}
                </p>

                <h3 className="mt-2 text-xl font-extrabold">
                  {reptile.name}
                </h3>

                <p className="mt-1 text-sm italic text-[#7b8075]">
                  {reptile.scientific}
                </p>

                <p className="mt-4 text-sm leading-6 text-[#62685d]">
                  {reptile.description}
                </p>
              </article>
            ))}
          </div>

          {filteredReptiles.length === 0 && (
            <p className="py-12 text-center text-[#62685d]">
              Reptil tidak ditemukan. Coba kata kunci lain, ya!
            </p>
          )}
        </div>
      </section>

      {/* FAKTA */}
      <section className="px-5 py-16 lg:px-10">
        <div className="mx-auto max-w-[1400px] rounded-[2rem] bg-[#254d38] p-8 text-white sm:p-12">
          <p className="text-sm font-bold uppercase tracking-widest text-[#d9b486]">
            Tahukah Kamu?
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Komodo, kebanggaan Indonesia.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-white/80">
            Komodo merupakan kadal terbesar yang masih hidup dan habitat
            alaminya berada di Indonesia. Pelestarian habitatnya penting
            untuk menjaga keberlangsungan spesies unik ini.
          </p>
        </div>
      </section>
    </main>
  );
}
