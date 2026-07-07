import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  FileText, Download, Loader2, Scale, Package, Briefcase, ExternalLink, ShieldCheck, BookOpen,
} from "lucide-react";

// The site's legal / policy library — mirrors the public footer links.
const LEGAL_LIBRARY = [
  { label: "Terms of Service", to: "/legal/terms" },
  { label: "Privacy Policy", to: "/legal/privacy" },
  { label: "Cookie Policy", to: "/legal/cookies" },
  { label: "Acceptable Use Policy", to: "/legal/acceptable-use" },
  { label: "Builder Agreement", to: "/legal/builder-agreement" },
  { label: "Refund Policy", to: "/legal/refunds" },
  { label: "DMCA Policy", to: "/legal/dmca" },
  { label: "Export Controls Policy", to: "/legal/export-controls" },
  { label: "AI Disclosure", to: "/legal/ai-disclosure" },
  { label: "Security Disclosure", to: "/legal/security-disclosure" },
  { label: "Referral & Affiliate Terms", to: "/legal/referral-terms" },
  { label: "Accessibility Statement", to: "/legal/accessibility" },
  { label: "Children's Safety Policy", to: "/legal/childrens-safety" },
  { label: "Data Processing Addendum (DPA)", to: "/legal/dpa" },
  { label: "White Paper", to: "/white-paper" },
];

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v) {
  const s = v === undefined || v === null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

// ── Group card shell ──────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, children, action }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-lg"><Icon className="w-4 h-4 text-slate-500" /></div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{title}</p>
            {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Policy & Legal documents ──────────────────────────────────────
function LegalDocsSection() {
  const [savedDocs, setSavedDocs] = useState([]);

  useEffect(() => {
    base44.entities.LegalDocument.list("-updated_date", 100)
      .then((d) => setSavedDocs(d || []))
      .catch(() => {});
  }, []);

  const downloadSaved = (doc) => {
    const header = `${doc.title || doc.slug}\n${"=".repeat((doc.title || doc.slug).length)}\n\n`;
    downloadText(`${doc.slug || "document"}.txt`, header + (doc.content || ""));
  };

  const savedBySlug = Object.fromEntries(savedDocs.map((d) => [d.slug, d]));

  return (
    <Section icon={Scale} title="Policy & Legal Documents" subtitle={`${LEGAL_LIBRARY.length} site policies`}>
      <div className="grid sm:grid-cols-2 gap-2">
        {LEGAL_LIBRARY.map((doc) => {
          const stored = savedBySlug[doc.to.split("/").pop()];
          return (
            <div key={doc.to} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-xs font-medium text-slate-700 truncate">{doc.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link to={doc.to} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white" title="View">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                {stored && (
                  <button onClick={() => downloadSaved(stored)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-violet-700 hover:bg-white" title="Download saved content">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {savedDocs.length > 0 && (
        <p className="text-[11px] text-slate-400 mt-3">
          <ShieldCheck className="w-3 h-3 inline mr-1" />
          {savedDocs.length} document{savedDocs.length === 1 ? "" : "s"} have saved content in the database (download icon available).
        </p>
      )}
    </Section>
  );
}

// ── Component ledger ──────────────────────────────────────────────
function ComponentLedgerSection() {
  const [count, setCount] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    base44.entities.Component.filter({ status: "published" }, "-created_date", 10000)
      .then((d) => setCount((d || []).length))
      .catch(() => setCount(0));
  }, []);

  const exportLedger = async () => {
    setBusy(true);
    try {
      const rows = await base44.entities.Component.list("-created_date", 10000);
      const cols = ["sku", "code", "name", "type", "category", "builder_name", "price", "status", "installs_count", "rating", "trust_score", "certified", "created_date"];
      const csv = [cols.map(csvCell).join(",")]
        .concat((rows || []).map((r) => cols.map((c) => csvCell(r[c])).join(",")))
        .join("\n");
      downloadText(`component-ledger-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv");
    } catch {
      alert("Could not export the ledger. Please try again.");
    }
    setBusy(false);
  };

  return (
    <Section
      icon={Package}
      title="Component Ledger"
      subtitle={count === null ? "Loading…" : `${count.toLocaleString()} published components`}
      action={
        <Button size="sm" className="text-xs gap-1.5 bg-slate-900 hover:bg-slate-700" onClick={exportLedger} disabled={busy}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {busy ? "Exporting…" : "Download CSV"}
        </Button>
      }
    >
      <p className="text-xs text-slate-500 leading-relaxed">
        The full component ledger — every component in the database with its SKU, code, category, builder, pricing, install count,
        trust score, and status — exported as a spreadsheet-ready CSV.
      </p>
    </Section>
  );
}

// ── Business documents (BizDocument entity) ───────────────────────
function BizDocumentsSection() {
  const [docs, setDocs] = useState(null);

  useEffect(() => {
    base44.entities.BizDocument.list("-created_date", 200)
      .then((d) => setDocs(d || []))
      .catch(() => setDocs([]));
  }, []);

  const downloadDoc = (doc) => {
    const header = `${doc.title || doc.template_label}\n${"=".repeat((doc.title || doc.template_label || "").length)}\n\n`;
    downloadText(`${(doc.title || doc.template_key || "document").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`, header + (doc.draft_body || ""));
  };

  return (
    <Section
      icon={Briefcase}
      title="Business Documents"
      subtitle={docs === null ? "Loading…" : `${docs.length} generated document${docs.length === 1 ? "" : "s"}`}
    >
      {docs === null ? (
        <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>
      ) : docs.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No business documents generated yet.</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{doc.title || doc.template_label}</p>
                  <p className="text-[10px] text-slate-400">{doc.template_label} · {doc.created_date?.slice(0, 10)}</p>
                </div>
              </div>
              <button onClick={() => downloadDoc(doc)} disabled={!doc.draft_body}
                className="p-1.5 rounded-md text-slate-400 hover:text-violet-700 hover:bg-white disabled:opacity-30" title="Download">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

/**
 * SiteDocumentsTab — one clean hub to access & download every document
 * associated with the site: policy/legal library, the component ledger, and
 * generated business documents stored in the database.
 */
export default function SiteDocumentsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
        <p className="text-sm font-bold text-violet-900">Site Documents</p>
        <p className="text-xs text-violet-700 mt-0.5">
          Every document associated with this site in one place — policies, the component ledger, and business documents. View or download each below.
        </p>
      </div>
      <LegalDocsSection />
      <ComponentLedgerSection />
      <BizDocumentsSection />
    </div>
  );
}