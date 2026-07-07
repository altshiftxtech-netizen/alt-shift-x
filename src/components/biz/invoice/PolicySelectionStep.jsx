import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, FileText, Plus, ChevronRight, Trash2 } from "lucide-react";

const GOLD = "#C8A95B";

/**
 * Step 1 — Policy Selection. Fetches the active documents from the user's
 * SPEAKEASY-POLICY-VAULT-1.0 (SovereignPolicy records). Selecting a policy
 * seeds the itemization grid with its rate items (unit rate auto-filled).
 */
export default function PolicySelectionStep({ onNext }) {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ policy_name: "", hub: "", rate_items: [{ item_name: "", description: "", unit_rate: "" }] });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const rows = await base44.entities.SovereignPolicy.filter({ owner_id: user.id, is_active: true }, "-created_date", 50);
      setPolicies(rows);
    } catch { /* gated page */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const select = (policy) => {
    const seeded = (policy.rate_items || []).map((r) => ({
      item_name: r.item_name || "",
      description: r.description || "",
      unit_rate: Number(r.unit_rate) || 0,
      quantity: 1,
    }));
    onNext(policy, seeded.length ? seeded : [{ item_name: "", description: "", unit_rate: 0, quantity: 1 }]);
  };

  const updateDraftItem = (i, field, value) => {
    setDraft((d) => {
      const items = [...d.rate_items];
      items[i] = { ...items[i], [field]: value };
      return { ...d, rate_items: items };
    });
  };

  const saveDraft = async () => {
    if (!draft.policy_name.trim()) return;
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const rate_items = draft.rate_items
        .filter((r) => r.item_name.trim())
        .map((r) => ({ item_name: r.item_name.trim(), description: r.description.trim(), unit_rate: Number(r.unit_rate) || 0 }));
      await base44.entities.SovereignPolicy.create({
        owner_id: user.id,
        vault_code: "SPEAKEASY-POLICY-VAULT-1.0",
        policy_name: draft.policy_name.trim(),
        hub: draft.hub.trim(),
        rate_items,
        version: 1,
        is_active: true,
      });
      setCreating(false);
      setDraft({ policy_name: "", hub: "", rate_items: [{ item_name: "", description: "", unit_rate: "" }] });
      await load();
    } catch { /* noop */ }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-[#C8A95B]/60" /></div>;
  }

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: GOLD }}>SPEAKEASY-POLICY-VAULT-1.0</p>
      <h3 className="text-lg font-bold text-white mb-1">Select a rate policy</h3>
      <p className="text-xs text-white/50 mb-5">Choose an active policy from your vault. Its unit rates auto-fill the itemization grid.</p>

      {policies.length > 0 && (
        <div className="space-y-2 mb-4">
          {policies.map((p) => (
            <button
              key={p.id}
              onClick={() => select(p)}
              className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left hover:border-[#C8A95B]/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}33` }}>
                <FileText className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.policy_name}</p>
                <p className="text-[11px] text-white/45">{(p.rate_items || []).length} rate item(s){p.hub ? ` · ${p.hub}` : ""}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>
          ))}
        </div>
      )}

      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/30"
        >
          <Plus className="w-3.5 h-3.5" /> {policies.length ? "New policy" : "Create your first policy"}
        </button>
      ) : (
        <div className="rounded-xl border border-[#C8A95B]/25 bg-white/[0.03] p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={draft.policy_name}
              onChange={(e) => setDraft((d) => ({ ...d, policy_name: e.target.value }))}
              placeholder="Policy name"
              className="rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]"
            />
            <input
              value={draft.hub}
              onChange={(e) => setDraft((d) => ({ ...d, hub: e.target.value }))}
              placeholder="Hub / region (e.g. SEATTLE)"
              className="rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]"
            />
          </div>
          <div className="space-y-2">
            {draft.rate_items.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_100px_auto] gap-2 items-center">
                <input value={r.item_name} onChange={(e) => updateDraftItem(i, "item_name", e.target.value)} placeholder="Item name"
                  className="rounded-lg bg-white/5 border border-white/15 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]" />
                <input value={r.description} onChange={(e) => updateDraftItem(i, "description", e.target.value)} placeholder="Description"
                  className="rounded-lg bg-white/5 border border-white/15 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]" />
                <input value={r.unit_rate} onChange={(e) => updateDraftItem(i, "unit_rate", e.target.value)} placeholder="Rate" type="number"
                  className="rounded-lg bg-white/5 border border-white/15 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]" />
                <button
                  onClick={() => setDraft((d) => ({ ...d, rate_items: d.rate_items.filter((_, idx) => idx !== i) }))}
                  className="p-1.5 text-white/30 hover:text-red-400" disabled={draft.rate_items.length === 1}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setDraft((d) => ({ ...d, rate_items: [...d.rate_items, { item_name: "", description: "", unit_rate: "" }] }))}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C8A95B] hover:underline"
            >
              <Plus className="w-3 h-3" /> Add rate item
            </button>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={saveDraft}
              disabled={saving || !draft.policy_name.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-[#0A0A0C] disabled:opacity-50"
              style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Save policy
            </button>
            <button onClick={() => setCreating(false)} className="text-xs text-white/50 hover:text-white">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}