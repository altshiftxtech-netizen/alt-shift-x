import React, { useState } from "react";
import { AlertTriangle, Trash2, Archive, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComponentDeleteDialog({ component, onClose, onShelf, onDelete }) {
  const [step, setStep] = useState(1); // 1 = warning, 2 = choose action
  const [loading, setLoading] = useState(false);

  const handleShelf = async () => {
    setLoading(true);
    await onShelf(component);
    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDelete(component);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-sm font-bold text-slate-900">Remove Component</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {step === 1 && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800 mb-1">This will affect active subscribers</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <span className="font-semibold">{component.displayName || component.name}</span> is currently available on the marketplace. 
                    Removing it will make it <span className="font-semibold">immediately unavailable</span> to all users who have installed or subscribed to this component.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                You can choose to <span className="font-semibold text-slate-700">shelf it</span> (hidden from marketplace, data preserved, can be restored) or <span className="font-semibold text-red-600">permanently delete</span> it from the platform.
              </p>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 text-xs h-9" onClick={onClose}>Cancel</Button>
                <Button className="flex-1 text-xs h-9 bg-red-600 hover:bg-red-700 text-white" onClick={() => setStep(2)}>
                  Continue →
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm font-semibold text-slate-800">What would you like to do with <span className="text-violet-700">{component.displayName || component.name}</span>?</p>

              {/* Shelf option */}
              <button
                onClick={handleShelf}
                disabled={loading}
                className="w-full text-left border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center shrink-0">
                    <Archive className="w-4 h-4 text-slate-500 group-hover:text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-violet-800">Shelf Component</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Hidden from the marketplace. All data, reviews, and history are preserved. You can restore it at any time from your components list.</p>
                  </div>
                </div>
              </button>

              {/* Permanent delete option */}
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full text-left border-2 border-slate-200 hover:border-red-400 hover:bg-red-50 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-red-100 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-red-700">Permanently Delete</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Completely removes the component and all associated data from the platform. <span className="font-semibold text-red-600">This cannot be undone.</span></p>
                  </div>
                </div>
              </button>

              {loading && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-xs text-slate-400">Processing...</span>
                </div>
              )}

              <Button variant="outline" className="w-full text-xs h-9 mt-1" onClick={() => setStep(1)}>← Back</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}