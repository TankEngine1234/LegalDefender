// Simulate Solana Anchor Program Interaction (Demo Mode)

export interface ReviewStruct {
    reviewer_pubkey: string;
    rating: number;
    comment: string;
    timestamp: number;
    is_verified: boolean;
    tx_signature?: string;
}

export interface PropertyAccount {
    address_hash: string;
    violations: string[];
    reviews: ReviewStruct[];
    reputation_score: number;
    coordinates?: { lat: number, lng: number };
}

// ---------------------------------------------------------
// 1. THE 5 DEMO SCENARIOS (HARDCODED HAPPY PATHS)
// ---------------------------------------------------------
const DEMO_DB: Record<string, PropertyAccount> = {
    // 1. The Nightmare
    "1234 harvey mitchell pkwy": {
        address_hash: "1234 Harvey Mitchell Pkwy, College Station",
        violations: ["Illegal Late Fees (Usury)", "Mold Waiver Clause", "Security Deposit Theft"],
        reputation_score: 12, // 1.2 stars
        coordinates: { lat: 30.6097, lng: -96.3090 }, // Approx location
        reviews: [
            {
                reviewer_pubkey: "8xT...92j",
                rating: 1,
                comment: "They kept my whole deposit for 'dust'! Avoid at all costs.",
                timestamp: Date.now() - 86400000 * 4,
                is_verified: true,
                tx_signature: "5gH...92x"
            },
            {
                reviewer_pubkey: "3mP...77k",
                rating: 1,
                comment: "Mold in the AC unit and they refused to fix it.",
                timestamp: Date.now() - 86400000 * 12,
                is_verified: true,
                tx_signature: "2fL...88q"
            }
        ]
    },

    // 2. The Golden Standard
    "501 first st": {
        address_hash: "501 First St, College Station",
        violations: [], // Clean
        reputation_score: 48, // 4.8 stars
        coordinates: { lat: 30.6133, lng: -96.3358 }, // Park West area
        reviews: [
            {
                reviewer_pubkey: "9jL...11m",
                rating: 5,
                comment: "Best landlord in CStat. Fixes things same-day.",
                timestamp: Date.now() - 86400000 * 2,
                is_verified: true,
                tx_signature: "7kP...44m"
            },
            {
                reviewer_pubkey: "2nP...55x",
                rating: 5,
                comment: "Fair prices and very respectful management.",
                timestamp: Date.now() - 86400000 * 10,
                is_verified: true,
                tx_signature: "9oQ...22z"
            }
        ]
    },

    // 3. The Mixed Bag
    "401 george bush dr": {
        address_hash: "401 George Bush Dr, College Station",
        violations: ["Unannounced Entry Clause"],
        reputation_score: 30, // 3.0 stars
        coordinates: { lat: 30.6100, lng: -96.3400 }, // Callaway House area
        reviews: [
            {
                reviewer_pubkey: "4kR...33p",
                rating: 3,
                comment: "Great location, but maintenance enters without knocking.",
                timestamp: Date.now() - 86400000 * 5,
                is_verified: true,
                tx_signature: "1lM...66n"
            }
        ]
    },

    // 4. The New Build
    "200 marion pugh dr": {
        address_hash: "200 Marion Pugh Dr, College Station",
        violations: ["Construction Waiver"],
        reputation_score: 0, // N/A
        coordinates: { lat: 30.6050, lng: -96.3250 }, // The London area
        reviews: [] // New Listing
    },

    // 5. The Student Trap
    "800 raymond stotzer pkwy": {
        address_hash: "800 Raymond Stotzer Pkwy, College Station",
        violations: ["Exorbitant Utility Markup", "No Overnight Guests"],
        reputation_score: 21, // 2.1 stars
        coordinates: { lat: 30.6000, lng: -96.3500 }, // Approx
        reviews: [
            {
                reviewer_pubkey: "6tG...44h",
                rating: 2,
                comment: "Fine apartment, but the rules are like a prison.",
                timestamp: Date.now() - 86400000 * 7,
                is_verified: true,
                tx_signature: "3rF...88v"
            }
        ]
    }
};

// ---------------------------------------------------------
// 2. BACKEND API SIMULATION
// ---------------------------------------------------------
export const LandlordRadarProgram = {

    // Simulate Fetching PDA (Account Info)
    fetchAccount: async (address: string): Promise<PropertyAccount | null> => {
        await new Promise(resolve => setTimeout(resolve, 600)); // Network latency

        // 1. Normalized Search Key
        const normalized = address.toLowerCase();

        // 2. CHECK DEMO KEYS FIRST (The "Happy Path")
        const demoKey = Object.keys(DEMO_DB).find(k => normalized.includes(k));
        if (demoKey) {
            // Check for locally added reviews to merge with Demo DB
            if (typeof window !== 'undefined') {
                const storedReviews = localStorage.getItem(`legalDefender_reviews_${demoKey}`);
                if (storedReviews) {
                    const parsedReviews = JSON.parse(storedReviews);
                    return {
                        ...DEMO_DB[demoKey],
                        reviews: [...parsedReviews, ...DEMO_DB[demoKey].reviews]
                    };
                }
            }
            return DEMO_DB[demoKey];
        }

        // 3. CHECK LOCAL STORAGE (Simulate Scanner Integration or New properties)
        if (typeof window !== 'undefined') {
            const storedData = localStorage.getItem(`legalDefender_db_${address}`);
            if (storedData) {
                return JSON.parse(storedData) as PropertyAccount;
            }
        }

        return null; // Not found -> Frontend treats as "Clean/New"
    },

    // Simulate "Add Review" Instruction
    addReview: async (address: string, review: { rating: number, comment: string }, proofOfTenancy: boolean) => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Blockchain Confirmation Time

        if (!proofOfTenancy) {
            return { success: false, error: "Gatekeeper: No Lease Proof" };
        }

        const newReview: ReviewStruct = {
            reviewer_pubkey: "8xT...4jK", // Connected Wallet
            rating: review.rating,
            comment: review.comment,
            timestamp: Date.now(),
            is_verified: true,
            tx_signature: "5gH" + Math.random().toString(36).substring(7) + "92x"
        };

        // Update Local State for Demo Persistence
        if (typeof window !== 'undefined') {
            const normalized = address.toLowerCase();
            const demoKey = Object.keys(DEMO_DB).find(k => normalized.includes(k));

            if (demoKey) {
                // If it's a demo property, we store just the NEW reviews separately to merge later
                // (Separate key to avoid overwriting the hardcoded const)
                const existingStored = localStorage.getItem(`legalDefender_reviews_${demoKey}`);
                const reviews = existingStored ? JSON.parse(existingStored) : [];
                reviews.unshift(newReview);
                localStorage.setItem(`legalDefender_reviews_${demoKey}`, JSON.stringify(reviews));
            } else {
                // For completely new properties, store the whole account
                let account = await LandlordRadarProgram.fetchAccount(address);
                if (!account) {
                    account = {
                        address_hash: address,
                        violations: [],
                        reviews: [],
                        reputation_score: 0,
                        coordinates: { lat: 0, lng: 0 } // handled by map
                    };
                }
                account.reviews.unshift(newReview);
                localStorage.setItem(`legalDefender_db_${address}`, JSON.stringify(account));
            }
        }

        return { success: true, signature: newReview.tx_signature };
    },

    // Helper: Get Hardcoded Coords if available
    getDemoCoordinates: (address: string) => {
        const normalized = address.toLowerCase();
        const demoKey = Object.keys(DEMO_DB).find(k => normalized.includes(k));
        if (demoKey) return DEMO_DB[demoKey].coordinates;
        return null;
    }
};
