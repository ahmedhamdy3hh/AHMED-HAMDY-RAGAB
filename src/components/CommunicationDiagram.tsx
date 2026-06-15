import React from 'react';

export default function CommunicationDiagram() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 02 // SECURE DATAFLOW</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1">mTLS Cryptographic Integration & Control Bus Map</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Rigorous end-to-end communication topology mapping agents, load balancers, messaging streams, and backends.
        </p>
      </div>

      {/* SVG Diagram */}
      <div className="p-4 bg-zinc-950 border border-zinc-805 rounded-md flex justify-center">
        <svg className="w-full max-w-[800px] h-[350px]" viewBox="0 0 800 350" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="350" rx="4" fill="#09090b" />
          
          {/* Grid Lines background */}
          <path d="M 0,50 L 800,50 M 0,100 L 800,100 M 0,150 L 800,150 M 0,200 L 800,200 M 0,250 L 800,250 M 0,300 L 800,300" stroke="#18181b" strokeWidth="1" />
          <path d="M 100,0 L 100,350 M 200,0 L 200,350 M 300,0 L 300,350 M 400,0 L 400,350 M 500,0 L 500,350 M 600,0 L 600,350 M 700,0 L 700,350" stroke="#18181b" strokeWidth="1" />
          
          {/* Windows Agent Node */}
          <rect x="30" y="60" width="140" height="60" rx="2" fill="#18181b" stroke="#10b981" strokeWidth="1" />
          <text x="100" y="85" fill="#f4f4f5" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle" fontWeight="bold">Windows Agent</text>
          <text x="100" y="100" fill="#10b981" fontSize="8.5" fontFamily="ui-monospace, monospace" textAnchor="middle">Go / ETW / syscall</text>

          {/* Linux Agent Node */}
          <rect x="30" y="210" width="140" height="60" rx="2" fill="#18181b" stroke="#10b981" strokeWidth="1" />
          <text x="100" y="235" fill="#f4f4f5" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle" fontWeight="bold">Linux Agent</text>
          <text x="100" y="250" fill="#10b981" fontSize="8.5" fontFamily="ui-monospace, monospace" textAnchor="middle">Go / eBPF / Kprobes</text>

          {/* NGINX Gateway Node */}
          <rect x="250" y="135" width="120" height="70" rx="2" fill="#18181b" stroke="#e4e4e7" strokeWidth="1" />
          <text x="310" y="165" fill="#f4f4f5" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle" fontWeight="bold">NGINX / ALB</text>
          <text x="310" y="180" fill="#a1a1aa" fontSize="8.5" fontFamily="ui-monospace, monospace" textAnchor="middle">mTLS Termination</text>

          {/* FastAPI Backend */}
          <rect x="450" y="135" width="125" height="70" rx="2" fill="#18181b" stroke="#e4e4e7" strokeWidth="1" />
          <text x="512" y="165" fill="#f4f4f5" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle" fontWeight="bold">FastAPI Core</text>
          <text x="512" y="180" fill="#a1a1aa" fontSize="8.5" fontFamily="ui-monospace, monospace" textAnchor="middle">JWT / Async routes</text>

          {/* Cache & Queue Node */}
          <rect x="650" y="45" width="115" height="60" rx="2" fill="#18181b" stroke="#ef4444" strokeWidth="1" />
          <text x="707" y="72" fill="#f4f4f5" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle" fontWeight="bold">Redis Hub</text>
          <text x="707" y="87" fill="#ef4444" fontSize="8.5" fontFamily="ui-monospace, monospace" textAnchor="middle">RateLimits / CeleryQ</text>

          {/* Relational Multi-Tenant Storage */}
          <rect x="650" y="225" width="115" height="60" rx="2" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
          <text x="707" y="250" fill="#f4f4f5" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="middle" fontWeight="bold">TimescaleDB</text>
          <text x="707" y="265" fill="#f59e0b" fontSize="8.5" fontFamily="ui-monospace, monospace" textAnchor="middle">Tenant Isolated / RLS</text>

          {/* Connection lines */}
          <path d="M 170,90 Q 210,90 250,150" stroke="#10b981" strokeWidth="1" strokeDasharray="2 3"/>
          <path d="M 170,240 Q 210,240 250,190" stroke="#10b981" strokeWidth="1" strokeDasharray="2 3"/>
          <text x="210" y="112" fill="#10b981" fontSize="8" fontFamily="ui-monospace, monospace" textAnchor="middle">TCP 443 mTLS</text>

          {/* NLB to FastAPI */}
          <path d="M 370,170 L 450,170" stroke="#e4e4e7" strokeWidth="1.2" />
          <text x="410" y="160" fill="#a1a1aa" fontSize="8" fontFamily="ui-monospace, monospace" textAnchor="middle">HTTP/2</text>

          {/* FastAPI to Redis */}
          <path d="M 575,155 Q 610,130 650,90" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="2 2" />
          <text x="618" y="112" fill="#a1a1aa" fontSize="8" fontFamily="ui-monospace, monospace" textAnchor="middle">AMQP</text>

          {/* FastAPI to TimescaleDB */}
          <path d="M 575,185 Q 610,210 650,245" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="2 2" />
          <text x="615" y="215" fill="#a1a1aa" fontSize="8" fontFamily="ui-monospace, monospace" textAnchor="middle">SQL / TLS</text>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-md">
          <span className="text-emerald-400 font-bold">1. mTLS ENDPOINTS</span>
          <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed font-sans">
            Security boundaries enforce zero-trust endpoint tunnels using RSA-4096 or ECDSA P-384 client keys pinned directly on the endpoint prior to shipment.
          </p>
        </div>
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-md">
          <span className="text-emerald-400 font-bold">2. JWT SECURITY ASSERTION</span>
          <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed font-sans">
            Session keys are validated by stateless JWT headers containing cryptographic nonces to completely eliminate session-hijacking threat paths.
          </p>
        </div>
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-md">
          <span className="text-amber-400 font-bold">3. ENVELOPE ENCRYPTION</span>
          <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed font-sans">
            Stored database parameters leverage dynamic envelope encryption (KMS API tokens wrapping the local AES encryption keys for granular security).
          </p>
        </div>
      </div>
    </div>
  );
}
