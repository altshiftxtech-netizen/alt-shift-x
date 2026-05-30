import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Download, Loader2, Trash2, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function InstallButton({ component, size = "default" }) {
  const [installed, setInstalled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user) { setLoading(false); return; }
      base44.entities.InstalledComponent.filter({ user_id: user.id, component_id: component.id })
        .then(results => {
          if (results.length > 0) { setInstalled(true); setRecord(results[0]); }
          setLoading(false);
        });
    }).catch(() => setLoading(false));
  }, [component.id]);

  const handleInstall = async () => {
    // Check subscription before allowing download/install
    const subs = await base44.entities.Subscription.filter({ status: "active" });
    const hasPaid = subs && subs.length > 0 && !["free", "trial"].includes(subs[0]?.plan);
    if (!hasPaid) {
      window.location.href = "/pricing";
      return;
    }
    setLoading(true);
    const user = await base44.auth.me();
    const today = new Date().toISOString().split("T")[0];
    const rec = await base44.entities.InstalledComponent.create({
      user_id: user.id,
      component_id: component.id,
      component_name: component.name,
      component_code: component.code,
      component_type: component.type,
      trust_score: component.trustScore,
      installed_at: today,
      last_used: "Never",
      calls_this_month: 0,
      status: "active",
    });
    setRecord(rec);
    setInstalled(true);
    setLoading(false);
  };

  const handleUninstall = async () => {
    setLoading(true);
    await base44.entities.InstalledComponent.delete(record.id);
    setInstalled(false);
    setRecord(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <Button disabled size={size} variant="outline" className="gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </Button>
    );
  }

  if (installed) {
    return (
      <Button size={size} variant="outline" onClick={handleUninstall}
        className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300">
        <Trash2 className="w-4 h-4" /> Uninstall
      </Button>
    );
  }

  return (
    <Button size={size} onClick={handleInstall}
      className="gap-2 bg-violet-700 hover:bg-violet-800 text-white">
      <Download className="w-4 h-4" /> Install
    </Button>
  );
}