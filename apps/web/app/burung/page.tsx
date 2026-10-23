
"use client";

import { useMemo, useState } from "react";

const birds = [
  {
    name: "Cenderawasih",
    category: "Burung Hias",
    scientific: "Paradisaeidae",
    emoji: "🦜",
    description:
      "Dikenal karena bulunya yang indah dan menjadi salah satu kekayaan satwa khas Papua.",
  },
  {
    name: "Elang",
    category: "Burung Pemangsa",
    scientific: "Accipitridae",
    emoji: "🦅",
    description:
      "Memiliki penglihatan tajam dan paruh kuat untuk membantu berburu mangsa.",
  },
  {
    name: "Merak",
    category: "Burung Hias",
    scientific: "Pavo cristatus",
    emoji: "🦚",
    description:
      "Terkenal dengan bulu ekor yang indah dan digunakan dalam perilaku menarik pasangan.",
  },
  {
    name: "Kakatua",
    category: "Burung Hias",
    scientific: "Cacatuidae",
    emoji: "🦜",
    description:
      "Burung cerdas yang memiliki jambul khas dan kemampuan belajar melalui interaksi.",
  },
  {
    name: "Burung Hantu",
    category: "Burung Nokturnal",
    scientific: "Strigiformes",
    emoji: "🦉",
    description:
      "Aktif pada malam hari dan memiliki kemampuan mendengar yang membantu menemukan mangsa.",
  },
  {
    name: "Flamingo",
    category: "Burung Air",
    scientific: "Phoenicopteridae",
    emoji: "🦩",
    description:
      "Burung air dengan kaki panjang yang mencari makanan di perairan dangkal.",
  },
];

const categories = [
  "Semua",
  "Burung Hias",
  "Burung Pemangsa",
  "Burung Nokturnal",
  "Burung Air",
];

export default function BirdsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const filteredBirds = useMemo(() => {
    return birds.filter((bird) => {
      const matchesSearch =
        bird.name.toLowerCase().includes(search.toLowerCase()) ||
        bird.scientific.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "Semua" || bird.category === category;

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
            "url('https://images.unsplash.com/photo-1444464666168-49d633b86797?w=2000&q=85')",
        }}
      >
        <div className="absolute inset-0 bg-[#173b29]/65" />

        <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2">
          <div className="text-white">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#e5c69b]">
              Eksplorasi Alam • Taman Burung
            </p>

            <h1 className="text-4xl font-black leading-tight sm:text-6xl">
              Kepakan Sayap,
              <span className="block text-[#e5c69b]">
                Keindahan Alam.
              </span>
            </h1>

            <p className="mt-6 max-w-xl leading-7 text-white/85">
              Jelajahi keanekaragaman burung, kenali karakteristik uniknya,
              dan pelajari peran penting burung dalam menjaga keseimbangan
              ekosistem.
            </p>

            <a
              href="#koleksi"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-[#254d38] transition hover:bg-[#e9eee4]"
            >
              Jelajahi Burung ↓
            </a>
          </div>

          <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 p-8 backdrop-blur-sm sm:min-h-[380px]">
            <span className="text-8xl sm:text-9xl">🦜</span>
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
              Kenali Dunia Burung
            </h2>

            <p className="mt-3 text-[#62685d]">
              Cari burung berdasarkan nama atau kelompoknya.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama burung..."
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
            {filteredBirds.map((bird) => (
              <article
                key={bird.name}
                className="rounded-3xl border border-[#e5e7dc] bg-[#faf9f4] p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-32 items-center justify-center rounded-2xl bg-[#edf0e7]">
                  <span className="text-6xl">{bird.emoji}</span>
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#a16b3b]">
                  {bird.category}
                </p>

                <h3 className="mt-2 text-xl font-extrabold">
                  {bird.name}
                </h3>

                <p className="mt-1 text-sm italic text-[#7b8075]">
                  {bird.scientific}
                </p>

                <p className="mt-4 text-sm leading-6 text-[#62685d]">
                  {bird.description}
                </p>
              </article>
            ))}
          </div>

          {filteredBirds.length === 0 && (
            <p className="py-12 text-center text-[#62685d]">
              Burung tidak ditemukan. Coba kata kunci lain, ya!
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
            Burung punya peran penting.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-white/80">
            Burung membantu menyebarkan biji, menyerbuki bunga, dan mengendalikan
            populasi hewan tertentu. Melindungi habitat burung berarti ikut
            menjaga keseimbangan ekosistem.
          </p>
        </div>
      </section>
    </main>
  );
}
