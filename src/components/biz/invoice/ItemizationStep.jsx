import React, { useState } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";

const GOLD = "#C8A95B";
const money = (n) => `$${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Step 2 — Itemization. Editable grid: Item Name, Description, Unit Rate
 * (auto-filled from the selected policy), Quantity, and computed Subtotal.
 */
export default function ItemizationStep({ policy, initialItems, initialBillTo, onBack, onNext }) {
  const [billTo, setBillTo] = useState(initialBillTo || "");
  const [rows, setRows] = useState(
    initialItems?.length ? initialItems : [{ item_name: "", description: "", unit_rate: 0, quantity: 1 }],
  );

  const update = (i, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: field === "unit_rate" || field === "quantity" ? value : value };
      return next;
    });
  };

  const subtotal = (r) => (Number(r.unit_rate) || 0) * (Number(r.quantity) || 0);
  const total = rows.reduce((sum, r) => sum + subtotal(r), 0);

  const addRow = () => setRows((r) => [...r, { item_name: "", description: "", unit_rate: 0, quantity: 1 }]);
  const removeRow = (i) => setRows((r) => (r.length > 1 ? r.filter((_, idx) => idx !== i) : r));

  const proceed = () => {
    const cleaned = rows
      .filter((r) => (r.item_name || "").trim())
      .map((r) => ({
        item_name: r.item_name.trim(),
        description: (r.description || "").trim(),
        unit_rate: Number(r.unit_rate) || 0,
        quantity: Number(r.quantity) || 0,
        subtotal: subtotal(r),
      }));
    if (cleaned.length === 0) return;
    onNext(cleaned, billTo.trim());
  };

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: GOLD }}>Itemization</p>
      <h3 className="text-lg font-bold text-white mb-1">Build the line items</h3>
      <p className="text-xs text-white/50 mb-4">
        Rates auto-filled from <span className="text-white/70 font-semibold">{policy?.policy_name || "your policy"}</span>. Adjust quantities — subtotals compute live.
      </p>

      <div className="mb-4 max-w-sm">
        <label className="block text-[11px] font-semibold text-white/60 mb-1">Bill to</label>
        <input
          value={billTo}
          onChange={(e) => setBillTo(e.target.value)}
          placeholder="Client / recipient name"
          className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]"
        />
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-white/40">
              <th className="text-left font-semibold px-3 py-2">Item Name</th>
              <th className="text-left font-semibold px-3 py-2">Description</th>
              <th className="text-right font-semibold px-3 py-2 w-28">Unit Rate</th>
              <th className="text-right font-semibold px-3 py-2 w-20">Qty</th>
              <th className="text-right font-semibold px-3 py-2 w-28">Subtotal</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="px-2 py-1.5">
                  <input value={r.item_name} onChange={(e) => update(i, "item_name", e.target.value)} placeholder="Item"
                    className="w-full rounded-md bg-white/5 border border-white/10 px-2 py-1.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#C8A95B]" />
                </td>
                <td className="px-2 py-1.5">
                  <input value={r.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description"
                    className="w-full rounded-md bg-white/5 border border-white/10 px-2 py-1.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#C8A95B]" />
                </td>
                <td className="px-2 py-1.5">
                  <input value={r.unit_rate} onChange={(e) => update(i, "unit_rate", e.target.value)} type="number" step="0.01"
                    className="w-full rounded-md bg-white/5 border border-white/10 px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:border-[#C8A95B]" />
                </td>
                <td className="px-2 py-1.5">
                  <input value={r.quantity} onChange={(e) => update(i, "quantity", e.target.value)} type="number" step="1"
                    className="w-full rounded-md bg-white/5 border border-white/10 px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:border-[#C8A95B]" />
                </td>
                <td className="px-3 py-1.5 text-right text-xs font-semibold text-[#E6C878] whitespace-nowrap">{money(subtotal(r))}</td>
                <td className="px-2 py-1.5 text-center">
                  <button onClick={() => removeRow(i)} disabled={rows.length === 1} className="p-1 text-white/25 hover:text-red-400 disabled:opacity-30">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3">
        <button onClick={addRow} className="inline-flex items-center gap-1 text-xs font-semibold text-[#C8A95B] hover:underline">
          <Plus className="w-3.5 h-3.5" /> Add line item
        </button>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-white/40 mr-2">Total</span>
          <span className="text-lg font-black text-white">{money(total)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Policy
        </button>
        <button
          onClick={proceed}
          className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-bold text-[#0A0A0C]"
          style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
        >
          Forensic Review <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}