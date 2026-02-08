"use client";

import { Scale, FileText, ArrowRight, Shield, CheckCircle, Smartphone, TrendingUp, Users, Activity } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Fintech Style */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-violet-100 shadow-sm mb-8 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-semibold text-slate-600 tracking-wide">{t('home.badge')}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-sm font-bold text-emerald-600">
                  ${(14250).toLocaleString()} Recovered
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-slate-900 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {t('home.title')} <br />
                <span className="text-violet-600">{t('home.titleHighlight')}</span>
              </h1>

              <p className="text-xl text-slate-500 mb-10 max-w-lg mx-auto md:mx-0 font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {t('home.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Link
                  href="/contract-scanner"
                  className="group relative px-8 py-4 bg-violet-600 text-white rounded-full font-bold text-lg hover:bg-violet-700 transition-all shadow-lg hover:shadow-violet-200 flex items-center justify-center gap-2"
                >
                  {t('home.ctaScan')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/eviction-defense"
                  className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  {t('home.ctaEvidence')}
                </Link>
              </div>
            </div>

            {/* Visual Widget / "Credit Card" Style Graphic */}
            <div className="flex-1 w-full max-w-md md:max-w-full relative animate-fade-in" style={{ animationDelay: '0.4s' }}>

              {/* Main Scanner Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(124,58,237,0.15)] border border-white relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-violet-100 p-4 rounded-2xl">
                    <FileText className="w-8 h-8 text-violet-600" />
                  </div>
                  <span className="bg-emerald-100/50 text-emerald-600 text-sm font-bold px-4 py-2 rounded-full">98% Match</span>
                </div>
                <div className="space-y-3 mb-10">
                  <h4 className="text-slate-900 font-bold text-lg">Lease Agreement Analysis</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Clause 4.2 contains a hidden repair fee waiver which violates Texas Property Code § 92.006.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Verified against Texas Law
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Risk Score</div>
                    <div className="text-2xl font-bold text-slate-900">Low Risk</div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-full p-3 hover:bg-slate-800 transition-colors cursor-pointer">
                    <ArrowRight className="w-5 h-5 -rotate-45" />
                  </div>
                </div>
              </div>

              {/* Floating Stats Card 1 */}
              <div className="absolute -top-12 -right-4 bg-white p-4 rounded-3xl shadow-xl border border-white z-20 animate-bounce cursor-default md:block hidden" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold">Total Saved</div>
                    <div className="text-lg font-bold text-slate-900">$14,250</div>
                  </div>
                </div>
              </div>

              {/* Floating Stats Card 2 - Moved Down Below */}
              <div className="absolute -bottom-16 left-8 bg-white p-4 rounded-3xl shadow-xl border border-white z-0 md:block hidden opacity-90 scale-95">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold">Active Shield</div>
                    <div className="text-lg font-bold text-slate-900">Protected</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Grid Section */}
      <section className="px-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">{t('home.sectionTitle')}</h2>
          <Link href="/contract-scanner" className="text-violet-600 font-bold text-sm hover:underline">View All</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Scanner */}
          <Link href="/contract-scanner" className="group">
            <div className="glass-card h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 text-violet-600 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{t('home.cardScannerTitle')}</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                {t('home.cardScannerDesc')}
              </p>
              <div className="text-violet-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                {t('home.cardScannerCta')} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 2: Eviction Defense */}
          <Link href="/eviction-defense" className="group">
            <div className="glass-card h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-500 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-slate-900">{t('home.cardDefenseTitle')}</h3>
                <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full">EMERGENCY</span>
              </div>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                {t('home.cardDefenseDesc')}
              </p>
              <div className="text-rose-500 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                {t('home.cardDefenseCta')} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Card 3: Locker */}
          <Link href="/evidence-locker" className="group">
            <div className="glass-card h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{t('home.cardLockerTitle')}</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                {t('home.cardLockerDesc')}
              </p>
              <div className="text-emerald-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                {t('home.cardLockerCta')} <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-400">
          <div className="flex items-center gap-3 font-bold text-lg mb-4 md:mb-0 text-slate-900">
            <img src="/logo.svg" alt="LegalDefender Logo" className="w-8 h-8 object-contain" />
            {t('home.footerBrand')}
          </div>
          <div className="text-xs font-mono">
            {t('home.footerBuilt')}
          </div>
        </div>
      </footer>
    </div>
  );
}
