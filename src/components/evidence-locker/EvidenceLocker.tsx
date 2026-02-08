"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Upload, FileText, CheckCircle, ExternalLink, Shield, Loader, Key, AlertTriangle, Scale } from 'lucide-react';
import { Connection, PublicKey, Transaction, Keypair, sendAndConfirmTransaction, TransactionInstruction } from '@solana/web3.js';

// --- Types ---
type LockerStep = 'upload' | 'hashing' | 'securing' | 'complete' | 'error';

interface SecuredRecord {
    fileName: string;
    fileHash: string;
    timestamp: string;
    signature: string;
    explorerUrl: string;
}

export default function EvidenceLocker() {
    const [step, setStep] = useState<LockerStep>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [record, setRecord] = useState<SecuredRecord | null>(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [error, setError] = useState<string | null>(null);

    const calculateHash = async (file: File): Promise<string> => {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const secureOnChain = async () => {
        if (!file) return;

        setError(null);
        try {
            setStep('hashing');
            setStatusMsg('Generating SHA-256 Cryptographic Hash...');

            const hash = await calculateHash(file);

            setStep('securing');
            setStatusMsg('Connecting to Solana Devnet...');

            // 1. Setup connection and generated wallet (Burner for demo)
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
            const burner = Keypair.generate();

            setStatusMsg('Requesting Airdrop for Transaction Fees...');
            const airdropRes = await fetch('/api/request-airdrop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicKey: burner.publicKey.toBase58() }),
            });
            const airdropData = await airdropRes.json();
            if (!airdropRes.ok) {
                const msg = airdropData?.error || 'Airdrop failed';
                throw new Error(
                    airdropData?.code === 'RATE_LIMITED'
                        ? 'Airdrop limit reached (many providers allow 1 SOL/day). Limit resets daily—try again tomorrow.'
                        : `Airdrop failed: ${msg}`
                );
            }

            setStatusMsg('Minting "Proof of Condition" Transaction...');

            // 2. Create Transaction with Memo
            // Memo Program ID: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb
            const memoProgramId = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb");

            const memoData = new TextEncoder().encode(`LegalDefender Proof: ${hash} | File: ${file.name}`);
            const instruction = new TransactionInstruction({
                keys: [],
                programId: memoProgramId,
                data: memoData,
            });

            const transaction = new Transaction().add(instruction);

            // Send transaction
            const signature = await sendAndConfirmTransaction(connection, transaction, [burner]);

            const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

            setRecord({
                fileName: file.name,
                fileHash: hash,
                timestamp: new Date().toLocaleString(),
                signature: signature,
                explorerUrl: explorerUrl,
            });

            setStep('complete');

        } catch (err: any) {
            console.error(err);
            const msg = err?.message || "";
            let userMsg = "Blockchain transaction failed. ";
            if (
                msg.includes("insufficient") ||
                msg.includes("429") ||
                msg.includes("airdrop") ||
                msg.includes("rate limit") ||
                msg.includes("no record of a prior credit") ||
                msg.includes("Attempt to debit")
            ) {
                userMsg += "The funding airdrop failed (Devnet is rate-limited). Please wait a few minutes and try again.";
            } else if (msg.includes("blockhash") || msg.includes("expired")) {
                userMsg += "Transaction timed out. Please try again.";
            } else {
                userMsg += msg || "Devnet may be congested.";
            }
            setError(userMsg);
            setStep('error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <AnimatePresence mode="wait">
                {step === 'upload' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="glass p-12 rounded-3xl shadow-sm hover:shadow-md transition-shadow text-center"
                    >
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Lock className="w-12 h-12 text-[var(--success)]" />
                        </div>
                        <h2 className="text-4xl font-serif font-bold mb-6 text-[var(--primary)]">Secure Evidence Locker</h2>
                        <p className="text-[var(--text-secondary)] mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                            Upload photos, videos, or documents. We'll generate a unique cryptographic hash and store it on the Solana blockchain, effectively notarizing your evidence forever.
                        </p>

                        <div className="max-w-xl mx-auto border-3 border-dashed border-[var(--border)] rounded-3xl p-10 hover:border-[var(--success)] hover:bg-green-50/10 transition-all cursor-pointer relative group">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleFileChange}
                            />
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-[var(--success)]" />
                            </div>
                            <p className="font-medium text-xl mb-2 text-[var(--primary)]">
                                {file ? file.name : "Drop file here or click to upload"}
                            </p>
                            {file ? (
                                <p className="text-sm text-[var(--success)] mt-2 font-mono flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> {(file.size / 1024 / 1024).toFixed(2)} MB Ready
                                </p>
                            ) : (
                                <p className="text-[var(--text-secondary)]">Supports Images, Videos, PDFs</p>
                            )}
                        </div>

                        <button
                            onClick={secureOnChain}
                            disabled={!file}
                            className="mt-10 px-12 py-5 bg-[var(--success)] text-white rounded-2xl font-bold text-xl hover:bg-[#2ecc71] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_-10px_rgba(46,204,113,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(46,204,113,0.6)] hover:-translate-y-1"
                        >
                            Secure on Blockchain
                        </button>
                        {error && (
                            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 animate-fade-in">
                                <AlertTriangle className="w-5 h-5" />
                                {error}
                            </div>
                        )}
                    </motion.div>
                )}

                {(step === 'hashing' || step === 'securing') && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                    >
                        <div className="w-32 h-32 mb-8 relative">
                            <div className="absolute inset-0 border-8 border-[var(--border)] rounded-full opacity-30"></div>
                            <div className="absolute inset-0 border-8 border-[var(--success)] rounded-full border-t-transparent animate-spin"></div>
                            <Shield className="absolute inset-0 m-auto w-12 h-12 text-[var(--success)] animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 text-[var(--primary)]">{step === 'hashing' ? 'Hashing Evidence...' : 'Minting Proof...'}</h2>
                        <div className="space-y-2">
                            <p className="text-[var(--text-secondary)] font-mono animate-pulse">{statusMsg}</p>
                            <p className="text-sm text-[var(--text-secondary)] opacity-60">This may take a few seconds on Devnet.</p>
                        </div>
                    </motion.div>
                )}

                {step === 'complete' && record && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] overflow-hidden border border-[var(--border)] shadow-2xl max-w-3xl mx-auto relative"
                    >
                        {/* Certificate Border Effect */}
                        <div className="absolute inset-2 border-2 border-[#d4af37]/20 rounded-[1.5rem] pointer-events-none z-20"></div>

                        {/* Certificate Header */}
                        <div className="bg-[#1a1f36] text-[#d4af37] p-10 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                            <Shield className="w-20 h-20 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                            <h2 className="text-5xl font-serif font-bold tracking-wider mb-2 text-transparent bg-clip-text bg-gradient-to-b from-[#fadd7e] to-[#d4af37]">CERTIFICATE OF AUTHENTICITY</h2>
                            <p className="text-sm tracking-[0.3em] opacity-80 uppercase mt-4 font-bold">LegalDefender Digital Notary</p>
                        </div>

                        {/* Certificate Body */}
                        <div className="p-12 space-y-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-white relative">
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                                <Scale className="w-96 h-96" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-10 relative z-10">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">Evidence File</div>
                                    <div className="font-serif text-2xl text-[var(--primary)] flex items-center gap-3 border-b border-gray-100 pb-2">
                                        <FileText className="w-6 h-6 text-[var(--text-secondary)]" /> {record.fileName}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-bold">Timestamp</div>
                                    <div className="font-mono text-lg text-[var(--primary)] border-b border-gray-100 pb-2">{record.timestamp}</div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3 font-bold">Cryptographic Hash (SHA-256)</div>
                                <div className="bg-gray-50 p-6 rounded-xl font-mono text-sm break-all border border-gray-200 text-gray-700 shadow-inner">
                                    {record.fileHash}
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3 font-bold flex items-center gap-2">
                                    <Key className="w-4 h-4" /> Blockchain Signature (Solana)
                                </div>
                                <a
                                    href={record.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-blue-50/50 hover:bg-blue-50 p-6 rounded-xl border border-blue-100 transition-all group hover:shadow-md"
                                >
                                    <div className="font-mono text-xs break-all text-blue-900 mb-3 truncate opacity-70">
                                        {record.signature}
                                    </div>
                                    <div className="flex items-center text-blue-700 font-bold text-sm">
                                        View Verified Transaction <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 p-8 flex justify-between items-center border-t border-[var(--border)] relative z-10">
                            <div className="flex items-center gap-2 text-green-700 font-bold text-sm bg-green-50 px-4 py-2 rounded-full border border-green-100">
                                <CheckCircle className="w-5 h-5" /> Immutably Verified
                            </div>
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setRecord(null);
                                    setStep('upload');
                                    setError(null);
                                }}
                                className="text-[var(--text-secondary)] text-sm hover:text-[var(--primary)] font-medium transition-colors hover:underline underline-offset-4"
                            >
                                Secure Another File
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
