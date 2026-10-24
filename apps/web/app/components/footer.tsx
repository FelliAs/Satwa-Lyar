import Link from "next/link";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Dunia Air Tawar", href: "/airtawar" },
  { label: "Dunia Serangga", href: "/serangga" },
  { label: "Museum Komodo", href: "/reptils" },
  { label: "Taman Burung", href: "/burung" },
  { label: "Farm House", href: "/farmhouse" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#e5e7dc] bg-[#254d38] text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link
              href="/"
              className="text-xl font-black tracking-tight"
            >
              SATWA <span className="text-[#d9b486]">LYAR</span>
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
              Jelajahi dunia satwa, kenali keanekaragaman hayati,
              dan belajar menjaga kelestarian alam bersama kami.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Jelajahi</h3>
            <div className="mt-3 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-white/75 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold">Tentang SATWA LYAR</h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Media informasi dan edukasi untuk mengenal satwa
              serta lingkungan hidup.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-5 text-center text-xs text-white/65">
          © 2026 SATWA LYAR. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
