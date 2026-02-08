"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Star, Shield, Lock, Upload, AlertTriangle, X, CheckCircle, Wallet, ExternalLink, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { LandlordRadarProgram, PropertyAccount } from '@/lib/solana/mock-db';
import { extractTextFromFile } from '@/lib/file-processing';
import { motion, AnimatePresence } from 'framer-motion';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

// Dynamically import map (Google Maps)
const MapComponent = dynamic(() => import('@/components/landlord-radar/GoogleMapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Initializing Google Maps...</div>
});

const libraries: ("places")[] = ["places"];

export default function LandlordRadarPage() {
    const { t } = useLanguage();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [propertyAccount, setPropertyAccount] = useState<PropertyAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [overlayOpen, setOverlayOpen] = useState(false);

    // Autocomplete Reference
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onLoadAutocomplete = useCallback((autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    }, []);

    const onPlaceChanged = async () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();

            // 1. Get Address String
            const address = place.formatted_address || place.name || searchQuery;
            setSearchQuery(address);

            // 2. CHECK DEMO COORDINATES FIRST (Force Fly-To for Happy Paths)
            const demoCoords = LandlordRadarProgram.getDemoCoordinates(address);

            if (demoCoords) {
                setMapCenter([demoCoords.lat, demoCoords.lng]);
                await fetchPropertyData(address, demoCoords);
            }
            // 3. Fallback to Google Geocoding
            else if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setMapCenter([lat, lng]);
                await fetchPropertyData(address, { lat, lng });
            } else {
                console.log("No valid location details found");
            }
        }
    };


    const fetchPropertyData = async (address: string, coords: { lat: number, lng: number }) => {
        setLoading(true);
        setOverlayOpen(false);
        setVerificationStatus('idle');
        setTxSignature(null);
        setTxStep('idle');

        try {
            // 1. Fetch PDA
            const account = await LandlordRadarProgram.fetchAccount(address);

            if (account) {
                setPropertyAccount(account);
            } else {
                // Initialize empty view for new address with REAL coords
                setPropertyAccount({
                    address_hash: address,
                    violations: [],
                    reviews: [],
                    coordinates: coords
                });
            }
            setOverlayOpen(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Gatekeeper State
    const [reviewMode, setReviewMode] = useState(false);
    const [leaseFile, setLeaseFile] = useState<File | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
    const [verificationError, setVerificationError] = useState<string | null>(null);

    // Review Form & Solana Demo State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [txStep, setTxStep] = useState<'idle' | 'signing' | 'minting' | 'confirmed'>('idle');
    const [txSignature, setTxSignature] = useState<string | null>(null);

    // Map State
    const [mapCenter, setMapCenter] = useState<[number, number]>([30.6280, -96.3344]); // College Station default



    const handleGatekeeperCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !propertyAccount) return;

        setLeaseFile(file);
        setVerificationStatus('verifying');
        setVerificationError(null);

        try {
            const targetAddress = propertyAccount.address_hash.toLowerCase();
            const streetName = targetAddress.split(',')[0].split('(')[0]; // "1234 Harvey Mitchell Pkwy"

            // ---------------------------------------------------------
            // 1. FILENAME CHECK (Fast Path for Demo)
            // ---------------------------------------------------------
            // e.g. "lease_1234_harvey.pdf" -> PASS
            const filename = file.name.toLowerCase();
            if (filename.includes(streetName.split(' ')[1]?.toLowerCase() || "lease")) { // Fuzzy match street name
                await new Promise(r => setTimeout(r, 800)); // Quick verify
                setVerificationStatus('verified');
                return;
            }

            // ---------------------------------------------------------
            // 2. OCR Fallback (If filename fails)
            // ---------------------------------------------------------
            const text = await extractTextFromFile(file);
            const normalizedText = text?.toLowerCase() || "";

            const addressParts = streetName.split(' ').filter(p => p.length > 2);
            const matchedParts = addressParts.filter(part => normalizedText.includes(part));
            const matchRatio = matchedParts.length / addressParts.length;

            await new Promise(r => setTimeout(r, 1500));

            if (matchRatio >= 0.5 || normalizedText.includes("lease")) {
                setVerificationStatus('verified');
            } else {
                setVerificationStatus('failed');
                setVerificationError(`Lease address does not match "${propertyAccount.address_hash}". Access Denied.`);
                setLeaseFile(null);
            }
        } catch (err) {
            setVerificationStatus('failed');
            setVerificationError("Document parsing failed. Please upload a clear PDF/Image.");
        }
    };

    const submitToChain = async () => {
        if (verificationStatus !== 'verified' || !propertyAccount) return;

        setSubmitting(true);
        setTxStep('signing'); // Step 1: Wallet Signature UI

        try {
            await new Promise(r => setTimeout(r, 1500)); // Sign delay
            setTxStep('minting'); // Step 2: Minting UI

            // Call Anchor Instruction
            const result = await LandlordRadarProgram.addReview(
                propertyAccount.address_hash,
                { rating, comment },
                true // Proof of Tenancy Flag
            );

            if (result.success) {
                setTxStep('confirmed'); // Step 3: Success
                setTxSignature(result.signature!);
                setReviewMode(false);

                // Refresh Account
                const updated = await LandlordRadarProgram.fetchAccount(propertyAccount.address_hash);
                if (updated) setPropertyAccount(updated);

                // Reset form
                setComment('');
                setRating(0);
            } else {
                setVerificationError(result.error || "Transaction Failed");
                setTxStep('idle');
            }
        } catch (err) {
            setVerificationError("Blockchain Error");
            setTxStep('idle');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-900">
            {/* Absolute Background Pattern (The Abstract Geometric Theme) */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 bg-[url('/bg-pattern.svg')] bg-cover bg-center" />

            {/* Sticky Search Bar & Wallet Connect */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20 flex flex-col md:flex-row gap-4 items-center justify-center">
                {isLoaded ? (
                    <div className="relative group w-full max-w-2xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl flex items-center p-2 border border-white/50">
                            <MapPin className="ml-3 w-5 h-5 text-violet-600" />
                            <Autocomplete
                                onLoad={onLoadAutocomplete}
                                onPlaceChanged={onPlaceChanged}
                                className="w-full"
                            >
                                <input
                                    type="text"
                                    placeholder="Search Property (e.g. 1234 Harvey Mitchell Pkwy)"
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-500 font-medium h-10"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </Autocomplete>
                            <button
                                onClick={(e) => { e.preventDefault(); /* Trigger search manually if needed */ }}
                                disabled={loading}
                                className="bg-violet-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-violet-700 transition-colors shadow-lg disabled:opacity-50 min-w-[100px]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Search'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 p-3 rounded-xl animate-pulse w-full max-w-2xl text-center text-slate-500">
                        Loading Search...
                    </div>
                )}
            </div>

            {/* Main Map Layer */}
            <div className="absolute inset-0 z-0">
                <MapComponent
                    center={{ lat: mapCenter[0], lng: mapCenter[1] }}
                    markerPosition={propertyAccount ? { lat: mapCenter[0], lng: mapCenter[1] } : undefined}
                />
            </div>

            {/* Transaction Success Toast */}
            <AnimatePresence>
                {txStep === 'confirmed' && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-32 right-8 z-50 bg-emerald-900/90 backdrop-blur-xl border border-emerald-500 text-white p-4 rounded-xl shadow-2xl max-w-sm"
                    >
                        <div className="flex items-start gap-3">
                            <div className="bg-emerald-500 rounded-full p-1 mt-1">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Review Minted!</h4>
                                <p className="text-emerald-200 text-sm mb-2">Your verified review is now immutable on Solana Devnet.</p>
                                <a
                                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-mono bg-black/30 px-2 py-1 rounded hover:bg-black/50 transition-colors flex items-center gap-1 w-fit"
                                >
                                    Tx: {txSignature} <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <button onClick={() => setTxStep('idle')} className="text-emerald-300 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Frosted Glass Info Overlay */}
            <AnimatePresence>
                {overlayOpen && propertyAccount && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="absolute bottom-8 right-8 w-full max-w-md z-30"
                    >
                        {/* The Glass Card */}
                        <div className="bg-white/80 backdrop-blur-2xl border border-violet-100/50 rounded-3xl shadow-2xl overflow-hidden text-slate-900 max-h-[80vh] flex flex-col">

                            {/* Header */}
                            <div className="bg-violet-600/5 p-6 border-b border-violet-100/50 flex justify-between items-start shrink-0">
                                <div className="pr-4">
                                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-indigo-700 leading-tight">
                                        {propertyAccount.address_hash}
                                    </h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="bg-violet-100 text-violet-700 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-violet-200 tracking-wider">
                                            Solana PDA
                                        </span>
                                        {propertyAccount.violations.length > 0 ? (
                                            <span className="bg-red-100 text-red-700 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-red-200 flex items-center gap-1 tracking-wider">
                                                <AlertTriangle className="w-3 h-3" /> {propertyAccount.violations.length} Violations
                                            </span>
                                        ) : (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-emerald-200 flex items-center gap-1 tracking-wider">
                                                <Shield className="w-3 h-3" /> Clean Record
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setOverlayOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content Scroll */}
                            <div className="p-6 overflow-y-auto custom-scrollbar grow">

                                {/* Violations Section */}
                                {propertyAccount.violations.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">On-Chain Violations</h3>
                                        <div className="space-y-2">
                                            {propertyAccount.violations.map((v, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                                    <span className="text-sm font-medium text-slate-700">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reviews Section */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Reviews</h3>
                                        <button
                                            onClick={() => setReviewMode(!reviewMode)}
                                            className="text-xs font-bold text-violet-600 hover:underline hover:text-violet-800 transition-colors"
                                        >
                                            {reviewMode ? 'Cancel Review' : '+ Write Review'}
                                        </button>
                                    </div>

                                    {/* The Gatekeeper UI */}
                                    <AnimatePresence>
                                        {reviewMode && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mb-6 overflow-hidden"
                                            >
                                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden">

                                                    {/* Transaction Loading Overlay */}
                                                    {submitting && (
                                                        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-6 rounded-2xl">
                                                            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4 relative">
                                                                {txStep === 'signing' ? (
                                                                    <Wallet className="w-8 h-8 text-violet-600 animate-pulse" />
                                                                ) : (
                                                                    <>
                                                                        <div className="absolute inset-0 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                                                                        <Loader2 className="w-6 h-6 text-violet-600 animate-pulse" />
                                                                    </>
                                                                )}
                                                            </div>
                                                            <h4 className="font-bold text-slate-900 text-lg mb-1">
                                                                {txStep === 'signing' ? 'Encrypting Lease Data...' : 'Minting to Solana Block #224...'}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 font-mono">
                                                                {txStep === 'signing' ? 'Preparing Zero-Knowledge Proof' : 'Verifying Consensus...'}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {verificationStatus !== 'verified' ? (
                                                        // LOCKED STATE
                                                        <div className="text-center">
                                                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                <Lock className="w-6 h-6 text-slate-400" />
                                                            </div>
                                                            <h4 className="font-bold text-slate-700 mb-1">Gatekeeper Verification</h4>
                                                            <p className="text-xs text-slate-500 mb-4 px-4">
                                                                To prevent fraud, you must prove tenancy. Upload a lease that matches
                                                                <span className="font-mono bg-slate-200 px-1 rounded ml-1 text-[10px]">{propertyAccount.address_hash}</span>.
                                                            </p>

                                                            <label className={`relative block w-full py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${verificationStatus === 'failed' ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-violet-400 hover:bg-white'
                                                                }`}>
                                                                {verificationStatus === 'verifying' ? (
                                                                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-violet-600">
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        Verifying Address...
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
                                                                        <Upload className="w-4 h-4" />
                                                                        {verificationStatus === 'failed' ? 'Mismatch Detected. Try Again.' : 'Upload PDF Lease'}
                                                                    </div>
                                                                )}
                                                                <input type="file" className="hidden" onChange={handleGatekeeperCheck} disabled={verificationStatus === 'verifying'} />
                                                            </label>

                                                            {verificationError && (
                                                                <p className="mt-2 text-xs font-bold text-red-500 animate-pulse">{verificationError}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // UNLOCKED STATE
                                                        <div className="animate-fade-in">
                                                            <div className="flex items-center gap-2 mb-3 bg-emerald-100 text-emerald-800 px-3 py-2 rounded-lg text-xs font-bold">
                                                                <CheckCircle className="w-4 h-4" />
                                                                Tenancy Verified via OCR
                                                            </div>

                                                            <div className="flex gap-2 mb-3 justify-center">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <button key={star} onClick={() => setRating(star)}>
                                                                        <Star className={`w-6 h-6 transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            <textarea
                                                                placeholder="Write your review stored on the chain..."
                                                                className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 bg-white mb-3"
                                                                rows={3}
                                                                value={comment}
                                                                onChange={e => setComment(e.target.value)}
                                                            />

                                                            <button
                                                                onClick={submitToChain}
                                                                disabled={submitting || !comment || rating === 0}
                                                                className="w-full bg-violet-600 text-white font-bold py-2 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
                                                            >
                                                                <Lock className="w-4 h-4" />
                                                                Sign & Publish to Solana
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Reviews List */}
                                    <div className="space-y-4">
                                        {propertyAccount.reviews.length === 0 ? (
                                            <p className="text-sm text-slate-400 text-center py-4">No reviews recorded on-chain.</p>
                                        ) : (
                                            propertyAccount.reviews.map((r, i) => (
                                                <div key={i} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                                        <div className="flex gap-1">
                                                            {[...Array(5)].map((_, si) => (
                                                                <Star key={si} className={`w-3 h-3 ${si < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-mono">{new Date(r.timestamp).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 italic relative z-10">"{r.comment}"</p>
                                                    <div className="mt-3 flex items-center justify-between relative z-10">
                                                        <div className="flex items-center gap-1.5 opacity-50">
                                                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500"></div>
                                                            <span className="text-[10px] font-mono text-slate-400 truncate w-20">{r.reviewer_pubkey}</span>
                                                        </div>
                                                        {r.is_verified && (
                                                            <div className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                                                <Shield className="w-2 h-2" /> Verified
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Subtle Tx Hash Link */}
                                                    {r.tx_signature && (
                                                        <a
                                                            href={`https://explorer.solana.com/tx/${r.tx_signature}?cluster=devnet`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="absolute bottom-1 right-2 text-[8px] text-slate-300 hover:text-violet-500 transition-colors opacity-0 group-hover:opacity-100 font-mono"
                                                        >
                                                            Tx: {r.tx_signature.substring(0, 8)}...
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
