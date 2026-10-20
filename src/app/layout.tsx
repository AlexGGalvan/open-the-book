import type { Metadata } from "next";
import type { Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { ChurchAppShell } from "@/components/church/ChurchAppShell";
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
    default: "Iglesia de Torreón | Lectura diaria",
    template: "%s | Iglesia de Torreón",
  },
  description: "Lecturas bíblicas diarias, reflexiones y recursos de la Iglesia de Torreón.",
  applicationName: "Iglesia de Torreón - Lectura diaria",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lectura diaria",
  },
  openGraph: {
    title: "Iglesia de Torreón | Lectura diaria",
    description: "Lecturas bíblicas diarias, reflexiones y recursos de la Iglesia de Torreón.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1677c8",
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
      <body className="min-h-full bg-[#edf6fc] font-sans">
        <ChurchAppShell>{children}</ChurchAppShell>
      </body>
    </html>
  );
}
