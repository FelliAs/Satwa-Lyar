import type { Metadata } from "next";
import "./globals.css";
import PageViewTracker from "@/components/PageViewTracker";
import { AuthProvider } from "@/context/AuthContext";
import SiteChrome from "@/components/SiteChrome";

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
        <AuthProvider>
          <PageViewTracker />
          <SiteChrome>{children}</SiteChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
