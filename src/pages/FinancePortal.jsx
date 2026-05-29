import React, { useState } from "react";
import SharedNav from "@/components/SharedNav";
import FinanceDashboard from "@/components/FinanceDashboard";
import InvoiceApprovalPanel from "@/components/InvoiceApprovalPanel";
import VendorOnboarding from "@/components/VendorOnboarding";

export default function FinancePortal() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage invoices, payments, and vendors</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm w-fit">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'approvals', label: 'Invoice Approvals' },
            { id: 'onboarding', label: 'Onboard Vendor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && <FinanceDashboard />}
        {activeTab === 'approvals' && <InvoiceApprovalPanel />}
        {activeTab === 'onboarding' && <VendorOnboarding />}
      </div>
    </div>
  );
}