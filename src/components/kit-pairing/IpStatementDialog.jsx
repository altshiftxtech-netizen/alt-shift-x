import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck } from "lucide-react";

export default function IpStatementDialog({ open, onOpenChange, pairing }) {
  if (!pairing) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-600" />
            IP & Proprietary Protection Statement
          </DialogTitle>
        </DialogHeader>
        <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700">
          {pairing.ip_statement}
        </pre>
        {pairing.ip_statement_hash && (
          <p className="text-[10px] text-slate-400 font-mono break-all">
            SHA-256: {pairing.ip_statement_hash}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}