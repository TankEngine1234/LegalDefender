import EvidenceAnalyzer from '@/components/eviction-defense/EvidenceAnalyzer';

export default function EvictionDefensePage() {
    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <div className="py-12 bg-gradient-to-b from-[var(--danger)]/90 to-[var(--bg)] text-white text-center pb-24">
                <h1 className="text-4xl font-serif font-bold mb-4">Multimodal Eviction Defense</h1>
                <p className="opacity-90 max-w-2xl mx-auto px-4 text-lg">
                    Don't just document damage—diagnose it. Our AI Forensic Investigator analyzes photos, identifies violations (e.g. Mold, Structural), and cites the exact law to protect you.
                </p>
            </div>
            <div className="-mt-16 px-4 pb-12">
                <EvidenceAnalyzer />
            </div>
        </div>
    );
}
