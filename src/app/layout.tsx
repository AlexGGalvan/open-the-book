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
    default: "Daily Manna | Palabra y memorización bíblica",
    template: "%s | Daily Manna",
  },
  description: "Una palabra diaria y un pasaje semanal para memorizar y meditar en la Biblia.",
  applicationName: "Daily Manna",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Daily Manna",
  },
  openGraph: {
    title: "Daily Manna | Palabra y memorización bíblica",
    description: "Una palabra diaria y un pasaje semanal para memorizar y meditar en la Biblia.",
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
