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
              <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                  <img src="/logo.png" alt="LegalDefender Logo" className="w-8 h-10 object-contain" />
                  <span className="brand-title text-2xl font-bold tracking-tight">LegalDefender</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                  <Link href="/mission-control" className="hover:text-[var(--accent)] transition-colors">Mission Control</Link>
                  <Link href="/contract-scanner" className="hover:text-[var(--accent)] transition-colors">Scanner</Link>
                  <Link href="/eviction-defense" className="hover:text-[var(--accent)] transition-colors">Eviction</Link>
                  <Link href="/gig-defense" className="hover:text-[var(--accent)] transition-colors">Gig Union</Link>
                  <Link href="/evidence-locker" className="hover:text-[var(--accent)] transition-colors">Locker</Link>
                </nav>

                <div className="flex items-center gap-4">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
