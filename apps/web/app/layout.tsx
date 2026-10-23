import type { Metadata } from "next";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
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
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
