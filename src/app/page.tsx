"use client";

import { Scale, FileText, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2342] via-[var(--bg)] to-[var(--bg)] opacity-50 z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-none bg-white/5 backdrop-blur-sm mb-8 animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
            <span className="text-sm font-medium text-[var(--accent)] tracking-wide uppercase">{t('home.badge')}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-sm font-mono text-[var(--success)]">
              ${(14250).toLocaleString()} Recovered
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 leading-tight animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
            {t('home.title')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--success)]">{t('home.titleHighlight')}</span>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
            {t('home.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/contract-scanner"
              className="group relative px-8 py-4 bg-[var(--primary)] text-white rounded-full font-bold text-lg hover:bg-[var(--primary-light)] transition-all shadow-lg hover:shadow-[var(--accent-glow)] flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
              {t('home.ctaScan')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/eviction-defense"
              className="px-8 py-4 bg-white text-[var(--primary)] border border-[var(--border)] rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              {t('home.ctaEvidence')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="py-12 border-y border-[var(--border)] bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-[var(--primary)] mb-1">98%</div>
            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">{t('home.accuracy')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[var(--primary)] mb-1">$2.5M</div>
            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">{t('home.depositsSaved')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[var(--primary)] mb-1">15k+</div>
            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">{t('home.leasesScanned')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[var(--primary)] mb-1">24/7</div>
            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">{t('home.availability')}</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-serif font-bold text-center mb-16 text-[var(--primary)]">{t('home.sectionTitle')}</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <Link href="/contract-scanner" className="group">
            <div className="glass h-full p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-[var(--border)] hover:border-[var(--accent)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText className="w-24 h-24 rotate-12" />
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[var(--primary)]">{t('home.cardScannerTitle')}</h3>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                {t('home.cardScannerDesc')}
              </p>
              <div className="text-[var(--accent)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                {t('home.cardScannerCta')} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/eviction-defense" className="group">
            <div className="glass h-full p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-[var(--border)] hover:border-[var(--danger)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-24 h-24 rotate-12" />
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6 text-red-600 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[var(--primary)]">{t('home.cardDefenseTitle')}</h3>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                {t('home.cardDefenseDesc')}
              </p>
              <div className="text-[var(--danger)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                {t('home.cardDefenseCta')} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/evidence-locker" className="group">
            <div className="glass h-full p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-[var(--border)] hover:border-[var(--success)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle className="w-24 h-24 rotate-12" />
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[var(--primary)]">{t('home.cardLockerTitle')}</h3>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                {t('home.cardLockerDesc')}
              </p>
              <div className="text-[var(--success)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                {t('home.cardLockerCta')} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border)] bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-60">
          <div className="flex items-center gap-3 font-serif font-bold text-xl mb-4 md:mb-0">
            <img src="/logo.png" alt="LegalDefender Logo" className="w-8 h-8 object-contain" />
            {t('home.footerBrand')}
          </div>
          <div className="text-sm font-mono">
            {t('home.footerBuilt')}
          </div>
        </div>
      </footer>
    </div>
  );
}
