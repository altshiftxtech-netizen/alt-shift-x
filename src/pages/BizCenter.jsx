import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Briefcase, FileText, Lightbulb, MessageSquare, ShieldCheck, Search, Scale, ExternalLink } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import DraftingAidNotice from "@/components/biz/DraftingAidNotice";
import TemplatePicker from "@/components/biz/TemplatePicker";
import DocumentForm from "@/components/biz/DocumentForm";
import GeneratedDocument from "@/components/biz/GeneratedDocument";
import StrategyCenter from "@/components/biz/StrategyCenter";
import CounselorChat from "@/components/biz/CounselorChat";
import MemoryGreeting from "@/components/biz/MemoryGreeting";
import useBobTier, { LIGHT_TEMPLATE_KEYS } from "@/hooks/useBobTier";
import { TEMPLATES } from "@/components/biz/bizData";

const TABS = [
  { key: "documents", label: "Document Center", icon: FileText },
  { key: "strategy", label: "Strategy Center", icon: Lightbulb },
  { key: "counselor", label: "Counselor", icon: MessageSquare },
];

function BizCenterInner() {
  const navigate = useNavigate();
  const { isApex } = useBobTier();
  const allowedKeys = isApex ? null : LIGHT_TEMPLATE_KEYS;
  const [tab, setTab] = useState("documents");
  // Document flow: 'browse' → 'form' → 'result'
  const [docStep, setDocStep] = useState("browse");
  const [template, setTemplate] = useState(null);
  const [resumeData, setResumeData] = useState(null); // { values, jurisdiction } when resuming a saved draft
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const openTemplate = (t) => {
    setTemplate(t);
    setResumeData(null);
    setDocStep("form");
    setTab("documents");
    setResult(null);
  };

  // Resume a saved draft from the memory greeting.
  const resumeDraft = (doc) => {
    const tpl = TEMPLATES.find((t) => t.key === doc.template_key);
    if (!tpl) return;
    setTemplate(tpl);
    setResumeData({ values: doc.fields || {}, jurisdiction: doc.jurisdiction });
    setDocStep("form");
    setTab("documents");
    setResult(null);
  };

  const generate = async ({ template, jurisdiction, values }) => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateBizDocument", {
        template_key: template.key,
        template_label: template.label,
        deal_stage: template.stage,
        jurisdiction,
        fields: values,
      });
      const data = res.data || {};
      const title = values[template.fields[0]?.name] || template.label;
      const doc = {
        template_key: template.key,
        template_label: template.label,
        deal_stage: template.stage,
        title,
        jurisdiction,
        fields: values,
        draft_body: data.draft_body || "",
        assumptions: data.assumptions || [],
        review_checklist: data.review_checklist || [],
        version: 1,
        status: "generated",
      };
      setResult(doc);
      setDocStep("result");
      // Persist as a downloadable asset (best-effort).
      try {
        const user = await base44.auth.me();
        await base44.entities.BizDocument.create({ ...doc, owner_id: user.id });
      } catch { /* guest never reaches past the gate */ }
    } catch {
      setResult({ error: true });
      setDocStep("result");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white">
      {/* Top chrome */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/speakeasy/proxy-room")}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> The Room
          </button>
          <div className="h-5 w-px bg-white/15" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D9DCE1]/20 to-[#C8A95B]/20 border border-[#C8A95B]/25 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#C8A95B]" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#C8A95B] leading-none">BOB² BuilderOperatedBiz</p>
              <h1 className="text-sm font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Business Center</h1>
            </div>
          </div>
          <a
            href="https://www.upwork.com/search/profiles/?q=legal%20counsel"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-[#C8A95B]/40 bg-[#C8A95B]/10 px-3 py-1.5 text-xs font-semibold text-[#E6C878] hover:bg-[#C8A95B]/20 transition-colors"
          >
            <Scale className="w-3.5 h-3.5" /> Legal &amp; More <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Landing hero */}
      <div className="max-w-5xl mx-auto px-5 pt-8">
        <div className="rounded-2xl border border-[#C8A95B]/20 bg-gradient-to-b from-white/[0.06] to-transparent p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A95B] mb-2">One-Stop Builder Ops</p>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sell, buy & run your software business — document-first.
          </h2>
          <p className="text-sm text-white/60 max-w-2xl leading-relaxed mb-4">
            Generate the agreements a software deal needs, organized by workflow and contract type. Every draft becomes a
            downloadable, versioned asset with an assumptions panel and a review checklist. Ask the counselor which template
            you need, or how to structure a deal.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <HowItWorks n="1" title="Pick a template" text="Browse by deal stage — pre-deal, execution, ops, compliance." />
            <HowItWorks n="2" title="Fill the fields" text="Structured inputs with jurisdiction packs and critical-field prompts." />
            <HowItWorks n="3" title="Generate & download" text="Draft + assumptions + checklist, exported to PDF." />
          </div>
          <DraftingAidNotice />
        </div>
      </div>

      {/* Contextual memory greeting */}
      <div className="max-w-5xl mx-auto px-5 mt-6">
        <MemoryGreeting onResume={resumeDraft} tierLabel={isApex ? "Apex" : "Light"} />
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-5 mt-2">
        <div className="flex gap-1 border-b border-white/10">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  active ? "border-[#C8A95B] text-white" : "border-transparent text-white/50 hover:text-white/80"
                }`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panels */}
      <div className="max-w-5xl mx-auto px-5 py-6 pb-20">
        {tab === "documents" && (
          <>
            {docStep === "browse" && <TemplatePicker onPick={openTemplate} allowedKeys={allowedKeys} />}
            {docStep === "form" && template && (
              <DocumentForm template={template} generating={generating}
                initialValues={resumeData?.values} initialJurisdiction={resumeData?.jurisdiction}
                onBack={() => setDocStep("browse")} onGenerate={generate} />
            )}
            {docStep === "result" && result && (
              result.error ? (
                <div className="text-center py-12">
                  <p className="text-white/70">Generation failed. Please try again.</p>
                  <button onClick={() => setDocStep("form")} className="mt-3 text-sm text-[#C8A95B] hover:underline">Back to the form</button>
                </div>
              ) : (
                <GeneratedDocument doc={result} onBack={() => setDocStep("browse")} />
              )
            )}
          </>
        )}

        {tab === "strategy" && <StrategyCenter />}

        {tab === "counselor" && (
          <div className="h-[62vh] rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <CounselorChat onOpenTemplate={openTemplate} allowedKeys={allowedKeys} />
          </div>
        )}
      </div>
    </div>
  );
}

function HowItWorks({ n, title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-5 h-5 rounded-full bg-[#C8A95B] text-[#1a1207] text-[11px] font-black flex items-center justify-center">{n}</span>
        <h4 className="text-sm font-bold text-white">{title}</h4>
      </div>
      <p className="text-xs text-white/55 leading-relaxed">{text}</p>
    </div>
  );
}

export default function BizCenter() {
  return (
    <ProxyRoomGate>
      <BizCenterInner />
    </ProxyRoomGate>
  );
}