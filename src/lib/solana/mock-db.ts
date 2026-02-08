
// Mock service to simulate a Solana Anchor Program for Landlord Radar
// This mimics the on-chain logic specified in the architecture

export interface TenantReview {
    reviewer_pubkey: string; // Mock wallet address
    rating: number; // 1-5
    comment: string;
    timestamp: number;
    is_verified?: boolean; // For "Solana Verified" badge
    tx_signature?: string;
}

// Corresponds to the Rust struct with added geospatial data for the demo map
// pub struct PropertyAccount {
//     pub address_hash: String,
//     pub violations: Vec<String>,
//     pub reviews: Vec<TenantReview>,
// }
export interface PropertyAccount {
    address_hash: string; // The primary key (address string)
    violations: string[]; // ["Mold", "No Hot Water", etc.]
    reviews: TenantReview[];
    coordinates: { lat: number, lng: number }; // Stored off-chain or via geohash in real app, explicit here for demo
}

// Mock On-Chain Storage (PDAs) with College Station Data
// Key = address_hash (normalized lowercase)
const PROGRAM_ACCOUNTS: Record<string, PropertyAccount> = {
    // 1. The Stack
    "1234 harvey mitchell pkwy": {
        address_hash: "1234 Harvey Mitchell Pkwy (The Stack)",
        violations: ["Illegal Late Fees", "Security Deposit Theft"],
        coordinates: { lat: 30.6333, lng: -96.3667 }, // Approx logic, tuned below
        reviews: [
            {
                reviewer_pubkey: "8xT...4jK",
                rating: 1,
                comment: "They charged me $500 for paint that was already chipped. Glad this is on chain now.",
                timestamp: 1698754321000,
                is_verified: true,
                tx_signature: "5gH...92x"
            }
        ]
    },
    // 2. Park West
    "501 first st": {
        address_hash: "501 First St (Park West)",
        violations: ["Mold in HVAC", "Unannounced Entry"],
        coordinates: { lat: 30.6125, lng: -96.3475 },
        reviews: [
            {
                reviewer_pubkey: "EpZ...9x1",
                rating: 2,
                comment: "Maintenance enters without 24hr notice. Documented it here.",
                timestamp: 1699123456000,
                is_verified: true,
                tx_signature: "3jK...88L"
            }
        ]
    },
    // 3. Callaway House
    "401 george bush dr": {
        address_hash: "401 George Bush Dr (Callaway House)",
        violations: ["Broken Elevator", "Pest Infestation"],
        coordinates: { lat: 30.6098, lng: -96.3400 },
        reviews: [
            {
                reviewer_pubkey: "WaLk...22X",
                rating: 1,
                comment: "Elevator broken for 3 months. Rats in the trash chute.",
                timestamp: 1700112233000,
                is_verified: true,
                tx_signature: "9mN...44P"
            }
        ]
    },
    // 4. The London
    "200 marion pugh dr": {
        address_hash: "200 Marion Pugh Dr (The London)",
        violations: ["Water Leaks"],
        coordinates: { lat: 30.6015, lng: -96.3265 },
        reviews: [
            {
                reviewer_pubkey: "R3nt...Lr0",
                rating: 2,
                comment: "Roof leaked during the storm, management ignored it for a week.",
                timestamp: 1701223344000,
                is_verified: true,
                tx_signature: "2qW...11M"
            }
        ]
    },
    // Demo fallback for generic searches (Austin)
    "123 main st": {
        address_hash: "123 Main St",
        violations: ["Mold Infestation", "Illegal Late Fees", "HVAC Failure"],
        coordinates: { lat: 30.2672, lng: -97.7431 },
        reviews: [
            {
                reviewer_pubkey: "EpZ...9x1",
                rating: 2,
                comment: "Landlord ignores maintenance requests for months.",
                timestamp: 1698754321000,
                is_verified: true,
                tx_signature: "8uI...00K"
            }
        ]
    }
};

// College Station Coordinates for Geocoding Fallback
const CS_COORDS: Record<string, { lat: number, lng: number }> = {
    // Exact mapping for the demo addresses
    "1234 harvey mitchell pkwy": { lat: 30.6105, lng: -96.3255 }, // Tuned for The Stack
    "501 first st": { lat: 30.6125, lng: -96.3475 }, // Tuned for Park West
    "401 george bush dr": { lat: 30.6098, lng: -96.3400 }, // Callaway
    "200 marion pugh dr": { lat: 30.6015, lng: -96.3265 }, // The London
};

export class LandlordRadarProgram {

    // Simulate: pub fn fetch_account(ctx: Context<FetchAccount>, address_seed: String) -> Result<PropertyAccount>
    static async fetchAccount(address: string): Promise<PropertyAccount | null> {
        // Normalize address to use as seed (lowercase, trimmed)
        const seed = address.toLowerCase().trim().replace(/,/g, '').split(' (')[0]; // Remove city/state/parens for fuzzy match

        console.log(`[Anchor RPC] Fetching PDA for seed: "${seed}"...`);
        await new Promise(r => setTimeout(r, 600)); // Network latency

        // Simple fuzzy match for demo
        const key = Object.keys(PROGRAM_ACCOUNTS).find(k => k.includes(seed) || seed.includes(k));

        if (key) {
            return PROGRAM_ACCOUNTS[key];
        }

        // Return null if not found (clean slate) -> In real app this would be a 404 or empty account
        return null;
    }

    // Simulate: pub fn add_review(ctx: Context<AddReview>, content: String, proof_of_tenancy: bool) -> Result<()>
    static async addReview(
        address: string,
        review: { rating: number, comment: string },
        proofOfTenancy: boolean
    ): Promise<{ success: boolean, signature?: string, error?: string }> {

        console.log(`[Anchor RPC] Invoking instruction: add_review...`);
        await new Promise(r => setTimeout(r, 2000)); // Block time simulation (longer for effect)

        // 1. The Gatekeeper Check (Smart Contract Constraint)
        // require!(proof_of_tenancy, ErrorCode::TenancyNotVerified);
        if (!proofOfTenancy) {
            console.error("[Anchor Verification Failed] Transaction rejected: Proof of Tenancy required.");
            return {
                success: false,
                error: "Smart Contract Error: TenancyNotVerified. You must prove tenancy to write to this PDA."
            };
        }

        // 2. Derive PDA Seed logic (reused from fetch)
        const normalizedInput = address.toLowerCase().trim().replace(/,/g, '').split(' (')[0];
        const key = Object.keys(PROGRAM_ACCOUNTS).find(k => k.includes(normalizedInput) || normalizedInput.includes(k)) || normalizedInput;

        let account = PROGRAM_ACCOUNTS[key];

        // 3. Initialize Account if needed
        if (!account) {
            account = {
                address_hash: address, // Display name
                violations: [],
                reviews: [],
                coordinates: { lat: 30.6280, lng: -96.3344 } // Default to College Station center if new
            };
            PROGRAM_ACCOUNTS[key] = account; // Store it
        }

        // 4. Update State
        const txSig = "5gH..." + Math.random().toString(36).substring(2, 5) + "92x";
        account.reviews.unshift({
            reviewer_pubkey: "8xT...4jK", // Specified User Wallet
            rating: review.rating,
            comment: review.comment,
            timestamp: Date.now(),
            is_verified: true,
            tx_signature: txSig
        });

        // 5. Return Transaction Signature
        return { success: true, signature: txSig };
    }

    // Helper to get coordinates for map centering (Geocoding simulation)
    static getCoordinates(address: string): { lat: number, lng: number } {
        const seed = address.toLowerCase().trim().replace(/,/g, '').split(' (')[0];

        // Check DB first
        const key = Object.keys(PROGRAM_ACCOUNTS).find(k => k.includes(seed) || seed.includes(k));
        if (key && PROGRAM_ACCOUNTS[key].coordinates) {
            return PROGRAM_ACCOUNTS[key].coordinates;
        }

        // Check fallback list
        const fallbackKey = Object.keys(CS_COORDS).find(k => k.includes(seed) || seed.includes(k));
        if (fallbackKey) {
            return CS_COORDS[fallbackKey];
        }

        // Default to College Station, TX
        return { lat: 30.6280, lng: -96.3344 };
    }
}
