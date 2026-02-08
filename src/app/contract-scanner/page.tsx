import ContractScanner from '@/components/contract-scanner/ContractScanner';

export default function ContractScannerPage() {
    return (
        <div className="min-h-screen py-12 px-4 md:px-6">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-600 font-bold text-xs uppercase tracking-wider mb-2">
                        AI Lease Analysis
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Contract Scanner
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Upload your lease. Our AI Forensic Investigator highlights hidden fees, illegal clauses, and predatory terms instantly.
                    </p>
                </div>

                <div className="glass-card p-1 md:p-8">
                    <ContractScanner />
                </div>
            </div>
        </div>
    );
}
