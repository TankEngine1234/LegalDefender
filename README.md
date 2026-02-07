# Contract Scanner

Instant legal document analysis: upload a lease, freelance agreement, or job offer and get plain-English bullet points plus flagged risks and negotiation scripts.

## Quick start (hackathon)

1. **Install and add your API key**
   ```bash
   npm install
   cp .env.example .env
   ```
   Open the `.env` file and set your Gemini key (get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)):
   ```
   GEMINI_API_KEY=your-gemini-key-here
   ```
   Save the file. After changing the key, restart the server (Ctrl+C, then `npm start`).

2. **Run the app**
   ```bash
   npm start
   ```
   Open **http://localhost:3000** in your browser.

3. **Use it**
   - Drop a PDF or DOCX contract, or pick a sample.
   - The backend extracts text, detects contract type (lease / freelance / job offer), and calls Google Gemini to analyze.
   - You get a risk score, plain-English summary, market comparison, and copy-paste negotiation scripts.

## How it works

- **Frontend** (`contract-scanner-with-api.html`): PDF/DOCX upload, text extraction (pdf.js, mammoth), contract-type detection, and UI. No API key in the browser.
- **Backend** (`server.js`): Serves the app and exposes `POST /api/analyze`. It receives `{ contractText, contractType }`, calls Google Gemini (gemini-1.5-flash), and returns the analysis JSON.

Your Gemini API key stays in `.env` on the server and is never sent to the client.

## Cost

Gemini has a free tier; paid usage is low per contract. Fine for demos and light use.

## If you open the HTML file directly

Uploads will hit `/api/analyze` and fail (no server). Always run `npm start` and use http://localhost:3000 for real scanning.
