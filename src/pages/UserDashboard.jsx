import React from "react";
import { Link } from "react-router-dom";
import SharedNav from "@/components/SharedNav";
import { Card, CardContent } from "@/components/ui/card";
import { Package, BarChart2, Key, Settings, CreditCard, Webhook } from "lucide-react";
import ComponentTelemetry from "@/components/ComponentTelemetry";
import ReportScheduler from "@/components/ReportScheduler";
import VoiceChat from "@/components/VoiceChat";

const QUICK_LINKS = [
  { to: "/dashboard/installed", label: "Installed Components", icon: Package, desc: "Manage your active components" },
  { to: "/dashboard/usage", label: "Usage Analytics", icon: BarChart2, desc: "API calls and performance" },
  { to: "/dashboard/api-keys", label: "API Keys", icon: Key, desc: "Manage access tokens" },
  { to: "/dashboard/webhooks", label: "Webhooks", icon: Webhook, desc: "Configure event subscriptions" },
  { to: "/dashboard/subscription", label: "Subscription", icon: CreditCard, desc: "Plan and billing details" },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, desc: "Account preferences" },
];

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back. Here's your platform overview.</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {QUICK_LINKS.map(({ to, label, icon: Icon, desc }) => (
            <Link key={to} to={to}>
              <Card className="hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer h-full">
                <CardContent className="pt-5 pb-4 flex flex-col gap-2">
                  <div className="p-2 bg-slate-100 rounded-lg w-fit">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Telemetry */}
        <ComponentTelemetry />

        {/* Report Scheduler */}
        <ReportScheduler />
      </div>

      {/* Voice Chat */}
      <VoiceChat />
    </div>
  );
}