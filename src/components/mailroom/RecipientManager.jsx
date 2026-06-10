import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Upload, Loader2, Plus, Trash2, FolderPlus, Mail, X, CheckSquare, Square, FolderInput } from "lucide-react";

const AUDIENCES = ["newsletter", "all_users", "paying", "builders"];

// Parse a simple CSV: supports columns email,name (header optional).
function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const first = lines[0].toLowerCase();
  const hasHeader = first.includes("email");
  const rows = hasHeader ? lines.slice(1) : lines;
  return rows.map((line) => {
    const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^"|"$/g, ""));
    const emailIdx = parts.findIndex((p) => p.includes("@"));
    const email = emailIdx >= 0 ? parts[emailIdx] : parts[0];
    const name = parts.find((p, i) => i !== emailIdx && p && !p.includes("@")) || "";
    return { email, name };
  }).filter((r) => r.email && r.email.includes("@"));
}

export default function RecipientManager() {
  const [subs, setSubs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importAudience, setImportAudience] = useState("newsletter");
  const [importGroup, setImportGroup] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [activeGroup, setActiveGroup] = useState("all");
  const [importResult, setImportResult] = useState(null);

  // Batch selection
  const [selected, setSelected] = useState(new Set());
  const [working, setWorking] = useState(false);
  const [moveTarget, setMoveTarget] = useState("");

  const load = async () => {
    const [s, g] = await Promise.all([
      base44.entities.EmailSubscriber.list("-created_date", 500).catch(() => []),
      base44.entities.EmailGroup.list("-created_date", 100).catch(() => []),
    ]);
    setSubs(s || []); setGroups(g || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const text = await file.text();
    const rows = parseCsv(text);
    const existing = new Set(subs.map((s) => (s.email || "").toLowerCase()));
    const fresh = rows.filter((r) => !existing.has(r.email.toLowerCase()));
    let created = 0;
    for (const r of fresh) {
      await base44.entities.EmailSubscriber.create({
        email: r.email,
        name: r.name || undefined,
        audience: importAudience,
        group_ids: importGroup ? [importGroup] : [],
        source: "import",
        subscribed: true,
      }).then(() => created++).catch(() => {});
    }
    setImportResult({ total: rows.length, created, skipped: rows.length - created });
    setImporting(false);
    e.target.value = "";
    await load();
  };

  const createGroup = async () => {
    if (!newGroup.trim()) return;
    setCreatingGroup(true);
    await base44.entities.EmailGroup.create({ name: newGroup.trim() }).catch(() => {});
    setNewGroup("");
    setCreatingGroup(false);
    await load();
  };

  const deleteGroup = async (id) => {
    if (!window.confirm("Delete this group? Recipients are kept.")) return;
    await base44.entities.EmailGroup.delete(id).catch(() => {});
    if (activeGroup === id) setActiveGroup("all");
    await load();
  };

  const removeSub = async (id) => {
    await base44.entities.EmailSubscriber.delete(id).catch(() => {});
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    await load();
  };

  const visible = activeGroup === "all"
    ? subs
    : subs.filter((s) => (s.group_ids || []).includes(activeGroup));

  // ── Batch selection helpers ──
  const toggleOne = (id) => setSelected((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const visibleSelectedCount = visible.filter((s) => selected.has(s.id)).length;
  const allVisibleSelected = visible.length > 0 && visibleSelectedCount === visible.length;
  const toggleAllVisible = () => setSelected((prev) => {
    const n = new Set(prev);
    if (allVisibleSelected) visible.forEach((s) => n.delete(s.id));
    else visible.forEach((s) => n.add(s.id));
    return n;
  });
  const clearSelection = () => setSelected(new Set());

  const batchDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} selected recipient${ids.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setWorking(true);
    for (const id of ids) {
      await base44.entities.EmailSubscriber.delete(id).catch(() => {});
    }
    clearSelection();
    setWorking(false);
    await load();
  };

  const batchMove = async () => {
    const ids = [...selected];
    if (!ids.length || !moveTarget) return;
    setWorking(true);
    for (const id of ids) {
      const sub = subs.find((s) => s.id === id);
      const current = sub?.group_ids || [];
      if (current.includes(moveTarget)) continue;
      await base44.entities.EmailSubscriber.update(id, { group_ids: [...current, moveTarget] }).catch(() => {});
    }
    clearSelection();
    setMoveTarget("");
    setWorking(false);
    await load();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange-400 animate-spin" /></div>;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Import + Groups */}
      <div className="space-y-4">
        <div className="bg-[#241812] border border-orange-900/40 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-orange-100 flex items-center gap-2">
            <Upload className="w-4 h-4 text-orange-400" /> Import Recipients
          </h3>
          <p className="text-[11px] text-orange-200/50">Upload a CSV with an <span className="text-orange-300">email</span> column (and optional name). Duplicates are skipped.</p>
          <div className="flex flex-wrap gap-2">
            <select value={importAudience} onChange={(e) => setImportAudience(e.target.value)}
              className="bg-[#1a120d] text-orange-50 text-xs px-2.5 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600 capitalize">
              {AUDIENCES.map((a) => <option key={a} value={a}>{a.replace("_", " ")}</option>)}
            </select>
            <select value={importGroup} onChange={(e) => setImportGroup(e.target.value)}
              className="bg-[#1a120d] text-orange-50 text-xs px-2.5 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600">
              <option value="">No group</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 px-4 py-2.5 rounded-xl cursor-pointer transition-opacity">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {importing ? "Importing…" : "Upload CSV"}
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} disabled={importing} />
          </label>
          {importResult && (
            <p className="text-[11px] text-emerald-400">Imported {importResult.created} new · {importResult.skipped} skipped (of {importResult.total}).</p>
          )}
        </div>

        <div className="bg-[#241812] border border-orange-900/40 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-orange-100 flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-orange-400" /> Folders
          </h3>
          <div className="flex gap-2">
            <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createGroup(); }}
              placeholder="New folder name…"
              className="flex-1 bg-[#1a120d] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600" />
            <button onClick={createGroup} disabled={creatingGroup || !newGroup.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-40 px-3 py-2 rounded-lg transition-colors">
              {creatingGroup ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add
            </button>
          </div>
          {groups.length === 0 ? (
            <p className="text-[11px] text-orange-200/40">No folders yet. Create one to organize recipients.</p>
          ) : (
            <div className="space-y-1.5">
              {groups.map((g) => {
                const count = subs.filter((s) => (s.group_ids || []).includes(g.id)).length;
                return (
                  <div key={g.id} className="flex items-center justify-between bg-[#1a120d] border border-orange-900/40 rounded-lg px-3 py-2">
                    <span className="text-sm text-orange-50">{g.name} <span className="text-[11px] text-orange-200/40">· {count}</span></span>
                    <button onClick={() => deleteGroup(g.id)} className="text-orange-300/60 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recipient list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-orange-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" /> Recipients ({visible.length})
          </h3>
          {visible.length > 0 && (
            <button onClick={toggleAllVisible} className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-200/70 hover:text-orange-100">
              {allVisibleSelected ? <CheckSquare className="w-3.5 h-3.5 text-orange-400" /> : <Square className="w-3.5 h-3.5" />}
              {allVisibleSelected ? "Deselect all" : "Select all"}
            </button>
          )}
        </div>

        {/* Folder filter chips */}
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setActiveGroup("all")}
            className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${activeGroup === "all" ? "bg-orange-600 text-white border-orange-500" : "bg-[#2a1d16] text-orange-200/70 border-orange-900/40 hover:border-orange-700"}`}>
            All · {subs.length}
          </button>
          {groups.map((g) => (
            <button key={g.id} onClick={() => setActiveGroup(g.id)}
              className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${activeGroup === g.id ? "bg-orange-600 text-white border-orange-500" : "bg-[#2a1d16] text-orange-200/70 border-orange-900/40 hover:border-orange-700"}`}>
              {g.name}
            </button>
          ))}
        </div>

        {/* Batch action bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-[#2a1d16] border border-orange-700/50 rounded-xl px-3 py-2">
            <span className="text-[11px] font-bold text-orange-100">{selected.size} selected</span>
            <div className="flex-1" />
            <select value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}
              className="bg-[#1a120d] text-orange-50 text-[11px] px-2 py-1.5 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600">
              <option value="">Move to folder…</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <button onClick={batchMove} disabled={working || !moveTarget}
              className="flex items-center gap-1 text-[11px] font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-40 px-2.5 py-1.5 rounded-lg transition-colors">
              {working ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderInput className="w-3 h-3" />} Move
            </button>
            <button onClick={batchDelete} disabled={working}
              className="flex items-center gap-1 text-[11px] font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 px-2.5 py-1.5 rounded-lg transition-colors">
              {working ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
            </button>
            <button onClick={clearSelection} className="text-orange-300/60 hover:text-orange-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {visible.length === 0 ? (
          <p className="text-xs text-orange-200/50 py-6 text-center">No recipients here yet. Import a CSV to get started.</p>
        ) : (
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {visible.map((s) => {
              const isSel = selected.has(s.id);
              return (
                <div key={s.id} className={`flex items-center gap-3 border rounded-xl px-3 py-2 transition-colors ${isSel ? "bg-[#3a2417] border-orange-600" : "bg-[#241812] border-orange-900/40"}`}>
                  <button onClick={() => toggleOne(s.id)} className="shrink-0 text-orange-300/70 hover:text-orange-100">
                    {isSel ? <CheckSquare className="w-4 h-4 text-orange-400" /> : <Square className="w-4 h-4" />}
                  </button>
                  <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-orange-50 truncate">{s.name || s.email}</p>
                    {s.name && <p className="text-[11px] text-orange-200/40 truncate">{s.email}</p>}
                  </div>
                  <span className="text-[10px] text-orange-200/50 capitalize shrink-0">{(s.audience || "").replace("_", " ")}</span>
                  <button onClick={() => removeSub(s.id)} className="text-orange-300/50 hover:text-red-400 shrink-0"><X className="w-3.5 h-3.5" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}