"use client";

import AnimalHighlights from "@/components/AnimalHighlights";
import ZoneAnimalGrid from "@/components/ZoneAnimalGrid";

const facts = [
  {
    number: "01",
    title: "Membantu penyerbukan",
    description:
      "Kupu-kupu dan lebah membantu proses penyerbukan yang mendukung perkembangbiakan tumbuhan.",
  },
  {
    number: "02",
    title: "Menjaga rantai makanan",
    description:
      "Serangga menjadi sumber makanan bagi berbagai jenis burung, ikan, amfibi, dan hewan lainnya.",
  },
  {
    number: "03",
    title: "Menjaga keseimbangan alam",
    description:
      "Serangga berperan sebagai penyerbuk, pengurai, herbivora, maupun predator dalam ekosistem.",
  },
];

export default function InsectsPage() {

  return (
    <main className="font-serif-headings min-h-screen bg-[#faf9f4] text-[#27352b]">
      {/* HERO */}
      <section className="relative isolate min-h-[520px] overflow-hidden bg-[#163d3b] sm:min-h-[580px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://tamanmini.com/taman_jelajah_indonesia/wp-content/uploads/2023/09/Museum-Serangga-scaled.jpg')",
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
              <span className="text-[#b7d9ba]">Serangga.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              Dari taman yang dipenuhi bunga hingga kawasan hutan,
              kenali kehidupan serangga dan peran pentingnya dalam
              menjaga keseimbangan alam.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#jelajahi"
                className="rounded-full bg-[#c5dfb6] px-6 py-3.5 text-sm font-bold text-[#193c30] transition hover:bg-white"
              >
                Jelajahi Serangga <span className="ml-2">↘</span>
              </a>

              <a
                href="#tentang"
                className="rounded-full border bg-[#c5dfb6] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Tentang Serangga
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/20 pt-6">
              <div>
                <p className="text-sm text-white/60">Kenali</p>
                <p className="mt-1 font-bold text-white">
                  Ragam serangga
                </p>
              </div>

              <div>
                <p className="text-sm text-white/60">Pelajari</p>
                <p className="mt-1 font-bold text-white">
                  Peran ekosistem
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
            Makhluk kecil yang menjaga keseimbangan alam.
          </h2>
        </div>

        <div>
          <p className="leading-8 text-[#73796e]">
            Serangga merupakan kelompok hewan dengan bentuk dan cara hidup
            yang beragam. Mereka dapat ditemukan di taman, hutan, padang
            rumput, hingga lingkungan sekitar manusia.
          </p>

          <p className="mt-4 leading-8 text-[#73796e]">
            Sebagian serangga membantu penyerbukan tumbuhan, sebagian
            berperan dalam penguraian bahan organik, dan lainnya menjadi
            bagian penting dari rantai makanan.
          </p>
        </div>
      </section>

      {/* INSECT EXPLORER */}
      <AnimalHighlights location="serangga" title="Highlight Satwa" description="Kenali satwa pilihan dari zona ini dan jelajahi informasi lengkapnya." />
      <section id="jelajahi" className="bg-white py-16 sm:py-20">
        <ZoneAnimalGrid
          zone="serangga"
          filters={[{ label: "Semua", value: "Semua" }]}
          searchPlaceholder="Nama serangga atau habitat..."
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
              Serangga punya peran besar bagi kehidupan.
            </h2>

            <p className="mt-5 leading-8 text-[#73796e]">
              Keberadaan serangga mendukung proses alami yang menjaga
              ekosistem tetap berjalan. Melindungi habitat dan mengurangi
              pencemaran menjadi bagian dari upaya menjaga keanekaragaman hayati.
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
