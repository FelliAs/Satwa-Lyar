"use client";

import { useMemo, useState } from "react";

const insects = [
  {
    name: "Kupu-Kupu",
    category: "Penyerbuk",
    scientific: "Lepidoptera",
    emoji: "🦋",
    description:
      "Membantu penyerbukan bunga dan mengalami metamorfosis sempurna.",
  },
  {
    name: "Lebah",
    category: "Penyerbuk",
    scientific: "Anthophila",
    emoji: "🐝",
    description:
      "Berperan penting dalam penyerbukan berbagai tumbuhan berbunga.",
  },
  {
    name: "Semut",
    category: "Sosial",
    scientific: "Formicidae",
    emoji: "🐜",
    description:
      "Hidup berkoloni dan bekerja sama mencari makanan serta membangun sarang.",
  },
  {
    name: "Belalang",
    category: "Herbivora",
    scientific: "Caelifera",
    emoji: "🦗",
    description:
      "Memakan tumbuhan dan menjadi sumber makanan bagi sejumlah hewan lain.",
  },
  {
    name: "Kumbang",
    category: "Pengurai",
    scientific: "Coleoptera",
    emoji: "🪲",
    description:
      "Kelompok serangga yang sangat beragam, dengan peran berbeda di alam.",
  },
  {
    name: "Capung",
    category: "Predator",
    scientific: "Odonata",
    emoji: "🌿",
    description:
      "Pemburu serangga kecil yang sering ditemukan dekat perairan.",
  },
];

const categories = [
  "Semua",
  "Penyerbuk",
  "Sosial",
  "Herbivora",
  "Pengurai",
  "Predator",
];

export default function InsectsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const filteredInsects = useMemo(() => {
    return insects.filter((insect) => {
      const matchesSearch =
        insect.name.toLowerCase().includes(search.toLowerCase()) ||
        insect.scientific.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "Semua" || insect.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-[#faf9f4] text-[#254d38]">
      {/* HERO */}
        <section
          className="relative overflow-hidden bg-cover bg-center px-5 py-16 sm:py-24 lg:px-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1530053969600-caed2596d242?w=2000&q=85')",
          }}
        >
          {/* Lapisan gelap supaya teks terbaca */}
          <div className="absolute inset-0 bg-[#173b29]/65" />

          {/* Konten hero */}
          <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2">
            <div className="text-white">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#e5c69b]">
                Eksplorasi Alam • Dunia Serangga
              </p>

              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                Kecil Ukurannya,
                <span className="block text-[#e5c69b]">
                  Besar Perannya.
                </span>
              </h1>

              <p className="mt-6 max-w-xl leading-7 text-white/85">
                Kenali keanekaragaman serangga, pelajari keunikan kehidupannya,
                dan temukan peran penting mereka dalam menjaga keseimbangan ekosistem.
              </p>

              <a
                href="#koleksi"
                className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-[#254d38] transition hover:bg-[#e9eee4]"
              >
                Jelajahi Serangga ↓
              </a>
            </div>

            {/* Panel kanan */}
            <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 p-8 backdrop-blur-sm sm:min-h-[380px]">
              <span className="text-8xl sm:text-9xl">🦋</span>
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
              Temukan Seranggamu
            </h2>
            <p className="mt-3 text-[#62685d]">
              Cari serangga berdasarkan nama atau kelompoknya.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama serangga..."
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
            {filteredInsects.map((insect) => (
              <article
                key={insect.name}
                className="rounded-3xl border border-[#e5e7dc] bg-[#faf9f4] p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-32 items-center justify-center rounded-2xl bg-[#edf0e7]">
                  <span className="text-6xl">{insect.emoji}</span>
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#a16b3b]">
                  {insect.category}
                </p>

                <h3 className="mt-2 text-xl font-extrabold">
                  {insect.name}
                </h3>

                <p className="mt-1 text-sm italic text-[#7b8075]">
                  {insect.scientific}
                </p>

                <p className="mt-4 text-sm leading-6 text-[#62685d]">
                  {insect.description}
                </p>
              </article>
            ))}
          </div>

          {filteredInsects.length === 0 && (
            <p className="py-12 text-center text-[#62685d]">
              Serangga tidak ditemukan. Coba kata kunci lain, ya!
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
            Dari telur hingga dewasa.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/80">
            Kupu-kupu mengalami metamorfosis sempurna melalui empat
            tahap: telur, larva (ulat), pupa (kepompong), dan dewasa.
            Tidak semua serangga mengalami tahapan yang sama.
          </p>
        </div>
      </section>
    </main>
  );
}
