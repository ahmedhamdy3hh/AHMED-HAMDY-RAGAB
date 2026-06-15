import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, ShieldCheck, Key, Plus, Calendar, Layers, ShieldAlert, CheckCircle, RefreshCw 
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  tier: 'Standard' | 'Enterprise' | 'FedRAMP-High';
  encryption_key_arn: string;
  created_at: string;
}

export default function CompanyTenantConsole() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [name, setName] = useState('');
  const [tier, setTier] = useState<'Standard' | 'Enterprise' | 'FedRAMP-High'>('Enterprise');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/v1/tenants');
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          console.warn('[Tenants] Non-JSON tenants response received; backend might be starting up.');
          return;
        }
        const data = await res.json();
        setTenants(data);
      }
    } catch (e) {
      console.error('Error listing tenants:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setStatusMessage(null);
    try {
      const res = await fetch('/api/v1/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tier,
          encryption_key_arn: encryptionKey
        })
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          setStatusMessage('[WARNING] Received non-JSON response from server during creation. Please try again.');
          return;
        }
        const data = await res.json();
        setStatusMessage(`[SUCCESS] Tenant organization "${data.name}" provisioned beautifully!`);
        setName('');
        setEncryptionKey('');
        fetchTenants();
      } else {
        setStatusMessage('[ERROR] Failed to populate new company profile.');
      }
    } catch (err: any) {
      setStatusMessage(`[ERROR] Direct bridge broke: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Querying Tenets DB...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="company-tenant-console">
      
      {/* Description text */}
      <div className="border-b border-zinc-805 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">CRITICAL LOGICAL BOUNDARY ENDPOINT</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1 font-sans flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-400" />
          <span>Multi-Tenant Enterprise Console</span>
        </h2>
        <p className="text-xs text-zinc-405 mt-1 leading-relaxed">
          Manage distinct organizations, enforce cryptographically isolated logical boundary limits, and configure HSM-backed envelope encryption.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ADD NEW TENANT PROVISIONING FORM */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-4">
            
            <div className="flex items-center space-x-2 border-b border-zinc-900 pb-2.5">
              <Plus className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-mono text-zinc-300 uppercase font-bold">Register New Enterprise Tenant</span>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 font-mono text-xs">
              
              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-550 uppercase tracking-wider block font-bold">Enterprise Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Defense Inc"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-855 text-xs text-zinc-305 py-1.5 px-2.5 rounded focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-550 uppercase tracking-wider block font-bold">Billing Service Tier</label>
                <select
                  value={tier}
                  onChange={(e: any) => setTier(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-855 text-xs text-zinc-305 py-1.5 px-2 rounded focus:outline-none"
                >
                  <option value="Standard">Standard Tier (Shared CPU clusters)</option>
                  <option value="Enterprise">Enterprise Tier (Dedicated DB partition)</option>
                  <option value="FedRAMP-High">FedRAMP-High Tier (Hardened HSM clusters)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-550 uppercase tracking-wider block font-bold">KMS Envelope Key ARN</label>
                <input
                  type="text"
                  placeholder="arn:aws:kms:region:account:key/..."
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-855 text-xs text-zinc-305 py-1.5 px-2.5 rounded focus:outline-none"
                />
                <span className="text-[9px] text-zinc-600 block leading-normal">
                  KMS key used to encrypt raw process streams prior to cold DB indexing. Left blank to use system managed keys.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-sans font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Provision Tenant Partition
              </button>
            </form>

            {statusMessage && (
              <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded font-mono text-[9.5px] text-emerald-400 break-all leading-normal whitespace-pre-wrap select-text">
                {statusMessage}
              </div>
            )}

          </div>
        </div>

        {/* ACTIVE COPORTIONS TABLE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-zinc-950 border border-zinc-805 rounded-md p-5 space-y-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold border-b border-zinc-900 pb-2">
              Registered Corporate Tenant Sandbox Isolation Log
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px] text-zinc-400">
                <thead>
                  <tr className="bg-zinc-900/40 border-b border-zinc-850 text-zinc-350">
                    <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider">Tenant ID</th>
                    <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider">Enterprise Entity Name</th>
                    <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider">KMS Crypt Encryption</th>
                    <th className="p-2.5 font-bold uppercase text-[9px] tracking-wider">Tier</th>
                    <th className="p-2.5 text-right font-bold uppercase text-[9px] tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {tenants.map(t => (
                    <tr key={t.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="p-2.5 text-zinc-500 text-[10px] truncate max-w-[120px]" title={t.id}>{t.id}</td>
                      <td className="p-2.5 font-bold text-zinc-200">{t.name}</td>
                      <td className="p-2.5 text-[9.5px] text-zinc-600 truncate max-w-[190px]" title={t.encryption_key_arn}>
                        {t.encryption_key_arn || 'DEFAULT HSM MANAGED'}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded-sm uppercase tracking-wide border ${
                          t.tier === 'FedRAMP-High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          t.tier === 'Enterprise' ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' :
                          'bg-zinc-800 text-zinc-400 border-zinc-700/50'
                        }`}>
                          {t.tier}
                        </span>
                      </td>
                      <td className="p-2.5 text-right text-zinc-550 text-[10.5px]">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded text-zinc-500 text-[10px] space-y-2 leading-relaxed">
              <span className="font-bold uppercase text-zinc-430 block">💡 Row Isolation Security Guarantee</span>
              <p>
                Row-Level Security (RLS) is automatically enabled on the PostgreSQL schema matching the <code className="text-zinc-400">tenant_id</code> UUID parameter. 
                All inbound queries are filtered through session scopes, making tenant data breaches programmatically impossible at the infrastructure boundary.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
