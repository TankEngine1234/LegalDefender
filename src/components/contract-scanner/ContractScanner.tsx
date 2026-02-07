"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle, Shield, Search, ArrowRight, X } from 'lucide-react';
import { extractTextFromFile } from '@/lib/file-processing';
import { RiskScoreGauge } from './risk-gauge';

// --- Types ---
type ScanStatus = 'idle' | 'scanning' | 'analyzing' | 'complete' | 'error';

interface AnalysisResult {
    riskScore: {
        overall: number;
        grade: string;
        breakdown: Array<{ category: string; score: number; grade: string; status: string }>;
    };
    comparison: {
        location: string;
        contractsAnalyzed: number;
        metrics: Array<{
            label: string;
            yourValue: string;
            marketAvg: string;
            difference: string;
            status: 'above' | 'below' | 'fair';
            suggestion: string | null
        }>;
    };
    summary: string[];
    risks: Array<{
        severity: 'high' | 'medium' | 'low';
        title: string;
        description: string;
        standard: string;
        savings: string;
        legalCode?: string;
        script?: string;
    }>;
    totalSavings: string;
}

// --- Sample Data ---
const SAMPLE_CONTRACTS: Record<string, AnalysisResult & { name: string; type: string }> = {
    lease: {
        name: "Apartment Lease Agreement",
        type: "lease",
        riskScore: {
            overall: 58,
            grade: "C-",
            breakdown: [
                { category: "Financial Terms", score: 72, grade: "B", status: "good rent, bad fees" },
                { category: "Legal Compliance", score: 45, grade: "D", status: "2 unenforceable clauses" },
                { category: "Tenant Rights", score: 65, grade: "C", status: "weak maintenance terms" },
                { category: "Hidden Costs", score: 35, grade: "F", status: "$650/year in excessive fees" }
            ]
        },
        comparison: {
            location: "Austin, TX",
            contractsAnalyzed: 247,
            metrics: [
                { label: "Monthly Rent", yourValue: "$1,850", marketAvg: "$1,720", difference: "+7.6%", status: "above", suggestion: "Ask for $130/month reduction to match market rate" },
                { label: "Security Deposit", yourValue: "$1,850", marketAvg: "$1,720", difference: "Market standard", status: "fair", suggestion: "This is standard (1 month rent)" },
                { label: "Late Fee", yourValue: "$75", marketAvg: "$28", difference: "+168%", status: "above", suggestion: "Illegal under TX law - demand $25 maximum" },
                { label: "Pet Deposit", yourValue: "$300 + $25/mo", marketAvg: "$200 + $15/mo", difference: "+50%", status: "above", suggestion: "Negotiate to $200 + $15/month" },
                { label: "Lease Length", yourValue: "12 months", marketAvg: "12 months", difference: "Market standard", status: "fair", suggestion: null }
            ]
        },
        summary: [
            "Rent: $1,850/month (due on 1st of month)",
            "Security deposit: $1,850 (refundable within 30 days)",
            "Lease term: 12 months (March 1, 2026 - Feb 28, 2027)",
            "Property: 2BR/1BA, 850 sq ft",
            "Utilities: Tenant pays electric, water, gas"
        ],
        risks: [
            {
                severity: "high",
                title: "Late fee exceeds legal maximum",
                description: "$75 late fee charged after 3-day grace period",
                standard: "Texas law caps late fees at the greater of $25 or 5% of monthly rent ($92.50 max for this lease)",
                savings: "$75 per incident",
                legalCode: "Texas Property Code §92.019",
                script: "Hi [Landlord Name],\n\nI noticed the lease lists a $75 late fee in Section 4.2. According to Texas Property Code §92.019, late fees are capped at the greater of $25 or 5% of monthly rent.\n\nFor a $1,850/month lease, the legal maximum is $92.50, but I'd like to propose the standard $25 flat fee, which is common in the Austin market.\n\nCould we update Section 4.2 to reflect this? Happy to sign an addendum.\n\nThanks,\n[Your Name]"
            },
            {
                severity: "high",
                title: "Illegal entry notice provision",
                description: "Landlord may enter with only 12 hours notice",
                standard: "Texas requires minimum 24-hour notice for non-emergency entry",
                savings: "Protection of privacy rights",
                legalCode: "Texas Property Code §92.0081",
                script: "Hi [Landlord Name],\n\nI see Section 8.1 allows entry with 12-hour notice. Texas Property Code §92.0081 requires at least 24 hours notice for non-emergency situations.\n\nCould we update this section to comply with state law? This protects both our interests.\n\nBest,\n[Your Name]"
            }
        ],
        totalSavings: "$111+ annually, plus legal protections"
    },
    // Add other sample types if needed (freelance, jobOffer) - omitted for brevity but logic is same
};


export default function ContractScanner() {
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'risks'>('overview');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        await processFile(selectedFile);
    };

    const processFile = async (file: File) => {
        setStatus('scanning');
        setError(null);
        setResult(null);

        try {
            const text = await extractTextFromFile(file);
            await analyzeContract(text, 'lease'); // Default to lease for now, can add selector
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
        }
    };

    const analyzeContract = async (text: string, type: string) => {
        setStatus('analyzing');
        try {
            const res = await fetch('/api/analyze-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contractText: text, contractType: type }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Analysis failed');
            }

            const data = await res.json();
            setResult(data);
            setStatus('complete');
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
        }
    };

    const loadSample = (type: string) => {
        setFile(null);
        // Simulate loading delay
        setStatus('analyzing');
        setTimeout(() => {
            // @ts-ignore
            setResult(SAMPLE_CONTRACTS[type]);
            setStatus('complete');
        }, 1500);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
                    >
                        <div
                            className="w-full max-w-2xl border-3 border-dashed border-[var(--border)] rounded-3xl bg-[var(--card)] p-12 text-center cursor-pointer hover:border-[var(--accent)] hover:bg-blue-50/10 transition-all group"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file) {
                                    setFile(file);
                                    processFile(file);
                                }
                            }}
                        >
                            <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10 text-[var(--accent)]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Drop your contract here</h3>
                            <p className="text-[var(--text-secondary)] mb-6">Supports PDF, DOCX, TXT</p>
                            <button className="px-8 py-3 bg-[var(--primary)] text-white rounded-full font-semibold hover:bg-blue-900 transition-colors">
                                Select File
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx,.txt"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="text-center">
                            <p className="text-[var(--text-secondary)] mb-4">Or try a sample contract:</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => loadSample('lease')}
                                    className="px-6 py-3 bg-white border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-lg transition-all flex items-center gap-3"
                                >
                                    <span className="text-2xl">🏠</span>
                                    <div className="text-left">
                                        <div className="font-bold">Lease Agreement</div>
                                        <div className="text-xs text-[var(--text-secondary)]">Residential Draft</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {(status === 'scanning' || status === 'analyzing') && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                    >
                        <div className="w-24 h-24 mb-8 relative">
                            <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[var(--accent)] rounded-full border-t-transparent animate-spin"></div>
                            <Search className="absolute inset-0 m-auto w-10 h-10 text-[var(--accent)] animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">
                            {status === 'scanning' ? 'Reading Document...' : 'Analyzing Legal Terms...'}
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-md">
                            Gemini is reviewing every clause, extracting financial terms, and identifying potential risks.
                        </p>
                    </motion.div>
                )}

                {status === 'complete' && result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-12">
                            <button
                                onClick={() => setStatus('idle')}
                                className="text-[var(--text-secondary)] hover:text-[var(--primary)] flex items-center gap-2 group transition-colors"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Scan Another Contract
                            </button>
                            <div className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2 border border-green-200 shadow-sm">
                                <CheckCircle className="w-4 h-4" /> Analyzed by Gemini 1.5
                            </div>
                        </div>

                        {/* Dashboard Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Col: Score & Summary */}
                            <div className="space-y-8">
                                <div className="glass p-8 rounded-3xl shadow-lg text-center relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)] to-[var(--success)]"></div>
                                    <h3 className="text-lg font-semibold mb-6 text-[var(--text-secondary)] uppercase tracking-wider">Overall Risk Score</h3>
                                    <RiskScoreGauge score={result.riskScore.overall} grade={result.riskScore.grade} />

                                    <div className="mt-8 space-y-4">
                                        {result.riskScore.breakdown.map((item, i) => (
                                            <div key={i} className="text-left">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium text-[var(--text-primary)]">{item.category}</span>
                                                    <span className={`font-bold ${item.grade === 'A' || item.grade === 'B' ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>{item.grade}</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${item.grade === 'A' || item.grade === 'B' ? 'bg-[var(--success)]' :
                                                                item.grade === 'F' ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]'
                                                            }`}
                                                        style={{ width: `${item.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass p-8 rounded-3xl shadow-lg">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--primary)]">
                                        <FileText className="w-5 h-5 text-[var(--accent)]" /> Lease Summary
                                    </h3>
                                    <ul className="space-y-4">
                                        {result.summary.map((item, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                                                <span className="text-[var(--accent)] mt-1">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right Col: Tabs */}
                            <div className="lg:col-span-2">
                                <div className="flex gap-8 border-b border-[var(--border)] mb-8">
                                    {['overview', 'comparison', 'risks'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`pb-4 text-lg font-medium capitalize transition-all relative ${activeTab === tab ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
                                                }`}
                                        >
                                            {tab}
                                            {activeTab === tab && (
                                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--accent)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="min-h-[400px]">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'overview' && (
                                            <motion.div
                                                key="overview"
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                            >
                                                {result.risks.slice(0, 4).map((risk, i) => (
                                                    <div key={i} className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md ${risk.severity === 'high' ? 'border-red-100 bg-red-50/30' :
                                                            risk.severity === 'medium' ? 'border-orange-100 bg-orange-50/30' : 'border-blue-100 bg-blue-50/30'
                                                        }`}>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle className={`w-5 h-5 ${risk.severity === 'high' ? 'text-[var(--danger)]' :
                                                                        risk.severity === 'medium' ? 'text-[var(--warning)]' : 'text-[var(--accent)]'
                                                                    }`} />
                                                                <span className={`text-xs font-bold uppercase tracking-wider ${risk.severity === 'high' ? 'text-[var(--danger)]' :
                                                                        risk.severity === 'medium' ? 'text-[var(--warning)]' : 'text-[var(--accent)]'
                                                                    }`}>{risk.severity} Risk</span>
                                                            </div>
                                                        </div>
                                                        <h4 className="text-xl font-bold mb-2 text-[var(--primary)]">{risk.title}</h4>
                                                        <p className="text-[var(--text-secondary)] mb-4 text-sm leading-relaxed">{risk.description}</p>
                                                        {risk.savings && (
                                                            <div className="inline-block px-3 py-1 bg-white rounded-lg text-sm font-semibold shadow-sm text-green-600 border border-green-100">
                                                                💰 Potential Savings: {risk.savings}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {activeTab === 'comparison' && (
                                            <motion.div
                                                key="comparison"
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                className="glass rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm"
                                            >
                                                <table className="w-full">
                                                    <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
                                                        <tr>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Metric</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Your Contract</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Market Avg</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[var(--border)]">
                                                        {result.comparison.metrics.map((metric, i) => (
                                                            <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                                                <td className="px-6 py-4 font-medium text-[var(--primary)]">{metric.label}</td>
                                                                <td className="px-6 py-4 font-mono text-sm font-bold">{metric.yourValue}</td>
                                                                <td className="px-6 py-4 text-[var(--text-secondary)] text-sm">{metric.marketAvg}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase inline-flex items-center gap-1 ${metric.status === 'fair' ? 'bg-green-100 text-green-700' :
                                                                            metric.status === 'above' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                                        }`}>
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${metric.status === 'fair' ? 'bg-green-500' :
                                                                                metric.status === 'above' ? 'bg-orange-500' : 'bg-blue-500'
                                                                            }`} />
                                                                        {metric.status}
                                                                    </span>
                                                                    {metric.suggestion && (
                                                                        <div className="text-xs text-[var(--text-secondary)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            💡 {metric.suggestion}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </motion.div>
                                        )}

                                        {activeTab === 'risks' && (
                                            <motion.div
                                                key="risks"
                                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                {result.risks.map((risk, i) => (
                                                    <div key={i} className="glass p-6 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <div className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${risk.severity === 'high' ? 'text-[var(--danger)]' :
                                                                        risk.severity === 'medium' ? 'text-[var(--warning)]' : 'text-[var(--accent)]'
                                                                    }`}>
                                                                    <AlertTriangle className="w-3 h-3" /> {risk.severity} Risk
                                                                </div>
                                                                <h3 className="text-xl font-bold text-[var(--primary)]">{risk.title}</h3>
                                                            </div>
                                                            {risk.legalCode && (
                                                                <div className="flex items-center gap-1 text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">
                                                                    <Shield className="w-3 h-3" /> {risk.legalCode}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="grid md:grid-cols-2 gap-8 mb-6">
                                                            <div>
                                                                <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Issue</div>
                                                                <p className="font-medium text-sm leading-relaxed">{risk.description}</p>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Standard / Legal</div>
                                                                <p className="font-medium text-sm leading-relaxed">{risk.standard}</p>
                                                            </div>
                                                        </div>
                                                        {risk.script && (
                                                            <div className="bg-[var(--bg)] p-5 rounded-xl text-sm border border-[var(--border)] relative group">
                                                                <div className="absolute -top-3 left-4 bg-[var(--card)] px-2 text-xs font-bold text-[var(--text-secondary)] border border-[var(--border)] rounded shadow-sm">
                                                                    NEGOTIATION SCRIPT
                                                                </div>
                                                                <button
                                                                    className="absolute top-2 right-2 text-xs bg-[var(--card)] border border-[var(--border)] px-2 py-1 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                                                    onClick={() => navigator.clipboard.writeText(risk.script!)}
                                                                >
                                                                    Copy Email
                                                                </button>
                                                                <pre className="whitespace-pre-wrap font-mono text-[var(--text-primary)] opacity-80">{risk.script}</pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
