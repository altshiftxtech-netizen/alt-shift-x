import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ShieldAlert, Globe, Clock } from "lucide-react";

const SEV_COLORS = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700"
};

const STATUS_OPTIONS = ["new", "reviewed", "reported_to_authorities", "dismissed"];

export default function IncidentRow({ incident, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(incident.status);

  const updateStatus = async (newStatus) => {
    setStatus(newStatus);
    await base44.entities.SecurityIncident.update(incident.id, { status: newStatus });
    if (onUpdated) onUpdated();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 text-left">
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-900">{incident.incident_type.replace(/_/g, " ")}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${SEV_COLORS[incident.severity] || SEV_COLORS.medium}`}>
              {incident.severity}
            </span>
            {incident.blocked && <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">Blocked</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{incident.ip_address}</span>
            {incident.geo_country && <span>{incident.geo_country}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(incident.created_date).toLocaleString()}</span>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${status === "new" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
          {status.replace(/_/g, " ")}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Detail label="Detection Rule" value={incident.detection_rule} />
            <Detail label="Request Path" value={incident.request_path} />
            <Detail label="Method" value={incident.request_method} />
            <Detail label="User-Agent" value={incident.user_agent} />
            <Detail label="Email Sent" value={incident.email_sent ? "Yes" : "No"} />
          </div>
          {incident.payload_sample && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payload Sample</p>
              <pre className="bg-slate-900 text-slate-100 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">{incident.payload_sample}</pre>
            </div>
          )}
          {incident.headers_fingerprint && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Header Fingerprint</p>
              <pre className="bg-white border border-slate-200 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(incident.headers_fingerprint, null, 2)}</pre>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Set Status</span>
            {STATUS_OPTIONS.map(s => (
              <Button key={s} size="sm" variant={status === s ? "default" : "outline"} className="text-[10px] h-7"
                onClick={() => updateStatus(s)}>
                {s.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-slate-700 break-all">{value || "—"}</p>
    </div>
  );
}