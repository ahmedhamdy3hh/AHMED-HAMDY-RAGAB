import React, { useState } from 'react';
import { 
  Activity, Shield, Server, Database, Code, Workflow, Lock, 
  GitBranch, Terminal, Layers, Search, Copy, Check, HardDrive, 
  AlertOctagon, Sparkles, Building2, Radio, Play, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DB_SCHEMA, API_SPECS, MONOREPO_TREE } from './specData';

// Import modular deliverables components
import SystemArchitecture from './components/SystemArchitecture';
import CommunicationDiagram from './components/CommunicationDiagram';
import DatabaseSchema from './components/DatabaseSchema';
import ApiSpecification from './components/ApiSpecification';
import SecurityArchitecture from './components/SecurityArchitecture';
import DeploymentArchitecture from './components/DeploymentArchitecture';
import DockerArchitecture from './components/DockerArchitecture';
import MonitoringArchitecture from './components/MonitoringArchitecture';
import ScalabilityStrategy from './components/ScalabilityStrategy';
import FolderStructure from './components/FolderStructure';

// Import live interactive components
import TacticalDashboard from './components/TacticalDashboard';
import AiIncidentForensics from './components/AiIncidentForensics';
import PythonAgentCompiler from './components/PythonAgentCompiler';
import CompanyTenantConsole from './components/CompanyTenantConsole';

export default function App() {
  const [activeTab, setActiveTab ] = useState<string>('tactical-dashboard');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Modern Navigation Schema categorized between Live HUD and Specs
  const liveTabs = [
    { id: 'tactical-dashboard', label: 'Tactical Ops Center', icon: Radio, category: 'Live Operations' },
    { id: 'ai-forensics', label: 'AI Forensic Copilot', icon: Sparkles, category: 'Live Operations' },
    { id: 'agent-compiler', label: 'Python Agent Compiler', icon: Code, category: 'Live Operations' },
    { id: 'tenant-console', label: 'Multi-Tenant Console', icon: Building2, category: 'Live Operations' },
  ];

  const specTabs = [
    { id: 'system-architecture', label: '1. System Architecture', icon: Layers, category: 'Platform Specifications' },
    { id: 'communication-diagram', label: '2. Communication Map', icon: Workflow, category: 'Platform Specifications' },
    { id: 'database-schema', label: '3. DB & Storage Schema', icon: Database, category: 'Platform Specifications' },
    { id: 'api-specification', label: '4. REST/WS Gateway Specs', icon: KeyIcon, category: 'Platform Specifications' },
    { id: 'security-architecture', label: '5. DevSecOps & Security', icon: Lock, category: 'Platform Specifications' },
    { id: 'deployment', label: '6. Multi-Env Deployments', icon: Server, category: 'Platform Specifications' },
    { id: 'docker', label: '7. Dockerized Infra', icon: Terminal, category: 'Platform Specifications' },
    { id: 'monitoring', label: '8. Telemetry & Log Stack', icon: Activity, category: 'Platform Specifications' },
    { id: 'scalability', label: '9. Scalability & DR', icon: GitBranch, category: 'Platform Specifications' },
    { id: 'folder-structure', label: '10. Monorepo Directories', icon: HardDrive, category: 'Platform Specifications' },
  ];

  // Map KeyIcon to ShieldCheck for neat representation
  function KeyIcon(props: any) {
    return <ShieldCheck {...props} />;
  }

  const allTabs = [...liveTabs, ...specTabs];

  const filteredLiveTabs = liveTabs.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSpecTabs = specTabs.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-emerald-500/10 selection:text-emerald-400" id="cyberguard-root">
      
      {/* Structural background grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Dynamic header navigation */}
      <header className="border-b border-zinc-850 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4" id="cyberguard-header">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center rounded-sm shrink-0">
            <div className="w-4 h-4 border-2 border-zinc-950 rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-sans text-base font-bold tracking-tight text-white uppercase">CYBER GUARD BOT</h1>
              <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-sm">
                v1.1.0 STABLE
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-sans">Enterprise Extended Detection & Incident Response (XDR) Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Filter console panels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full md:w-60 bg-zinc-900/40 border border-zinc-850 rounded-sm text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-mono"
            />
          </div>
          <button 
            onClick={() => handleCopy(JSON.stringify({ DB_SCHEMA, API_SPECS, MONOREPO_TREE }, null, 2), 'Unified Schema Config JSON')}
            className="px-3 py-1.5 bg-zinc-900/60 w-full md:w-auto hover:bg-zinc-800 border border-zinc-850 rounded-sm text-xs font-mono text-zinc-400 hover:text-white transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {copiedText === 'Unified Schema Config JSON' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied JSON!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-500" />
                <span>Download System Specs</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-900/20 border border-zinc-805 rounded-md p-4">
            
            {/* 1. Live Operations HUD */}
            <div className="space-y-1 mb-5">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-900">
                <span className="text-[9.5px] font-mono uppercase text-emerald-400 tracking-wider font-bold">Live Operations HUD</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <nav className="space-y-1">
                {filteredLiveTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-sm text-left transition-all text-xs font-mono relative group cursor-pointer ${
                        isActive 
                          ? 'bg-zinc-900/40 text-zinc-100 border-l-2 border-emerald-500 font-semibold shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                      }`}
                    >
                      <TabIcon className={`h-3.5 w-3.5 shrink-0 transition-colors ${isActive ? 'text-emerald-450' : 'text-zinc-550 group-hover:text-zinc-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 2. Platform Schematics group */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-905">
                <span className="text-[9.5px] font-mono uppercase text-zinc-450 tracking-wider font-bold">Engineering Schematics</span>
                <span className="text-[8.5px] font-mono text-zinc-550">Draft v1</span>
              </div>
              <nav className="space-y-1 max-h-[290px] overflow-y-auto pr-1">
                {filteredSpecTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-sm text-left transition-all text-xs font-mono relative group cursor-pointer ${
                        isActive 
                          ? 'bg-zinc-900/40 text-zinc-100 border-l-2 border-emerald-500 font-semibold shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                      }`}
                    >
                      <TabIcon className={`h-3.5 w-3.5 shrink-0 transition-colors ${isActive ? 'text-emerald-450' : 'text-zinc-555 group-hover:text-zinc-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
                {allTabs.filter(tab => tab.label.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="text-center py-6 text-zinc-650 text-xs font-mono">
                    Zero items match filter.
                  </div>
                )}
              </nav>
            </div>

          </div>

          {/* Quick Threat Intel constraints card */}
          <div className="bg-zinc-900/20 border border-zinc-855 rounded-md p-4 text-xs font-mono">
            <div className="flex items-center space-x-2 text-rose-500 mb-3">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span className="font-bold uppercase tracking-wider">Threat Defense Context</span>
            </div>
            <p className="text-zinc-400 leading-relaxed mb-4 text-[11px] font-sans">
              CyberGuard leverages robust mTLS tunnel boundaries with custom eBPF process-interceptor loops to provide millisecond responsive defensive actions.
            </p>
            <div className="p-3 bg-zinc-950/45 rounded-sm border border-zinc-850 text-[10px] text-zinc-500 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>mTLS Handshake:</span>
                <span className="text-emerald-400 font-bold uppercase">Enforced</span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-900/50 pt-1.5">
                <span>AI Core engine:</span>
                <span className="text-emerald-400 font-bold uppercase">Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Deliverable Details Display Box */}
        <div className="lg:col-span-9 bg-zinc-953">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="bg-zinc-900/10 border border-zinc-800 rounded-md p-6 min-h-[580px]"
            >
              <h2 className="sr-only">Deliverable Details</h2>
              {/* Interactive Dashboard Tabs */}
              {activeTab === 'tactical-dashboard' && <TacticalDashboard />}
              {activeTab === 'ai-forensics' && <AiIncidentForensics />}
              {activeTab === 'agent-compiler' && <PythonAgentCompiler />}
              {activeTab === 'tenant-console' && <CompanyTenantConsole />}

              {/* Specification Tabs */}
              {activeTab === 'system-architecture' && <SystemArchitecture />}
              {activeTab === 'communication-diagram' && <CommunicationDiagram />}
              {activeTab === 'database-schema' && <DatabaseSchema handleCopy={handleCopy} copiedText={copiedText} />}
              {activeTab === 'api-specification' && <ApiSpecification />}
              {activeTab === 'security-architecture' && <SecurityArchitecture />}
              {activeTab === 'deployment' && <DeploymentArchitecture />}
              {activeTab === 'docker' && <DockerArchitecture handleCopy={handleCopy} copiedText={copiedText} />}
              {activeTab === 'monitoring' && <MonitoringArchitecture />}
              {activeTab === 'scalability' && <ScalabilityStrategy />}
              {activeTab === 'folder-structure' && <FolderStructure />}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Modern Minimalistic Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-955 py-10 mt-16 px-6 text-center text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
        <p>© 2026 CYBER GUARD BOT RADAR OPS MONITOR.</p>
        <p className="mt-1 text-zinc-650">INTEGRATED UNDER NIST 800-53 R5 COMPLIANCE DOMAIN</p>
      </footer>
    </div>
  );
}
