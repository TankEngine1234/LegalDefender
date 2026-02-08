import EvidenceAnalyzer from '@/components/eviction-defense/EvidenceAnalyzer';

export default function EvictionDefensePage() {
    return (
        <div className="min-h-screen py-12 px-4 md:px-6">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-wider mb-2">
                        Emergency Tool
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Multimodal Eviction Defense
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Don't just document damage—diagnose it. Our AI Forensic Investigator analyzes photos, identifies violations (e.g. Mold, Structural), and cites the exact law.
                    </p>
                </div>

                <div className="glass-card p-1 md:p-8">
                    <EvidenceAnalyzer />
                </div>
            </div>
        </div>
    );
}
