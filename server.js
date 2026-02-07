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

  const { contractText, contractType } = req.body;
  if (!contractText || typeof contractText !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid contractText' });
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
    lease: 'comparison.metrics MUST include 5-6 items. Extract from contract: Monthly Rent (yourValue=exact rent from contract, marketAvg=typical for that area), Security Deposit, Late Fee, Pet Deposit/Pet Rent (if mentioned), Lease Length, Entry Notice (e.g. 24hr). For each: label, yourValue (from contract), marketAvg (typical benchmark), difference (+X% or -X% or "Market standard"), status ("above"|"below"|"fair"), suggestion (one line or null).',
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
      {"label": "Metric Name", "yourValue": "exact value from contract", "marketAvg": "typical market value", "difference": "+15% or -10% or Market standard", "status": "above or below or fair", "suggestion": "one line advice or null"}
    ]
  },
  "summary": ["plain English key term 1", "key term 2", "key term 3"],
  "risks": [
    {"severity": "high or medium or low", "title": "issue title", "description": "what is wrong", "standard": "what is normal", "savings": "$ or description", "legalCode": "law ref or null", "script": "email template with [Name] placeholders"}
  ],
  "totalSavings": "e.g. $500+ annually"
}

CRITICAL - Value extraction: yourValue MUST be the EXACT value from the contract text (e.g. "$1,850", "30 days", "Net-30"). NEVER use "not specified", "obfuscated", "N/A" when the value appears in the contract. Only use "Not in contract" if the term is truly absent.

CRITICAL - Market comparison: ${comparisonInstruction}
comparison.metrics: yourValue = exact quote from contract (dollar amounts, dates, percentages as written). marketAvg = typical benchmark for comparison.

Focus on: ${guidance.issues}
Return ONLY valid JSON, no markdown.

CONTRACT TEXT:
${contractText.slice(0, 15000)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: 'You are an expert legal contract analyzer helping the user analyze their own contract. Extract EXACT values from the contract text—if rent is $1,850, write "$1,850". NEVER use "not specified", "obfuscated", "redacted", or placeholders. If a term is not in the contract, use "Not in contract". Return only valid JSON, no markdown.' }] },
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

app.listen(PORT, () => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  console.log(`
  Contract Scanner running at http://localhost:${PORT}
  API key: ${hasKey ? '✓ Set (Gemini)' : '✗ Missing - set GEMINI_API_KEY in .env (aistudio.google.com/apikey)'}
  `);
});
