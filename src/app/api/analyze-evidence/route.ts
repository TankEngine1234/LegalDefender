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
        const formData = await req.formData();
        const evidenceFiles = formData.getAll("evidence") as File[];
        const leaseFile = formData.get("lease") as File | null;
        const additionalContext = formData.get("context") as string;

        if (!evidenceFiles || evidenceFiles.length === 0) {
            return NextResponse.json(
                { error: "No evidence files provided" },
                { status: 400 }
            );
        }

        // Convert evidence files to Gemini Parts
        const imageParts = await Promise.all(
            evidenceFiles.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                return {
                    inlineData: {
                        data: Buffer.from(arrayBuffer).toString("base64"),
                        mimeType: file.type,
                    },
                };
            })
        );

        // Extract text from lease if provided (simplistic text extraction for now or just treat as blob if Gemini supports PDF directly)
        // Gemini 1.5 Pro supports PDF directly via File API, but for inlineData it expects image/video/audio. 
        // For PDF, we usually need to use the File API (uploadFile) which requires a server-to-server upload, 
        // OR extract text. Since we have a text extractor client-side, let's assume the client sends the *text* of the lease 
        // or we can try to extract it here. 
        // Actually, we can use `pdfjs-dist` on the server to extract text if needed, but it's heavier. 
        // Let's ask the prompt to rely on the client sending extracted text or handle PDF if we implement `uploadFile`.
        // For simplicity and speed in this hackathon context, let's assume the client extracts the text and sends it as `leaseText`.

        // Changing strategy: Client will send `leaseText` string.
        const leaseText = formData.get("leaseText") as string;

        const prompt = `
    You are a Forensic Housing Investigator and Legal Advocate. 
    
    TASK:
    1. Analyze the provided image(s)/video(s) of rental property damage.
    2. Identify the specific issue (scientific name if mold, technical term if structural).
    3. Cite relevant Texas Property Code (Chapter 92) or general Tenant-Landlord law regarding this specific issue. https://statutes.capitol.texas.gov/Docs/PR/htm/PR.92.htm
    4. If lease text is provided, cross-reference it. Does the lease incorrectly try to shift responsibility to the tenant? (e.g. "Tenant maintains AC" vs Law "Landlord must fix if hazardous").
    5. Assess if this condition constitutes a "condition materially affecting the physical health or safety of an ordinary tenant" (Texas Prop Code 92.056).

    CONTEXT:
    ${additionalContext ? `User context: ${additionalContext}` : ""}
    ${leaseText ? `LEASE TEXT EXCERPT: ${leaseText.substring(0, 20000)}...` : "No lease provided. Rely on default state law."}

    OUTPUT JSON:
    {
      "diagnosis": {
        "issue": "Short title of issue",
        "scientificName": "Scientific name or technical description",
        "severity": "Emergency | Urgent | Routine",
        "description": "Detailed visual analysis"
      },
      "legalAnalysis": {
        "code": "Specific Legal Code Citation (e.g. Texas Prop Code § 92.052)",
        "requirement": "What the law requires the landlord to do",
        "violation": "Yes/No/Likely",
        "explanation": "Why this is a violation based on the visual evidence"
      },
      "leaseCrossReference": {
        "relevantClause": "Clause from lease or 'Not found'",
        "conflict": "Description of conflict between lease and law"
      },
      "actionPlan": {
        "steps": ["Step 1", "Step 2"],
        "letterDraft": "Draft a formal 'Notice of Condition' email to the landlord citing the specific code and attaching the evidence."
      }
    }
    `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite", // Free tier: 15 RPM, 1000 RPD; supports vision
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

        return NextResponse.json(JSON.parse(cleanedText));

    } catch (error: any) {
        console.error("Evidence analysis error:", error);
        return NextResponse.json(
            { error: error.message || "Analysis failed" },
            { status: 500 }
        );
    }
}
