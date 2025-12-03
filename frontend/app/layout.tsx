import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Erişilebilir Biletleme",
  description: "WCAG 2.1 Uyumlu Bilet Satış Platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="font-sans">
        {/* Skip Link */}
        <a 
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-indigo-600 text-white px-4 py-2 rounded-md font-bold shadow-lg transition-transform"
        >
          Ana İçeriğe Atla
        </a>

        {/* 🔥 ANA İÇERİK SARICI: WCAG hatasını çözen yer */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
