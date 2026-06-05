import React from "react";
import { Switch } from "@/components/ui/switch";
import { Award, ShieldCheck, Lock } from "lucide-react";
import ResidentDeveloperBadge from "@/components/ResidentDeveloperBadge";

/**
 * UserPrivilegeToggles — admin/staff controls to grant/revoke privileges on a
 * user's UserAdminProfile, including the Resident Developer toggle (which drives
 * the public-webpage badge).
 */
const PRIV_ROWS = [
  { key: "can_sell", label: "Can sell components" },
  { key: "can_publish", label: "Can publish components" },
  { key: "can_payout", label: "Can receive payouts" },
  { key: "speakeasy_access", label: "Speakeasy access" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "text-emerald-600" },
  { value: "suspended", label: "Suspended", color: "text-amber-600" },
  { value: "locked", label: "Locked", color: "text-red-600" },
];

export default function UserPrivilegeToggles({ profile, saving, onChange, onStatusChange }) {
  const privileges = profile?.privileges || {};

  return (
    <div className="space-y-4">
      {/* Resident Developer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-slate-900">Resident Developer</p>
              <p className="text-[11px] text-slate-500">Adds a badge on their public webpage — not on products.</p>
            </div>
          </div>
          <Switch
            checked={!!profile?.resident_developer}
            disabled={saving}
            onCheckedChange={(v) => onChange("resident_developer", v)}
          />
        </div>
        {profile?.resident_developer && (
          <div className="mt-3"><ResidentDeveloperBadge size="sm" /></div>
        )}
      </div>

      {/* Account status */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-bold text-slate-900">Account Status</p>
        </div>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              disabled={saving}
              onClick={() => onStatusChange(s.value)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-all ${
                (profile?.account_status || "active") === s.value
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Privilege flags */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-bold text-slate-900">Privileges</p>
        </div>
        <div className="space-y-2.5">
          {PRIV_ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between">
              <span className="text-xs text-slate-600">{row.label}</span>
              <Switch
                checked={privileges[row.key] !== false && privileges[row.key] !== undefined ? !!privileges[row.key] : row.key !== "speakeasy_access"}
                disabled={saving}
                onCheckedChange={(v) => onChange(`privileges.${row.key}`, v)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}