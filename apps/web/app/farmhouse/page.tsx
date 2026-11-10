"use client";

import AnimalHighlights from "@/components/AnimalHighlights";
import ZoneAnimalGrid from "@/components/ZoneAnimalGrid";
import ZoneHeroImage from "@/components/ZoneHeroImage";

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

  return (
    <main className="font-serif-headings min-h-screen bg-[#faf9f4] text-[#27352b]">
      {/* HERO */}
      <section className="relative isolate min-h-[520px] overflow-hidden bg-[#163d3b] sm:min-h-[580px]">
        <ZoneHeroImage zone="farmhouse" />

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
      <section id="jelajahi" className="bg-white py-16 sm:py-20">
        <ZoneAnimalGrid
          zone="farmhouse"
          filters={[{ label: "Semua", value: "Semua" }]}
          searchPlaceholder="Nama hewan或个人"
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
