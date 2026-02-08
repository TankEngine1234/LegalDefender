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
        const payload = await req.json();
        if (!payload) {
            return NextResponse.json({ error: "Missing payload" }, { status: 400 });
        }

        const prompt = `Translate this contract analysis to Spanish. Return ONLY valid JSON with the EXACT same structure as the input.
- riskScore: translate "grade" and breakdown "category", "status" only; keep "overall", "score", "grade" (letter) as-is.
- comparison: translate "location"; in metrics translate "label", "yourValue" (if it's text like "12 months"), "marketAvg" (if text), "difference", "status", "suggestion". Keep dollar amounts and numbers unchanged (e.g. $1,850, +7.6%).
- summary: translate each string; keep dollar amounts and numbers unchanged.
- risks: translate "title", "description", "standard", "savings", "script"; keep "severity" as "high"/"medium"/"low" and "legalCode" unchanged (e.g. Texas Property Code §92.019).
- totalSavings: translate but keep dollar amounts and numbers.

Return the full object with the same keys and structure. No extra keys.

INPUT JSON:
${JSON.stringify(payload)}`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite", // Free tier: 15 RPM, 1000 RPD
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

        return NextResponse.json(JSON.parse(cleanedText));

    } catch (error: any) {
        console.error("Translate error:", error);
        return NextResponse.json(
            { error: error.message || "Translation failed" },
            { status: 500 }
        );
    }
}
