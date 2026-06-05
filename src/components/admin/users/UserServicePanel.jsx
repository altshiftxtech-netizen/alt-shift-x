import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { KeyRound, Mail, Send, Printer, Loader2, CheckCircle2, LifeBuoy } from "lucide-react";

/**
 * UserServicePanel — login-issue resolution + document delivery (email / mail / fax)
 * for a single user, used inside the admin/staff User Management hub.
 */
export default function UserServicePanel({ targetUser, profile, onUnlock, onLogged }) {
  const [docTitle, setDocTitle] = useState("");
  const [docBody, setDocBody] = useState("");
  const [channel, setChannel] = useState("email");
  const [target, setTarget] = useState(targetUser?.email || "");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const channels = [
    { id: "email", label: "Email", icon: Mail, hint: "Sent automatically" },
    { id: "mail", label: "Physical Mail", icon: Printer, hint: "Queued for admin" },
    { id: "fax", label: "Fax", icon: Printer, hint: "Queued for admin" },
  ];

  const sendDoc = async () => {
    if (!docTitle.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("serveUserDocument", {
        user_id: targetUser.id,
        user_email: targetUser.email,
        user_name: targetUser.full_name,
        document_title: docTitle,
        document_body: docBody,
        channel,
        target: target || targetUser.email,
      });
      setResult(res.data?.delivered ? "sent" : "queued");
      setDocTitle(""); setDocBody("");
      onLogged && onLogged();
    } catch (e) {
      setResult("error:" + (e.message || "failed"));
    } finally {
      setSending(false);
    }
  };

  const isLocked = profile?.account_status === "locked" || profile?.account_status === "suspended";

  return (
    <div className="space-y-4">
      {/* Login issues */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <LifeBuoy className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-bold text-slate-900">Login & Access Support</p>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Current status: <span className="font-semibold capitalize">{profile?.account_status || "active"}</span>
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={!isLocked}
          onClick={onUnlock}
          className="gap-1.5 text-xs"
        >
          <KeyRound className="w-3.5 h-3.5" /> {isLocked ? "Unlock / Restore Access" : "Account is active"}
        </Button>
      </div>

      {/* Document delivery */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-bold text-slate-900">Produce & Deliver Document</p>
        </div>

        <Input
          placeholder="Document title (e.g. Information Protection Policy)"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          className="text-sm"
        />
        <Textarea
          placeholder="Document body / message to include…"
          value={docBody}
          onChange={(e) => setDocBody(e.target.value)}
          className="text-sm h-24"
        />

        <div className="grid grid-cols-3 gap-2">
          {channels.map(({ id, label, icon: Icon, hint }) => (
            <button
              key={id}
              onClick={() => setChannel(id)}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] font-semibold transition-all ${
                channel === id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={`text-[9px] font-normal ${channel === id ? "text-slate-300" : "text-slate-400"}`}>{hint}</span>
            </button>
          ))}
        </div>

        <Input
          placeholder={channel === "email" ? "Recipient email" : channel === "fax" ? "Fax number" : "Mailing address"}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="text-sm"
        />

        <div className="flex items-center gap-2">
          <Button onClick={sendDoc} disabled={sending || !docTitle.trim()} size="sm" className="gap-1.5 text-xs">
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {channel === "email" ? "Send Now" : "Queue Request"}
          </Button>
          {result === "sent" && <span className="text-[11px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Emailed</span>}
          {result === "queued" && <span className="text-[11px] text-amber-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Queued for admin</span>}
          {result?.startsWith("error:") && <span className="text-[11px] text-red-600">{result.slice(6)}</span>}
        </div>
      </div>
    </div>
  );
}