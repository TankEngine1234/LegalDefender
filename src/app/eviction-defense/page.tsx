import EvidenceAnalyzer from '@/components/eviction-defense/EvidenceAnalyzer';

export default function EvictionDefensePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="py-12 bg-slate-900 text-white text-center pb-24">
                <h1 className="text-4xl font-bold mb-4 tracking-tight">Multimodal Eviction Defense</h1>
                <p className="opacity-80 max-w-2xl mx-auto px-4 font-light text-lg">
                    Don't just document damage—diagnose it. Our AI Forensic Investigator analyzes photos, identifies violations (e.g. Mold, Structural), and cites the exact law to protect you.
                </p>
            </div>
            <div className="-mt-16 px-4 pb-12">
                <EvidenceAnalyzer />
            </div>
        </div>
    );
}
