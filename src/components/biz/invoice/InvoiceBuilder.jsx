import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, ListChecks, ShieldCheck } from "lucide-react";
import PolicySelectionStep from "./PolicySelectionStep";
import ItemizationStep from "./ItemizationStep";
import ForensicReviewStep from "./ForensicReviewStep";

const STEPS = [
  { key: "policy", label: "Policy Selection", icon: FileText },
  { key: "items", label: "Itemization", icon: ListChecks },
  { key: "review", label: "Forensic Review", icon: ShieldCheck },
];

/**
 * InvoiceBuilder — the Sovereign Invoicing System multi-step form.
 * Step 1 selects a policy from SPEAKEASY-POLICY-VAULT-1.0, Step 2 itemizes with
 * policy-auto-filled rates, Step 3 issues via SOVEREIGN-INVOICE-ENGINE-1.0 and
 * renders the forensic QR.
 */
export default function InvoiceBuilder() {
  const [step, setStep] = useState("policy");
  const [policy, setPolicy] = useState(null);
  const [billTo, setBillTo] = useState("");
  const [items, setItems] = useState([]);
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState(null);
  const [error, setError] = useState("");

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const onPolicyNext = (selectedPolicy, seededItems) => {
    setPolicy(selectedPolicy);
    setItems(seededItems);
    setStep("items");
  };

  const onItemsNext = (finalItems, billToName) => {
    setItems(finalItems);
    setBillTo(billToName);
    setStep("review");
  };

  const issue = async () => {
    setIssuing(true);
    setError("");
    try {
      const res = await base44.functions.invoke("sovereignInvoiceEngine", {
        action: "issue",
        policy_id: policy?.id || "",
        policy_name: policy?.policy_name || "",
        hub: policy?.hub || "",
        bill_to: billTo,
        line_items: items,
      });
      if (res.data?.ok) {
        setIssued(res.data);
      } else {
        setError(res.data?.error || "Could not issue the invoice.");
      }
    } catch {
      setError("Could not issue the invoice.");
    }
    setIssuing(false);
  };

  return (
    <div className="rounded-2xl border border-[#C8A95B]/20 bg-white/[0.02] p-5 sm:p-6">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <React.Fragment key={s.key}>
              <div className={`flex items-center gap-2 ${active ? "text-[#E6C878]" : done ? "text-emerald-400" : "text-white/35"}`}>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: active ? "rgba(200,169,91,0.15)" : done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${active ? "rgba(200,169,91,0.5)" : done ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.12)"}`,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-semibold hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/10" />}
            </React.Fragment>
          );
        })}
      </div>

      {step === "policy" && <PolicySelectionStep onNext={onPolicyNext} />}

      {step === "items" && (
        <ItemizationStep
          policy={policy}
          initialItems={items}
          initialBillTo={billTo}
          onBack={() => setStep("policy")}
          onNext={onItemsNext}
        />
      )}

      {step === "review" && (
        <ForensicReviewStep
          policy={policy}
          billTo={billTo}
          items={items}
          issuing={issuing}
          issued={issued}
          error={error}
          onBack={() => setStep("items")}
          onIssue={issue}
          onReset={() => { setStep("policy"); setPolicy(null); setItems([]); setBillTo(""); setIssued(null); setError(""); }}
        />
      )}
    </div>
  );
}