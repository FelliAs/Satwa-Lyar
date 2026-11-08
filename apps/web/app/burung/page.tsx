"use client";

import AnimalHighlights from "@/components/AnimalHighlights";
import ZoneAnimalGrid from "@/components/ZoneAnimalGrid";

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
      <section id="jelajahi" className="bg-white py-16 sm:py-20">
        <ZoneAnimalGrid
          zone="burung"
          filters={[{ label: "Semua", value: "Semua" }]}
          searchPlaceholder="Nama burung atau habitat..."
          badgeLabel={(animal, activeFilter) =>
            activeFilter === "Semua"
              ? animal.category_name || "Satwa"
              : activeFilter
          }
        />
      </section>

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
