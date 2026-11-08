"use client";

import AnimalHighlights from "@/components/AnimalHighlights";
import ZoneAnimalGrid from "@/components/ZoneAnimalGrid";

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
      <section id="jelajahi" className="bg-white py-16 sm:py-20">
        <ZoneAnimalGrid
          zone="air-tawar"
          filters={[{ label: "Semua", value: "Semua" }]}
          searchPlaceholder="Nama satwa atau habitat..."
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
