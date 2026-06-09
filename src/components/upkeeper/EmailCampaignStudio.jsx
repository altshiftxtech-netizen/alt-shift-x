import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Sparkles, Loader2, Send, RefreshCw, Users, CheckCircle2, XCircle, Clock, Inbox } from "lucide-react";
import RecipientManager from "@/components/mailroom/RecipientManager";
import InboxPanel from "@/components/mailroom/InboxPanel";

const AUDIENCES = [
  { key: "newsletter", label: "Newsletter" },
  { key: "all_users", label: "All users" },
  { key: "paying", label: "Paying members" },
  { key: "builders", label: "Builders & staff" },
];

const STATUS_STYLE = {
  draft: "bg-slate-700/40 text-slate-300",
  sending: "bg-amber-900/40 text-amber-300",
  sent: "bg-emerald-900/40 text-emerald-300",
  failed: "bg-red-900/40 text-red-300",
};

// Mailchimp-style email studio: compose (AI-assisted) + audience + history.
export default function EmailCampaignStudio({ user }) {
  const [subject, setSubject] = useState("");
  const [audience, setAudience] = useState("newsletter");
  const [brief, setBrief] = useState("");
  const [body, setBody] = useState("");
  const [genBody, setGenBody] = useState(false);
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [counts, setCounts] = useState({});
  const [view, setView] = useState("compose");

  const load = async () => {
    const list = await base44.entities.EmailCampaign.list("-created_date", 30).catch(() => []);
    setCampaigns(list);
    const subs = await base44.entities.EmailSubscriber.filter({ subscribed: true }).catch(() => []);
    const c = { all_users: subs.length, newsletter: 0, paying: 0, builders: 0 };
    subs.forEach((s) => { if (c[s.audience] != null) c[s.audience]++; });
    setCounts(c);
  };
  useEffect(() => { load(); }, []);

  const audienceCount = audience === "all_users" ? counts.all_users || 0 : counts[audience] || 0;

  const generateBody = async () => {
    if (!brief.trim()) return;
    setGenBody(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a warm, on-brand marketing email for the Alt+Shift+X AI marketplace about: "${brief}". Audience: ${audience}. Include a short subject line and a body with a clear call to action. Keep it concise and friendly.`,
      response_json_schema: {
        type: "object",
        properties: { subject: { type: "string" }, body: { type: "string" } },
        required: ["subject", "body"],
      },
    });
    if (res?.subject && !subject.trim()) setSubject(res.subject);
    setBody(res?.body || "");
    setGenBody(false);
  };

  const syncLists = async () => {
    setSyncing(true);
    await base44.functions.invoke("syncEmailSubscribers", {}).catch(() => {});
    await load();
    setSyncing(false);
  };

  const sendCampaign = async () => {
    if (!subject.trim() || !body.trim()) return;
    if (!window.confirm(`Send "${subject}" to ${audienceCount} ${audience.replace("_", " ")} subscriber(s)?`)) return;
    setSending(true);
    const campaign = await base44.entities.EmailCampaign.create({
      subject, body, audience, status: "draft",
      created_by_name: user?.full_name || "Admin",
    });
    await base44.functions.invoke("sendEmailCampaign", { campaignId: campaign.id }).catch(() => {});
    setSubject(""); setBody(""); setBrief("");
    await load();
    setSending(false);
  };

  const SUBTABS = [
    { id: "compose", label: "Compose", icon: Mail },
    { id: "recipients", label: "Recipients & Groups", icon: Users },
    { id: "inbox", label: "Inbox", icon: Inbox },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-[#1a120d] border border-orange-900/40 rounded-xl p-1 max-w-md">
        {SUBTABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${view === id ? "bg-orange-600 text-white shadow" : "text-orange-200/60 hover:text-white hover:bg-[#2a1d16]"}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {view === "recipients" && <RecipientManager />}
      {view === "inbox" && <InboxPanel />}

      {view === "compose" && (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Composer */}
      <div className="bg-[#241812] border border-orange-900/40 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-orange-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-400" /> Email Campaign
          </h3>
          <button onClick={syncLists} disabled={syncing}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />} Sync lists
          </button>
        </div>

        {/* Audience */}
        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">Audience</label>
          <div className="flex flex-wrap gap-1.5">
            {AUDIENCES.map(({ key, label }) => (
              <button key={key} onClick={() => setAudience(key)}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${audience === key ? "bg-orange-600 text-white border-orange-500" : "bg-[#2a1d16] text-orange-200/70 border-orange-900/40 hover:border-orange-700"}`}>
                {label} <span className="opacity-60">· {key === "all_users" ? counts.all_users || 0 : counts[key] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brief + AI */}
        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">What's this email about?</label>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={2}
            placeholder="e.g. Announce our SAFEGUARD launch with a 20% intro discount"
            className="w-full bg-[#1a120d] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600 resize-none" />
          <button onClick={generateBody} disabled={genBody || !brief.trim()}
            className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
            {genBody ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Draft with AI
          </button>
        </div>

        {/* Subject */}
        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line…"
            className="w-full bg-[#1a120d] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600" />
        </div>

        {/* Body */}
        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8}
            placeholder="Write or generate the email body…"
            className="w-full bg-[#1a120d] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600 resize-none" />
          <p className="text-[10px] text-orange-200/40 mt-1">An unsubscribe link is added automatically to every email.</p>
        </div>

        <button onClick={sendCampaign} disabled={sending || !subject.trim() || !body.trim()}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 px-4 py-2.5 rounded-xl disabled:opacity-50 transition-opacity">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send to {audienceCount} subscriber{audienceCount === 1 ? "" : "s"}
        </button>
      </div>

      {/* History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-orange-100">Campaign History</h3>
          <button onClick={load} className="text-orange-300 hover:text-white p-1 rounded-lg hover:bg-[#2a1d16]">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        {campaigns.length === 0 ? (
          <p className="text-xs text-orange-200/50 py-6 text-center">No campaigns sent yet.</p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {campaigns.map((c) => {
              const Icon = c.status === "sent" ? CheckCircle2 : c.status === "failed" ? XCircle : Clock;
              return (
                <div key={c.id} className="bg-[#241812] border border-orange-900/40 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-orange-50 truncate">{c.subject}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${STATUS_STYLE[c.status] || STATUS_STYLE.draft}`}>
                      <Icon className="w-3 h-3" /> {c.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-orange-200/50 mt-1 capitalize">
                    {c.audience?.replace("_", " ")} · {c.sent_count || 0} sent{c.failed_count ? ` · ${c.failed_count} failed` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
      )}
    </div>
  );
}