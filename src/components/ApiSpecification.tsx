import React, { useState } from 'react';
import { API_SPECS, ApiEndpointSpec } from '../specData';
import { Play, RefreshCw, Terminal, Code } from 'lucide-react';

export default function ApiSpecification() {
  const [selectedApi, setSelectedApi] = useState<number>(0);
  const [apiTerminalOutput, setApiTerminalOutput] = useState<string>('// Select an endpoint and click "Simulate Sandbox" above.');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const triggerMockApiCall = (endpoint: ApiEndpointSpec) => {
    setIsSendingRequest(true);
    setApiTerminalOutput('Sending HTTPS request with cryptographic verification...');
    
    setTimeout(() => {
      setApiTerminalOutput(`$ curl -X ${endpoint.method} "https://ingress.cyberguard.net${endpoint.path}" \\
  -H "Content-Type: application/json" \\
  -H "X-Client-Signature: sha256=2a98f10b..."

HTTP/1.1 200 OK
Content-Type: application/json
X-Response-Time: 12ms
Database-Status: REPLICA_SYNCHRONIZED

${endpoint.responseBody}`);
      setIsSendingRequest(false);
    }, 800);
  };

  const apiSpec = API_SPECS[selectedApi];

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 04 // GATEWAY COMPLIANCE</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1">Gateway Endpoint Handshakes & JSON Payloads</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Asynchronous web endpoints for agents and console operators, carrying rigid input payloads and schema responses.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Endpoint Scroller */}
        <div className="xl:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {API_SPECS.map((api, index) => (
            <button
              key={api.path}
              onClick={() => setSelectedApi(index)}
              className={`w-full text-left p-3 border transition-all ${
                selectedApi === index 
                  ? 'bg-zinc-900 border-zinc-700 shadow-sm' 
                  : 'bg-zinc-950/40 hover:bg-zinc-900/50 border-zinc-850'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-sm ${
                  api.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' :
                  api.method === 'POST' ? 'bg-zinc-100 text-zinc-900' :
                  api.method === 'PUT' ? 'bg-amber-500/10 text-amber-400' :
                  api.method === 'WS' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {api.method}
                </span>
                <span className="font-mono text-xs text-zinc-200 truncate">{api.path}</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5 truncate">{api.description}</p>
            </button>
          ))}
        </div>

        {/* Micro Client Simulator */}
        <div className="xl:col-span-7 space-y-4">
          {apiSpec && (
            <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest">Interactive Terminal</span>
                  <h3 className="font-mono text-xs text-zinc-300 mt-1">Simulate REST Gateway Verification</h3>
                </div>

                <button
                  onClick={() => triggerMockApiCall(apiSpec)}
                  disabled={isSendingRequest}
                  className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold rounded-sm text-xs tracking-tight transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingRequest ? (
                    <RefreshCw className="h-3 w-3 animate-spin text-zinc-900" />
                  ) : (
                    <Play className="h-2.5 w-2.5 fill-current text-zinc-900" />
                  )}
                  <span>Simulate Sandbox</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Auth Configuration</span>
                  <div className="p-3 bg-zinc-900/40 w-full border border-zinc-850 rounded-sm text-[11px] text-zinc-400 font-mono leading-relaxed max-h-36 overflow-y-auto">
                    {apiSpec.auth}
                  </div>
                </div>
                {apiSpec.requestBody && (
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">JSON Payload Sample</span>
                    <pre className="p-3 bg-zinc-900/40 w-full border border-zinc-850 rounded-sm text-[10px] text-zinc-300 font-mono leading-relaxed overflow-x-auto max-h-36 overflow-y-auto">
                      {apiSpec.requestBody}
                    </pre>
                  </div>
                )}
              </div>

              {/* Client Output terminal box */}
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Response Logs</span>
                <pre className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-sm text-[10px] text-emerald-400/90 font-mono leading-relaxed overflow-x-auto max-h-48 overflow-y-auto min-h-[140px] whitespace-pre-wrap">
                  {apiTerminalOutput}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
