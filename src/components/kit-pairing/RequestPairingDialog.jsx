import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RequestPairingDialog({ open, onOpenChange, components, onSuccess }) {
  const [selectedComponent, setSelectedComponent] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!selectedComponent || !partnerEmail.trim()) return;
    setLoading(true);
    try {
      await base44.functions.invoke("createKitPairing", {
        requester_component_id: selectedComponent,
        partner_email: partnerEmail.trim(),
      });
      onSuccess?.();
      onOpenChange(false);
      setSelectedComponent("");
      setPartnerEmail("");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Kit Pairing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Your Component</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Select a component...</option>
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (${c.price}/mo)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Partner Builder Email</label>
            <Input
              placeholder="partner@example.com"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <p className="text-xs text-slate-500">
            The partner builder will receive a pairing request and must accept to lock in the revenue split.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleRequest}
              disabled={!selectedComponent || !partnerEmail.trim() || loading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}