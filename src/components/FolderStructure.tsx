import React, { useState } from 'react';
import { MONOREPO_TREE } from '../specData';
import { Code, ChevronRight, ChevronDown } from 'lucide-react';

export default function FolderStructure() {
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({
    'root': true,
    'root/agents': true,
    'root/backend': true,
    'root/dashboard': true,
    'root/infra': true,
  });

  const toggleDirectory = (path: string) => {
    setExpandedDirs(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderNode = (node: any, path: string = 'root') => {
    const currentPath = `${path}/${node.name}`;
    const isExpanded = expandedDirs[path] || expandedDirs[currentPath];
    
    if (node.type === 'file') {
      return (
        <div key={node.name} className="flex items-center space-x-2 py-1 pl-6 hover:bg-zinc-900/30 rounded-sm">
          <Code className="h-3 w-3 text-zinc-500 shrink-0" />
          <span className="text-zinc-400 text-[11.5px] font-mono">{node.name}</span>
        </div>
      );
    }

    return (
      <div key={node.name} className="py-0.5">
        <button
          onClick={() => toggleDirectory(currentPath)}
          className="flex items-center space-x-1.5 w-full text-left py-1 hover:bg-zinc-900/40 rounded-sm px-1 transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-zinc-500 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-zinc-500 shrink-0" />
          )}
          <span className={`text-[11.5px] font-bold uppercase tracking-wider shrink-0 font-mono ${
            node.name === 'agents' ? 'text-emerald-400' :
            node.name === 'backend' ? 'text-zinc-300' :
            node.name === 'dashboard' ? 'text-zinc-300' :
            node.name === 'infra' ? 'text-amber-500/85' : 'text-zinc-400'
          }`}>
            {node.name}/
          </span>
        </button>

        {isExpanded && node.children && (
          <div className="pl-4 ml-1.5 border-l border-zinc-850 mt-1 space-y-0.5">
            {node.children.map((child: any) => renderNode(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 10 // MONOREPO SPEC</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1">Interactive Component Directory Map</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Clean structured monorepo layout separating security agent sources, databases, backend engines, and DevOps deployments.
        </p>
      </div>

      <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-sm">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-4 font-bold">Interactive Explorer</span>
        <div className="font-mono text-xs space-y-0.5">
          {renderNode(MONOREPO_TREE)}
        </div>
      </div>
    </div>
  );
}
