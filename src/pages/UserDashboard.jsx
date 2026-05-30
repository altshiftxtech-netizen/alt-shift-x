import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, BarChart2, Key, Settings, ShieldCheck, ArrowRight, Webhook, Download, CheckCircle2, AlertCircle, User, FileText, Loader2 } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const QUICK_LINKS = [
  { to: "/dashboard/installed", label: "Installed Components", desc: "Manage your active components", icon: Package },
  { to: "/dashboard/usage", label: "Usage Analytics", desc: "View API call trends & forecasts", icon: BarChart2 },
  { to: "/dashboard/api-keys", label: "API Keys", desc: "Create and manage API keys", icon: Key },
  { to: "/dashboard/webhooks", label: "Webhooks", desc: "Configure event subscriptions", icon: Webhook },
  { to: "/dashboard/subscription", label: "Subscription", desc: "Manage your plan & billing", icon: ShieldCheck },
  { to: "/dashboard/settings", label: "Account Settings", desc: "Update profile and preferences", icon: Settings },
];

function ProfileSummaryCard({ profile, user }) {
  if (!profile) return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="pt-4 pb-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">Profile Incomplete</p>
          <p className="text-xs text-amber-700">Complete your intake form to unlock full access.</p>
        </div>
        <Link to="/onboarding"><Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs">Complete →</Button></Link>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-violet-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900">{profile.first_name} {profile.last_name}</p>
              {profile.intake_completed && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>}
            </div>
            <p className="text-xs text-slate-500">{profile.job_title}{profile.company_name ? ` @ ${profile.company_name}` : ""}</p>
            <p className="text-xs text-slate-400">{profile.industry} · {profile.country}</p>
          </div>
          <Link to="/onboarding"><Button variant="outline" size="sm" className="text-xs shrink-0">Edit Profile</Button></Link>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentDownloadCard({ profile }) {
  const [downloading, setDownloading] = useState(false);

  const downloadApplicationPDF = async () => {
    if (!profile) return;
    setDownloading(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Alt+Shift+X — Application Confirmation", 20, 25);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 20, 35);

      doc.setDrawColor(200);
      doc.line(20, 42, 190, 42);

      const fields = [
        ["Full Name", `${profile.first_name} ${profile.last_name}`],
        ["Email Address", profile.email],
        ["Phone", profile.phone || "Not provided"],
        ["Company", profile.company_name || "Not provided"],
        ["Job Title", profile.job_title || "Not provided"],
        ["Industry", profile.industry || "Not provided"],
        ["Company Size", profile.company_size ? `${profile.company_size} employees` : "Not provided"],
        ["Country", profile.country || "Not provided"],
        ["State / Province", profile.state_province || "Not provided"],
        ["Primary Use Case", profile.use_case || "Not provided"],
        ["How They Heard", profile.how_did_you_hear || "Not provided"],
        ["Agreed to Terms", profile.agreed_to_terms ? "Yes" : "No"],
        ["Agreed to Privacy Policy", profile.agreed_to_privacy ? "Yes" : "No"],
        ["Application Status", profile.intake_completed ? "Completed" : "Pending"],
        ["Submitted At", profile.intake_completed_at ? new Date(profile.intake_completed_at).toLocaleString() : "—"],
      ];

      let y = 55;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30);
      doc.text("Application Details", 20, y);
      y += 10;

      fields.forEach(([label, value]) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(label + ":", 20, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30);
        const lines = doc.splitTextToSize(String(value), 120);
        doc.text(lines, 80, y);
        y += lines.length > 1 ? lines.length * 6 + 4 : 10;
      });

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("© 2026 Alt+Shift+X. This document is confidential and intended for the named applicant only.", 20, 285);

      doc.save(`AltShiftX-Application-${profile.first_name}-${profile.last_name}.pdf`);
    } catch (err) {
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-slate-900">Your Documents</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-800">Application Confirmation</p>
              <p className="text-xs text-slate-400">Your complete intake form submission</p>
            </div>
            {profile?.intake_completed ? (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={downloadApplicationPDF} disabled={downloading}>
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {downloading ? "..." : "Download PDF"}
              </Button>
            ) : (
              <span className="text-xs text-slate-400 italic">Complete profile first</span>
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-800">Terms of Service</p>
              <p className="text-xs text-slate-400">Platform agreement document</p>
            </div>
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> View
              </Button>
            </a>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-800">Privacy Policy</p>
              <p className="text-xs text-slate-400">Data handling & privacy rights</p>
            </div>
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> View
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [stats, setStats] = useState({ installed: 0, apiCalls: 0, apiKeys: 0 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.UserProfile.filter({ user_id: user.id }),
      base44.entities.InstalledComponent.filter({ user_id: user.id }),
      base44.entities.ApiKey.filter({ status: "active" }),
    ]).then(([profiles, installed, keys]) => {
      setProfile(profiles?.[0] || null);
      setStats({ installed: installed?.length || 0, apiKeys: keys?.length || 0, apiCalls: 0 });
    }).catch(() => {}).finally(() => setLoadingProfile(false));
  }, [user]);

  const STATS = [
    { label: "Installed Components", value: stats.installed, icon: Package, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Active API Keys", value: stats.apiKeys, icon: Key, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Profile Status", value: profile?.intake_completed ? "Complete" : "Pending", icon: ShieldCheck, color: profile?.intake_completed ? "text-emerald-600" : "text-amber-600", bg: profile?.intake_completed ? "bg-emerald-50" : "bg-amber-50" },
    { label: "Account", value: user?.role === "admin" ? "Admin" : "Member", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} — here's your platform overview</p>
        </div>

        {/* Profile summary */}
        {!loadingProfile && <ProfileSummaryCard profile={profile} user={user} />}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-4">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Documents */}
        <DocumentDownloadCard profile={profile} />

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Access</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ to, label, desc, icon: Icon }) => (
              <Link key={to} to={to}>
                <Card className="hover:border-violet-200 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="pt-4 pb-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-400 truncate">{desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Marketplace CTA */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-violet-900">Explore the Marketplace</p>
            <p className="text-sm text-violet-700 mt-0.5">Discover new AI components to supercharge your workflow</p>
          </div>
          <Link to="/marketplace">
            <Button className="bg-violet-700 hover:bg-violet-800 text-white shrink-0">Browse Components →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}