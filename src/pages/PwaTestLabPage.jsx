import React, { useState, useEffect } from "react";
import SharedNav from "@/components/SharedNav";
import PwaTestLab from "@/components/admin/PwaTestLab";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PwaTestLabPage() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then((u) => { setRole(u?.role); setLoading(false); })
      .catch(() => { setRole(null); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (role !== "admin" && role !== "staff") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h1>
          <p className="text-sm text-slate-500">Admin or staff access required to use the PWA Test Lab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">PWA Test Lab</h1>
          <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-1 rounded-full">Admin Only</span>
        </div>
        <PwaTestLab />
      </div>
    </div>
  );
}