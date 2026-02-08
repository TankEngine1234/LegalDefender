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
        <div className="w-full max-w-5xl mx-auto p-6">
            <AnimatePresence mode="wait">
                {step === 'upload' && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* Evidence Upload Section */}
                        <div className="bg-white border border-slate-200 p-10 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-rose-50 rounded-xl">
                                    <Camera className="w-6 h-6 text-rose-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    1. Upload Evidence
                                </h2>
                            </div>

                            <div
                                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-slate-800 hover:bg-slate-50 transition-all group relative"
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
                                <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-slate-600" />
                                </div>
                                <p className="font-semibold text-lg mb-1 text-slate-900">Upload Photos or Videos</p>
                                <p className="text-slate-500 text-sm">Document the damage or issue clearly</p>
                            </div>

                            <AnimatePresence>
                                {evidenceFiles.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
                                    >
                                        {evidenceFiles.map((file, i) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                key={i}
                                                className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200 group"
                                            >
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
                                                    className="absolute top-2 right-2 bg-white/90 text-slate-700 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm backdrop-blur-sm"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Lease & Context Section */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        2. Lease Agreement (Optional)
                                    </h2>
                                </div>
                                <div
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-all"
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
                                        <div className="flex flex-col items-center justify-center gap-2 text-emerald-600 font-medium">
                                            <CheckCircle className="w-6 h-6 mb-1" />
                                            <span className="truncate max-w-full px-4 text-sm">{leaseFile.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 font-medium text-sm">Select PDF or Text File</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <TestTube className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        3. Context
                                    </h2>
                                </div>
                                <textarea
                                    className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 resize-none focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-sm"
                                    placeholder="Describe the issue (e.g. 'Mold started appearing after the pipe burst last week...')"
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 border border-rose-100"
                            >
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={analyzeEvidence}
                                disabled={evidenceFiles.length === 0}
                                className="px-8 py-4 bg-violet-600 text-white rounded-xl font-bold text-lg hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Start Forensic Investigation
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'analyzing' && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[50vh] text-center"
                    >
                        <div className="w-32 h-32 mb-8 relative">
                            {/* High-tech scanning animation */}
                            <div className="absolute inset-0 border border-slate-200 rounded-full opacity-20 animate-ping"></div>
                            <div className="absolute inset-4 border border-slate-300 rounded-full opacity-40 animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            <div className="absolute inset-0 border-2 border-t-slate-900 border-r-slate-900 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-2 border-2 border-b-rose-500 border-l-rose-500 border-t-transparent border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            <TestTube className="absolute inset-0 m-auto w-10 h-10 text-slate-800" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">Processing Evidence</h2>
                        <div className="max-w-md mx-auto space-y-3">
                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                                Diagnosing biological & structural factors...
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-sm opacity-80" style={{ animationDelay: '0.5s' }}>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                Cross-referencing Texas Property Code...
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'report' && report && (
                    <motion.div
                        key="report"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Forensic Analysis Report</h2>
                            <button
                                onClick={() => setStep('upload')}
                                className="text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors text-sm font-medium"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" /> Start New Case
                            </button>
                        </div>

                        {/* 1. Diagnosis Card */}
                        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
                            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <TestTube className="w-64 h-64 transform rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${report.diagnosis.severity === 'Emergency' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-orange-500/20 border-orange-500 text-orange-300'}`}>
                                            {report.diagnosis.severity} Priority
                                        </div>
                                        <div className="text-slate-500 text-xs font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                                    </div>
                                    <h3 className="text-4xl font-bold mb-2 text-white">{report.diagnosis.issue}</h3>
                                    <p className="font-mono text-emerald-400 text-sm border-l-2 border-emerald-500/50 pl-3">{report.diagnosis.scientificName}</p>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50/50">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Visual Diagnosis</div>
                                <p className="text-slate-700 text-lg leading-relaxed">{report.diagnosis.description}</p>
                            </div>
                        </div>

                        {/* 2. Legal Analysis */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                                    <Gavel className="w-5 h-5 text-slate-500" /> Legal Analysis
                                </h3>
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Citation</div>
                                        <div className="font-mono text-blue-700 text-sm font-semibold">{report.legalAnalysis.code}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Requirement</div>
                                        <p className="text-slate-700 text-sm font-medium">{report.legalAnalysis.requirement}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-2 h-2 rounded-full ${report.legalAnalysis.violation.includes('Yes') ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Violation Status</div>
                                        </div>
                                        <p className="text-slate-600 text-sm">{report.legalAnalysis.explanation}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                                    <FileText className="w-5 h-5 text-slate-500" /> Lease Cross-Reference
                                </h3>
                                {leaseFile || leaseText ? (
                                    <div className="space-y-6">
                                        <div className="relative">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 rounded-full"></div>
                                            <div className="pl-4">
                                                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Relevant Clause</div>
                                                <p className="text-slate-600 italic text-sm">"{report.leaseCrossReference.relevantClause}"</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                            <div className="text-xs text-orange-800/60 uppercase tracking-wider font-bold mb-1">Conflict Analysis</div>
                                            <p className="text-orange-900 text-sm font-medium">{report.leaseCrossReference.conflict}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl">
                                        <FileText className="w-8 h-8 mb-2" />
                                        <p className="text-sm">No lease provided</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Action Plan */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-700">
                                <CheckCircle className="w-5 h-5" /> Recommended Action Plan
                            </h3>

                            <div className="mb-8">
                                <ul className="space-y-4">
                                    {report.actionPlan.steps.map((step, i) => (
                                        <li key={i} className="flex gap-4 items-center group">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                                                {i + 1}
                                            </div>
                                            <p className="text-slate-700 font-medium">{step}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                        <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Draft Notice to Landlord</h4>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(report.actionPlan.letterDraft)}
                                        className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-600"
                                    >
                                        Copy Text
                                    </button>
                                </div>
                                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
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
