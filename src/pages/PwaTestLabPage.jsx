import React from "react";
import SharedNav from "@/components/SharedNav";
import PwaTestLab from "@/components/admin/PwaTestLab";

export default function PwaTestLabPage() {
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