import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://adama-os-web.vercel.app"),
  title: "Adama OS, System Architect",
  description:
    "Tableau de bord en direct d'Adama Diallo, architecte de Strata. RSE, ESG, CSRD.",
  openGraph: {
    title: "Adama OS, System Architect",
    description:
      "Le dashboard système d'Adama Diallo, architecte de Strata.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adama OS, System Architect",
    description:
      "Le dashboard système d'Adama Diallo, architecte de Strata.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
