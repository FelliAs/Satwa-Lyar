import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Panel – SATWA LYAR",
  description: "Panel administrasi untuk mengelola data satwa dan konten website SATWA LYAR.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="h-full font-sans antialiased bg-slate-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
