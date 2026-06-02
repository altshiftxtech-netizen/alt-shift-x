import React from "react";
import { Check, X } from "lucide-react";

// Common weak passwords blocked outright
const COMMON = ["password", "12345678", "qwerty", "11111111", "letmein", "iloveyou", "admin123", "welcome1", "password1", "abc12345"];

export function evaluatePassword(pw) {
  const checks = {
    length: pw.length >= 10,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
    notCommon: !COMMON.includes(pw.toLowerCase()),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const valid = checks.length && checks.upper && checks.lower && checks.number && checks.notCommon;
  return { checks, passed, valid };
}

const RULES = [
  { key: "length", label: "At least 10 characters" },
  { key: "upper", label: "One uppercase letter" },
  { key: "lower", label: "One lowercase letter" },
  { key: "number", label: "One number" },
  { key: "symbol", label: "One symbol (recommended)" },
  { key: "notCommon", label: "Not a common password" },
];

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const { checks, passed } = evaluatePassword(password);
  const strength = passed <= 2 ? "Weak" : passed <= 4 ? "Fair" : "Strong";
  const barColor = passed <= 2 ? "bg-destructive" : passed <= 4 ? "bg-amber-500" : "bg-emerald-500";
  const width = `${(passed / 6) * 100}%`;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={`h-full transition-all ${barColor}`} style={{ width }} />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{strength}</span>
      </div>
      <ul className="grid grid-cols-1 gap-1">
        {RULES.map((r) => (
          <li key={r.key} className="flex items-center gap-1.5 text-xs">
            {checks[r.key] ? (
              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            )}
            <span className={checks[r.key] ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}