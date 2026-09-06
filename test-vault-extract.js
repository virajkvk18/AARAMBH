const fs = require('fs');
const http = require('http');

// Start backend server in background or test with a direct handler test
const FormData = require('./backend/node_modules/form-data');
const axios = require('./backend/node_modules/axios');

async function testExtraction() {
  console.log('Sending sample-dossier.pdf to http://localhost:5000/api/vault/extract ...');

  const form = new FormData();
  form.append('file', fs.createReadStream('./sample-dossier.pdf'), {
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
