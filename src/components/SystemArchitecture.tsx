import React from 'react';

export default function SystemArchitecture() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 01 // PRODUCTION SPECIFICATION</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1 font-sans">Multi-Tenant EDR Core Subsystem Architecture</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Platform baseline engineering diagram outlining continuous asynchronous telemetry ingestion, tenant-bound worker separation, and automated AI analysis models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-md">
            <h3 className="font-mono text-xs font-bold text-zinc-200 flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>1. Kernel Interception & Agent Daemons</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Lightweight agent compiled to static machine binaries (Go/C++). 
            </p>
            <ul className="text-xs text-zinc-500 mt-1.5 space-y-1.5 list-disc pl-5 font-sans">
              <li><strong className="text-zinc-300">Linux:</strong> Dynamic kernel probe hooks utilizing eBPF (Extended Berkeley Packet Filter) bytecode maps for direct tracing of process lifecycles and syscall manipulation, preventing userland bypass.</li>
              <li><strong className="text-zinc-300">Windows:</strong> Subscribed ETW (Event Tracing for Windows) kernel sessions and custom WMI system event listeners tracking persistence run keys, WinAPI DLL loading, and privilege assertions.</li>
            </ul>
          </div>

          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-md">
            <h3 className="font-mono text-xs font-bold text-zinc-200 flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>2. FastAPI Async Event Ingestion API</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Asynchronous API gateways written using Python ASGI processes. Integrates stateless schema mapping and multi-tenant parsing pipelines.
            </p>
            <ul className="text-xs text-zinc-500 mt-1.5 space-y-1.5 list-disc pl-5 font-sans">
              <li>Direct JWT claim evaluation verifying tenant limits.</li>
              <li>Bulk endpoint telemetry deserialized dynamically.</li>
              <li>Raw log buffering routed to Redis event streams to isolate database write workloads.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-md">
            <h3 className="font-mono text-xs font-bold text-zinc-200 flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>3. Asynchronous Pipeline & AI Analysis</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Celery workers running asynchronously processing buffered telemetry queues from Redis.
            </p>
            <ul className="text-xs text-zinc-500 mt-1.5 space-y-1.5 list-disc pl-5 font-sans">
              <li><strong className="text-zinc-300">Anomaly Engine:</strong> Evaluates behavior trees using sliding time-window threat rules.</li>
              <li><strong className="text-zinc-300">Automated Playbook trigger:</strong> Matches security patterns and auto-transmits node quarantine payloads back to active agents via persistent WebSockets.</li>
              <li><strong className="text-zinc-300">Gemini LLM Inference:</strong> Synthesizes incident parameters into remediation steps and executive summaries on critical hits.</li>
            </ul>
          </div>

          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-md">
            <h3 className="font-mono text-xs font-bold text-zinc-200 flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-450" style={{ backgroundColor: '#fb7185' }} />
              <span>4. Durable Database Layer</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              PostgreSQL partitioned cluster serving as the relational transactional backbone:
            </p>
            <ul className="text-xs text-zinc-500 mt-1.5 space-y-1.5 list-disc pl-5 font-sans">
              <li>Strict row-level security (RLS) policies scoped explicitly by <code className="text-emerald-400 font-mono">tenant_id</code>.</li>
              <li>TimescaleDB extension partitioning table structures of primary <code className="text-zinc-300 font-mono">host_telemetry</code> events into daily slices.</li>
              <li>Redis acting as distributed key-value storage for access-token blocklists and rate limit buckets.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
