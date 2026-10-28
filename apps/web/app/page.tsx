"use client";

import { useEffect, useState } from "react";
import AnimalHighlights from "@/components/AnimalHighlights";

const destinations = [
  { name: "Dunia Air Tawar", kicker: "SUNGAI & DANAU", description: "Menyelami kehidupan yang mengalir di perairan kita.", image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=900&q=85", href: "/airtawar" },
  { name: "Dunia Serangga", kicker: "DUNIA KECIL, PERAN BESAR", description: "Melihat lebih dekat para penyerbuk dan pengurai alam.", image: "https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=900&q=85", href: "/serangga" },
  { name: "Museum Komodo", kicker: "JEJAK SANG PURBA", description: "Mengenal kadal terbesar dan habitat khasnya.", image: "https://images.unsplash.com/photo-1570741066052-817c6de995c8?w=900&q=85", href: "/reptils" },
  { name: "Taman Burung", kicker: "SAYAP NUSANTARA", description: "Menemukan warna, suara, dan peran burung di alam.", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=900&q=85", href: "/burung" },
  { name: "Farm House", kicker: "KEHIDUPAN BERSAMA", description: "Belajar tentang satwa ternak dan cara merawatnya.", image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900&q=85", href: "/farmhouse" },
];

const faqs = [
  { question: "Apa itu JSN-EDU?", answer: "JSN-EDU adalah ruang belajar digital untuk mengenal satwa, habitat, serta peran setiap makhluk hidup dalam menjaga keseimbangan alam." },
  { question: "Siapa yang bisa belajar di sini?", answer: "Semua orang bisa menjelajahi JSN-EDU, termasuk pelajar, keluarga, pendidik, dan siapa pun yang ingin mengenal alam lebih dekat." },
  { question: "Apa yang bisa ditemukan di menu Destinasi?", answer: "Ada lima dunia untuk dijelajahi: Air Tawar, Serangga, Museum Komodo, Taman Burung, dan Farm House." },
  { question: "Bagaimana cara ikut menjaga satwa?", answer: "Mulailah dengan mengenal satwa dan habitatnya, menghargai lingkungan, serta membagikan pengetahuan yang benar kepada orang di sekitar kita." },
];

export default function HomePage() {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="overflow-hidden bg-[#f6f5ed] text-[#183d32]">
      <section data-reveal className="hero relative isolate">
        <div className="hero-image absolute inset-0 -z-20" />
        <div className="hero-shade absolute inset-0 -z-10" />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">JELAJAHI KEHIDUPAN INDONESIA</p>
            <h1 className="hero-heading">Kenali Satwa<br />Jaga Alam Kita</h1>
            <p className="hero-description">Dari rimbunnya hutan hingga kehidupan di air tawar. Temukan keunikan satwa Indonesia dan alasan kita perlu menjaganya.</p>
            <div className="mt-7 flex flex-wrap gap-3"><a href="#zona" className="button-primary">Jelajahi Satwa <span aria-hidden="true">↗</span></a><a href="#tentang" className="button-ghost">Tentang Kami</a></div>
            <div className="hero-meta"><span>SATWA · HABITAT · KEPEDULIAN</span><a href="#zona">Mulai penjelajahan <span aria-hidden="true">↓</span></a></div>
          </div>
          <article className="hero-feature">
            <img src="https://www.mediajustitia.com/wp-content/uploads/2026/10/Orangutan-indonesia-terdesak-2773950329.webp" alt="Orangutan di antara pepohonan hutan" />
            <div className="hero-fact"><p className="eyebrow">CATATAN DARI HABITAT</p><h2>Penjaga regenerasi hutan</h2><p>Orangutan membantu menyebarkan biji dari buah yang dimakannya. Hutan pun terus tumbuh.</p><span>⌖ Hutan tropis Kalimantan</span></div>
          </article>
        </div>
      </section>

      <section data-reveal id="zona" className="destination-section scroll-mt-20 px-5 py-16 sm:py-20 lg:px-8">
        <div className="section-heading mx-auto text-center"><p className="eyebrow">PILIH ARAH PENJELAJAHANMU</p><h2 className="section-title">Jelajahi Dunia Satwa</h2><p className="section-description mx-auto">Lima pintu untuk mengenal kehidupan. Setiap destinasi menyimpan cerita dan sudut pandang yang berbeda.</p></div>
        <div className="destination-grid mx-auto mt-9 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-6" onPointerLeave={() => setSelectedDestination(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSelectedDestination(null); }}>
          {destinations.map((destination, index) => <a key={destination.name} href={destination.href} onPointerEnter={() => setSelectedDestination(destination.name)} onPointerDown={() => setSelectedDestination(destination.name)} onFocus={() => setSelectedDestination(destination.name)} style={{ backgroundImage: `linear-gradient(180deg, transparent 24%, rgb(7 25 19 / 84%) 100%), url("${destination.image}")` }} className={`destination-card group lg:col-span-2 ${index === 3 ? "lg:col-start-2" : index === 4 ? "lg:col-start-4" : ""} ${selectedDestination ? selectedDestination === destination.name ? "is-selected" : "is-dimmed" : ""}`}><span className="destination-kicker">{destination.kicker}</span><span className="destination-arrow" aria-hidden="true">↗</span><div><h3>{destination.name}</h3><p>{destination.description}</p></div></a>)}
        </div>
        <p className="destination-footnote">Mulai dari rasa ingin tahu. Temukan cerita yang paling dekat denganmu.</p>
      </section>

      <div data-reveal id="satwa" className="scroll-mt-20">
        <AnimalHighlights location="landing" title="Ensiklopedia Satwa" description="Setiap satwa punya cerita. Kenali ciri, habitat, dan perannya dalam keseimbangan alam." />
      </div>
      {/*
      <section data-reveal id="satwa" className="encyclopedia-section scroll-mt-20 px-5 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl"><div className="encyclopedia-heading"><div><p className="eyebrow">KENALI LEBIH DEKAT</p><h2 className="section-title">Ensiklopedia Satwa</h2><p className="section-description">Setiap satwa punya cerita. Kenali ciri, habitat, dan perannya dalam keseimbangan alam.</p></div><label className="animal-search"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama satwa..." aria-label="Cari nama satwa" /></label></div>
          <div className="animal-filters" role="group" aria-label="Filter kategori satwa">{filters.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={filter === item ? "active" : ""}>{item}</button>)}</div>
          <div className="animal-grid">{visibleAnimals.map((animal) => <article key={animal.name} className="animal-card"><div className="animal-image"><img src={animal.image} alt={animal.name} /><span>{animal.category}</span></div><div className="animal-content"><h3>{animal.name}</h3><p className="animal-scientific">{animal.scientific}</p><p>{animal.description}</p><div className="animal-location"><span>⌖ {animal.location}</span><a href="#zona" aria-label={`Jelajahi habitat ${animal.name}`}>↗</a></div></div></article>)}</div>
          {visibleAnimals.length === 0 && <p className="animal-empty">Belum ada satwa yang cocok. Coba kata kunci atau kategori lain.</p>}
          <div className="encyclopedia-footer"><span>Sekilas kekayaan fauna Nusantara.</span><a href="#zona">Lihat semua satwa ↗</a></div>
        </div>
      </section> */}

      <section data-reveal id="tentang" className="about-section scroll-mt-20 px-5 py-16 sm:py-20 lg:px-8"><div className="about-layout mx-auto grid max-w-6xl items-center gap-9 md:grid-cols-2 md:gap-14"><div className="about-image"><img src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&q=85" alt="Hutan tropis sebagai rumah beragam kehidupan" /><div><span>✳</span><p>Alam bukan hanya tempat tinggal. Ia adalah kehidupan yang saling terhubung.</p></div></div><div className="about-copy"><p className="eyebrow">TENTANG KAMI</p><h2 className="section-title">Kepedulian tumbuh dari perkenalan.</h2><p>JSN-EDU adalah ruang belajar tentang satwa dan keanekaragaman hayati Indonesia. Kami ingin membuat pengetahuan terasa dekat, menarik, dan mudah dipahami siapa saja.</p><p>Dengan mengenal satwa dan habitatnya, kita belajar menghargai setiap perannya—dan memulai langkah kecil untuk menjaga alam bersama.</p><ul><li>Belajar dengan rasa ingin tahu</li><li>Menghargai satwa dan habitatnya</li><li>Menumbuhkan kepedulian sehari-hari</li></ul><a href="#zona" className="about-link">Kenali JSN-EDU <span>↗</span></a></div></div></section>

      <section data-reveal id="faq" className="faq-section scroll-mt-20 px-5 py-16 sm:py-20 lg:px-8"><div className="faq-layout mx-auto grid max-w-6xl gap-8 md:grid-cols-[.7fr_1.3fr] md:gap-14"><div><p className="eyebrow">SEBELUM MENJELAJAH</p><h2 className="section-title">Ada yang ingin kamu tahu?</h2><p className="section-description">Beberapa jawaban singkat untuk menemani awal penjelajahanmu.</p></div><div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} className="faq-item" open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></div></section>
    </main>
  );
}
