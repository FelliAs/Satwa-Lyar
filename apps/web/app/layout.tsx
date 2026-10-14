import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SATWA LYAR — Jelajahi Dunia Satwa",
  description:
    "Jelajahi Dunia Air Tawar, Dunia Serangga, Museum Komodo, Taman Burung, dan Farm House.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
