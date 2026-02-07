/**
 * Contract Scanner API (Google Gemini)
 * Run: npm install && GEMINI_API_KEY=your_key node server.js
 * Get key: aistudio.google.com/apikey
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Serve the frontend
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'contract-scanner-with-api.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('contract-scanner-with-api.html not found');
  }
});

// Analyze contract via Google Gemini (key stays on server)
app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY not set. Add it to .env or run: GEMINI_API_KEY=... node server.js (get key at aistudio.google.com/apikey)'
    });
  }

  let { contractText, contractType } = req.body;
  if (!contractText || typeof contractText !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid contractText' });
  }
  if (contractType === 'lease') {
    const lines = contractText.split(/\n+/).filter(l => l.trim().length > 5);
    const keywords = /rent|deposit|fee|charge|payment|monthly|\$\d|price/i;
    const dollar = /\$\s*\d[\d,.]*/;
    const hints = lines.filter(l => (keywords.test(l) && dollar.test(l)) || (l.match(dollar) && l.length < 120)).slice(0, 30);
    if (hints.length > 0) {
      contractText = 'POTENTIAL FINANCIAL TERMS (extract from these):\n' + hints.map(l => l.trim().substring(0, 150)).join('\n') + '\n\n--- FULL CONTRACT ---\n' + contractText;
    }
  }

  const typeGuidance = {
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

  const comparisonMetricsByType = {
    lease: 'comparison.metrics MUST include 5-6 items. Monthly Rent: yourValue = MONTHLY amount only (if contract shows total like $11,700/12mo, use $975—divide total by months). Security Deposit, Late Fee, Pet Deposit (if any), Lease Length, Entry Notice. For each: label, yourValue, marketAvg (e.g. $1,000 for 1br College Station), difference, status ("above"|"below"|"fair"), suggestion.',
    freelance: 'comparison.metrics MUST include 5-6 items. Extract: Hourly/Project Rate, Payment Terms (e.g. Net-30), Revision Rounds, Late Payment Penalty, IP Ownership. For each: label, yourValue (from contract), marketAvg (industry typical), difference, status ("above"|"below"|"fair"), suggestion.',
    jobOffer: 'comparison.metrics MUST include 5-6 items. Extract: Base Salary, Equity/Options Grant, PTO Days, 401k Match, Vesting Schedule, Non-Compete Scope. For each: label, yourValue (from contract), marketAvg (market typical), difference, status ("above"|"below"|"fair"), suggestion.'
  };
  const comparisonInstruction = comparisonMetricsByType[contractType] || comparisonMetricsByType.lease;

  const summaryByType = {
    lease: 'summary: MUST include 6-8 separate bullets. Include: Rent, Deposit, Lease term, Late fee, Pet deposit/fee (if any), Entry notice (e.g. 24hr), Utilities (who pays), Application fee (if any), Move-in date. Extract every key term from the contract. Do NOT combine into fewer items.',
    freelance: 'summary: MUST include 6-8 separate bullets. Include: Rate, Payment terms, Scope/deliverables, Revisions, Late payment penalty, IP ownership, Kill fee (if any), Timeline. Extract every key term.',
    jobOffer: 'summary: MUST include 6-8 separate bullets. Include: Salary, Start date, Benefits, PTO, Equity/options, Vesting, Non-compete scope, Relocation (if any). Extract every key term.'
  };
  const summaryInstruction = summaryByType[contractType] || summaryByType.lease;

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
      {"label": "match contract type - lease: Monthly Rent/Security Deposit; freelance: Rate/Payment Terms; job: Salary/Equity", "yourValue": "from contract", "marketAvg": "typical", "difference": "...", "status": "above/below/fair", "suggestion": "advice or null"}
    ]
  },
  "summary": ["plain-English bullet with actual value 1", "bullet 2", "bullet 3"],
  "risks": [
    {"severity": "high or medium or low", "title": "issue title", "description": "what is wrong", "standard": "what is normal", "savings": "$ or description", "legalCode": "law ref or null", "script": "email template with [Name] placeholders"}
  ],
  "totalSavings": "e.g. $500+ annually"
}

${contractType === 'lease' ? `CRITICAL - LEASE VALUE EXTRACTION:
- Monthly Rent: Extract the amount due EACH month. If the contract shows a TOTAL for the lease (e.g. $11,700 for 12 months), divide: $11,700 ÷ 12 = $975/month. NEVER use the total lease amount as monthly rent. Look for "monthly rent", "rent per month", "base rent", or total ÷ number of months.
- Security Deposit: "security deposit", "deposit", "refundable deposit"
- Late Fee: "late fee", "late charge", "delinquency fee"
- Pet Deposit/Fee: "pet deposit", "pet fee", "pet rent"
- Lease Length: "term", "12 months", "month to month"
Search every page and addendum. Extract EXACT values. Never use "Not in contract" for rent or deposit.` : ''}

CRITICAL - Market comparison: ${comparisonInstruction}
yourValue = EXACT value from contract. marketAvg = typical benchmark.

CRITICAL - summary: MUST be an array of 6-8 SEPARATE strings. ${summaryInstruction} Each item: one bullet, e.g. "Rent: $975/month", "Deposit: $500", "Lease: 12 months", "Late fee: $50", "Entry notice: 24 hours", "Utilities: tenant pays electric/gas". Return 6-8 items, NOT 3. Search the full contract for all key terms.

CRITICAL - comparison.metrics: Labels MUST match contract type. lease: Monthly Rent, Security Deposit, Late Fee, etc. freelance: Rate, Payment Terms, Revision Rounds, etc. job: Base Salary, Equity, PTO, etc. Never leave label empty.

CRITICAL - risks[]: Each risk MUST have ALL fields: title (short name of issue, e.g. "Late fee exceeds legal maximum"), description (what the contract says and why it's a problem), standard (what's normal or legal), savings (e.g. "$50 per incident"), legalCode (if applicable), script (ready-to-send email with [Landlord Name] placeholder). Never leave title, description, or standard empty.

Focus on: ${guidance.issues}
Return ONLY valid JSON, no markdown.

CONTRACT TEXT:
${contractText.slice(0, 40000)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: 'You are an expert legal contract analyzer. For leases: Monthly Rent = amount due EACH month. If contract shows total (e.g. $11,700 for 12 months), divide by months: $11,700÷12=$975. NEVER use total as monthly rent. Extract exact values for deposit, fees. comparison.metrics must have 5-6 items with yourValue, marketAvg, difference, status, suggestion. Return only valid JSON, no markdown.' }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message = data.error?.message || data.error?.code || 'Unknown error';
      return res.status(response.status).json({
        error: `Gemini API error: ${message}`
      });
    }

    let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      return res.status(502).json({ error: 'Empty response from Gemini' });
    }

    content = content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const analysis = JSON.parse(content);
    res.json(analysis);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'Invalid JSON from AI', raw: err.message });
    }
    console.error('Analyze error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// Translate contract analysis to Spanish
app.post('/api/translate', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  }
  const payload = req.body;
  if (!payload) {
    return res.status(400).json({ error: 'Missing payload' });
  }
  const prompt = `Translate this contract analysis to Spanish. Return ONLY valid JSON:
{"summary": ["translated string 1", "..."], "risks": [{"title": "...", "description": "...", "standard": "...", "savings": "...", "script": "..."}], "comparison": {"metrics": [{"label": "...", "suggestion": "..."}]}, "totalSavings": "..."}
Keep dollar amounts, numbers, and percentages unchanged (e.g. $1,850, 30 days). Translate everything else to Spanish.

INPUT JSON:
${JSON.stringify(payload)}`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
      }) }
    );
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Translation failed' });
    }
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return res.status(502).json({ error: 'Empty response' });
    content = content.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    res.json(JSON.parse(content));
  } catch (err) {
    console.error('Translate error:', err);
    res.status(500).json({ error: err.message || 'Translation failed' });
  }
});

app.listen(PORT, () => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  console.log(`
  Contract Scanner running at http://localhost:${PORT}
  API key: ${hasKey ? '✓ Set (Gemini)' : '✗ Missing - set GEMINI_API_KEY in .env (aistudio.google.com/apikey)'}
  `);
});
