"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, TestTube, FileText, CheckCircle, AlertTriangle, Gavel, ArrowRight, X } from 'lucide-react';
import { extractTextFromFile } from '@/lib/file-processing';

interface DefenseReport {
    diagnosis: {
        issue: string;
        scientificName: string;
        severity: string;
        description: string;
    };
    legalAnalysis: {
        code: string;
        requirement: string;
        violation: string;
        explanation: string;
    };
    leaseCrossReference: {
        relevantClause: string;
        conflict: string;
    };
    actionPlan: {
        steps: string[];
        letterDraft: string;
    };
}

export default function EvidenceAnalyzer() {
    const [step, setStep] = useState<'upload' | 'analyzing' | 'report'>('upload');
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [leaseFile, setLeaseFile] = useState<File | null>(null);
    const [leaseText, setLeaseText] = useState<string>('');
    const [context, setContext] = useState('');
    const [report, setReport] = useState<DefenseReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    const evidenceInputRef = useRef<HTMLInputElement>(null);
    const leaseInputRef = useRef<HTMLInputElement>(null);

    const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setEvidenceFiles(Array.from(e.target.files));
        }
    };

    const handleLeaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLeaseFile(file);
            try {
                const text = await extractTextFromFile(file);
                setLeaseText(text);
            } catch (err: any) {
                console.error("Lease text extraction failed:", err);
                // Fallback: we still set the file, but maybe warn user or let server try (server route only handles text for now based on implementation)
                // Actually, my server implementation expects 'leaseText' string. So I must extract it client side.
                setError("Failed to read lease file. Please try pasting the text or using a simpler PDF.");
            }
        }
    };

    const analyzeEvidence = async () => {
        if (evidenceFiles.length === 0) {
            setError("Please upload at least one photo or video of the damage.");
            return;
        }

        setStep('analyzing');
        setError(null);

        const formData = new FormData();
        evidenceFiles.forEach((file) => formData.append('evidence', file));
        if (leaseText) formData.append('leaseText', leaseText);
        formData.append('context', context);

        try {
            const res = await fetch('/api/analyze-evidence', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Analysis failed");
            }

            const data = await res.json();
            setReport(data);
            setStep('report');
        } catch (err: any) {
            setError(err.message);
            setStep('upload');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <AnimatePresence mode="wait">
                {step === 'upload' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Evidence Upload Section */}
                        <div className="glass p-12 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[var(--primary)]">
                                <Camera className="w-7 h-7 text-[var(--danger)]" />
                                1. Upload Evidence
                            </h2>

                            <div
                                className="border-3 border-dashed border-[var(--border)] rounded-2xl p-12 text-center cursor-pointer hover:border-[var(--danger)] hover:bg-red-50/10 transition-all group"
                                onClick={() => evidenceInputRef.current?.click()}
                            >
                                <input
                                    ref={evidenceInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleEvidenceUpload}
                                />
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Upload className="w-10 h-10 text-[var(--danger)]" />
                                </div>
                                <p className="font-medium text-xl mb-2 text-[var(--primary)]">Click to upload photos or videos</p>
                                <p className="text-[var(--text-secondary)]">JPG, PNG, MP4 supported</p>
                            </div>

                            {evidenceFiles.length > 0 && (
                                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {evidenceFiles.map((file, i) => (
                                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-[var(--border)] group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEvidenceFiles(evidenceFiles.filter((_, idx) => idx !== i));
                                                }}
                                                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-[var(--danger)] transition-colors backdrop-blur-sm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lease & Context Section */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="glass p-8 rounded-3xl shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--primary)]">
                                    <FileText className="w-5 h-5 text-[var(--accent)]" />
                                    2. Lease Agreement (Optional)
                                </h2>
                                <p className="text-[var(--text-secondary)] text-sm mb-6">
                                    Upload your lease to cross-reference terms.
                                </p>
                                <div
                                    className="border-2 border-dashed border-[var(--border)] rounded-2xl p-6 text-center cursor-pointer hover:border-[var(--accent)] transition-all bg-[var(--bg)]"
                                    onClick={() => leaseInputRef.current?.click()}
                                >
                                    <input
                                        ref={leaseInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.txt"
                                        className="hidden"
                                        onChange={handleLeaseUpload}
                                    />
                                    {leaseFile ? (
                                        <div className="flex flex-col items-center justify-center gap-2 text-[var(--success)] font-medium">
                                            <CheckCircle className="w-8 h-8 mb-1" />
                                            <span className="truncate max-w-full px-4">{leaseFile.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[var(--accent)] font-medium">Select File</span>
                                    )}
                                </div>
                            </div>

                            <div className="glass p-8 rounded-3xl shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--primary)]">
                                    <TestTube className="w-5 h-5 text-[var(--warning)]" />
                                    3. Context
                                </h2>
                                <textarea
                                    className="w-full h-32 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] resize-none focus:outline-none focus:border-[var(--accent)] transition-colors"
                                    placeholder="Describe the issue (e.g. 'Mold started appearing after the pipe burst last week...')"
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-100 animate-fade-in">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={analyzeEvidence}
                            disabled={evidenceFiles.length === 0}
                            className="w-full py-5 bg-[var(--danger)] text-white rounded-2xl font-bold text-xl hover:bg-[#E02E5C] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_-10px_rgba(255,51,102,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(255,51,102,0.6)] hover:-translate-y-1"
                        >
                            Start Forensic Investigation
                        </button>
                    </motion.div>
                )}

                {step === 'analyzing' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                    >
                        <div className="w-32 h-32 mb-8 relative">
                            <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full opacity-30"></div>
                            <div className="absolute inset-0 border-8 border-[var(--danger)] rounded-full border-t-transparent animate-spin"></div>
                            <TestTube className="absolute inset-0 m-auto w-12 h-12 text-[var(--danger)] animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 text-[var(--primary)]">Analyzing Evidence...</h2>
                        <div className="max-w-md mx-auto space-y-2">
                            <p className="text-[var(--text-secondary)] animate-pulse">Diagnosing biological & structural damage...</p>
                            <p className="text-[var(--text-secondary)] animate-pulse" style={{ animationDelay: '1s' }}>Cross-referencing Texas Property Code...</p>
                            <p className="text-[var(--text-secondary)] animate-pulse" style={{ animationDelay: '2s' }}>Drafting legal notice...</p>
                        </div>
                    </motion.div>
                )}

                {step === 'report' && report && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-3xl font-serif font-bold text-[var(--primary)]">Forensic Report</h2>
                            <button
                                onClick={() => setStep('upload')}
                                className="text-[var(--text-secondary)] hover:text-[var(--primary)] flex items-center gap-2 transition-colors"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" /> Start New Case
                            </button>
                        </div>

                        {/* 1. Diagnosis Card */}
                        <div className="bg-white rounded-3xl overflow-hidden border border-[var(--border)] shadow-xl">
                            <div className="bg-[#1a1f36] p-10 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <TestTube className="w-40 h-40 transform rotate-12" />
                                </div>
                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${report.diagnosis.severity === 'Emergency' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                                        }`}>
                                        {report.diagnosis.severity} Severity
                                    </span>
                                    <span className="text-gray-400 text-sm font-mono">CASE ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                </div>
                                <h3 className="text-4xl font-bold mb-2 relative z-10">{report.diagnosis.issue}</h3>
                                <p className="font-mono text-[var(--accent)] text-lg italic relative z-10">{report.diagnosis.scientificName}</p>
                            </div>
                            <div className="p-10">
                                <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Visual Analysis</div>
                                <p className="text-[var(--text-primary)] text-lg leading-relaxed">{report.diagnosis.description}</p>
                            </div>
                        </div>

                        {/* 2. Legal Analysis */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--primary)]">
                                    <Gavel className="w-6 h-6" /> Legal Analysis
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-1">Code Citation</div>
                                        <div className="font-mono bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">{report.legalAnalysis.code}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-1">Requirement</div>
                                        <p className="font-medium">{report.legalAnalysis.requirement}</p>
                                    </div>
                                    <div>
                                        <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-1">Violation Status</div>
                                        <div className={`inline-block px-3 py-1 rounded-lg font-bold ${report.legalAnalysis.violation.includes('Yes') || report.legalAnalysis.violation.includes('Likely') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {report.legalAnalysis.violation}
                                        </div>
                                        <p className="mt-2 text-sm text-[var(--text-secondary)]">{report.legalAnalysis.explanation}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--primary)]">
                                    <FileText className="w-6 h-6" /> Lease Cross-Reference
                                </h3>
                                {leaseFile || leaseText ? (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-1">Relevant Clause</div>
                                            <p className="italic text-gray-600 border-l-4 border-gray-300 pl-4 py-2">"{report.leaseCrossReference.relevantClause}"</p>
                                        </div>
                                        <div>
                                            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-1">Conflict Analysis</div>
                                            <p className="font-medium text-orange-700">{report.leaseCrossReference.conflict}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-secondary)] opacity-50">
                                        <FileText className="w-12 h-12 mb-4" />
                                        <p>No lease provided for cross-reference.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Action Plan */}
                        <div className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--success)]">
                                <CheckCircle className="w-6 h-6" /> Recommended Action Plan
                            </h3>

                            <div className="mb-8">
                                <ul className="space-y-4">
                                    {report.actionPlan.steps.map((step, i) => (
                                        <li key={i} className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold flex-shrink-0">
                                                {i + 1}
                                            </div>
                                            <p className="font-medium mt-1">{step}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-[var(--border)]">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-[var(--text-secondary)]">Draft Notice to Landlord</h4>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(report.actionPlan.letterDraft)}
                                        className="text-xs bg-white border border-[var(--border)] px-3 py-1 rounded-lg hover:bg-gray-100"
                                    >
                                        Copy to Clipboard
                                    </button>
                                </div>
                                <pre className="whitespace-pre-wrap font-mono text-sm text-[var(--text-primary)] leading-relaxed">
                                    {report.actionPlan.letterDraft}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
