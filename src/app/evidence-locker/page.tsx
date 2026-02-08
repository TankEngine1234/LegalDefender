import EvidenceLocker from '@/components/evidence-locker/EvidenceLocker';

export default function EvidenceLockerPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="py-12 bg-slate-900 text-white text-center pb-24">
                <h1 className="text-4xl font-bold mb-4 tracking-tight">Immutable Evidence Locker</h1>
                <p className="opacity-80 max-w-2xl mx-auto px-4 font-light text-lg">
                    Courts require proof that evidence hasn't been tampered with. We generate a cryptographic hash of your files and store it on the Solana blockchain as irrefutable proof of existence.
                </p>
            </div>
            <div className="-mt-16 px-4 pb-12">
                <EvidenceLocker />
            </div>
        </div>
    );
}
