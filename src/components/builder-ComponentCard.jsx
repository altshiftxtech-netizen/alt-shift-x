import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck, DollarSign, History, FlaskConical, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import ComponentDeleteDialog from "@/components/builder-ComponentDeleteDialog";
import PipelineOptInToggle from "@/components/pipelines/PipelineOptInToggle";
import { base44 } from "@/api/base44Client";

const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };
const statusStyles = {
  published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  draft: "bg-slate-100 text-slate-500 border-slate-200",
};

function TrustBadge({ score }) {
  if (score == null) return <span className="text-xs text-slate-400">Not yet scored</span>;
  const color = score >= 90 ? "text-emerald-600" : score >= 70 ? "text-blue-600" : "text-amber-600";
  return <span className={`text-sm font-black ${color}`}>{score}<span className="text-xs font-normal text-slate-400">/100</span></span>;
}

export default function ComponentCard({ component: c, onViewHistory, onRemoved }) {
  const [showDelete, setShowDelete] = useState(false);

  const handleShelf = async (comp) => {
    await base44.entities.Component.update(comp.id, { status: "shelved" });
    onRemoved && onRemoved(comp.id);
  };

  const handleDelete = async (comp) => {
    await base44.entities.Component.delete(comp.id);
    onRemoved && onRemoved(comp.id);
  };

  return (
    <>
      {showDelete && (
        <ComponentDeleteDialog
          component={c}
          onClose={() => setShowDelete(false)}
          onShelf={handleShelf}
          onDelete={handleDelete}
        />
      )}
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[c.type] || "bg-slate-100 text-slate-600"}`}>{c.type}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[c.status]}`}>{c.status}</span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{c.version}</span>
          </div>
          <button onClick={() => setShowDelete(true)} className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50" title="Remove component">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-0.5">{c.displayName}</h3>
        <p className="text-[10px] text-slate-400 font-mono mb-2">{c.name}</p>
        <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{c.description}</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Download className="w-3 h-3 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">{c.installs.toLocaleString()}</p>
            </div>
            <p className="text-[10px] text-slate-400">Installs</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <DollarSign className="w-3 h-3 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">${c.revenue.toLocaleString()}</p>
            </div>
            <p className="text-[10px] text-slate-400">Revenue</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <TrustBadge score={c.trustScore} />
            </div>
            <p className="text-[10px] text-slate-400">Trust Score</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/builder/sandbox" className="flex-1">
            <Button variant="outline" className="w-full text-xs h-8 gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" /> Test
            </Button>
          </Link>
          <Button variant="outline" className="flex-1 text-xs h-8 gap-1.5" onClick={onViewHistory}>
            <History className="w-3.5 h-3.5" /> History
          </Button>
        </div>

        {c.id && (
          <div className="mt-2.5">
            <PipelineOptInToggle componentId={c.id} initial={c.include_in_pipelines} />
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}