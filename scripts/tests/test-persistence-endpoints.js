// scripts/tests/test-persistence-endpoints.js — REST Persistence & DAG Cascade API tests
// Usage: node scripts/tests/test-persistence-endpoints.js

const axios = require('../../backend/node_modules/axios');

async function testEndpoints() {
  const BASE = 'http://localhost:5000/api';

  console.log('Testing REST Persistence & Clearance DAG Endpoints...');

  // 1. POST /api/enterprise
  try {
    const entRes = await axios.post(`${BASE}/enterprise`, {
      id: 'ENT-MH-2026-8891',
      name: 'Maharashtra Solvents & Chemicals Pvt Ltd',
      sector: 'Chemical Manufacturing',
      location_zone: 'Chakan MIDC (Pune)',
      capex_cr: 35,
      power_load_kva: 250,
      water_demand_kld: 30,
      workforce_size: 120,
      risk_track: 'red',
    });
    console.log('✅ POST /api/enterprise:', entRes.data.status, entRes.data.enterprise?.name);
  } catch (e) {
    console.error('❌ POST /api/enterprise failed:', e.message);
  }

  // 2. GET /api/enterprise/ENT-MH-2026-8891
  try {
    const getEntRes = await axios.get(`${BASE}/enterprise/ENT-MH-2026-8891`);
    console.log('✅ GET /api/enterprise/:id:', getEntRes.data.status, getEntRes.data.enterprise?.sector);
  } catch (e) {
    console.error('❌ GET /api/enterprise/:id failed:', e.message);
  }

  // 3. GET /api/dag/ENT-MH-2026-8891
  try {
    const dagRes = await axios.get(`${BASE}/dag/ENT-MH-2026-8891`);
    console.log('✅ GET /api/dag/:enterpriseId:', dagRes.data.status, 'Total Nodes:', dagRes.data.nodes?.length);
  } catch (e) {
    console.error('❌ GET /api/dag/:enterpriseId failed:', e.message);
  }

  // 4. PATCH /api/dag/node-root/approve
  try {
    const approveRes = await axios.patch(`${BASE}/dag/node-root/approve`, {
      enterprise_id: 'ENT-MH-2026-8891',
    });
    console.log('✅ PATCH /api/dag/node-root/approve:', approveRes.data.status, approveRes.data.message);
    const mpcbNode = approveRes.data.nodes?.find(n => n.id === 'node-mpcb');
    console.log('   → Child node-mpcb status now:', mpcbNode?.status);
  } catch (e) {
    console.error('❌ PATCH /api/dag/node-root/approve failed:', e.message);
  }
}

testEndpoints();
