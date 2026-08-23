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
  metadataBase: new URL("https://open-the-book.app"),
  title: {
    default: "OPEN THE BOOK",
    template: "%s · OPEN THE BOOK",
  },
  description: "A quiet place between you and the Word.",
  applicationName: "Open the Book",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Open the Book",
  },
  openGraph: {
    title: "OPEN THE BOOK",
    description: "A quiet place between you and the Word.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#080604",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#050403] font-sans">{children}</body>
    </html>
  );
}
