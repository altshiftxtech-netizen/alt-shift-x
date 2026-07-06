import React, { useEffect, useState } from "react";
import { Loader2, Building2, UserPlus, ShieldCheck, CheckCircle2, Crown, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BlackstoneLegalGate from "@/components/legal/BlackstoneLegalGate";
import StaffRegistryTable from "./StaffRegistryTable";
import InviteMemberModal from "./InviteMemberModal";

const GOLD = "#C8A95B";
const CORE_CODE = "EXPERT-MINDS-ENTERPRISE-CORE-1.0";
const EM_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/70a65d41d_generated_image.png";

/**
 * ExpertMindsEnterpriseTab — the /enterprise gate to ExpertMinds Enterprise.
 *
 * Flow: Org Admin signs the Blackstone Enterprise Agreement → $10k/mo core
 * subscription checkout (EXPERT-MINDS-ENTERPRISE-CORE-1.0). Once active, the
 * Org Admin manages member seats (EXPERT-MINDS-MEMBER-LICENSE-1.0, $999/mo),
 * each invite pending until the member completes their Vana-Voice handshake.
 */
export default function ExpertMindsEnterpriseTab() {
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [seats, setSeats] = useState([]);
  const [orgName, setOrgName] = useState("");
  const [legalOpen, setLegalOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await base44.functions.invoke("expertMindsOrgOps", { action: "list" });
      if (res.data?.ok) {
        setOrg(res.data.org);
        setSeats(res.data.seats || []);
        if (res.data.org?.org_name) setOrgName(res.data.org.org_name);
      }
    } catch {
      setError("Could not load your organization.");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const inIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();

  // Blackstone signed → open the $10k/mo core checkout.
  const onCleared = async (hash) => {
    setLegalOpen(false);
    if (inIframe) { setError("Checkout works only from the published app. Open ExpertMinds in a new tab to subscribe."); return; }
    setCheckout(true);
    setError("");
    try {
      const res = await base44.functions.invoke("expertMindsOrgOps", {
        action: "setup_org",
        org_name: orgName.trim() || undefined,
        blackstone_acceptance_hash: hash,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || "Could not open checkout.");
        await load();
      }
    } catch {
      setError("Could not open checkout.");
    }
    setCheckout(false);
  };

  const active = org?.core_status === "active";
  const verifiedCount = seats.filter((s) => s.forensic_status === "verified").length;

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#C8A95B]/60" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Corporate masthead — frosted glass panel */}
      <div
        className="rounded-2xl border p-6 backdrop-blur-xl"
        style={{
          borderColor: `${GOLD}44`,
          background: "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(200,169,91,0.05) 55%, rgba(0,0,0,0.25))",
          boxShadow: `0 20px 60px -24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)`,
        }}
      >
        <div className="flex items-start gap-4">
          <img src={EM_LOGO} alt="ExpertMinds" className="h-16 w-16 object-contain rounded-xl" draggable="false" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${GOLD}33`, padding: 4 }} />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>{CORE_CODE} · $10k/mo</p>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>ExpertMinds Enterprise</h3>
            <p className="text-xs text-white/50 mt-1 max-w-lg">
              The Org Master license. Sign the Blackstone Enterprise Agreement, activate your core subscription, then provision
              member seats — each activated by a Vana-Voice biological handshake.
            </p>
          </div>
        </div>
      </div>

      {/* Gate: not yet active → Buy Enterprise */}
      {!active ? (
        <div className="rounded-2xl border p-6 text-center max-w-lg mx-auto" style={{ borderColor: `${GOLD}44`, background: "rgba(255,255,255,0.02)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}55` }}>
            <Crown className="w-6 h-6" style={{ color: GOLD }} />
          </div>
          <h4 className="text-lg font-bold text-white">Activate the Org Master</h4>
          <p className="text-sm text-white/50 mt-2 mb-5">
            Mandatory Blackstone Enterprise Agreement signature by the primary Org Admin, then a $10,000/mo core subscription.
          </p>
          <div className="max-w-xs mx-auto mb-4 text-left">
            <label className="block text-[11px] font-semibold text-white/60 mb-1">Organization name</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Corporation"
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]"
            />
          </div>
          <button
            onClick={() => setLegalOpen(true)}
            disabled={checkout}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#0A0A0C] disabled:opacity-60"
            style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
          >
            {checkout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            {checkout ? "Opening checkout…" : "Buy Enterprise · $10k/mo"}
          </button>
          <p className="text-[11px] text-white/35 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: GOLD }} /> Blackstone Enterprise Agreement required
          </p>
          {org?.core_status === "pending_payment" && (
            <p className="text-[11px] text-amber-400 mt-2">Agreement signed — complete the checkout to activate.</p>
          )}
        </div>
      ) : (
        <>
          {/* Active org — staff registry */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.35)" }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Core Active
              </span>
              <span className="text-sm text-white/60">{org.org_name}</span>
              <span className="text-[11px] text-white/35">· {verifiedCount}/{seats.length} verified</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5"><RefreshCw className="w-4 h-4" /></button>
              <button
                onClick={() => setInviteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#0A0A0C]"
                style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
              >
                <UserPlus className="w-3.5 h-3.5" /> Invite Member
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Staff Registry</p>
            <StaffRegistryTable seats={seats} />
          </div>
        </>
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <BlackstoneLegalGate
        open={legalOpen}
        componentCode={CORE_CODE}
        componentName="ExpertMinds Enterprise Agreement"
        onCleared={onCleared}
        onCancel={() => setLegalOpen(false)}
      />
      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={() => load()}
      />
    </div>
  );
}