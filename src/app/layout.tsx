import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Playfair_Display } from "next/font/google"; // Switched to Inter
import Link from "next/link";
import Script from "next/script";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { HtmlLangSetter } from "@/components/HtmlLangSetter";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
        className={`${inter.variable} ${ibmPlexMono.variable} ${playfairDisplay.variable} antialiased font-sans bg-background text-foreground selection:bg-violet-100 selection:text-violet-900`}
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
            {/* Fintech Vibe: Clean Glass Header */}
            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 transition-all duration-300">
              <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                  <img src="/logo.svg" alt="LegalDefender Logo" className="w-12 h-12 object-contain shadow-lg rounded-full group-hover:scale-105 transition-transform" />
                  <span className="brand-title text-2xl font-bold tracking-tight text-slate-900 group-hover:text-violet-700 transition-colors">LegalDefender</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/50 rounded-full border border-slate-200/50">
                  <Link href="/mission-control" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:text-violet-700 hover:shadow-sm transition-all">Mission Control</Link>
                  <Link href="/contract-scanner" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:text-violet-700 hover:shadow-sm transition-all">Scanner</Link>
                  <Link href="/eviction-defense" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:text-violet-700 hover:shadow-sm transition-all">Eviction</Link>
                  <Link href="/landlord-radar" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:text-violet-700 hover:shadow-sm transition-all">Radar</Link>
                  <Link href="/evidence-locker" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:text-violet-700 hover:shadow-sm transition-all">Locker</Link>
                </nav>

                <button className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-violet-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  8xT...4jK
                </button>

                <div className="flex items-center gap-3">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="min-h-screen">
              {children}
            </main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
