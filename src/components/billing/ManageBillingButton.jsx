import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Opens the Stripe Customer Portal where the user updates their card/bank,
// views invoices, and manages their subscription. Works only from the published
// app (Stripe Checkout/Portal cannot run inside the builder iframe).
export default function ManageBillingButton({ children = "Update Card", className = "", variant = "outline", size }) {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    // Stripe portal can't run inside an iframe (the builder preview)
    if (window.self !== window.top) {
      alert("Billing management opens only from the published app. Please open your live app and try again.");
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("createBillingPortalSession", {
        return_url: window.location.href,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert(res.data?.error || "Could not open billing portal.");
        setLoading(false);
      }
    } catch (err) {
      alert(err?.response?.data?.error || "Could not open billing portal.");
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} className={`text-sm gap-2 ${className}`} onClick={openPortal} disabled={loading}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}