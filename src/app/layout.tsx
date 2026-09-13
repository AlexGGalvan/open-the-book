import type { Metadata } from "next";
import type { Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alexggalvan.github.io/open-the-book/"),
  title: {
    default: "Recitación de la semana",
    template: "%s | Recitación de la semana",
  },
  description: "Memorizaciones bíblicas semanales para recitar y practicar.",
  applicationName: "Recitación de la semana",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Recitación",
  },
  openGraph: {
    title: "Recitación de la semana",
    description: "Memorizaciones bíblicas semanales para recitar y practicar.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f1",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#fbf8f1] font-sans">{children}</body>
    </html>
  );
}
