import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import W9Form from "./W9Form";

/**
 * W9RequiredBanner — shown to all builders/contractors. Requires a completed W-9
 * (1099 compliance) before they're fully onboarded. Surfaces a banner + modal form.
 */
export default function W9RequiredBanner() {
  const [user, setUser] = useState(null);
  const [record, setRecord] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const mine = await base44.entities.TaxForm1099.filter({ user_id: me.id });
      setRecord(mine?.[0] || null);
    } catch {
      setRecord(null);
    }
    setLoaded(true);
  };
  useEffect(() => { load(); }, []);

  if (!loaded || !user) return null;

  const completed = record?.status === "completed" && record?.w9_signed;

  if (completed) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
        <CheckCircle2 className="w-4 h-4" />
        1099 compliance complete — W-9 on file.
        <button className="ml-auto text-emerald-700 underline" onClick={() => setOpen(true)}>Update</button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Update your W-9</DialogTitle></DialogHeader>
            <W9Form record={record} userId={user.id} userEmail={user.email} onSaved={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-900">Action required: 1099 tax compliance</p>
          <p className="text-xs text-amber-700">All contractors must submit IRS Form W-9 before receiving payouts. This takes about a minute.</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5" onClick={() => setOpen(true)}>
          <FileText className="w-3.5 h-3.5" /> Complete W-9
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>IRS Form W-9 — 1099 Compliance</DialogTitle></DialogHeader>
            <W9Form record={record} userId={user.id} userEmail={user.email} onSaved={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}