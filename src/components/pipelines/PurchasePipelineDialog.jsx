import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, Building2 } from "lucide-react";
import { toast } from "sonner";

const inIframe = () => { try { return window.self !== window.top; } catch { return true; } };

/**
 * Collects the buying company's details and starts a full-payment checkout for
 * the pipeline key. Blocks checkout inside the preview iframe (published-app only).
 */
export default function PurchasePipelineDialog({ pipeline, open, onClose }) {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!pipeline) return null;

  const buy = async () => {
    if (inIframe()) {
      toast.error("Checkout only works from the published app, not the preview window.");
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("purchasePipelineKey", {
        pipeline_id: pipeline.id,
        company_name: company,
        company_email: email,
        provider: "stripe",
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(res.data?.error || "Could not start checkout.");
        setLoading(false);
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not start checkout.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-400" /> {pipeline.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-slate-800/60 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-slate-400">One-time price</span>
            <span className="text-lg font-black text-white">${Number(pipeline.price || 0).toLocaleString()}</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Company name</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className="bg-slate-800 border-slate-600 text-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Billing email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ap@acme.com" className="bg-slate-800 border-slate-600 text-white" />
          </div>
          <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-800/60 rounded-lg p-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            After full payment, you'll be taken to a secure page that reveals your pipeline key once. Store it immediately.
          </div>
          <Button onClick={buy} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Pay & get secure key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}