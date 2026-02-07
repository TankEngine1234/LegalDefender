import ContractScanner from '@/components/contract-scanner/ContractScanner';

export default function ContractScannerPage() {
    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <div className="py-12 bg-gradient-to-b from-[var(--primary)] to-[var(--bg)] text-white text-center pb-24">
                <h1 className="text-4xl font-serif font-bold mb-4">Contract Scanner</h1>
                <p className="opacity-80 max-w-2xl mx-auto px-4">
                    Upload your lease or contract. Our AI Forensic Investigator will extract financial terms, compare them to market averages, and flag legal risks instantly.
                </p>
            </div>
            <div className="-mt-16 px-4 pb-12">
                <ContractScanner />
            </div>
        </div>
    );
}
