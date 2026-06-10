import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Package, Loader2, Mail, LifeBuoy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import QuickStartActivation from "@/components/install/QuickStartActivation";

export default function ComponentSetup() {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resolve the real component for this install — by Component id, then by the
  // user's InstalledComponent record — so the guide matches what was clicked.
  useEffect(() => {
    (async () => {
      let found = null;
      try {
        found = await base44.entities.Component.get(id);
      } catch { /* not a Component id */ }
      if (!found) {
        try {
          const me = await base44.auth.me();
          const installs = await base44.entities.InstalledComponent.filter({ user_id: me.id, component_id: id });
          if (installs?.[0]) found = installs[0];
        } catch { /* ignore */ }
      }
      setComponent(found);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const name = component?.name || component?.component_name || "Your Component";
  const code = component?.code || component?.component_code || "";

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <Link to="/dashboard/installed" className="text-sm text-slate-400 hover:text-slate-700">Installed</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-700 font-medium">Welcome Guide: {name}</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-violet-100"><Package className="w-5 h-5 text-violet-700" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
            {code && <p className="text-sm font-mono text-slate-400">{code} · Welcome Guide</p>}
          </div>
        </div>

        {/* Welcome letter — warm, plain-English, non-technical */}
        <Card>
          <CardContent className="py-6 space-y-4 text-slate-700">
            <p className="text-sm leading-relaxed">Dear Valued Member,</p>
            <p className="text-sm leading-relaxed">
              Welcome, and thank you for choosing <span className="font-semibold text-slate-900">{name}</span>.
              We're delighted to have you on board. This short guide will help you get started in just a few
              minutes — no technical experience needed.
            </p>
            <p className="text-sm leading-relaxed">
              Getting set up is as simple as creating your personal access key, saving it somewhere safe, pasting it
              into your device, and checking your key is active. Just follow the steps below, one at a time.
            </p>
            <p className="text-sm leading-relaxed">
              If you ever feel unsure at any point, please don't worry — our team is always happy to help. You'll
              find our contact details at the bottom of this page.
            </p>
            <p className="text-sm leading-relaxed">Warm regards,<br /><span className="font-semibold text-slate-900">The Alt+Shift+X Team</span></p>
          </CardContent>
        </Card>

        {/* The actual easy activation flow */}
        <QuickStartActivation componentName={name} />

        {/* Help footer */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="py-5 flex items-start gap-3">
            <LifeBuoy className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">Need a hand?</p>
              <p className="text-xs text-slate-500 mt-0.5">
                We're here for you. Reach out any time and a real person will help you get going.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline mt-2">
                <Mail className="w-3.5 h-3.5" /> Contact our support team
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}