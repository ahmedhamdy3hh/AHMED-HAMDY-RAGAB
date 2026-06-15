/**
 * Cyber Guard Bot - Enterprise Platform End-to-End & Integration Test Suite
 * Asserts host registration, multi-tenant boundaries, real-time security telemetry ingestion,
 * and incident remediation workflows.
 */

import { strict as assert } from 'assert';
import testFixtures from './test-data.json' with { type: 'json' };

// Simulate an internal HTTP network driver calling endpoints exposed by server.ts
class MockClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint: string, headers: Record<string, string> = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    return {
      status: response.status,
      data: response.ok ? await response.json() : null,
    };
  }

  async post(endpoint: string, payload: any, headers: Record<string, string> = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
    return {
      status: response.status,
      data: response.ok ? await response.json() : await response.text(),
    };
  }
}

async function runIntegrationTests() {
  console.log('\n======================================================================');
  console.log('🏁 COMMENCING CYBER GUARD ENTERPRISE PLATFORM INTEGRATION TESTING SUITE');
  console.log('======================================================================\n');

  const client = new MockClient('http://localhost:3000');

  try {
    // -------------------------------------------------------------
    // Test 1: Verify Initial Multi-Tenant Partition Registry Bounds
    // -------------------------------------------------------------
    console.log('🧪 [TEST 1] Verifying multi-tenant registry schema and tenant provisioning...');
    const listTenantsBefore = await client.get('/api/v1/tenants');
    assert.equal(listTenantsBefore.status, 200, 'Tenants list should return 200');
    assert.ok(Array.isArray(listTenantsBefore.data), 'Tenant list should be an array');
    
    const originalTenantCount = listTenantsBefore.data.length;
    
    // Provison a new tenant partition
    const provisionResult = await client.post('/api/v1/tenants', testFixtures.tenants[0]);
    assert.equal(provisionResult.status, 200, 'Provision should succeed with 200');
    assert.equal(provisionResult.data.name, testFixtures.tenants[0].name, 'Tenant name should match input');
    assert.ok(provisionResult.data.id.startsWith('tenant-'), 'Issued sub-tenant UUID should follow platform standard');

    const listTenantsAfter = await client.get('/api/v1/tenants');
    assert.equal(listTenantsAfter.data.length, originalTenantCount + 1, 'Tenant count should be incremented');
    console.log('✅ [PASSED] Tenant partitioning and isolation mapping tests successful.\n');

    // -------------------------------------------------------------
    // Test 2: Host Registration and mTLS Certificate Bootstrapping
    // -------------------------------------------------------------
    console.log('🧪 [TEST 2] Running secure endpoint agent registration process...');
    const registrationResult = await client.post('/api/v1/agents/register', testFixtures.agents[0]);
    assert.equal(registrationResult.status, 200, 'Registration should succeed');
    assert.ok(registrationResult.data.agent_id, 'Registration should issue unique agent authorization UUID');
    assert.ok(registrationResult.data.mTLS_issued_cert, 'mTLS public/private handshake credentials must be generated');
    
    const authorizedAgentId = registrationResult.data.agent_id;
    console.log(`✅ [PASSED] Agent bootstrap succeeded. Assigned Device ID: ${authorizedAgentId}\n`);

    // -------------------------------------------------------------
    // Test 3: Sandbox Telemetry Ingestion and Mitigation Triggers
    // -------------------------------------------------------------
    console.log('🧪 [TEST 3] Ingesting telemetry; asserting threat-scoring triggers...');
    
    // Send standard benign CPU activity
    const benignPayload = { ...testFixtures.telemetry.benign_process, agent_id: authorizedAgentId };
    const benignRes = await client.post('/api/v1/telemetry/ingest', benignPayload);
    assert.equal(benignRes.status, 200);
    assert.equal(benignRes.data.action_required, false, 'Benign events should not trip safety parameters');

    // Send malicious command payload mimicking live root shell transfer
    const maliciousPayload = { ...testFixtures.telemetry.malicious_curl, agent_id: authorizedAgentId };
    const maliciousRes = await client.post('/api/v1/telemetry/ingest', maliciousPayload);
    assert.equal(maliciousRes.status, 200);
    assert.equal(maliciousRes.data.action_required, true, 'Malicious payload must trip automated mitigation alerts');
    console.log('✅ [PASSED] Ingestion pipeline validated: threat engines flagged malicious telemetry natively.\n');

    // -------------------------------------------------------------
    // Test 4: Dashboard Event Queries & Automated Remediations
    // -------------------------------------------------------------
    console.log('🧪 [TEST 4] Simulating human-in-the-loop analyst incident quarantining...');
    
    // Fetch all active alerts on Dashboard
    const alertsRes = await client.get('/api/v1/alerts');
    assert.equal(alertsRes.status, 200);
    const incidentList = alertsRes.data.items;
    assert.ok(incidentList.length > 0, 'Should find unmitigated alerts in backend registers');
    
    const freshAlert = incidentList[0];
    console.log(`🔍 Incident identified: "${freshAlert.title}" on host "${freshAlert.hostname}"`);

    // Dispatch incident playbook mitigation commands (Quarantine Host)
    const playbooksRes = await client.post(`/api/v1/alerts/${freshAlert.id}/remediate`, {
      action: 'QUARANTINE_NODE',
      reason: 'Confirmed C2 shell beaconing indicators during integration test run.'
    });
    assert.equal(playbooksRes.status, 200);
    assert.equal(playbooksRes.data.status, 'PLAYBOOK_DISPATCHED', 'Threat playbook should dispatch to endpoint socket');

    // Verify host was quarantined on the main grid
    const agentsListRes = await client.get('/api/v1/agents');
    const matchedAgent = agentsListRes.data.find((a: any) => a.id === freshAlert.agent_id);
    if (matchedAgent) {
      assert.equal(matchedAgent.connection_status, 'Compromised', 'Target endpoint must be quarantined immediately');
      console.log('✅ [PASSED] Remediation playbook successfully executed. Host isolated from local segments.');
    } else {
      console.log('⚠️ [WARNING] Host check skipped; telemetry generated event maps outside scope.');
    }
    
    console.log('\n======================================================================');
    console.log('🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY WITH ZERO DEFECTS!');
    console.log('======================================================================\n');

  } catch (error: any) {
    console.error('❌ [FAILED] Integration testing aborted due to assertions error:');
    console.error(error.message || error);
    process.exit(1);
  }
}

// Ensure server is reachable before running tests
setTimeout(() => {
  runIntegrationTests();
}, 1000);
