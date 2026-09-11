// scripts/tests/test-vault-extract.js — Test PDF multipart upload & OCR extraction pipeline
// Usage: node scripts/tests/test-vault-extract.js

const fs = require('fs');
const path = require('path');
const FormData = require('../../backend/node_modules/form-data');
const axios = require('../../backend/node_modules/axios');

async function testExtraction() {
  const pdfPath = path.join(__dirname, 'sample-dossier.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('sample-dossier.pdf not found, generating one now...');
    require('./generate-sample-pdf.js');
  }

  console.log(`Sending ${pdfPath} to http://localhost:5000/api/vault/extract ...`);

  const form = new FormData();
  form.append('file', fs.createReadStream(pdfPath), {
    filename: 'sample-dossier.pdf',
    contentType: 'application/pdf',
  });

  try {
    const res = await axios.post('http://localhost:5000/api/vault/extract', form, {
      headers: form.getHeaders(),
    });

    console.log('✅ Status:', res.status);
    console.log('✅ Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('❌ Request failed:', err.response ? err.response.data : err.message);
  }
}

testExtraction();
