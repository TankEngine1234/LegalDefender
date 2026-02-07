import EvidenceLocker from '@/components/evidence-locker/EvidenceLocker';

export default function EvidenceLockerPage() {
    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <div className="py-12 bg-gradient-to-b from-[var(--success)]/90 to-[var(--bg)] text-[var(--primary)] text-center pb-24">
                <h1 className="text-4xl font-serif font-bold mb-4 text-white">Immutable Evidence Locker</h1>
                <p className="opacity-90 max-w-2xl mx-auto px-4 text-white text-lg">
                    Courts require proof that evidence hasn't been tampered with. We generate a cryptographic hash of your files and store it on the Solana blockchain as irrefutable proof of existence.
                </p>
            </div>
            <div className="-mt-16 px-4 pb-12">
                <EvidenceLocker />
            </div>
        </div>
    );
}
