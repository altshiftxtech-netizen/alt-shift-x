import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSignature } from "lucide-react";

/**
 * BuilderAgreementModal — one-time gate shown before a Builder's first
 * Component submission. Requires an explicit checkbox confirmation of the
 * Builder Agreement before allowing the submit to proceed.
 */
export default function BuilderAgreementModal({ open, onOpenChange, onConfirm }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center mb-2">
            <FileSignature className="w-5 h-5 text-violet-700" />
          </div>
          <DialogTitle>Builder Agreement</DialogTitle>
          <DialogDescription>
            Before you submit your first Component, please review and accept the Builder Agreement. This is a one-time confirmation.
          </DialogDescription>
        </DialogHeader>

        <label className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-lg p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          <span className="text-xs text-slate-700 leading-relaxed">
            By submitting this Component, I agree to the{" "}
            <Link to="/legal/builder-agreement" target="_blank" className="text-violet-700 underline">
              Builder Agreement
            </Link>
            . I have reviewed it before proceeding.
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!agreed} onClick={onConfirm} className="bg-violet-700 hover:bg-violet-800 text-white">
            Agree &amp; Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}