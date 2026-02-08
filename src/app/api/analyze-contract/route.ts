import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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

        // Guidance configuration from legacy code
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

        const comparisonMetricsByType: Record<string, string> = {
            lease: 'comparison.metrics MUST include 5-6 items. Monthly Rent: yourValue = MONTHLY amount only (if contract shows total like $11,700/12mo, use $975—divide total by months). Security Deposit, Late Fee, Pet Deposit (if any), Lease Length, Entry Notice. For each: label, yourValue, marketAvg (e.g. $1,000 for 1br College Station), difference, status ("above"|"below"|"fair"), suggestion.',
            freelance: 'comparison.metrics MUST include 5-6 items. Extract: Hourly/Project Rate, Payment Terms (e.g. Net-30), Revision Rounds, Late Payment Penalty, IP Ownership. For each: label, yourValue (from contract), marketAvg (industry typical), difference, status ("above"|"below"|"fair"), suggestion.',
            jobOffer: 'comparison.metrics MUST include 5-6 items. Extract: Base Salary, Equity/Options Grant, PTO Days, 401k Match, Vesting Schedule, Non-Compete Scope. For each: label, yourValue (from contract), marketAvg (market typical), difference, status ("above"|"below"|"fair"), suggestion.'
        };
        const comparisonInstruction = comparisonMetricsByType[contractType] || comparisonMetricsByType.lease;

        const userPrompt = `Analyze this ${contractType} contract and return a JSON object with this EXACT structure:

{
  "riskScore": {
    "overall": <number 0-100>,
    "grade": "<letter grade e.g. B+ or C->",
    "breakdown": [
      {"category": "${guidance.categories[0]}", "score": <0-100>, "grade": "<A-F>", "status": "<short description>"},
      {"category": "${guidance.categories[1]}", "score": <0-100>, "grade": "<A-F>", "status": "<short description>"},
      {"category": "${guidance.categories[2]}", "score": <0-100>, "grade": "<A-F>", "status": "<short description>"},
      {"category": "${guidance.categories[3]}", "score": <0-100>, "grade": "<A-F>", "status": "<short description>"}
    ]
  },
  "comparison": {
    "location": "<infer city/state from contract or use region e.g. National>",
    "contractsAnalyzed": <number 150-300>,
    "metrics": [
      {"label": "Monthly Rent", "yourValue": "from contract", "marketAvg": "typical", "difference": "+X% or Market standard", "status": "above/below/fair", "suggestion": "advice or null"},
      {"label": "Security Deposit", "yourValue": "from contract", "marketAvg": "typical", "difference": "...", "status": "...", "suggestion": null}
    ]
  },
  "summary": ["plain-English bullet with actual value 1", "bullet 2", "bullet 3"],
  "risks": [
    {"severity": "high or medium or low", "title": "issue title", "description": "what is wrong", "standard": "what is normal", "savings": "$ or description", "legalCode": "law ref or null", "script": "email template with [Name] placeholders"}
  ],
  "totalSavings": "e.g. $500+ annually"
}

CRITICAL - LEASE VALUE EXTRACTION:
- Monthly Rent: Extract the amount due EACH month. If the contract shows a TOTAL for the lease (e.g. $11,700 for 12 months), divide: $11,700 ÷ 12 = $975/month. NEVER use the total lease amount as monthly rent. Look for "monthly rent", "rent per month", "base rent", or total ÷ number of months.
- Security Deposit: "security deposit", "deposit", "refundable deposit"
- Late Fee: "late fee", "late charge", "delinquency fee"
- Pet Deposit/Fee: "pet deposit", "pet fee", "pet rent"
- Lease Length: "term", "12 months", "month to month"
Search every page and addendum. Extract EXACT values. Never use "Not in contract" for rent or deposit.

CRITICAL - Market comparison: ${comparisonInstruction}
yourValue = EXACT value from contract. marketAvg = typical benchmark.

CRITICAL - summary: Must be 5-7 plain-English bullet points with ACTUAL values. Do NOT return category headers like "Financial Terms:" or "Legal Compliance:" with no content. Each summary item must include the real value/description.

CRITICAL - comparison.metrics: Each object MUST have label, yourValue, marketAvg, difference, status, suggestion. Never leave label empty.

CRITICAL - risks[]: Each risk MUST have ALL fields: title, description, standard, savings, legalCode, script. Never leave title, description, or standard empty.

Focus on: ${guidance.issues}
Return ONLY valid JSON, no markdown.

CONTRACT TEXT:
${contractText}`;
        // Note: Removed legacy 40000 char limit to leverage Gemini 1.5 context window

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite", // Free tier: 15 RPM, 1000 RPD
            generationConfig: { responseMimeType: "application/json" }
        });

        let result;
        try {
            result = await model.generateContent(userPrompt);
        } catch (firstError: any) {
            // Retry once after delay on 429 (rate limit)
            const is429 = firstError?.message?.includes("429") || firstError?.message?.includes("Too Many Requests");
            const retryDelay = 17000; // 17s to match API suggestion
            if (is429 && retryDelay > 0) {
                await new Promise(r => setTimeout(r, retryDelay));
                result = await model.generateContent(userPrompt);
            } else {
                throw firstError;
            }
        }

        const text = result!.response.text();

        // Clean up potential markdown code blocks (SDK usually handles this with responseMimeType, but good to be safe)
        const cleanedText = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

        return NextResponse.json(JSON.parse(cleanedText));

    } catch (error: any) {
        console.error("Analyze error:", error);
        const msg = error?.message ?? "Analysis failed";
        const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests");
        return NextResponse.json(
            {
                error: isQuota
                    ? "Rate limit exceeded. Wait a minute and try again, or check your Gemini API quota: https://ai.google.dev/gemini-api/docs/rate-limits"
                    : msg
            },
            { status: isQuota ? 429 : 500 }
        );
    }
}
