"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const zones = [
  { label: "Dunia Air Tawar", note: "SUNGAI & DANAU", href: "/airtawar" },
  { label: "Dunia Serangga", note: "DUNIA KECIL, PERAN BESAR", href: "/serangga" },
  { label: "Museum Komodo", note: "JEJAK SANG PURBA", href: "/reptils" },
  { label: "Taman Burung", note: "SAYAP NUSANTARA", href: "/burung" },
  { label: "Farm House", note: "DEKAT DENGAN KESEHARIAN", href: "/farmhouse" },
];

function Brand() {
  return (
    <span className="brand-lockup">
      <span className="brand-mark">
        <img src="/jsnn.jpg" alt="JSN-EDU" />
      </span>
      <span className="brand-name">JSN-EDU</span>
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const closeMenus = () => { setMenuOpen(false); setDestinationsOpen(false); };

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="header-inner mx-auto flex min-h-[64px] max-w-[1500px] items-center justify-between gap-4 px-5 lg:px-8">
        <Link href="/" onClick={closeMenus} aria-label="JSN-EDU, beranda"><Brand /></Link>
        <nav className="desktop-nav hidden items-center xl:flex" aria-label="Navigasi utama">
          <Link href="/" className={pathname === "/" ? "active" : ""}>Beranda</Link>
          <div className="desktop-destination-wrap">
            <button type="button" className={destinationsOpen || zones.some((zone) => pathname === zone.href) ? "active" : ""} aria-expanded={destinationsOpen} onClick={() => setDestinationsOpen((open) => !open)}>Destinasi <span aria-hidden="true">{destinationsOpen ? "⌃" : "⌄"}</span></button>
            {destinationsOpen && <div className="destinations-menu">
              <div className="mega-intro"><p>DESTINASI</p><h2>Ke mana rasa ingin tahumu membawa?</h2><span>Pilih satu dunia. Temukan banyak cerita kehidupan.</span></div>
              <div className="mega-links">{zones.map((zone) => <Link key={zone.href} href={zone.href} onClick={closeMenus}><span><strong>{zone.label}</strong><small>{zone.note}</small></span><i aria-hidden="true">↗</i></Link>)}</div>
              <Link href="/serangga" onClick={closeMenus} className="mega-feature"><span>PILIHAN JELAJAH</span><strong>Dunia Serangga</strong><i aria-hidden="true">↗</i></Link>
            </div>}
          </div>
          <Link href="/#tentang">Tentang</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <span className="header-tagline hidden xl:block">DEKAT DENGAN ALAM</span>
        <button type="button" className="mobile-menu-toggle xl:hidden" aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? "×" : "☰"}</button>
      </div>

      {menuOpen && <nav className="mobile-nav-panel xl:hidden" aria-label="Navigasi utama">
        <div className="mobile-nav-top"><Link href="/" onClick={closeMenus}><Brand /></Link><button type="button" aria-label="Tutup navigasi" onClick={closeMenus}>×</button></div>
        <p className="mobile-nav-kicker">MULAI PENJELAJAHAN</p>
        <Link href="/" onClick={closeMenus} className="mobile-nav-heading">Beranda</Link>
        <button type="button" className="mobile-nav-heading mobile-destinations-button" aria-expanded={destinationsOpen} onClick={() => setDestinationsOpen((open) => !open)}>Destinasi <span>{destinationsOpen ? "⌃" : "⌄"}</span></button>
        {destinationsOpen && <div className="mobile-destinations-list">{zones.map((zone) => <Link key={zone.href} href={zone.href} onClick={closeMenus}>{zone.label}<span aria-hidden="true">↗</span></Link>)}</div>}
        <Link href="/#tentang" onClick={closeMenus} className="mobile-nav-heading">Tentang</Link>
        <Link href="/#faq" onClick={closeMenus} className="mobile-nav-heading">FAQ</Link>
        <div className="mobile-nav-bottom"><a href="/#zona" onClick={closeMenus}>Jelajahi Satwa <span>↗</span></a><p>Kenali lebih dekat. Peduli lebih dalam.</p></div>
      </nav>}
    </header>
  );
}
