import Link from "next/link";

const destinations = [
  { label: "Dunia Air Tawar", href: "/airtawar" },
  { label: "Dunia Serangga", href: "/serangga" },
  { label: "Museum Komodo", href: "/reptils" },
  { label: "Taman Burung", href: "/burung" },
  { label: "Farm House", href: "/farmhouse" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <div className="footer-grid">
         <div className="footer-brand">
  <Link href="/" className="footer-brand-name">
    <span className="footer-brand-mark">
      <img src="/jsnn.jpg" alt="Logo JSN-EDU" />
    </span>
    <span className="footer-brand-text">JSN-EDU</span>
  </Link>

  <h2>
    Kenali lebih dekat.
    <br />
    Peduli lebih dalam.
  </h2>

  <p>
    Ruang belajar satwa dan keanekaragaman hayati Indonesia.
  </p>
</div>
<div>
  <h3>JELAJAH</h3>
  <Link href="/">Beranda</Link>
  <Link href="/#zona">Destinasi</Link>
  <Link href="/#satwa">Ensiklopedia Satwa</Link>
  <Link href="/#tentang">Tentang Kami</Link>
  <Link href="/#faq">FAQ</Link>
</div>
        <div>
            <h3>DESTINASI</h3>
            {destinations.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 JSN-EDU. Belajar untuk menjaga.</span>
          <span>Dari rasa ingin tahu, untuk masa depan alam.</span>
        </div>
      </div>
    </footer>
  );
}
