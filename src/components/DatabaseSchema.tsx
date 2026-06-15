import React, { useState } from 'react';
import { DB_SCHEMA } from '../specData';
import { Copy, Check } from 'lucide-react';

interface DatabaseSchemaProps {
  handleCopy: (text: string, label: string) => void;
  copiedText: string | null;
}

export default function DatabaseSchema({ handleCopy, copiedText }: DatabaseSchemaProps) {
  const [selectedTable, setSelectedTable] = useState<string>('threat_alerts');

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">DELIVERABLE 03 // DATA ARCHITECTURE</span>
        <h2 className="text-xl font-bold text-zinc-100 mt-1">Relational Database Schemas & Cache Structures</h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          PostgreSQL/TimescaleDB baseline schemas built with strict constraint structures, RLS policies, and partitioning targets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Database Table Navigator */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-1">Database Tables</span>
          {DB_SCHEMA.map(table => (
            <button
              key={table.name}
              onClick={() => setSelectedTable(table.name)}
              className={`w-full flex items-center justify-between px-3 py-2 border transition-colors ${
                selectedTable === table.name 
                  ? 'bg-zinc-900 text-zinc-100 border-zinc-750 font-medium' 
                  : 'bg-zinc-950/40 hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 border-transparent'
              }`}
              style={{ borderRadius: '2px' }}
            >
              <span className="truncate font-mono text-xs">{table.name}</span>
              <span className="text-[9px] bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                {table.name === 'host_telemetry' ? 'Partitioned' : 'Table'}
              </span>
            </button>
          ))}
        </div>

        {/* Table Details Viewer */}
        <div className="lg:col-span-8 p-5 bg-zinc-950 border border-zinc-805 rounded-md">
          {(() => {
            const tbl = DB_SCHEMA.find(t => t.name === selectedTable);
            if (!tbl) return null;
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-mono text-sm font-bold text-zinc-100">{tbl.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-sans leading-relaxed">{tbl.description}</p>
                  </div>
                  <button 
                    onClick={() => handleCopy(
                      `CREATE TABLE ${tbl.name} (\n` + 
                      tbl.fields.map(f => `  ${f.name} ${f.type} ${f.constraints}`).join(',\n') + 
                      `\n);`, 
                      `SQL-${tbl.name}`
                    )}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-sm text-[10px] font-mono transition-colors flex items-center space-x-1.5"
                  >
                    {copiedText === `SQL-${tbl.name}` ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy SQL DDL</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs text-zinc-400">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-300">
                        <th className="py-2.5 font-bold uppercase text-[10px] tracking-wider">Field</th>
                        <th className="py-2.5 font-bold uppercase text-[10px] tracking-wider">Type</th>
                        <th className="py-2.5 font-bold uppercase text-[10px] tracking-wider">Constraints</th>
                        <th className="py-2.5 font-bold uppercase text-[10px] tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                      {tbl.fields.map(field => (
                        <tr key={field.name} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="py-2.5 font-bold text-zinc-200">{field.name}</td>
                          <td className="py-2.5 text-zinc-400">{field.type}</td>
                          <td className="py-2.5 text-amber-500/80 text-[10px] whitespace-normal max-w-[120px] truncate" title={field.constraints}>
                            {field.constraints || 'None'}
                          </td>
                          <td className="py-2.5 text-zinc-550 max-w-[180px] text-xs font-sans leading-relaxed">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
