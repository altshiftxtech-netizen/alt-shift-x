import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Bell, CreditCard, CheckCircle2, Zap } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import CommandPromptToggle from "@/components/CommandPromptToggle";
import TestModeSelector from "@/components/TestModeSelector";
import { useAuth } from "@/lib/AuthContext";

const ALL_TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "developer", label: "Developer", icon: Zap, adminOnly: true },
];

function ProfileTab() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="space-y-5">
      <Card><CardContent className="pt-5 space-y-4">
        <p className="text-sm font-bold text-slate-900">Personal Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-xs text-slate-500 mb-1 block">First name</label><Input defaultValue="Alex" /></div>
          <div><label className="text-xs text-slate-500 mb-1 block">Last name</label><Input defaultValue="Thompson" /></div>
        </div>
        <div><label className="text-xs text-slate-500 mb-1 block">Email</label><Input defaultValue="alex@company.com" /></div>
        <div><label className="text-xs text-slate-500 mb-1 block">Company</label><Input defaultValue="Thompson Construction Ltd" /></div>
        <div><label className="text-xs text-slate-500 mb-1 block">Role</label><Input defaultValue="Senior Project Manager" /></div>
        <Button className={`${saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-700"} text-white text-sm h-9 gap-2`} onClick={handleSave}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Changes"}
        </Button>
      </CardContent></Card>
    </div>
  );
}

function SecurityTab() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="space-y-5">
      <Card><CardContent className="pt-5 space-y-4">
        <p className="text-sm font-bold text-slate-900">Change Password</p>
        <div><label className="text-xs text-slate-500 mb-1 block">Current password</label><Input type="password" placeholder="••••••••" /></div>
        <div><label className="text-xs text-slate-500 mb-1 block">New password</label><Input type="password" placeholder="••••••••" /></div>
        <div><label className="text-xs text-slate-500 mb-1 block">Confirm new password</label><Input type="password" placeholder="••••••••" /></div>
        <Button className={`${saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-700"} text-white text-sm h-9 gap-2`} onClick={handleSave}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Updated</> : "Update Password"}
        </Button>
      </CardContent></Card>
      <Card><CardContent className="pt-5">
        <p className="text-sm font-bold text-slate-900 mb-1">Two-Factor Authentication</p>
        <p className="text-xs text-slate-400 mb-4">Add an extra layer of security to your account.</p>
        <Button variant="outline" className="text-sm">Enable 2FA</Button>
      </CardContent></Card>
      <Card className="border-red-200"><CardContent className="pt-5">
        <p className="text-sm font-bold text-red-700 mb-1">Danger Zone</p>
        <p className="text-xs text-slate-400 mb-4">Permanently delete your account and all data. This cannot be undone.</p>
        <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50 text-sm">Delete Account</Button>
      </CardContent></Card>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({ installs: true, updates: true, billing: true, reviews: false, marketing: false });
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const items = [
    { key: "installs", label: "Component install confirmations", desc: "When a component is successfully installed or removed" },
    { key: "updates", label: "Component updates available", desc: "When builders release new versions of installed components" },
    { key: "billing", label: "Billing & payment alerts", desc: "Receipts, payment failures, and subscription changes" },
    { key: "reviews", label: "Review reminders", desc: "Prompts to review components you've been using" },
    { key: "marketing", label: "Product news & announcements", desc: "New features, marketplace highlights, and community updates" },
  ];
  return (
    <Card><CardContent className="pt-5 divide-y divide-slate-100">
      {items.map(item => (
        <div key={item.key} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.label}</p>
            <p className="text-xs text-slate-400">{item.desc}</p>
          </div>
          <button onClick={() => toggle(item.key)}
            className={`w-10 h-5 rounded-full transition-colors shrink-0 ${prefs[item.key] ? "bg-violet-600" : "bg-slate-200"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${prefs[item.key] ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      ))}
    </CardContent></Card>
  );
}

function DeveloperTab() {
  return (
    <div className="space-y-5">
      <Card><CardContent className="pt-5 space-y-4">
        <p className="text-sm font-bold text-slate-900">Developer Tools</p>
        <p className="text-xs text-slate-500 mb-4">Enable advanced features for testing and development.</p>
        <CommandPromptToggle />
      </CardContent></Card>
      <TestModeSelector />
      <Card><CardContent className="pt-5">
        <p className="text-sm font-bold text-slate-900 mb-2">Testing Dashboard</p>
        <p className="text-xs text-slate-500 mb-4">Access automated test results and compliance reports</p>
        <Link to="/dashboard/testing"><Button variant="outline" className="text-sm">Go to Testing Dashboard</Button></Link>
      </CardContent></Card>
      <Card><CardContent className="pt-5">
        <p className="text-sm font-bold text-slate-900 mb-2">Rollout Procedures</p>
        <p className="text-xs text-slate-500 mb-4">View SOC2-compliant deployment checklist</p>
        <Link to="/rollout-procedures"><Button variant="outline" className="text-sm">View Procedures</Button></Link>
      </CardContent></Card>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-5">
      <Card><CardContent className="pt-5">
        <p className="text-sm font-bold text-slate-900 mb-3">Current Plan</p>
        <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl border border-violet-100 mb-4">
          <div>
            <p className="text-sm font-bold text-violet-900">Professional</p>
            <p className="text-xs text-violet-600">Up to 10 components · 50,000 calls/mo</p>
          </div>
          <span className="text-lg font-black text-violet-700">$49<span className="text-xs font-normal">/mo</span></span>
        </div>
        <Button variant="outline" className="text-sm">Upgrade Plan</Button>
      </CardContent></Card>
      <Card><CardContent className="pt-5">
        <p className="text-sm font-bold text-slate-900 mb-3">Payment Method</p>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
          <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
          <p className="text-sm text-slate-700">•••• •••• •••• 4242</p>
          <span className="text-xs text-slate-400 ml-auto">Expires 12/27</span>
        </div>
        <Button variant="outline" className="text-sm">Update Card</Button>
      </CardContent></Card>
      <Card><CardContent className="pt-5">
        <p className="text-sm font-bold text-slate-900 mb-3">Recent Invoices</p>
        <div className="space-y-2">
          {[
            { date: "May 1, 2026", amount: "$49.00", status: "Paid" },
            { date: "Apr 1, 2026", amount: "$49.00", status: "Paid" },
            { date: "Mar 1, 2026", amount: "$49.00", status: "Paid" },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
              <span className="text-slate-600">{inv.date}</span>
              <span className="font-semibold text-slate-800">{inv.amount}</span>
              <span className="text-emerald-600 font-semibold">{inv.status}</span>
              <button className="text-violet-600 hover:underline">Download</button>
            </div>
          ))}
        </div>
      </CardContent></Card>
    </div>
  );
}

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const TABS = ALL_TABS.filter(t => !t.adminOnly || isAdmin);

  const tabComponents = { profile: ProfileTab, security: SecurityTab, notifications: NotificationsTab, billing: BillingTab, developer: DeveloperTab };
  const ActiveTab = tabComponents[activeTab] || ProfileTab;

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar tabs */}
          <aside className="sm:w-44 shrink-0">
            <div className="space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${activeTab === id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          </aside>
          <div className="flex-1"><ActiveTab /></div>
        </div>
      </div>
    </div>
  );
}