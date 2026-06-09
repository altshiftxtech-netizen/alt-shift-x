import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, Mail } from "lucide-react";

export default function Unsubscribe() {
  const [status, setStatus] = useState("working"); // working | done | error
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  useEffect(() => {
    base44.functions.invoke("unsubscribeEmail", { token, email })
      .then(() => setStatus("done"))
      .catch(() => setStatus("error"));
  }, [token, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        {status === "working" && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Processing your request…</p>
          </>
        )}
        {status === "done" && (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900">You're unsubscribed</h1>
            <p className="text-slate-500 mt-2 text-sm">
              {email ? <><strong>{email}</strong> has </> : "You've "} been removed from our mailing list. You won't receive further marketing emails.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <Mail className="w-10 h-10 text-slate-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
            <p className="text-slate-500 mt-2 text-sm">We couldn't process your request. Please try again later.</p>
          </>
        )}
      </div>
    </div>
  );
}