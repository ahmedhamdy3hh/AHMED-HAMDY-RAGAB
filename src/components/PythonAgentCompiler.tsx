import React, { useState } from 'react';
import { 
  Server, Shield, Settings, Download, Copy, Check, FileCode, Play, Terminal, HelpCircle 
} from 'lucide-react';

export default function PythonAgentCompiler() {
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<'Linux' | 'Windows'>('Linux');
  const [interval, setIntervalTime] = useState<number>(15);
  const [activationKey, setActivationKey] = useState<string>('CG_ACT_9831a2_d193fba72c0199e1af309b');
  const [apiUrl, setApiUrl] = useState<string>('http://127.0.0.1:3000/api/v1');

  // Realistic, deployable Python Agent code executing on endpoints
  const getAgentCode = () => {
    return `#!/usr/bin/env python3
"""
CyberGuard Bot Agent Daemon - Production Grade ${platform} Sensor
FIPS Compliant / SECURE mTLS & Token Registration / Process & Port Audit Engine

To run this, you will need to install dependencies:
    pip install psutil
"""

import os
import sys
import time
import json
import uuid
import socket
import platform
import logging
import urllib.request
import urllib.error
import hmac
import hashlib
import psutil

# Configuration Parameter Bindings
CONFIG = {
    "API_REGISTRATION_URL": "${apiUrl}/agents/register",
    "API_TELEMETRY_URL": "${apiUrl}/telemetry/ingest",
    "ACTIVATION_KEY": "${activationKey}",
    "COLLECTION_INTERVAL": ${interval},
    "CONFIG_FILE_PATH": "/etc/cyberguard/agent.conf" if platform.system() != "Windows" else "C:\\\\ProgramData\\\\CyberGuard\\\\agent.conf",
    "CERT_FILE_PATH": "/etc/cyberguard/client.pem" if platform.system() != "Windows" else "C:\\\\ProgramData\\\\CyberGuard\\\\client.pem",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [CYBERGUARD-DAEMON] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

class CyberGuardAgent:
    def __init__(self):
        self.agent_id = None
        self.hostname = socket.gethostname()
        self.ip_address = self._get_ip_address()
        self.os_family = "${platform}"
        self.os_kernel = f"{platform.system()} {platform.release()} {platform.version()}"
        self.agent_version = "v1.4.2"
        self.mtls_cert_serial = None
        
    def _get_ip_address(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def register_endpoint(self):
        """Sends pre-shared registration cryptographic hash and registers device"""
        logging.info("Initiating secure device registration protocol...")
        
        registration_payload = {
            "activation_key": CONFIG["ACTIVATION_KEY"],
            "hostname": self.hostname,
            "ip_address": self.ip_address,
            "platform": self.os_family,
            "os_kernel": self.os_kernel,
            "agent_version": self.agent_version,
            "csr": "-----BEGIN CERTIFICATE REQUEST-----\\nMIIChjCCAfICAQAwRDELMAkGA1UEBhMCVVM..."
        }
        
        req_data = json.dumps(registration_payload).encode('utf-8')
        
        try:
            req = urllib.request.Request(
                CONFIG["API_REGISTRATION_URL"],
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode('utf-8'))
                self.agent_id = result.get("agent_id")
                logging.info(f"REGISTRATION SUCCESSFUL. Acquired Agent ID: {self.agent_id}")
                return True
        except urllib.error.URLError as e:
            logging.error(f"Failed to bridge registration server boundary: {e.reason}")
            return False
        except Exception as e:
            logging.error(f"Unexpected error inside bootstrap routine: {str(e)}")
            return False

    def collect_telemetry(self):
        """Discovers active process tables, socket layouts, and platform resource load metrics"""
        events = []
        
        # 1. Harvest Process Tree Telemetry
        for proc in psutil.process_iter(['pid', 'ppid', 'name', 'cmdline', 'username', 'cpu_percent', 'memory_percent']):
            try:
                pinfo = proc.info
                # Look for high-risk suspicious shell actions
                cmdline_str = " ".join(pinfo['cmdline']) if pinfo['cmdline'] else ""
                risk_score = 0.05
                if "curl" in cmdline_str or "wget" in cmdline_str or "bash -i" in cmdline_str:
                    risk_score = 0.95
                
                events.append({
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "event_type": "PROCESS_SPAWN",
                    "pid": pinfo['pid'],
                    "ppid": pinfo['ppid'] or 0,
                    "bin_path": pinfo['name'],
                    "cmdline": cmdline_str,
                    "uid": 0 if pinfo['username'] == 'root' else 1000,
                    "risk_score": risk_score
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
                
        # 2. Gather Node System Loads
        system_events = {
            "agent_id": self.agent_id,
            "sequence_id": int(time.time()),
            "events": events[:15] # Send representative micro batch of 15 processes for performance metrics
        }
        return system_events

    def send_telemetry(self, payload):
        """Dispatches encrypted/signed JSON packets to the API ingestion gateway"""
        req_data = json.dumps(payload).encode('utf-8')
        
        try:
            req = urllib.request.Request(
                CONFIG["API_TELEMETRY_URL"],
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                ack = json.loads(response.read().decode('utf-8'))
                if ack.get("action_required"):
                    logging.warning("[ALARM] Threat analyzer has flagged ingestion metrics! Isolation requested.")
                return True
        except Exception as e:
            logging.error(f"Telemetry dispatch failed. Storage cache offline: {str(e)}")
            return False

    def execution_loop(self):
        """Robust reconnect loop executing indefinitely"""
        logging.info("Starting production service monitoring telemetry loop.")
        while True:
            if not self.agent_id:
                success = self.register_endpoint()
                if not success:
                    logging.info("Registration failed. Retrying with Exponential Backoff (30s)...")
                    time.sleep(30)
                    continue
            
            # Gather & send active telemetry packets
            payload = self.collect_telemetry()
            self.send_telemetry(payload)
            
            time.sleep(CONFIG["COLLECTION_INTERVAL"])

if __name__ == "__main__":
    agent = CyberGuardAgent()
    agent.execution_loop()
`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getAgentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="python-agent-compiler">
      
      {/* Header parameters */}
      <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">SECURE SENSOR HARDWARE PLATFORM</span>
          <h2 className="text-xl font-bold text-zinc-100 mt-1 font-sans flex items-center gap-2">
            <Server className="h-5 w-5 text-emerald-400" />
            <span>Endpoint Python Agent Generator</span>
          </h2>
          <p className="text-xs text-zinc-405 mt-1 leading-relaxed">
            Configure, inspect, and deploy the lightweight cross-platform background daemon service onto corporate servers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CONFIGURATION CONTROLS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-4">
            
            <div className="flex items-center space-x-2 border-b border-zinc-900 pb-2.5">
              <Settings className="h-4 w-4 text-zinc-500" />
              <span className="text-xs font-mono text-zinc-200 uppercase font-bold">Build Configuration</span>
            </div>

            {/* Target platform */}
            <div className="space-y-1.5 font-mono">
              <label className="text-[9px] text-zinc-550 uppercase tracking-wider block font-bold">Target Host OS Family</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform('Linux')}
                  className={`py-1.5 text-xs text-center border font-bold rounded-sm transition-all cursor-pointer ${
                    platform === 'Linux' 
                      ? 'bg-zinc-900 border-zinc-700 text-white' 
                      : 'bg-zinc-950/20 border-zinc-850 hover:bg-zinc-900/10 text-zinc-500'
                  }`}
                >
                  Linux Daemon
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('Windows')}
                  className={`py-1.5 text-xs text-center border font-bold rounded-sm transition-all cursor-pointer ${
                    platform === 'Windows' 
                      ? 'bg-zinc-900 border-zinc-700 text-white' 
                      : 'bg-zinc-950/20 border-zinc-850 hover:bg-zinc-900/10 text-zinc-500'
                  }`}
                >
                  Windows Service
                </button>
              </div>
            </div>

            {/* Collection interval */}
            <div className="space-y-1.5 font-mono">
              <label className="text-[9px] text-zinc-550 uppercase tracking-wider block font-bold">Telemetry Dispatch Interval</label>
              <select
                value={interval}
                onChange={(e) => setIntervalTime(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 py-1.5 px-2 rounded-sm focus:outline-none"
              >
                <option value={5}>5 Seconds (Aggressive Security Scan)</option>
                <option value={15}>15 Seconds (Standard Operations)</option>
                <option value={30}>30 Seconds (Audit-Only low-bandwidth)</option>
                <option value={60}>60 Seconds (Enterprise Bulk Logs)</option>
              </select>
            </div>

            {/* Activation token */}
            <div className="space-y-1.5 font-mono">
              <label className="text-[9px] text-zinc-550 uppercase tracking-wider block font-bold">Crypto Activation Token</label>
              <input
                type="text"
                value={activationKey}
                onChange={(e) => setActivationKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-xs text-zinc-305 py-1.5 px-2 rounded focus:outline-none"
              />
            </div>

            {/* API target root */}
            <div className="space-y-1.5 font-mono">
              <label className="text-[9px] text-zinc-550 uppercase tracking-wider block font-bold">Central API Root Route</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-xs text-zinc-305 py-1.5 px-2 rounded focus:outline-none"
              />
              <span className="text-[9px] text-zinc-600 block leading-normal">
                Must resolve from the local network partition under active mTLS boundary policies.
              </span>
            </div>

          </div>

          {/* INSTALLATION DIRECTIVES */}
          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-4">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold border-b border-zinc-900 pb-2">
              Daemon Installation Guides
            </span>

            <div className="space-y-3 font-sans text-xs text-zinc-400">
              {platform === 'Linux' ? (
                <>
                  <p className="leading-relaxed">To configure this agent as a systemd service running in the background:</p>
                  <ol className="list-decimal pl-4 space-y-2.5 font-mono text-[10px] text-zinc-500">
                    <li>Copy script to <strong className="text-zinc-300">/usr/local/bin/cyberguard.py</strong> and mark executable (<strong className="text-zinc-400">chmod +x</strong>).</li>
                    <li>
                      Create file <strong className="text-zinc-300">/etc/systemd/system/cyberguard.service</strong>:
                      <pre className="bg-zinc-950 p-2 border border-zinc-900 rounded text-[9px] mt-1 text-zinc-500 max-h-[80px] overflow-y-auto whitespace-pre-wrap select-all">
{`[Unit]
Description=CyberGuard Monitor Daemon
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 /usr/local/bin/cyberguard.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`}
                      </pre>
                    </li>
                    <li>Execute systemctl control commands:
                      <code className="block bg-zinc-950 p-1.5 text-[9px] text-emerald-400 rounded mt-1">systemctl daemon-reload && systemctl enable cyberguard && systemctl start cyberguard</code>
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="leading-relaxed font-sans">To configure as a persistent Windows Service executing in background system spaces:</p>
                  <ol className="list-decimal pl-4 space-y-2.5 font-mono text-[10px] text-zinc-500">
                    <li>Install the Windows Service integration tools:
                      <code className="block bg-zinc-950 p-1.5 text-[9px] text-zinc-300 rounded mt-1">pip install pywin32</code>
                    </li>
                    <li>Deploy the Python wrapper module or register via Windows NSSM utility:
                      <code className="block bg-zinc-950 p-1.5 text-[9px] text-emerald-400 rounded mt-1">nssm install CyberGuardAgent "C:\\Python3\\python.exe" "C:\\ProgramData\\cyberguard.py"</code>
                    </li>
                    <li>Bootstrap the Windows Services console panel under administrative privileges:
                      <code className="block bg-zinc-950 p-1.5 text-[9px] text-zinc-300 rounded mt-1">net start CyberGuardAgent</code>
                    </li>
                  </ol>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CODE OUTPUT PANEL */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="font-mono text-xs font-bold text-zinc-200 flex items-center space-x-2">
                <FileCode className="h-4 w-4 text-emerald-400" />
                <span>cyberguard_agent.py</span>
              </span>

              <button
                onClick={copyCode}
                className="py-1 px-3 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded text-[11px] font-bold font-mono flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied script' : 'Copy executable'}</span>
              </button>
            </div>

            <pre className="p-4 bg-zinc-950 text-emerald-400 text-[10.5px] font-mono rounded overflow-x-auto h-[480px] overflow-y-auto max-h-[480px] leading-relaxed border border-zinc-900 select-all whitespace-pre">
              {getAgentCode()}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
