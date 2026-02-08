const fs = require('fs');
const path = require('path');

const workerSrc = path.join(
  __dirname,
  '..',
  'node_modules',
  'pdfjs-dist',
  'build',
  'pdf.worker.min.mjs'
);
const workerDest = path.join(__dirname, '..', 'public', 'pdf.worker.min.mjs');

if (!fs.existsSync(workerSrc)) {
  console.warn('copy-pdf-worker: pdfjs-dist worker not found at', workerSrc);
  process.exit(0);
}

const publicDir = path.dirname(workerDest);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.copyFileSync(workerSrc, workerDest);
console.log('copy-pdf-worker: copied pdf.worker.min.mjs to public/');
