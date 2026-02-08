import ContractScanner from '@/components/contract-scanner/ContractScanner';

export default function ContractScannerPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="py-12 bg-slate-900 text-white text-center pb-24">
                <h1 className="text-4xl font-bold mb-4 tracking-tight">Contract Scanner</h1>
                <p className="opacity-80 max-w-2xl mx-auto px-4 font-light text-lg">
                    Upload your lease or contract. Our AI Forensic Investigator will extract financial terms, compare them to market averages, and flag legal risks instantly.
                </p>
            </div>
            <div className="-mt-16 px-4 pb-12">
                <ContractScanner />
            </div>
        </div>
    );
}
