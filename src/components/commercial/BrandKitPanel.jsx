import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, Palette, X, Check, Pencil } from "lucide-react";

// Brand Kit onboarding + editor. Persists to the BrandKit entity so it steers
// every production and survives across sessions. Brand Consistency Lock is
// active by default the moment a kit exists. `prefill` (from Document Intake)
// auto-populates the fields and opens the editor for review.
export default function BrandKitPanel({ kit, prefill, onSaved }) {
  const [editing, setEditing] = useState(!kit);
  const [brandName, setBrandName] = useState(kit?.brand_name || "");
  const [logoUrl, setLogoUrl] = useState(kit?.logo_url || "");
  const [colors, setColors] = useState(kit?.colors?.length ? kit.colors : ["#0A0A0C", "#C8A95B"]);
  const [fonts, setFonts] = useState(kit?.fonts || "");
  const [tone, setTone] = useState(kit?.tone || "");
  const [styleNotes, setStyleNotes] = useState(kit?.style_notes || "");
  const [refs, setRefs] = useState(kit?.reference_image_urls || []);

  // When Document Intake extracts brand info, fill any field it found and open
  // the editor so the operator can review/edit before saving. Fields the doc
  // didn't mention are left as-is (already populated / defaults).
  useEffect(() => {
    if (!prefill) return;
    if (prefill.brand_name) setBrandName(prefill.brand_name);
    if (prefill.colors?.length) setColors(prefill.colors);
    if (prefill.fonts) setFonts(prefill.fonts);
    if (prefill.tone) setTone(prefill.tone);
    if (prefill.style_notes) setStyleNotes(prefill.style_notes);
    setEditing(true);
  }, [prefill]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoRef = useRef(null);
  const refRef = useRef(null);

  const doUpload = async (file) => {
    const res = await base44.integrations.Core.UploadFile({ file });
    const url = res?.file_url || res?.data?.file_url;
    if (!url) throw new Error("Upload did not return a file URL");
    return url;
  };

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try { setLogoUrl(await doUpload(file)); } finally { setUploading(false); }
  };

  const uploadRef = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try { const url = await doUpload(file); setRefs((prev) => [...prev, url]); } finally { setUploading(false); }
  };

  const save = async () => {
    if (!brandName.trim()) return;
    setSaving(true);
    const me = await base44.auth.me();
    const data = {
      owner_id: me.id,
      brand_name: brandName,
      logo_url: logoUrl || undefined,
      colors,
      fonts,
      tone,
      style_notes: styleNotes,
      reference_image_urls: refs,
      is_active: true,
    };
    let saved;
    if (kit?.id) saved = await base44.entities.BrandKit.update(kit.id, data);
    else saved = await base44.entities.BrandKit.create(data);
    setSaving(false);
    setEditing(false);
    onSaved?.(saved);
  };

  if (!editing && kit) {
    return (
      <div className="bg-[#12100f] border border-amber-900/30 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> Consistency Lock On
            </span>
          </div>
          <button onClick={() => setEditing(true)} className="text-amber-300/70 hover:text-amber-200 p-1 rounded-lg hover:bg-amber-900/20">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {kit.logo_url
            ? <img src={kit.logo_url} alt="" className="w-12 h-12 rounded-lg object-contain bg-black/40 border border-amber-900/30" />
            : <div className="w-12 h-12 rounded-lg bg-amber-900/20 border border-amber-900/30 flex items-center justify-center"><Palette className="w-5 h-5 text-amber-400/60" /></div>}
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-50 truncate">{kit.brand_name}</p>
            <p className="text-[11px] text-amber-200/50 truncate">{kit.tone || "No tone set"}</p>
          </div>
          <div className="ml-auto flex gap-1">
            {(kit.colors || []).slice(0, 5).map((c, i) => (
              <span key={i} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} title={c} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#12100f] border border-amber-900/30 rounded-2xl p-4 space-y-3">
      <p className="text-sm font-bold text-amber-50 flex items-center gap-2">
        <Palette className="w-4 h-4 text-amber-400" /> Brand Kit
      </p>
      <p className="text-[11px] text-amber-200/50 -mt-1">Uploaded once, enforced on every production.</p>

      <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Brand name *"
        className="w-full bg-black/40 text-amber-50 text-sm px-3 py-2 rounded-lg border border-amber-900/30 outline-none focus:border-amber-600" />

      {/* Logo */}
      <div className="flex items-center gap-2">
        {logoUrl && <img src={logoUrl} alt="" className="w-10 h-10 rounded-lg object-contain bg-black/40 border border-amber-900/30" />}
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
        <button onClick={() => logoRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-200 bg-black/40 hover:bg-black/60 border border-amber-900/30 px-2.5 py-1.5 rounded-lg">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Logo
        </button>
      </div>

      {/* Colors */}
      <div>
        <label className="text-[11px] font-semibold text-amber-200/60 block mb-1.5">Brand colors</label>
        <div className="flex flex-wrap items-center gap-2">
          {colors.map((c, i) => (
            <div key={i} className="relative group">
              <input type="color" value={c} onChange={(e) => setColors((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                className="w-8 h-8 rounded-lg border border-amber-900/30 bg-transparent cursor-pointer" />
              <button onClick={() => setColors((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X className="w-2.5 h-2.5 text-white" /></button>
            </div>
          ))}
          {colors.length < 6 && (
            <button onClick={() => setColors((prev) => [...prev, "#ffffff"])}
              className="w-8 h-8 rounded-lg border border-dashed border-amber-700/50 text-amber-400 hover:border-amber-500 text-lg leading-none">+</button>
          )}
        </div>
      </div>

      <input value={fonts} onChange={(e) => setFonts(e.target.value)} placeholder="Fonts / typography"
        className="w-full bg-black/40 text-amber-50 text-sm px-3 py-2 rounded-lg border border-amber-900/30 outline-none focus:border-amber-600" />
      <input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Voice & tone (e.g. confident, editorial)"
        className="w-full bg-black/40 text-amber-50 text-sm px-3 py-2 rounded-lg border border-amber-900/30 outline-none focus:border-amber-600" />
      <textarea value={styleNotes} onChange={(e) => setStyleNotes(e.target.value)} rows={2} placeholder="Visual style direction to enforce"
        className="w-full bg-black/40 text-amber-50 text-sm px-3 py-2 rounded-lg border border-amber-900/30 outline-none focus:border-amber-600 resize-none" />

      {/* Reference images */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          {refs.map((r, i) => (
            <div key={i} className="relative group">
              <img src={r} alt="" className="w-12 h-12 rounded-lg object-cover border border-amber-900/30" />
              <button onClick={() => setRefs((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X className="w-2.5 h-2.5 text-white" /></button>
            </div>
          ))}
          <input ref={refRef} type="file" accept="image/*" className="hidden" onChange={uploadRef} />
          <button onClick={() => refRef.current?.click()} disabled={uploading}
            className="w-12 h-12 rounded-lg border border-dashed border-amber-700/50 text-amber-400 hover:border-amber-500 flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-amber-200/40 mt-1">Style reference images (optional)</p>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={save} disabled={saving || !brandName.trim()}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:opacity-90 px-4 py-2 rounded-xl disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Brand Kit
        </button>
        {kit && (
          <button onClick={() => setEditing(false)} className="text-amber-200/60 hover:text-amber-200 px-3 py-2 rounded-xl border border-amber-900/30">Cancel</button>
        )}
      </div>
    </div>
  );
}