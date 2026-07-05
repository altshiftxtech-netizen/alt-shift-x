import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Boxes, Plus, Loader2 } from "lucide-react";

const STATUS_COLOR = {
  queued: "#F59E0B", in_review: "#5BA2FF", scoping: "#A78BFA",
  building: "#22D3EE", delivered: "#10B981", declined: "#EF4444",
};

/** Component Request Queue — request new catalog annexes. */
export default function ComponentRequestQueue({ user }) {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [brief, setBrief] = useState("");
  const [priority, setPriority] = useState("high");
  const [saving, setSaving] = useState(false);

  const load = async () => setRows(await base44.entities.ComponentAnnexRequest.list("-created_date", 50));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!title || !brief) return;
    setSaving(true);
    await base44.entities.ComponentAnnexRequest.create({
      requester_id: user?.id, requester_name: user?.full_name || user?.email,
      title, domain, brief, priority, status: "queued",
    });
    setTitle(""); setDomain(""); setBrief(""); setPriority("high");
    setOpen(false); setSaving(false); load();
  };

  return (
    <div className="rounded-2xl border p-6" style={{ background: "linear-gradient(180deg,rgba(24,20,32,0.7),rgba(10,8,14,0.85))", borderColor: "#A78BFA33" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)" }}>
          <Boxes className="w-5 h-5 text-[#A78BFA]" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A78BFA]">Catalog Annexes</p>
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Component Request Queue</h3>
        </div>
        <Button size="sm" onClick={() => setOpen((v) => !v)} className="ml-auto font-semibold text-white" style={{ background: "linear-gradient(90deg,#7C3AED,#A78BFA)" }}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Request
        </Button>
      </div>

      {open && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Annex title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            <Input placeholder="Intelligence domain" value={domain} onChange={(e) => setDomain(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <Textarea placeholder="Describe the capability you need annexed to the catalog…" value={brief} onChange={(e) => setBrief(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px]" />
          <div className="flex items-center gap-2">
            {["standard", "high", "critical"].map((p) => (
              <button key={p} onClick={() => setPriority(p)} className={`text-[11px] font-semibold px-3 py-1 rounded-full border capitalize ${priority === p ? "bg-[#A78BFA] text-black border-[#A78BFA]" : "text-white/50 border-white/15"}`}>{p}</button>
            ))}
            <Button size="sm" disabled={saving || !title || !brief} onClick={submit} className="ml-auto font-semibold text-white" style={{ background: "linear-gradient(90deg,#7C3AED,#A78BFA)" }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit to queue"}
            </Button>
          </div>
        </div>
      )}

      {rows === null ? (
        <div className="py-6 text-center"><Loader2 className="w-5 h-5 animate-spin text-white/30 mx-auto" /></div>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-white/40">No annex requests yet. Request the intelligence your operation needs.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white flex-1 truncate">{r.title}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: STATUS_COLOR[r.status], background: `${STATUS_COLOR[r.status]}1a` }}>
                  {String(r.status).replace("_", " ")}
                </span>
              </div>
              {r.domain && <p className="text-[10px] text-white/40 mt-0.5">{r.domain}</p>}
              <p className="text-xs text-white/55 mt-1 line-clamp-2">{r.brief}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}