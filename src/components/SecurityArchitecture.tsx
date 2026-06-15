import React from 'react';
import { Lock, UserCheck, Activity, AlertTriangle } from 'lucide-react';

export default function SecurityArchitecture() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 05 // THREAT MODELING</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1">Multi-Tenant Boundary Controls & RBAC Context</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Platform specifications utilizing hardware security modules, anti-tampering keys, and strict RBAC controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4 space-y-3">
          <div className="flex items-center space-x-2 text-zinc-200">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-bold tracking-wide uppercase text-[11px]">Tenant Sandbox Boundary</span>
          </div>
          <p className="text-zinc-400 leading-normal text-[11px] font-sans leading-relaxed">
            Data isolation is preserved at rest via schema separation and mandatory PostgreSQL Row Level Security (RLS) policies. Every backend query forces validation bounds against parsed JWT tenant claims.
          </p>
          <div className="p-2.5 bg-zinc-900/40 w-full border border-zinc-850 rounded-sm text-[10px] text-zinc-400 leading-relaxed overflow-x-auto">
            <code>ALTER TABLE host_telemetry ENABLE ROW LEVEL SECURITY;<br />
            CREATE POLICY tenant_isolation ON host_telemetry TO soc_role USING (tenant_id = current_setting('app.current_tenant_id'));</code>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4 space-y-3">
          <div className="flex items-center space-x-2 text-zinc-200">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-bold tracking-wide uppercase text-[11px]">Mandatory MFA & RBAC</span>
          </div>
          <p className="text-zinc-400 leading-normal text-[11px] font-sans leading-relaxed">
            Two-factor (TOTP SHA-256) validation is enforced natively during login middleware. Roles map directly to discrete assignment matrices evaluated on all routing controllers.
          </p>
          <div className="p-2.5 bg-zinc-900/40 w-full border border-zinc-850 rounded-sm text-[10px] text-zinc-500 leading-relaxed">
            <span className="text-zinc-300 font-bold block">SOC_Manager: <span className="text-zinc-400 font-normal">CRUD Alerts, Quarantine Host</span></span>
            <span className="text-zinc-300 font-bold block mt-1">SOC_Analyst: <span className="text-zinc-400 font-normal">CRUD Alerts, Read Telemetry</span></span>
            <span className="text-zinc-300 font-bold block mt-1">Auditor: <span className="text-zinc-400 font-normal">Read Audit Logs exclusively</span></span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4 space-y-3">
          <div className="flex items-center space-x-2 text-zinc-200">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-bold tracking-wide uppercase text-[11px]">Anti-Tamper & Signing</span>
          </div>
          <p className="text-zinc-400 leading-normal text-[11px] font-sans leading-relaxed">
            Every telemetry chunk dispatched carries an HMAC signature calculated by the agent using their private key. If signatures do not align during API payload evaluation, the transaction is dropped.
          </p>
          <div className="p-2.5 bg-zinc-900/40 w-full border border-zinc-850 rounded-sm text-[10px] text-zinc-400 leading-relaxed overflow-x-auto">
            <code>Signature = HMAC-SHA256(Nonce + Timestamp + Payload, AgentPrivateKey)</code>
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-950 border border-rose-950/40 rounded-md text-xs leading-relaxed font-mono">
        <div className="flex items-center space-x-2 text-rose-450 font-bold mb-2">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          <span className="tracking-widest uppercase text-[11px]">SECURE CREDENTIAL MANAGEMENT ENVELOPE</span>
        </div>
        <p className="font-sans text-zinc-400 text-xs">
          Secret keys, database certificates, and SSH access key rings are exclusively injected by secure storage managers like <strong className="text-zinc-200">HashiCorp Vault</strong> or AWS Secrets Manager inside container runtime.
        </p>
      </div>
    </div>
  );
}
