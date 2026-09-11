// scripts/tests/generate-sample-pdf.js — Simple generator for valid statutory test PDF
const fs = require('fs');
const path = require('path');

function createTextPDF(text) {
  const content = `BT /F1 12 Tf 50 750 Td (${text.replace(/[\(\)\\]/g, '\\$&').replace(/\n/g, ') Tj T* (')}) Tj ET`;
  const streamLength = Buffer.byteLength(content);
  
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000340 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
419
%%EOF`;

  return Buffer.from(pdf);
}

const sampleText = `MAHARASHTRA INDUSTRIAL DEVELOPMENT CORPORATION (MIDC)
STATUTORY CLEARANCE APPLICATION & ENTERPRISE PROFILE

Enterprise Name: Maharashtra Solvents & Petrochemicals Pvt Ltd
Permanent Account Number (PAN): ABCDE1234F
Goods and Services Tax (GSTIN): 27ABCDE1234F1Z5
Industrial Zone: Chakan MIDC Phase-II, Plot No. 44, Pune
Proposed Plot Area: 5000 sq.meters
Sanctioned Power Load: 250 kVA
Capital Expenditure (Capex): INR 35.00 Crores
Project Scope: Solvent recovery and green petrochemical refining.`;

const targetPath = path.join(__dirname, 'sample-dossier.pdf');
const pdfBuffer = createTextPDF(sampleText);
fs.writeFileSync(targetPath, pdfBuffer);
console.log('Sample PDF created successfully: ' + targetPath + ' (' + pdfBuffer.length + ' bytes)');
