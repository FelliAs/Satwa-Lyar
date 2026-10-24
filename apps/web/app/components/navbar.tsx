"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Dunia Air Tawar", href: "/airtawar" },
  { label: "Dunia Serangga", href: "/serangga" },
  { label: "Museum Komodo", href: "/reptils" },
  { label: "Taman Burung", href: "/burung" },
  { label: "Farm House", href: "/farmhouse" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e7dc] bg-[#faf9f4]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[78px] max-w-[1400px] items-center justify-between gap-4 px-5 lg:px-10">
        {/* LOGO */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
  src="/jsnn.jpg"
  alt="Logo SATWA LYAR"
  width={44}
  height={44}
  className="h-11 w-11 rounded-full object-cover"
/>

          <span className="text-lg font-black tracking-tight text-[#254d38] sm:text-xl">
            SATWA <span className="text-[#a16b3b]">LYAR</span>
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap border-b-2 py-2 text-sm transition ${
                  active
                    ? "border-[#315b40] font-bold text-[#315b40]"
                    : "border-transparent font-medium text-[#555b50] hover:text-[#315b40]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* TOMBOL MENU MOBILE */}
        <button
          type="button"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dce2d6] text-2xl text-[#315b40] lg:hidden"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {/* MENU MOBILE */}
      {menuOpen && (
        <nav className="border-t border-[#e5e7dc] bg-[#faf9f4] px-5 py-3 lg:hidden">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-[#e9eee4] font-bold text-[#315b40]"
                      : "text-[#555b50] hover:bg-[#edf0e7]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

          </div>
        </nav>
      )}
    </header>
  );
}