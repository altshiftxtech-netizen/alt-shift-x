import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldCheck, Printer } from "lucide-react";

const GOLD = "#C8A95B";

const TYPE_LABELS = {
  X1: "X1 · Reading Protocol",
  X2: "X2 · Prophecy Model",
  X3: "X3 · Speed Profile",
  X4: "X4 · Reason Council",
  X5: "X5 · Complete Agent",
};

/**
 * EnterpriseCatalog — a clean, read-only, legally-worded working document of the
 * full published component catalog. Opened in its own window from the Engineering
 * Suite's "View Catalog" button. No install / edit controls — reference only.
 */
export default function EnterpriseCatalog() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Sovereign Component Catalog — Read-Only Working Document";
    base44.entities.Component.filter({ status: "published" })
      .then((rows) => setComponents(Array.isArray(rows) ? rows : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const byCat = {};
    for (const c of components) {
      const cat = c.category || "Uncategorized";
      (byCat[cat] ||= []).push(c);
    }
    Object.values(byCat).forEach((arr) => arr.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
    return Object.entries(byCat).sort((a, b) => a[0].localeCompare(b[0]));
  }, [components]);

  const issuedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Print bar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <ShieldCheck className="w-4 h-4" style={{ color: GOLD }} />
          Read-Only Working Document · Reference Copy
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg"
          style={{ background: GOLD }}
        >
          <Printer className="w-3.5 h-3.5" /> Print / Save PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Cover / masthead */}
        <header className="text-center border-b-2 pb-8 mb-8" style={{ borderColor: GOLD }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] mb-3" style={{ color: GOLD }}>
            Sovereign Global Network
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Component Catalog
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            The authoritative, read-only register of all published components licensable through the
            Alt+Shift+X marketplace and Enterprise Engineering Suite.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] text-slate-400">
            <span>Issued: {issuedDate}</span>
            <span>Total published components: {components.length}</span>
            <span>Register: SGT-1.0 Compliant</span>
          </div>
        </header>

        {/* Legal preamble */}
        <section className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Notice &amp; Terms of Reference</h2>
          <div className="space-y-3 text-[13px] leading-relaxed text-slate-600">
            <p>
              <strong>1. Purpose.</strong> This document is provided solely as a reference register of components
              published to the marketplace as of the issue date above. It is a read-only working copy and does not
              itself constitute an offer, a license grant, or a warranty of availability, pricing, or fitness for a
              particular purpose.
            </p>
            <p>
              <strong>2. Pricing.</strong> All prices are stated per installation, per month, in United States Dollars
              (USD), exclusive of applicable taxes. Prices are indicative and subject to change; the price applied at the
              time of a completed transaction shall control.
            </p>
            <p>
              <strong>3. Licensing.</strong> Access to and use of any component is governed exclusively by the applicable
              marketplace terms, the builder agreement, and any component-specific legal acceptance required at checkout.
              Nothing in this catalog varies or supersedes those instruments.
            </p>
            <p>
              <strong>4. Confidentiality.</strong> This register may contain non-public commercial information intended
              for authorized recipients only. Redistribution outside the licensed enterprise is prohibited without prior
              written consent.
            </p>
            <p>
              <strong>5. Accuracy.</strong> While compiled directly from live catalog records, entries may be superseded
              between issuances. The live marketplace record is the definitive source of truth in the event of any
              discrepancy.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
        ) : components.length === 0 ? (
          <p className="text-center text-slate-400 py-20 text-sm">No published components are currently on the register.</p>
        ) : (
          grouped.map(([category, items]) => (
            <section key={category} className="mb-10">
              <h2 className="text-lg font-black mb-4 pb-2 border-b border-slate-200" style={{ fontFamily: "'Playfair Display', serif" }}>
                {category}
                <span className="ml-2 text-xs font-normal text-slate-400">({items.length})</span>
              </h2>
              <div className="space-y-4">
                {items.map((c) => (
                  <article key={c.id} className="break-inside-avoid rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-slate-900">{c.name}</h3>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">{c.code}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[15px] font-black text-slate-900">
                          {typeof c.price === "number" ? `$${c.price.toLocaleString()}` : "—"}
                          <span className="text-[10px] font-medium text-slate-400">/mo</span>
                        </p>
                        {c.certified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-1">
                            <ShieldCheck className="w-3 h-3" /> Certified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {c.type && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {TYPE_LABELS[c.type] || c.type}
                        </span>
                      )}
                      {c.builder_name && (
                        <span className="text-[10px] text-slate-400">by {c.builder_name}</span>
                      )}
                      {typeof c.trust_score === "number" && c.trust_score > 0 && (
                        <span className="text-[10px] text-slate-400">Trust {c.trust_score}</span>
                      )}
                    </div>

                    {c.description && (
                      <p className="text-[13px] leading-relaxed text-slate-600 mt-2">{c.description}</p>
                    )}

                    {Array.isArray(c.features) && c.features.length > 0 && (
                      <ul className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1">
                        {c.features.slice(0, 6).map((f, i) => (
                          <li key={i} className="text-[12px] text-slate-500 flex items-start gap-1.5">
                            <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: GOLD }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-[11px] text-slate-400 space-y-1">
          <p>Sovereign Global Network — Component Catalog · SGT-1.0 Compliant Register</p>
          <p>This is a controlled reference document. © {new Date().getFullYear()} Alt+Shift+X. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}