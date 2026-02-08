import EvidenceLocker from '@/components/evidence-locker/EvidenceLocker';

export default function EvidenceLockerPage() {
    return (
        <div className="min-h-screen py-12 px-4 md:px-6">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2">
                        Blockchain Verified
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Immutable Evidence Locker
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Secure your evidence on the Solana blockchain. Generate a cryptographic hash to prove file existence and integrity for court.
                    </p>
                </div>

                <div className="glass-card p-1 md:p-8">
                    <EvidenceLocker />
                </div>
            </div>
        </div>
    );
}
