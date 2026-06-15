import React from 'react';

export default function ScalabilityStrategy() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 09 // INCIDENT HAZARD RECOVERY</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1">Horizontal Scalability Strategy & Hot-Replica DR Models</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Fault-tolerant system design guaranteeing enterprise business continuity and massive performance scaling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-sm space-y-3">
          <span className="text-emerald-400 font-bold block">1. HORIZONTAL SCALING STRATEGY</span>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
            Redis Event Queues decouple ingestion from processing pools. During high active incident periods (e.g., malware outbreak), Kubernetes Horizontal Pod Autoscaler dynamically scales worker pools up to 100 instances to clear the processing queue without stalling agent heartbeats.
          </p>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-sm space-y-3">
          <span className="text-amber-500/90 font-bold block">2. DISASTER RECOVERY POLICY</span>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
            Database engines replicate asynchronously to cold standby nodes inside a secondary georegion. In the event of primary zone isolation, routing tables swap to the standby node within 30 seconds using DNS health checks.
          </p>
        </div>
      </div>
    </div>
  );
}
