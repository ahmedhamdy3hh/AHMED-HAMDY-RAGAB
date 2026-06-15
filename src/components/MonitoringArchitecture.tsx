import React from 'react';
import { Activity, Terminal } from 'lucide-react';

export default function MonitoringArchitecture() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 08 // REALTIME OBSERVABILITY</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1 font-sans">Prometheus Metric Exporter Configuration</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Comprehensive observability telemetry configurations routing system-health and incident queues directly to Grafana alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-mono text-xs font-bold text-zinc-200 flex items-center space-x-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Core Operational Metrics Handled</span>
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-sans text-zinc-400">
            The platform exposes standardized Prometheus scraping endpoints `/metrics` outputting operational performance:
          </p>
          <div className="p-4 bg-zinc-950 border border-zinc-805 rounded-sm font-mono text-xs space-y-2.5 text-zinc-400">
            <div>
              <code className="text-emerald-400 font-bold block mb-1">cyberguard_agent_heartbeat_miss_count</code>
              <span className="text-[11px] text-zinc-500 font-sans leading-relaxed">Tracks offline managed servers with zero-latency heartbeat loops.</span>
            </div>
            <div className="pt-2 border-t border-zinc-900">
              <code className="text-zinc-350 font-bold block mb-1">cyberguard_telemetry_events_ingested_total</code>
              <span className="text-[11px] text-zinc-500 font-sans leading-relaxed">Continuous incrementor of incoming event blocks.</span>
            </div>
            <div className="pt-2 border-t border-zinc-900">
              <code className="text-amber-400 font-bold block mb-1">cyberguard_ai_analysis_latency_seconds</code>
              <span className="text-[11px] text-zinc-500 font-sans leading-relaxed">Aggressive monitoring of Gemini summary generation loops.</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-xs font-bold text-zinc-200 flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span>Metric Scraper Configuration Map</span>
          </h3>
          <pre className="p-4 bg-zinc-950 rounded border border-zinc-805 text-[10px] font-mono whitespace-pre text-zinc-400 overflow-x-auto leading-relaxed">
{`# prometheus.yml
scrape_configs:
  - job_name: 'cyberguard-backend'
    scrape_interval: 5s
    metrics_path: '/api/v1/metrics'
    static_configs:
      - targets: ['api-backend.cyberguard.net:3000']
    tls_config:
      ca_file: /etc/ssl/certs/internal_ca.crt
      cert_file: /etc/ssl/certs/prometheus.crt
      key_file: /etc/ssl/certs/prometheus.key`}
          </pre>
        </div>
      </div>
    </div>
  );
}
