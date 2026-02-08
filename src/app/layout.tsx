import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { HtmlLangSetter } from "@/components/HtmlLangSetter";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LegalDefender - AI Contract Analysis & Eviction Defense",
  description: "Instant legal document analysis and multimodal eviction defense powered by Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${newsreader.variable} ${ibmPlexMono.variable} ${playfairDisplay.variable} antialiased font-serif bg-[var(--bg)] text-[var(--text-primary)]`}
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var stored = localStorage.getItem('legaldefender-theme');
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = (stored === 'light' || stored === 'dark') ? stored : (prefersDark ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <HtmlLangSetter />
            <header className="bg-[var(--primary)] text-white py-5 px-6 border-b border-white/10 sticky top-0 z-50">
              <div className="max-w-6xl mx-auto flex justify-center items-center gap-4">
                <Link href="/" className="brand-title text-2xl md:text-3xl tracking-tight hover:opacity-90 transition-opacity">
                  LegalDefender
                </Link>
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </header>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
