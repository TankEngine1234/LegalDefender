import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { NextResponse } from "next/server";

const PUBLIC_RPC = "https://api.devnet.solana.com";
const RPC_URL = process.env.SOLANA_DEVNET_RPC || PUBLIC_RPC;
// Memo tx costs ~5k lamports; 0.01 SOL allows ~100 requests/day within 1 SOL project limit
const AIRDROP_LAMPORTS = 0.01 * LAMPORTS_PER_SOL;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 4000;

async function tryAirdrop(connection: Connection, pubkey: PublicKey): Promise<string | null> {
    const sig = await connection.requestAirdrop(pubkey, AIRDROP_LAMPORTS);
    await connection.confirmTransaction(sig, "confirmed");
    const balance = await connection.getBalance(pubkey);
    return balance > 0 ? sig : null;
}

function isRateLimited(msg: string): boolean {
    const m = msg.toLowerCase();
    return m.includes("403") || m.includes("429") || m.includes("rate limit") || m.includes("limit exceeded");
}

export async function POST(req: Request) {
    try {
        const { publicKey } = await req.json();
        if (!publicKey || typeof publicKey !== "string") {
            return NextResponse.json({ error: "publicKey required" }, { status: 400 });
        }

        const pubkey = new PublicKey(publicKey);
        const rpcs = RPC_URL !== PUBLIC_RPC ? [RPC_URL, PUBLIC_RPC] : [RPC_URL];

        let lastError: Error | null = null;
        for (const rpcUrl of rpcs) {
            const connection = new Connection(rpcUrl, "confirmed");
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    const sig = await tryAirdrop(connection, pubkey);
                    if (sig) return NextResponse.json({ signature: sig });
                } catch (e: unknown) {
                    lastError = e instanceof Error ? e : new Error(String(e));
                    const msg = lastError?.message || "";
                    if (isRateLimited(msg) && rpcUrl !== PUBLIC_RPC) break; // Try fallback RPC
                    if (attempt < MAX_RETRIES) {
                        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
                    }
                }
            }
        }

        const msg = lastError?.message || "Airdrop failed";
        return NextResponse.json(
            { error: msg, code: isRateLimited(msg) ? "RATE_LIMITED" : "AIRDROP_FAILED" },
            { status: 503 }
        );
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
