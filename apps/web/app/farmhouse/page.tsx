
"use client";

import { useMemo, useState } from "react";

const animals = [
  {
    name: "Sapi",
    category: "Hewan Ternak",
    scientific: "Bos taurus",
    emoji: "🐄",
    description:
      "Hewan ternak yang dipelihara untuk menghasilkan susu dan menjadi bagian penting dalam kehidupan peternakan.",
  },
  {
    name: "Kambing",
    category: "Hewan Ternak",
    scientific: "Capra hircus",
    emoji: "🐐",
    description:
      "Hewan pemakan tumbuhan yang dapat hidup di berbagai lingkungan dan dipelihara untuk susu maupun daging.",
  },
  {
    name: "Domba",
    category: "Hewan Ternak",
    scientific: "Ovis aries",
    emoji: "🐑",
    description:
      "Dikenal dengan bulunya yang dapat dimanfaatkan sebagai bahan serat alami.",
  },
  {
    name: "Kelinci",
    category: "Hewan Peliharaan",
    scientific: "Oryctolagus cuniculus",
    emoji: "🐇",
    description:
      "Mamalia herbivora yang senang mengunyah tumbuhan dan membutuhkan lingkungan yang nyaman.",
  },
  {
    name: "Ayam",
    category: "Unggas",
    scientific: "Gallus gallus domesticus",
    emoji: "🐓",
    description:
      "Unggas yang dipelihara untuk menghasilkan telur dan menjadi bagian dari sistem peternakan.",
  },
  {
    name: "Bebek",
    category: "Unggas",
    scientific: "Anas platyrhynchos domesticus",
    emoji: "🦆",
    description:
      "Unggas yang menyukai lingkungan berair dan memiliki kaki berselaput untuk membantu berenang.",
  },
];

const categories = [
  "Semua",
  "Hewan Ternak",
  "Hewan Peliharaan",
  "Unggas",
];

export default function FarmHousePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchesSearch =
        animal.name.toLowerCase().includes(search.toLowerCase()) ||
        animal.scientific.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "Semua" || animal.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#4b3828]">
      {/* HERO */}
      <section
        className="relative overflow-hidden bg-cover bg-center px-5 py-16 sm:py-24 lg:px-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2000&q=85')",
        }}
      >
        <div className="absolute inset-0 bg-[#3b2b1d]/60" />

        <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2">
          <div className="text-white">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#f0d4a8]">
              Eksplorasi Alam • Farm House
            </p>

            <h1 className="text-4xl font-black leading-tight sm:text-6xl">
              Dekat dengan Alam,
              <span className="block text-[#f0d4a8]">
                Kenali Sahabat Satwa.
              </span>
            </h1>

            <p className="mt-6 max-w-xl leading-7 text-white/85">
              Kenali berbagai hewan peternakan, pelajari karakteristiknya,
              dan temukan bagaimana manusia dapat merawat satwa dengan baik
              serta menjaga lingkungan sekitarnya.
            </p>

            <a
              href="#koleksi"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-[#4b3828] transition hover:bg-[#f4e8d5]"
            >
              Jelajahi Farm House ↓
            </a>
          </div>

          <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 p-8 backdrop-blur-sm sm:min-h-[380px]">
            <span className="text-8xl sm:text-9xl">🐄</span>
          </div>
        </div>
      </section>

      {/* KOLEKSI */}
      <section
        id="koleksi"
        className="border-t border-[#e9dfd2] bg-white px-5 py-16 lg:px-10"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-[#a16b3b]">
              Koleksi Edukasi
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Kenali Hewan Farm House
            </h2>

            <p className="mt-3 text-[#766b5e]">
              Cari hewan berdasarkan nama atau kelompoknya.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama hewan..."
            className="mb-5 w-full rounded-2xl border border-[#e4d8c9] bg-[#faf9f4] px-5 py-4 outline-none focus:border-[#9b6a3d] sm:max-w-md"
          />

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === item
                    ? "bg-[#805333] text-white"
                    : "border border-[#e4d8c9] bg-white text-[#655747] hover:bg-[#f4e8d5]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAnimals.map((animal) => (
              <article
                key={animal.name}
                className="rounded-3xl border border-[#e9dfd2] bg-[#faf9f4] p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-32 items-center justify-center rounded-2xl bg-[#f1e8d9]">
                  <span className="text-6xl">{animal.emoji}</span>
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#a16b3b]">
                  {animal.category}
                </p>

                <h3 className="mt-2 text-xl font-extrabold">
                  {animal.name}
                </h3>

                <p className="mt-1 text-sm italic text-[#8b7c6b]">
                  {animal.scientific}
                </p>

                <p className="mt-4 text-sm leading-6 text-[#766b5e]">
                  {animal.description}
                </p>
              </article>
            ))}
          </div>

          {filteredAnimals.length === 0 && (
            <p className="py-12 text-center text-[#766b5e]">
              Hewan tidak ditemukan. Coba kata kunci lain, ya!
            </p>
          )}
        </div>
      </section>

      {/* FAKTA */}
      <section className="px-5 py-16 lg:px-10">
        <div className="mx-auto max-w-[1400px] rounded-[2rem] bg-[#65462e] p-8 text-white sm:p-12">
          <p className="text-sm font-bold uppercase tracking-widest text-[#f0d4a8]">
            Tahukah Kamu?
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Merawat satwa adalah tanggung jawab bersama.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-white/80">
            Hewan membutuhkan makanan yang sesuai, air bersih, tempat tinggal
            yang layak, dan perawatan yang baik. Mengenal kebutuhan satwa
            membantu kita membangun hubungan yang lebih bertanggung jawab
            dengan alam.
          </p>
        </div>
      </section>
    </main>
  );
}
