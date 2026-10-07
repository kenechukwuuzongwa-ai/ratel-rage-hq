import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:5173"),
  title: { default: "Ratel Rage — Official Game Site", template: "%s | Ratel Rage" },
  description: "Ratel Rage is a Nigerian-inspired 2D arcade beat ’em up. Meet Darki, explore the streets, and join the playtest.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", title: "Ratel Rage", description: "A Nigerian-inspired 2D arcade beat ’em up. The street has a price.", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ratel Rage: Darki on a Lagos street" }] },
  twitter: { card: "summary_large_image", title: "Ratel Rage", description: "A Nigerian-inspired 2D arcade beat ’em up. In development.", images: ["/og.png"] },
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
