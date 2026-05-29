import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ALL_SPECS = ["Risk & Compliance", "Site Reporting", "Bid Estimation", "Project Management", "Scheduling", "Financial Analysis", "Document Generation", "Contract Administration"];

export default function ProfileEditForm({ profile, onSave }) {
  const [form, setForm] = useState({ ...profile });

  const toggleSpec = (spec) => {
    const has = form.specializations.includes(spec);
    setForm(f => ({ ...f, specializations: has ? f.specializations.filter(s => s !== spec) : [...f.specializations, spec] }));
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-800">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Display Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Tagline</label>
          <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
            placeholder="One sentence about what you build"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={4} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-2">Specializations <span className="text-slate-400 font-normal">(select all that apply)</span></label>
          <div className="flex flex-wrap gap-2">
            {ALL_SPECS.map(s => (
              <button key={s} onClick={() => toggleSpec(s)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${form.specializations.includes(s) ? "bg-violet-700 text-white border-violet-700" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Location</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Website</label>
            <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">X / Twitter</label>
          <input value={form.twitter} onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
        </div>
        <div className="pt-2">
          <Button onClick={() => onSave(form)} className="w-full bg-violet-700 hover:bg-violet-800 text-white">
            Save Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}