import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // Build hatası nedeniyle geçici olarak devre dışı
import "./globals.css"; // ÖNEMLİ: Kendi projenizde bu satırı yorumdan çıkarın (Uncomment)

// const inter = Inter({ subsets: ["latin"] });

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
    // DİLİ TÜRKÇE YAPTIK (Screen Reader doğru telaffuz etsin diye)
    <html lang="tr">
      {/* inter.className yerine varsayılan fontu kullanıyoruz */}
      <body className="font-sans">
        {/* Skip Link: Klavye kullanıcıları için ana içeriğe hızlı geçiş */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-indigo-600 text-white px-4 py-2 rounded-md font-bold shadow-lg transition-transform"
        >
          Ana İçeriğe Atla
        </a>
        {children}
      </body>
    </html>
  );
}