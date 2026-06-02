import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CreateDiscountDialog({ open, onOpenChange, components, onSuccess }) {
  const [selectedComponent, setSelectedComponent] = useState("");
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState(10);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!selectedComponent || !code.trim()) return;
    setLoading(true);
    try {
      const result = await base44.functions.invoke("createBuilderDiscount", {
        component_id: selectedComponent,
        code: code.toUpperCase().trim(),
        percent_off: percentOff,
      });
      setCreated(result.data);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(created.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (created) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discount Code Created!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-3">Share this code:</p>
              <div className="flex items-center gap-2 bg-white border border-green-200 rounded p-3">
                <code className="flex-1 font-mono text-lg font-bold text-green-700">
                  {created.code}
                </code>
                <button onClick={copyCode} className="p-2 hover:bg-green-100 rounded">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-green-700 mt-2">
                {percentOff}% off → {components.find((c) => c.id === selectedComponent)?.name}
              </p>
            </div>
            <Button
              onClick={() => {
                setCreated(null);
                setCode("");
                setPercentOff(10);
                setSelectedComponent("");
                onOpenChange(false);
                onSuccess?.();
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Discount Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Component</label>
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
            <p className="text-xs text-slate-500 mt-1">
              Only standalone components are eligible for discounts.
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Promo Code</label>
            <Input
              placeholder="e.g., SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Discount: {percentOff}% off</label>
            <input
              type="range"
              min="1"
              max="100"
              value={percentOff}
              onChange={(e) => setPercentOff(parseInt(e.target.value))}
              className="w-full"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!selectedComponent || !code.trim() || loading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}