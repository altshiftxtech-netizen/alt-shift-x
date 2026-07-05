import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bluetooth, Radio, Loader2, CheckCircle2, KeyRound, Copy, ShieldCheck, Fingerprint } from "lucide-react";

/**
 * Secure Handshake — BT-SECURE-KEY-TRANS-1.0. A secure in-app key handoff
 * styled as an air-gapped Bluetooth pairing ceremony.
 *  - Admin side: Pair & Transmit Key
 *  - User side:  Receive & Ingest → green "Forensic Read-Receipt Verified"
 */
export default function SecureHandshakeModule({ isAdmin, user, onRequireLegal, legalAccepted }) {
  return (
    <div className="rounded-2xl border p-6" style={{ background: "linear-gradient(180deg,rgba(20,24,34,0.7),rgba(8,10,16,0.85))", borderColor: "#3B82F633" }}>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <Bluetooth className="w-5 h-5 text-[#5BA2FF]" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5BA2FF]">Air-Gapped Sovereignty</p>
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Secure Handshake</h3>
        </div>
        <span className="ml-auto text-[10px] font-mono text-white/30">BT-SECURE-KEY-TRANS-1.0</span>
      </div>
      <p className="text-xs text-white/45 mb-5">A single-issue key transfer. Pair, transmit, and confirm delivery with a cryptographic forensic read-receipt.</p>

      {isAdmin
        ? <TransmitSide onRequireLegal={onRequireLegal} legalAccepted={legalAccepted} user={user} />
        : <IngestSide onRequireLegal={onRequireLegal} legalAccepted={legalAccepted} user={user} />}
    </div>
  );
}

/* ── Admin: Pair & Transmit Key ─────────────────────────────────────────── */
function TransmitSide({ onRequireLegal, legalAccepted, user }) {
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | pairing | done
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const transmit = async () => {
    setError("");
    if (!legalAccepted) { onRequireLegal(); return; }
    if (!email || !secret) { setError("Recipient email and the key are required."); return; }
    setPhase("pairing");
    // brief pairing ceremony beat, then transmit
    await new Promise((r) => setTimeout(r, 1400));
    const res = await base44.functions.invoke("secureHandshake", {
      action: "transmit", recipient_email: email, key_label: label, key_secret: secret,
    });
    if (res.data?.handshake) { setResult(res.data.handshake); setPhase("done"); }
    else { setError(res.data?.error || "Transmission failed."); setPhase("idle"); }
  };

  if (phase === "done" && result) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)" }}>
          <Radio className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-sm font-bold text-white">Key transmitted & paired</p>
        <p className="text-xs text-white/50 mt-1">Sent to <span className="text-white/80">{result.recipient_email}</span></p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2" style={{ background: "rgba(255,255,255,0.05)" }}>
          <span className="text-[10px] uppercase tracking-widest text-white/40">Pairing code</span>
          <span className="font-mono text-lg font-bold tracking-[0.3em] text-[#5BA2FF]">{result.pairing_code}</span>
        </div>
        <p className="text-[11px] text-white/40 mt-3">The recipient must Receive &amp; Ingest to unseal the key. It reveals exactly once.</p>
        <Button variant="ghost" className="mt-3 text-xs text-white/60 hover:text-white" onClick={() => { setPhase("idle"); setResult(null); setEmail(""); setLabel(""); setSecret(""); }}>
          Transmit another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Input placeholder="Recipient email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        <Input placeholder="Key label (e.g. Pipeline LIVE)" value={label} onChange={(e) => setLabel(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
      </div>
      <Input placeholder="Key / secret to transmit" value={secret} onChange={(e) => setSecret(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono" />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button onClick={transmit} disabled={phase === "pairing"} className="w-full font-semibold text-white" style={{ background: "linear-gradient(90deg,#2563EB,#3B82F6)" }}>
        {phase === "pairing" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Pairing…</> : <><Bluetooth className="w-4 h-4 mr-2" /> Pair &amp; Transmit Key</>}
      </Button>
      {phase === "pairing" && <PairingWaves />}
    </div>
  );
}

/* ── User: Receive & Ingest ─────────────────────────────────────────────── */
function IngestSide({ onRequireLegal, legalAccepted, user }) {
  const [pending, setPending] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | scanning | verified
  const [revealed, setRevealed] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const rows = await base44.entities.SecureHandshake.filter({ recipient_email: user?.email });
      setPending(rows.filter((r) => r.status === "transmitted"));
    } catch { /* no-op */ }
  };
  useEffect(() => { if (user?.email) load(); }, [user?.email]);

  const ingest = async (hs) => {
    setError("");
    if (!legalAccepted) { onRequireLegal(); return; }
    setPhase("scanning");
    await new Promise((r) => setTimeout(r, 1600));
    const res = await base44.functions.invoke("secureHandshake", { action: "ingest", handshake_id: hs.id });
    if (res.data?.key_secret) {
      setRevealed({ label: res.data.key_label, secret: res.data.key_secret });
      setReceipt(res.data.receipt);
      setPhase("verified");
      load();
    } else { setError(res.data?.error || "Ingest failed."); setPhase("idle"); }
  };

  if (phase === "verified" && revealed) {
    return (
      <div className="text-center py-3">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 animate-pulse" style={{ background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.5)" }}>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
          <Fingerprint className="w-4 h-4" /> Forensic Read-Receipt Verified
        </p>
        <p className="text-[11px] text-white/40 mt-1 font-mono break-all px-4">{receipt?.receipt_hash}</p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left">
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{revealed.label}</p>
          <div className="flex items-center gap-2">
            <code className="text-sm text-[#5BEbA0] font-mono break-all flex-1">{revealed.secret}</code>
            <button onClick={() => { navigator.clipboard.writeText(revealed.secret); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-white/50 hover:text-white shrink-0">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <p className="text-[10px] text-emerald-400 mt-1">Copied</p>}
          <p className="text-[10px] text-amber-400/80 mt-2">This key is shown once. Store it securely now.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {phase === "scanning" ? (
        <div className="py-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.4)" }}>
            <Loader2 className="w-5 h-5 text-[#5BA2FF] animate-spin" />
          </div>
          <p className="text-xs text-white/60">Establishing secure link & verifying receipt…</p>
          <PairingWaves />
        </div>
      ) : pending.length === 0 ? (
        <div className="py-6 text-center">
          <KeyRound className="w-8 h-8 mx-auto text-white/20 mb-2" />
          <p className="text-xs text-white/40">No keys awaiting ingest. When an operator transmits a key to <span className="text-white/70">{user?.email}</span>, it will appear here.</p>
          <Button variant="ghost" className="mt-2 text-xs text-white/50" onClick={load}>Refresh</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((hs) => (
            <div key={hs.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                <KeyRound className="w-4 h-4 text-[#5BA2FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{hs.key_label}</p>
                <p className="text-[10px] text-white/40 font-mono">Pairing {hs.pairing_code} · ••••{hs.key_last4}</p>
              </div>
              <Button size="sm" onClick={() => ingest(hs)} className="font-semibold text-white shrink-0" style={{ background: "linear-gradient(90deg,#059669,#10B981)" }}>
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Receive &amp; Ingest
              </Button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}

function PairingWaves() {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-3">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="w-1.5 rounded-full bg-[#5BA2FF] animate-pulse" style={{ height: `${8 + i * 5}px`, animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}