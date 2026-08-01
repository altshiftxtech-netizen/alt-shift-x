import React from "react";
import { Database, ChevronDown } from "lucide-react";

// Database options for B.O.B.Init PWA builds — each maps to a language-appropriate
// database so the builder can pick whichever fits their stack.
export const DATABASE_OPTIONS = [
  { id: "mongodb", label: "MongoDB", desc: "NoSQL document database", languages: "Node.js · Python · Go · Java" },
  { id: "postgresql", label: "PostgreSQL", desc: "Relational SQL database", languages: "Node.js · Python · Go · Rust" },
  { id: "mysql", label: "MySQL", desc: "Relational SQL database", languages: "Node.js · Python · PHP · Java" },
  { id: "sqlite", label: "SQLite", desc: "Embedded file-based database", languages: "Any language" },
  { id: "supabase", label: "Supabase (Postgres)", desc: "Hosted Postgres + Auth + Realtime", languages: "JS · Dart · Swift" },
  { id: "redis", label: "Redis", desc: "In-memory key-value store", languages: "Node.js · Python · Go" },
];

export default function DatabasePicker({ database, onChange }) {
  const selected = DATABASE_OPTIONS.find((d) => d.id === database);

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-mono text-[#8b949e] uppercase tracking-wider">
        <Database className="w-3.5 h-3.5 text-cyan-400" /> Database
      </div>
      <div className="relative">
        <select
          value={database || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-[#30363d] bg-[#010409] text-[#c9d1d9] font-mono text-xs px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500"
        >
          <option value="">— Select database —</option>
          {DATABASE_OPTIONS.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-[#484f58] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {selected && (
        <div className="text-[10px] font-mono text-[#8b949e] space-y-0.5">
          <p className="text-cyan-400">{selected.desc}</p>
          <p>Languages: {selected.languages}</p>
        </div>
      )}
    </div>
  );
}