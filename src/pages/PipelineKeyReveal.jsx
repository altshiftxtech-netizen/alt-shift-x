import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Loader2, Copy, CheckCircle2, KeyRound, AlertTriangle, Lock } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import { toast } from "sonner";

/**
 * Secure one-time pipeline key reveal page (/pipeline-key/:id).
 * The plaintext key is fetched from the backend ONCE after payment is confirmed,
 * shown on this page, and never stored in plaintext anywhere.
 */
export default function PipelineKeyReveal() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [record, setRecord] = useState(null);
  const [plainKey, setPlainKey] = useState(null);
  const [alreadyRevealed, setAlreadyRevealed] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = await base44.entities.PipelineKey.filter({ id });
        setRecord(rows[0] || null);
        if (rows[0]?.revealed) setAlreadyRevealed(true);
      } catch (e) {
        setError("Could not load this pipeline key.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const reveal = async () => {
    setRevealing(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("revealPipelineKey", { pipeline_key_id: id });
      const data = res.data || {};
      if (data.key) {
        setPlainKey(data.key);
      } else if (data.already_revealed) {
        setAlreadyRevealed(true);
        toast.error("This key was already revealed once and can't be shown again.");
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Payment not confirmed yet, or the key could not be issued.");
    } finally {
      setRevealing(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(plainKey);
    setCopied(true);
    toast.success("Key copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900">
      <SharedNav mode="user" />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-violet-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Secure Pipeline Key</h1>
            <p className="text-slate-400 text-sm">{record?.pipeline_name || "Enterprise Pipeline"}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          </div>
        ) : !record ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="pt-6 text-slate-400 text-sm">This pipeline key could not be found.</CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Company</span>
                <span className="text-white font-medium">{record.company_name || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Amount paid</span>
                <span className="text-white font-medium">${Number(record.amount_paid || 0).toLocaleString()}</span>
              </div>

              {plainKey ? (
                <>
                  <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Payment confirmed — your key is ready
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5">
                      <code className="text-emerald-400 text-xs font-mono break-all flex-1">{plainKey}</code>
                      <Button size="icon" variant="ghost" onClick={copy} className="text-slate-400 hover:text-white shrink-0">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-900/20 border border-amber-700/40 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    This key is shown <strong>only once</strong>. Copy and store it in your secrets manager now — it cannot be retrieved again.
                  </div>
                </>
              ) : alreadyRevealed ? (
                <div className="flex items-start gap-2 text-sm text-slate-300 bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  This key has already been revealed once and cannot be shown again. If you lost it, contact <a href="mailto:enterprise@altshiftx.com" className="text-violet-400 hover:underline">enterprise@altshiftx.com</a> to re-issue.
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-400">
                    Click below to securely generate and reveal your pipeline key. For your security, it will be displayed only once.
                  </p>
                  <Button onClick={reveal} disabled={revealing} className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
                    {revealing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Reveal my secure key
                  </Button>
                </>
              )}

              {error && (
                <div className="text-xs text-rose-400 bg-rose-900/20 border border-rose-700/40 rounded-lg p-3">{error}</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}