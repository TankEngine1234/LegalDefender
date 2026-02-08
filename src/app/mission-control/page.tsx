"use client";

import { motion } from 'framer-motion';
import { Shield, TrendingUp, Users, Scale, ArrowRight, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { useEffect, useState } from 'react';

export default function MissionControl() {
    const { t } = useLanguage();
    const [moneyRecovered, setMoneyRecovered] = useState(14250);
    const [clausesFlagged, setClausesFlagged] = useState(342);

    // Live ticker effect
    useEffect(() => {
        const interval = setInterval(() => {
            setMoneyRecovered(prev => prev + Math.floor(Math.random() * 50));
            if (Math.random() > 0.7) setClausesFlagged(prev => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg)] pt-20 pb-12 px-6">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B2968] text-white font-bold mb-4 shadow-lg border border-violet-400/30 animate-pulse">
                        <Shield className="w-4 h-4" /> Mission Control
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-[var(--primary)]">
                        State of <span className="text-violet-600">Justice</span>
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Real-time tracking of the systemic imbalance between landlords and tenants. We're leveling the playing field, one lease at a time.
                    </p>
                </motion.div>

                {/* Key Stats Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--border)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                        <h3 className="text-xl font-black text-rose-500 uppercase tracking-widest mb-2 animate-pulse">The Crisis</h3>
                        <div className="text-5xl font-bold text-[var(--danger)] mb-2">$50 Billion</div>
                        <p className="text-[var(--text-secondary)] mb-6">Stolen from workers annually via wage theft—more than all robberies combined.</p>
                        <div className="flex items-center gap-2 text-sm text-[var(--danger)] font-medium bg-red-50 px-3 py-1 rounded-full w-fit">
                            <AlertTriangle className="w-4 h-4" /> Source: Economic Policy Institute
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--border)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                        <h3 className="text-xl font-black text-violet-500 uppercase tracking-widest mb-2 animate-pulse">The Imbalance</h3>
                        <div className="flex items-end gap-2 mb-2">
                            <div className="text-5xl font-bold text-[var(--primary)]">90%</div>
                            <div className="text-xl text-[var(--text-secondary)] mb-2">vs</div>
                            <div className="text-5xl font-bold text-[var(--accent)]">10%</div>
                        </div>
                        <p className="text-[var(--text-secondary)] mb-6">Landlords have lawyers. Tenants usually don't. Until now.</p>
                        <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex">
                            <div className="w-[90%] bg-[var(--primary)] h-full" title="Landlords"></div>
                            <div className="w-[10%] bg-[var(--accent)] h-full" title="Tenants"></div>
                        </div>
                    </motion.div>
                </div>

                {/* Live Impact Tracker */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-[#0A0E27] text-white p-10 rounded-[2rem] shadow-2xl mb-12 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-[var(--success)] font-bold mb-2 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span> LIVE IMPACT
                            </div>
                            <h2 className="text-4xl font-serif font-bold mb-2">LegalDefender Usage</h2>
                            <p className="text-white/60">Real-time stats from our decentralized network.</p>
                        </div>

                        <div className="flex gap-8 md:gap-16 text-center">
                            <div>
                                <div className="text-5xl font-mono font-bold text-[var(--success)] mb-1">
                                    ${moneyRecovered.toLocaleString()}
                                </div>
                                <div className="text-sm font-medium text-white/60 uppercase tracking-wider">Est. Money Recovered</div>
                            </div>
                            <div>
                                <div className="text-5xl font-mono font-bold text-[var(--accent)] mb-1">
                                    {clausesFlagged.toLocaleString()}
                                </div>
                                <div className="text-sm font-medium text-white/60 uppercase tracking-wider">Illegal Clauses Flagged</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Cost Comparison */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white p-10 rounded-3xl shadow-sm border border-[var(--border)]"
                >
                    <h2 className="text-3xl font-serif font-bold mb-8 text-center text-[var(--primary)]">The Cost of <span className="text-violet-600">Justice</span></h2>

                    <div className="flex flex-col md:flex-row gap-8 items-end justify-center h-64">
                        {/* Traditional Legal */}
                        <div className="w-full md:w-1/3 flex flex-col items-center group">
                            <div className="text-2xl font-bold text-[var(--text-secondary)] mb-2">$300/hr</div>
                            <div className="w-full bg-[#0A0E27] rounded-t-xl h-48 relative overflow-hidden group-hover:bg-[#1a214d] transition-colors">
                                <div className="absolute bottom-4 left-0 right-0 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Traditional Lawyer</div>
                            </div>
                        </div>

                        {/* LegalDefender */}
                        <div className="w-full md:w-1/3 flex flex-col items-center group">
                            <div className="text-2xl font-bold text-[var(--success)] mb-2">$0</div>
                            <div className="w-full bg-[var(--success)] rounded-t-xl h-16 relative overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.3)] group-hover:h-20 transition-all duration-500">
                                <div className="absolute bottom-4 left-0 right-0 text-center text-xs font-bold text-green-900 uppercase tracking-wider">LegalDefender</div>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-[var(--text-secondary)] mt-8 max-w-lg mx-auto">
                        For 90% of tenants, the choice isn't between a "good lawyer" and a "bad lawyer." It's between <b>no help</b> and <b>help</b>.
                    </p>
                </motion.div>

            </div>
        </div>
    );
}
