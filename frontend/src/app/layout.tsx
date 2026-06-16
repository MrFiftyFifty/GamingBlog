import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import { Analytics } from "@/components/providers/Analytics";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Игровой форум — обсуждение компьютерных игр",
    template: "%s — Игровой форум",
  },
  description:
    "Русскоязычный форум для геймеров: гайды, обзоры, впечатления и поиск команды. Обсуждения по играм, платформам и жанрам.",
  keywords: [
    "игры", "геймеры", "форум", "обзоры", "гайды", "RPG", "шутеры",
    "MMO", "Steam", "PlayStation", "Xbox", "PC-игры",
  ],
  authors: [{ name: "GamingBlog" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Игровой форум",
    title: "Игровой форум — обсуждение компьютерных игр",
    description: "Русскоязычный форум для геймеров: гайды, обзоры, впечатления и поиск команды.",
    images: [{ url: "/images/home/featured.jpg", width: 1200, height: 630, alt: "Игровой форум" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Игровой форум — обсуждение компьютерных игр",
    description: "Русскоязычный форум для геймеров: гайды, обзоры, впечатления и поиск команды.",
    images: ["/images/home/featured.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased min-h-screen flex flex-col overflow-x-hidden`}>
        <AuthProvider>
          <a href="#main-content" className="skip-to-content">
            Перейти к основному содержимому
          </a>
          <SmoothScroll />
          <Toaster position="top-right" richColors closeButton />
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
