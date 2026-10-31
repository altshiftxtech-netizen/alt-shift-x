import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, Clock, Users, Flag, CreditCard, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";
import LegalDocumentsTab from "@/components/admin/LegalDocumentsTab";
import ReconciliationPanel from "@/components/ReconciliationPanel";
import AuditTrailViewer from "@/components/AuditTrailViewer";
import InvoiceApprovalPanel from "@/components/InvoiceApprovalPanel";
import FinancialMetricsTab from "@/components/admin/FinancialMetricsTab";
import ComponentUploadTab from "@/components/admin/ComponentUploadTab";
import Vested100Tab from "@/components/admin/Vested100Tab";
import AffiliateTab from "@/components/admin/AffiliateTab";
import PaymentModeTab from "@/components/admin/PaymentModeTab";
import UserManagementTab from "@/components/admin/users/UserManagementTab";
import TaxFilingTab from "@/components/admin/TaxFilingTab";
import OnboardResidentDevsTab from "@/components/admin/OnboardResidentDevsTab";
import FinanceAnalyticsTab from "@/components/admin/FinanceAnalyticsTab";
import PendingReviewTab from "@/components/admin/PendingReviewTab";
import PublishedTab from "@/components/admin/PublishedTab";
import FlaggedTab from "@/components/admin/FlaggedTab";
import BuildersTab from "@/components/admin/BuildersTab";
import AiChangeLogTab from "@/components/admin/AiChangeLogTab";
import AdminExpertMindsEnterpriseTab from "@/components/admin/ExpertMindsEnterpriseTab";
import SiteDocumentsTab from "@/components/admin/SiteDocumentsTab";
import AquillaDownloadTab from "@/components/admin/AquillaDownloadTab";
import Pm1aDeploymentTab from "@/components/admin/Pm1aDeploymentTab";
import PwaExportsSection from "@/components/admin/PwaExportsSection";
import PwaTestLab from "@/components/admin/PwaTestLab";
import AdminSitesObservatory from "@/components/admin/AdminSitesObservatory";
import ProvingGroundReport from '@/pages/ProvingGroundReport';

const TABS = ["Finance Analytics", "ExpertMinds Enterprise", "User Management", "Dev Community", "Tax Filing", "Invoices", "Pending Review", "Published", "Flagged", "Builders", "Subscriptions", "Payment Mode", "Beta Program", "Affiliate Links", "Legal Docs", "AI Change Log", "Reconciliation", "Audit Trail", "Financial Metrics", "Component Upload", "Site Documents", "Sites Fleet", "Platform Intelligence", "Aquilla Binary", "PWA Management", "Proving Ground Report"];

const PLAN_LABELS = { starter: "Starter", pro: "Pro", enterprise: "Enterprise" };
const PLAN_COLORS = { starter: "bg-slate-100 text-slate-600", pro: "bg-violet-100 text-violet-700", enterprise: "bg-blue-100 text-blue-700" };
const STATUS_COLORS = { active: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-600", past_due: "bg-amber-100 text-amber-700" };

function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.asServiceRole?.entities?.Subscription?.list("-created_date", 50)
      .then((data) => { setSubscriptions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-3">
      {subscriptions.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No subscriptions yet</div>
      ) : (
        subscriptions.map((sub) => (
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

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get('section') === 'proving-ground' ? 'Proving Ground Report' : 'User Management');
  const [stats, setStats] = useState({ pending: 0, published: 0, flagged: 0, builders: 0 });

  // Load accurate catalog counts. A single .filter()/.list() call is capped at
  // 5,000 records per page, so counting on the client truncates once the catalog
  // grows past that. componentCounts paginates server-side for the true totals.
  const loadStats = React.useCallback(async () => {
    try {
      const [countsRes, users, components] = await Promise.all([
        base44.functions.invoke("componentCounts", {}),
        base44.asServiceRole.entities.User.list("-created_date", 500),
        base44.asServiceRole.entities.Component.list("-created_date", 5000),
      ]);
      const counts = countsRes?.data || {};
      const builderIds = new Set(components.filter((c) => c.builder_id).map((c) => c.builder_id));
      const builders = users.filter((u) => builderIds.has(u.id) || u.role === "admin" || u.role === "builder").length;
      setStats({
        pending: counts.breakdown?.pending || 0,
        published: counts.published || 0,
        flagged: counts.breakdown?.shelved || 0,
        builders,
      });
    } catch {
      // leave existing values
    }
  }, []);

  // Initial load + realtime: re-count whenever a component is added/updated/deleted.
  useEffect(() => {
    loadStats();
    const unsubscribe = base44.entities.Component.subscribe(() => loadStats());
    return unsubscribe;
  }, [loadStats]);

  const STATS = [
    { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-600" },
    { label: "Published", value: stats.published, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Flagged", value: stats.flagged, icon: Flag, color: "text-red-600" },
    { label: "Builders", value: stats.builders, icon: Users, color: "text-violet-600" },
  ];

  const tabContent = {
    "Finance Analytics": <FinanceAnalyticsTab />,
    "ExpertMinds Enterprise": <AdminExpertMindsEnterpriseTab />,
    "User Management": <UserManagementTab />,
    "Dev Community": <OnboardResidentDevsTab />,
    "Tax Filing": <TaxFilingTab />,
    "Invoices": <InvoiceApprovalPanel />,
    "Pending Review": <PendingReviewTab />,
    "Published": <PublishedTab />,
    "Flagged": <FlaggedTab />,
    "Builders": <BuildersTab />,
    "Subscriptions": <SubscriptionsTab />,
    "Payment Mode": <PaymentModeTab />,
    "Beta Program": <Vested100Tab />,
    "Affiliate Links": <AffiliateTab />,
    "Legal Docs": <LegalDocumentsTab />,
    "AI Change Log": <AiChangeLogTab />,
    "Reconciliation": <ReconciliationPanel />,
    "Audit Trail": <AuditTrailViewer />,
    "Financial Metrics": <FinancialMetricsTab />,
    "Component Upload": <ComponentUploadTab />,
    "Site Documents": <SiteDocumentsTab />,
    "Sites Fleet": (
      <div className="space-y-4">
        <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-5">
          <p className="text-sm font-bold text-cyan-900 mb-1">Sites Fleet Observatory & 1-Take Jay Site Compiler</p>
          <p className="text-xs text-cyan-700 mb-4">Live fleet monitoring, edge telemetry, and clean static web distribution zip compiler for all 9 sovereign nodes. Separate from the native PWA compiler.</p>
          <Link to="/admin/sites">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-sm gap-2">Open Sites Fleet Observatory →</Button>
          </Link>
        </div>
        <AdminSitesObservatory />
      </div>
    ),
    "Aquilla Binary": <AquillaDownloadTab />,
    "Proving Ground Report": <ProvingGroundReport embedded />,
    "PWA Management": (
      <div className="space-y-6">
        <PwaExportsSection />
        <PwaTestLab />
        <Pm1aDeploymentTab />
      </div>
    ),
    "Platform Intelligence": (
      <div className="space-y-4">
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-5">
          <p className="text-sm font-bold text-violet-900 mb-1">Platform Intelligence Dashboard</p>
          <p className="text-xs text-violet-700 mb-4">Real-time moat metrics: NRR, trust flywheel, governance coverage, revenue health, webhook reliability, and ARR trajectory.</p>
          <Link to="/admin/intelligence">
            <Button className="bg-violet-600 hover:bg-violet-700 text-sm gap-2">Open Platform Intelligence →</Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/builder/governance">
            <div className="bg-white border border-slate-200 hover:border-violet-300 rounded-xl p-4 cursor-pointer transition-colors">
              <p className="text-sm font-bold text-slate-900">AI Governance Center</p>
              <p className="text-xs text-slate-400 mt-1">Score and certify all published components for SOC2, GDPR, ISO27001 compliance.</p>
            </div>
          </Link>
          <Link to="/dashboard/webhooks">
            <div className="bg-white border border-slate-200 hover:border-violet-300 rounded-xl p-4 cursor-pointer transition-colors">
              <p className="text-sm font-bold text-slate-900">Webhook Subscriptions</p>
              <p className="text-xs text-slate-400 mt-1">View and manage all active platform webhook endpoints and delivery health.</p>
            </div>
          </Link>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />

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
                  <p className="text-xl font-black text-slate-900">{value.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section selector */}
        <div className="max-w-xs">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Section</label>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            {TABS.map((tab) => (
              <option key={tab} value={tab}>
                {tab}
                {tab === "Pending Review" && stats.pending > 0 ? ` (${stats.pending})` : ""}
                {tab === "Flagged" && stats.flagged > 0 ? ` (${stats.flagged})` : ""}
              </option>
            ))}
          </select>
        </div>

        {tabContent[activeTab]}
      </div>
    </div>
  );
}