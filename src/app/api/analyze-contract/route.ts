import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY not set" },
            { status: 500 }
        );
    }

    try {
        const { contractText, contractType } = await req.json();

        if (!contractText || typeof contractText !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid contractText" },
                { status: 400 }
            );
        }

        // Load Texas Laws Ground Truth
        const jsonPath = path.join(process.cwd(), 'texas_tenant_laws_13_categories_production.json');
        const texasLawsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        // Guidance configuration
        const typeGuidance: Record<string, { categories: string[]; issues: string }> = {
            lease: {
                categories: ['Financial Terms', 'Legal Compliance', 'Tenant Rights', 'Hidden Costs'],
                issues: 'late fees, security deposits, maintenance response times, entry notice, pet fees'
            },
            freelance: {
                categories: ['Payment Terms', 'Scope Protection', 'IP Rights', 'Legal Protection'],
                issues: 'revision limits, payment terms, IP ownership, late fees, kill fees'
            },
            jobOffer: {
                categories: ['Compensation', 'Benefits', 'Non-Compete', 'Equity Terms'],
                issues: 'non-compete scope, equity vesting, PTO, salary benchmarks'
            }
        };

        const guidance = typeGuidance[contractType] || typeGuidance.lease;

        const userPrompt = `Analyze this ${contractType} contract using the provided Texas Property Code JSON as the ABSOLUTE GROUND TRUTH. 
        
        GROUND TRUTH DATA (Texas Tenant Laws):
        ${JSON.stringify(texasLawsData.state, null, 2)}
        
        MARKET DATA (Major Texas Cities):
        ${JSON.stringify({
            "college-station": texasLawsData["college-station"],
            "austin": texasLawsData["austin"],
            "dallas": texasLawsData["dallas"],
            "houston": texasLawsData["houston"],
            "san-antonio": texasLawsData["san-antonio"]
        }, null, 2)}

        RISK SCORING RUBRIC:
        - CRITICAL (Red): Clause is VOID/UNENFORCEABLE under Texas Law (e.g. waiving jury trial, waiving repair duty).
        - HIGH (Orange): Direct monetary loss or illegal fees (e.g. late fee > 12%, or charged before 2 full days).
        - MEDIUM (Yellow): Procedural errors (e.g. notice periods shortening).
        - LOW (Blue): Ambiguity or best practice missing.

        INSTRUCTIONS:
        1. EXTRACT specific values from the "CONTRACT TEXT" below (Rent, Dates, Fees, Clauses).
        2. COMPARE them against the "GROUND TRUTH DATA".
        3. ASSIGN a Risk Score and Severity based on the Rubric.
        4. For "comparison.metrics", use the MARKET DATA provided to benchmark Rent, Deposits, etc.

        RETURN JSON EXACTLY IN THIS STRUCTURE:
        {
          "riskScore": {
            "overall": <number 0-100>,
            "grade": "<A-F>",
            "breakdown": [
              {"category": "${guidance.categories[0]}", "score": <0-100>, "grade": "<A-F>", "status": "<short desc>"},
              {"category": "${guidance.categories[1]}", "score": <0-100>, "grade": "<A-F>", "status": "<short desc>"},
              {"category": "${guidance.categories[2]}", "score": <0-100>, "grade": "<A-F>", "status": "<short desc>"},
              {"category": "${guidance.categories[3]}", "score": <0-100>, "grade": "<A-F>", "status": "<short desc>"}
            ]
          },
          "comparison": {
            "location": "College Station, TX", 
            "contractsAnalyzed": 14205,
            "metrics": [
              {"label": "Monthly Rent", "yourValue": "$...", "marketAvg": "$...", "difference": "...", "status": "above/below/fair", "suggestion": "..."},
              {"label": "Late Fee", "yourValue": "...", "marketAvg": "...", "difference": "...", "status": "...", "suggestion": "..."}
            ]
          },
          "summary": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
          "risks": [
            {
               "severity": "high" | "medium" | "low" | "critical", 
               "title": "Illegal Late Fee", 
               "description": "Lease charges fee on the 2nd. Texas Law requires 2 full grace days (Prop Code 92.019).", 
               "standard": "Must wait until 3rd (2 full days unpaid).", 
               "savings": "Potential $250+ penalty recovery", 
               "legalCode": "Texas Property Code § 92.019", 
               "script": "Dear Landlord, Section 92.019 prohibits..."
            }
          ],
          "totalSavings": "$1,250 estimated"
        }

        CONTRACT TEXT:
        ${contractText}`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });

        let result;
        let attempt = 0;
        const maxRetries = 3;

        while (attempt <= maxRetries) {
            try {
                result = await model.generateContent(userPrompt);
                break; // Success
            } catch (error: any) {
                attempt++;
                console.log(`Attempt ${attempt} failed:`, error.message);

                const errorMessage = error?.message || error?.toString() || "";
                const is429 = errorMessage.includes("429") ||
                    errorMessage.includes("Too Many Requests") ||
                    errorMessage.includes("Quota exceeded");

                if (is429 && attempt <= maxRetries) {
                    // Exponential backoff: 2s, 5s, 10s
                    const delay = [2000, 5000, 10000][attempt - 1] || 10000;
                    console.log(`Hit rate limit. Retrying in ${delay}ms...`);
                    await new Promise(r => setTimeout(r, delay));
                } else {
                    throw error; // Not a rate limit or out of retries
                }
            }
        }

        if (!result) throw new Error("Max retries exceeded");

        const text = result.response.text();
        const cleanedText = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

        return NextResponse.json(JSON.parse(cleanedText));

    } catch (error: any) {
        console.error("Analyze error:", error);
        return NextResponse.json(
            {
                error: "Analysis failed due to high traffic. Please try again in 1 minute.",
                details: error.message
            },
            { status: 500 }
        );
    }
}
