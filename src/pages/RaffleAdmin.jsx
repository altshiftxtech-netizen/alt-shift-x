import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Ticket, Loader2, ShieldX } from "lucide-react";
import RaffleAdminPanel from "@/components/raffles/RaffleAdminPanel";

export default function RaffleAdmin() {
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState([]);
  const [active, setActive] = useState(null);
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== "admin") { setAuthorized(false); return; }
      setAuthorized(true);
      const rows = await base44.entities.Raffle.list("-created_date", 50);
      setRaffles(rows);
      setActive(rows[0] || null);
    })();
  }, []);

  if (authorized === null) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }
  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-600">
        <ShieldX className="w-10 h-10 text-slate-400" />
        <p>Admins only.</p>
        <button onClick={() => navigate("/")} className="text-slate-900 underline">Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft className="w-4 h-4" /> Admin
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Ticket className="w-6 h-6" /> Raffle Draw &amp; Fulfillment</h1>
        <p className="text-slate-500 text-sm mt-1">Draw winners, verify eligibility (DOB re-check), auto-promote alternates, and queue vouchers/shipping.</p>

        <div className="flex gap-2 flex-wrap mt-6 mb-6">
          {raffles.map((r) => (
            <button key={r.id} onClick={() => setActive(r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${active?.id === r.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
              {r.title}
            </button>
          ))}
        </div>

        {active && <RaffleAdminPanel key={active.id} raffle={active} />}
      </div>
    </div>
  );
}