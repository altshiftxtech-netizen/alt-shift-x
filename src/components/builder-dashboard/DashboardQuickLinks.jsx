import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ShieldCheck, FlaskConical, Star, DollarSign, Upload, User } from "lucide-react";

const links = [
  { label: "Revenue & Payouts", path: "/builder/revenue", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Trust Engine", path: "/builder/trust", icon: ShieldCheck, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Testing Sandbox", path: "/builder/sandbox", icon: FlaskConical, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "My Components", path: "/builder/components", icon: Package, color: "text-slate-600", bg: "bg-slate-100" },
  { label: "Analytics", path: "/builder/analytics", icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Reviews", path: "/builder/reviews", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  { label: "Publish", path: "/builder/publish", icon: Upload, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "My Profile", path: "/builder/profile", icon: User, color: "text-slate-600", bg: "bg-slate-100" },
];

export default function DashboardQuickLinks() {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-800">Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {links.map(({ label, path, icon: Icon, color, bg }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">{label}</span>
              <span className="ml-auto text-slate-300 group-hover:text-slate-400 text-xs">→</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}