import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Users, Flag, CreditCard, Loader2, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";
import LegalDocumentsTab from "@/components/admin/LegalDocumentsTab";
import ReconciliationPanel from "@/components/ReconciliationPanel";
import AuditTrailViewer from "@/components/AuditTrailViewer";

const TABS = ["Pending Review", "Published", "Flagged", "Builders", "Subscriptions", "Legal Docs", "Reconciliation", "Audit Trail"];

const PENDING = [
  { id: "p1", name: "Claim Sentinel 2.0", code: "RP-CLAIMS-2.0", builder: "ClaimAI", type: "X1", submitted: "May 27, 2026", trustScore: 76, category: "Risk & Compliance", issues: [] },
  { id: "p2", name: "Budget Tracker Pro", code: "PM-BUDGET-1.0", builder: "SiteIntel", type: "X2", submitted: "May 25, 2026", trustScore: 83, category: "Project Management", issues: [] },
  { id: "p3", name: "Permit Tracker 2.0", code: "RP-PERMIT-2.0", builder: "ComplianceBot", type: "X1", submitted: "May 22, 2026", trustScore: 68, category: "Risk & Compliance", issues: ["Low benchmark accuracy (68%)", "Missing citation references on Pass 2"] },
];

const PUBLISHED = [
  { id: "pub1", name: "Ironclad Protocol", code: "RP-CONSTRUCTION-1.0", builder: "BuildRight AI", type: "X1", trustScore: 91, installs: 2341, status: "live" },
  { id: "pub2", name: "The Site Board", code: "RC-CONSTRUCTION", builder: "BuildRight AI", type: "X4", trustScore: 93, installs: 612, status: "live" },
  { id: "pub3", name: "Estimator's Eye", code: "PM-CONSTRUCTION-BID", builder: "SiteIntel", type: "X2", trustScore: 87, installs: 890, status: "live" },
  { id: "pub4", name: "Schedule Pulse", code: "PM-SCHEDULE-1.0", builder: "SiteIntel", type: "X2", trustScore: 89, installs: 734, status: "live" },
];

const FLAGGED = [
  { id: "f1", name: "Permit Tracker", code: "RP-PERMIT-1.0", builder: "ComplianceBot", type: "X1", trustScore: 78, flags: 3, lastFlag: "May 28, 2026", reason: "Multiple users reporting incorrect permit expiry extraction" },
];

const BUILDERS_LIST = [
  { id: "buildright-ai", name: "BuildRight AI", tier: "certified", components: 3, totalInstalls: 3565, joined: "Jan 2025" },
  { id: "siteintel", name: "SiteIntel", tier: "official", components: 3, totalInstalls: 2022, joined: "Mar 2025" },
  { id: "claimai", name: "ClaimAI", tier: "community", components: 1, totalInstalls: 445, joined: "Jun 2025" },
  { id: "compliancebot", name: "ComplianceBot", tier: "community", components: 1, totalInstalls: 267, joined: "Sep 2025" },
];

const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };
const tierConfig = { certified: "bg-emerald-100 text-emerald-700", official: "bg-violet-100 text-violet-700", community: "bg-slate-100 text-slate-600" };

const STATS = [
  { label: "Pending Review", value: PENDING.length, icon: Clock, color: "text-amber-600" },
  { label: "Published", value: PUBLISHED.length, icon: CheckCircle2, color: "text-emerald-600" },
  { label: "Flagged", value: FLAGGED.length, icon: Flag, color: "text-red-600" },
  { label: "Builders", value: BUILDERS_LIST.length, icon: Users, color: "text-violet-600" },
];

const PLAN_LABELS = { starter: "Starter", pro: "Pro", enterprise: "Enterprise" };
const PLAN_COLORS = { starter: "bg-slate-100 text-slate-600", pro: "bg-violet-100 text-violet-700", enterprise: "bg-blue-100 text-blue-700" };
const STATUS_COLORS = { active: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-600", past_due: "bg-amber-100 text-amber-700" };

function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    base44.asServiceRole?.entities?.Subscription?.list("-created_date", 50)
      .then(data => { setSubscriptions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-3">
      {subscriptions.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No subscriptions yet</div>
      ) : (
        subscriptions.map(sub => (
          <Card key={sub.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl"><CreditCard className="w-4 h-4 text-slate-500" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PLAN_COLORS[sub.plan] || "bg-slate-100 text-slate-600"}`}>{PLAN_LABELS[sub.plan] || sub.plan}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[sub.status] || "bg-slate-100 text-slate-500"}`}>{sub.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Customer: {sub.stripe_customer_id || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-slate-700">{(sub.api_calls_used || 0).toLocaleString()}</p>
                  <p className="text-slate-400">API calls used</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-700">{sub.current_period_end || "—"}</p>
                  <p className="text-slate-400">renews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function PendingTab() {
  const [items, setItems] = useState(PENDING);
  const approve = (id) => setItems(p => p.filter(c => c.id !== id));
  const reject = (id) => setItems(p => p.filter(c => c.id !== id));

  return (
    <div className="space-y-4">
      {items.map(c => (
        <Card key={c.id} className={c.issues.length ? "border-amber-200" : ""}>
          <CardContent className="pt-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{c.category}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${c.trustScore >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    <ShieldCheck className="w-2.5 h-2.5" />{c.trustScore}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">{c.name}</p>
                <p className="text-xs font-mono text-slate-400">{c.code} · by {c.builder}</p>
                <p className="text-[10px] text-slate-400 mt-1">Submitted {c.submitted}</p>
                {c.issues.length > 0 && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                    {c.issues.map((iss, i) => (
                      <p key={i} className="text-[10px] text-amber-700 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5 shrink-0" />{iss}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5" onClick={() => approve(c.id)}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </Button>
                <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50 text-xs h-8 gap-1.5" onClick={() => reject(c.id)}>
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No components pending review</div>}
    </div>
  );
}

function PublishedTab() {
  return (
    <div className="space-y-3">
      {PUBLISHED.map(c => (
        <Card key={c.id}>
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
              <div>
                <p className="text-sm font-bold text-slate-900">{c.name}</p>
                <p className="text-xs font-mono text-slate-400">{c.code} · {c.builder}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <span className="text-emerald-600 font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{c.trustScore}</span>
              <span className="text-slate-500">{c.installs.toLocaleString()} installs</span>
              <Button variant="outline" className="text-xs h-7 text-red-500 border-red-200 hover:bg-red-50">Unpublish</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FlaggedTab() {
  return (
    <div className="space-y-4">
      {FLAGGED.map(c => (
        <Card key={c.id} className="border-red-200">
          <CardContent className="pt-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Flag className="w-2.5 h-2.5" />{c.flags} flags</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{c.name}</p>
                <p className="text-xs font-mono text-slate-400">{c.code} · {c.builder}</p>
                <p className="text-xs text-red-600 mt-2 bg-red-50 px-2 py-1.5 rounded-lg">{c.reason}</p>
                <p className="text-[10px] text-slate-400 mt-1">Last flagged {c.lastFlag}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" className="text-xs h-8">Investigate</Button>
                <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50 text-xs h-8">Suspend</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BuildersTab() {
  return (
    <div className="space-y-3">
      {BUILDERS_LIST.map(b => (
        <Card key={b.id}>
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm">{b.name[0]}</div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{b.name}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${tierConfig[b.tier]}`}>{b.tier}</span>
                </div>
                <p className="text-xs text-slate-400">Joined {b.joined} · {b.components} components</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <span className="text-slate-500">{b.totalInstalls.toLocaleString()} installs</span>
              <Button variant="outline" className="text-xs h-7">Manage</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("Pending Review");
  const [search, setSearch] = useState("");

  const tabContent = {
    "Pending Review": <PendingTab />,
    "Published": <PublishedTab />,
    "Flagged": <FlaggedTab />,
    "Builders": <BuildersTab />,
    "Subscriptions": <SubscriptionsTab />,
    "Legal Docs": <LegalDocumentsTab />,
    "Reconciliation": <ReconciliationPanel />,
    "Audit Trail": <AuditTrailViewer />,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Admin Moderation</h1>
          <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-1 rounded-full">Admin Only</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-xl font-black text-slate-900">{value}</p>
                  <p className="text-[10px] text-slate-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === tab ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}>
              {tab}
              {tab === "Pending Review" && PENDING.length > 0 && <span className="ml-1.5 bg-amber-500 text-white text-[9px] px-1 rounded-full">{PENDING.length}</span>}
              {tab === "Flagged" && FLAGGED.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1 rounded-full">{FLAGGED.length}</span>}
            </button>
          ))}
        </div>

        {tabContent[activeTab]}
      </div>
    </div>
  );
}