"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Truck, AlertTriangle, CheckCircle, Users, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GigDefense() {
    const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input');
    const [restaurant, setRestaurant] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [miles, setMiles] = useState('');
    const [pay, setPay] = useState('');

    const analyzeRoute = () => {
        if (!restaurant || !pay) return;
        setStep('analyzing');
        setTimeout(() => {
            setStep('result');
        }, 2000);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-4">
                        <Users className="w-4 h-4" /> Gig Worker Union (Beta)
                    </div>
                    <h1 className="text-4xl font-serif font-bold mb-4 text-[var(--primary)]">
                        Verify Your Pay
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        We aggregates data from thousands of drivers to detect systemic underpayment on specific routes.
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {step === 'input' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-[var(--border)]"
                        >
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Restaurant / Pickup</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Chick-fil-A, Downtown"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            value={restaurant}
                                            onChange={(e) => setRestaurant(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Est. Miles</label>
                                        <div className="relative">
                                            <Truck className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                placeholder="3.5"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={miles}
                                                onChange={(e) => setMiles(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Offer Amount</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                placeholder="4.50"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={pay}
                                                onChange={(e) => setPay(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={analyzeRoute}
                                    disabled={!restaurant || !pay}
                                    className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Check Fair Pay <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'analyzing' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-white p-12 rounded-3xl shadow-lg border border-[var(--border)] text-center min-h-[400px] flex flex-col items-center justify-center"
                        >
                            <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                            <h3 className="text-2xl font-bold text-[var(--primary)] mb-2">Analyzing Route Data...</h3>
                            <p className="text-[var(--text-secondary)]">Comparing against 14,203 recent trips in your area.</p>
                        </motion.div>
                    )}

                    {step === 'result' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            {/* Alert Card */}
                            <div className="bg-red-50 border border-red-100 p-6 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                                <div className="flex items-start gap-4 relaitve z-10">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm shrink-0">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-red-900 mb-1">Potential Wage Theft Detected</h3>
                                        <p className="text-red-700/80 mb-4">
                                            This offer is <strong>$2.40 below the average</strong> for this route distance and time.
                                        </p>
                                        <div className="bg-white/60 p-4 rounded-xl text-sm text-red-800 font-medium flex items-center gap-3">
                                            <Users className="w-5 h-5 text-red-600" />
                                            ⚠️ You are the 5th driver to report underpayment on this specific route today.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Collective Action Card */}
                            <div className="bg-white border border-[var(--border)] p-8 rounded-3xl shadow-sm">
                                <h3 className="text-lg font-bold text-[var(--primary)] mb-6">Collective Data</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-[var(--text-secondary)]">Route Avg</span>
                                        <span className="font-mono font-bold">$7.90</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-[var(--text-secondary)]">Your Offer</span>
                                        <span className="font-mono font-bold text-red-500">${parseFloat(pay).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-[var(--text-secondary)]">Underpayment</span>
                                        <span className="font-mono font-bold text-red-600">-$2.40</span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-6 rounded-2xl text-center">
                                    <h4 className="font-bold text-blue-900 mb-2">Help Build the Case</h4>
                                    <p className="text-sm text-blue-700/80 mb-4">
                                        By logging this, you contribute to a class-action dataset against algorithmic wage discrimination.
                                    </p>
                                    <button
                                        onClick={() => setStep('input')}
                                        className="text-blue-600 font-bold hover:underline"
                                    >
                                        Analyze Another Route
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
