import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Sparkles, Film, ImageIcon, Wand2, ShieldCheck, RefreshCw, AlertTriangle, ArrowRight,
} from "lucide-react";
import BrandKitPanel from "@/components/commercial/BrandKitPanel";
import ProductionCard from "@/components/commercial/ProductionCard";
import ZeroDefectCertificate from "@/components/commercial/ZeroDefectCertificate";

const FORMATS = [
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "video", label: "Video", icon: Film },
];
const RATIOS = ["16:9", "9:16"];

// Commercial Studio — a real professional production environment. Brand Kit
// steers every step; brief is intent-locked into a scene plan; media is really
// generated; a live governance gate issues an honest Zero-Defect Certificate;
// every production is saved and recoverable with a visible audit trail.
export default function CommercialStudio({ user }) {
  const [kit, setKit] = useState(null);
  const [loadingKit, setLoadingKit] = useState(true);

  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("video");
  const [aspect, setAspect] = useState("16:9");
  const [platform, setPlatform] = useState("");
  const [brief, setBrief] = useState("");

  const [plan, setPlan] = useState(null); // { scene_plan, generation_prompt, ambiguities }
  const [mediaUrl, setMediaUrl] = useState("");
  const [cert, setCert] = useState(null); // { certificate, governance }
  const [audit, setAudit] = useState([]);

  const [planning, setPlanning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [certifying, setCertifying] = useState(false);
  const [saving, setSaving] = useState(false);

  const [productions, setProductions] = useState([]);

  const loadKit = async () => {
    setLoadingKit(true);
    const kits = await base44.entities.BrandKit.filter({ is_active: true }, "-updated_date", 1);
    setKit(kits[0] || null);
    setLoadingKit(false);
  };
  const loadProductions = async () => {
    const list = await base44.entities.Production.list("-created_date", 20);
    setProductions(list);
  };
  useEffect(() => { loadKit(); loadProductions(); }, []);

  const brandPayload = () => ({
    brand_name: kit?.brand_name,
    colors: kit?.colors,
    fonts: kit?.fonts,
    tone: kit?.tone,
    style_notes: kit?.style_notes,
  });

  const logStep = (step, detail) =>
    setAudit((prev) => [...prev, { step, detail, at: new Date().toISOString() }]);

  const runPlan = async () => {
    if (!brief.trim()) return;
    setPlanning(true); setPlan(null); setMediaUrl(""); setCert(null); setAudit([]);
    const res = await base44.functions.invoke("commercialStudioPlan", {
      action: "plan", brief, format, platform, brand: brandPayload(),
    });
    setPlan(res.data);
    logStep("Intent locked", `${res.data.scene_plan?.length || 0} scenes decomposed from brief`);
    setPlanning(false);
  };

  const runGenerate = async () => {
    if (!plan?.generation_prompt) return;
    setGenerating(true);
    try {
      if (format === "video") {
        const res = await base44.integrations.Core.GenerateVideo({ prompt: plan.generation_prompt, aspect_ratio: aspect });
        setMediaUrl(res?.url || res?.video_url || "");
      } else {
        const refs = kit?.reference_image_urls?.length ? kit.reference_image_urls : undefined;
        const res = await base44.integrations.Core.GenerateImage({ prompt: plan.generation_prompt, existing_image_urls: refs });
        setMediaUrl(res?.url || "");
      }
      logStep("Rendered", `${format} generated under Brand Consistency Lock`);
    } finally {
      setGenerating(false);
    }
  };

  const runCertify = async () => {
    setCertifying(true);
    const res = await base44.functions.invoke("commercialStudioPlan", {
      action: "certify", brief, generation_prompt: plan?.generation_prompt, brand: brandPayload(),
    });
    setCert(res.data);
    logStep("Governance gate", res.data.governance?.verdict || "Evaluated");
    setCertifying(false);
  };

  const saveProduction = async () => {
    setSaving(true);
    const finalAudit = [...audit, { step: "Saved", detail: "Production filed to history", at: new Date().toISOString() }];
    await base44.entities.Production.create({
      owner_id: user?.id,
      brand_kit_id: kit?.id,
      brand_name: kit?.brand_name,
      title: title.trim() || brief.slice(0, 60),
      format,
      brief,
      platform_target: platform || undefined,
      scene_plan: plan?.scene_plan || [],
      media_url: mediaUrl || undefined,
      aspect_ratio: aspect,
      certificate: cert?.certificate,
      governance: cert?.governance,
      version: 1,
      audit_trail: finalAudit,
      status: cert?.certificate?.passed ? "certified" : mediaUrl ? "rendered" : "planned",
    });
    setTitle(""); setBrief(""); setPlan(null); setMediaUrl(""); setCert(null); setAudit([]);
    await loadProductions();
    setSaving(false);
  };

  const reopen = (p) => {
    setTitle(p.title); setFormat(p.format); setAspect(p.aspect_ratio || "16:9");
    setPlatform(p.platform_target || ""); setBrief(p.brief);
    setPlan(p.scene_plan?.length ? { scene_plan: p.scene_plan, generation_prompt: p.brief, ambiguities: [] } : null);
    setMediaUrl(p.media_url || ""); setCert(p.certificate ? { certificate: p.certificate, governance: p.governance } : null);
    setAudit(p.audit_trail || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loadingKit) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-amber-500/60" /></div>;
  }

  const noKit = !kit;

  return (
    <div className="space-y-4">
      {/* Studio banner */}
      <div className="rounded-2xl border border-amber-900/30 bg-gradient-to-r from-[#1a140d] to-[#12100f] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">Commercial Studio</p>
        <p className="text-sm text-amber-100/80 mt-1 max-w-2xl">Professional commercial production. Brand-locked, governance-certified, and recoverable — work so good people ask which agency made it.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* LEFT — Brand kit + history */}
        <div className="space-y-4">
          <BrandKitPanel kit={kit} onSaved={(k) => setKit(k)} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-100">Production History</h3>
              <button onClick={loadProductions} className="text-amber-300 hover:text-white p-1 rounded-lg hover:bg-amber-900/20"><RefreshCw className="w-3.5 h-3.5" /></button>
            </div>
            {productions.length === 0 ? (
              <p className="text-xs text-amber-200/40 py-4 text-center">No productions yet.</p>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {productions.map((p) => <ProductionCard key={p.id} production={p} onReopen={reopen} />)}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Production interface */}
        <div className="lg:col-span-2 bg-[#12100f] border border-amber-900/30 rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-bold text-amber-50 flex items-center gap-2"><Wand2 className="w-4 h-4 text-amber-400" /> New Production</h3>

          {noKit && (
            <div className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              Set up your Brand Kit first — it locks brand consistency into every production.
            </div>
          )}

          {/* Format + ratio + platform */}
          <div className="flex flex-wrap gap-2">
            {FORMATS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setFormat(key)}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${format === key ? "bg-amber-500 text-black border-amber-400" : "bg-black/40 text-amber-200/70 border-amber-900/30 hover:border-amber-700"}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
            <div className="w-px bg-amber-900/30 mx-1" />
            {RATIOS.map((r) => (
              <button key={r} onClick={() => setAspect(r)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${aspect === r ? "bg-amber-500 text-black border-amber-400" : "bg-black/40 text-amber-200/70 border-amber-900/30 hover:border-amber-700"}`}>{r}</button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Production title (optional)"
              className="w-full bg-black/40 text-amber-50 text-sm px-3 py-2 rounded-lg border border-amber-900/30 outline-none focus:border-amber-600" />
            <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="Platform target (e.g. YouTube)"
              className="w-full bg-black/40 text-amber-50 text-sm px-3 py-2 rounded-lg border border-amber-900/30 outline-none focus:border-amber-600" />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-amber-200/60 block mb-1.5">Production brief</label>
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={3}
              placeholder="Describe the commercial. e.g. A 60-second launch spot for our new AI Governance certification — premium, cinematic, ending on the logo."
              className="w-full bg-black/40 text-amber-50 text-sm px-3 py-2 rounded-lg border border-amber-900/30 outline-none focus:border-amber-600 resize-none" />
            <button onClick={runPlan} disabled={planning || !brief.trim()}
              className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:opacity-90 px-3 py-1.5 rounded-lg disabled:opacity-50">
              {planning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Lock intent & plan scenes
            </button>
          </div>

          {/* Plan */}
          {plan && (
            <div className="space-y-3 border-t border-amber-900/30 pt-3">
              {plan.ambiguities?.length > 0 && (
                <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5">
                  <p className="font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Resolve before rendering:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-200/70">{plan.ambiguities.map((a, i) => <li key={i}>{a}</li>)}</ul>
                  <p className="text-[10px] text-amber-200/40 mt-1">Edit the brief and re-plan, or render anyway.</p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold text-amber-200/60 mb-1.5">Scene plan (intent lock)</p>
                <ol className="space-y-1.5">
                  {plan.scene_plan?.map((s, i) => (
                    <li key={i} className="text-[11px] text-amber-100/80 bg-black/40 border border-amber-900/30 rounded-lg px-2.5 py-1.5">
                      <span className="font-bold text-amber-200">{i + 1}. {s.scene}</span> — {s.description}
                    </li>
                  ))}
                </ol>
              </div>

              <button onClick={runGenerate} disabled={generating}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:opacity-90 px-4 py-2.5 rounded-xl disabled:opacity-50">
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Rendering…</> : <><Film className="w-4 h-4" /> Render {format}</>}
              </button>
            </div>
          )}

          {/* Media */}
          {mediaUrl && (
            <div className="space-y-3 border-t border-amber-900/30 pt-3">
              <div className="rounded-lg overflow-hidden border border-amber-900/30">
                {format === "video"
                  ? <video src={mediaUrl} controls className="w-full max-h-72 object-contain bg-black" />
                  : <img src={mediaUrl} alt="" className="w-full max-h-72 object-contain bg-black" />}
              </div>

              {!cert && (
                <button onClick={runCertify} disabled={certifying}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-emerald-50 bg-emerald-700 hover:bg-emerald-600 px-4 py-2.5 rounded-xl disabled:opacity-50">
                  {certifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Running governance gate…</> : <><ShieldCheck className="w-4 h-4" /> Run Zero-Defect certification</>}
                </button>
              )}

              {cert && <ZeroDefectCertificate certificate={cert.certificate} governance={cert.governance} />}

              <button onClick={saveProduction} disabled={saving}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:opacity-90 px-4 py-2.5 rounded-xl disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Save to production history
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}