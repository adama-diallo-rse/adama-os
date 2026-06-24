import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adama OS",
  description: "Adama OS — Phase 0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
