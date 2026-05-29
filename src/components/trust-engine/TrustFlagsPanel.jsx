import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Zap, Star, ShieldCheck, Users, ArrowRight } from "lucide-react";

const flagDefinitions = {
  // Performance
  cycleTime: {
    category: "Performance",
    icon: Zap,
    color: "text-violet-600",
    severity: "high",
    title: "Cycle time exceeds target",
    description: "Your component is running slower than its declared cycle time, which harms your Performance score.",
    steps: [
      "Profile each pass independently using the Testing Sandbox (P-38) to find the bottleneck.",
      "Consider reducing extraction fields in Pass 2 (skim) and re-run the benchmark suite.",
      "Check for memory leaks or redundant cross-reference operations in Pass 4.",
      "Target a 15% buffer under your declared cycle time to account for document variability.",
    ],
  },
  benchmarkRegression: {
    category: "Performance",
    icon: Zap,
    color: "text-violet-600",
    severity: "medium",
    title: "Benchmark regression detected",
    description: "Recent version updates have degraded performance relative to your initial benchmark baseline.",
    steps: [
      "Run a side-by-side comparison in the Testing Sandbox between your current and previous version.",
      "Roll back the last update and re-test to isolate which change caused the regression.",
      "Add regression tests to your local X-Kit pipeline before future publishes.",
    ],
  },
  // User Satisfaction
  helpfulVoteRatio: {
    category: "User Satisfaction",
    icon: Star,
    color: "text-blue-600",
    severity: "low",
    title: "Helpful vote ratio below target",
    description: "Less than 75% of users are marking reviews as helpful, indicating review quality or relevance issues.",
    steps: [
      "Respond to recent reviews in the Reviews Manager to signal engagement.",
      "Encourage verified installers to leave detailed, use-case-specific reviews.",
      "Flag unhelpful or off-topic reviews via the moderation tool.",
    ],
  },
  ratingTrend: {
    category: "User Satisfaction",
    icon: Star,
    color: "text-blue-600",
    severity: "high",
    title: "Rating trend is declining",
    description: "Your average rating has been trending downward, which applies a multiplier penalty to your User Satisfaction score.",
    steps: [
      "Read the last 10 lowest-rated reviews to identify a common theme.",
      "Publish a response to the most visible negative reviews with your fix timeline.",
      "Ship a targeted update addressing the most-cited issues — this often reverses the trend within 30 days.",
      "Consider lowering your price temporarily to reset user expectations while you improve.",
    ],
  },
  // Safety
  adversarialResilience: {
    category: "Safety",
    icon: ShieldCheck,
    color: "text-emerald-600",
    severity: "high",
    title: "Adversarial resilience below threshold",
    description: "Your component falls below the 95% pass rate on adversarial document stress tests, which is required for Certified tier.",
    steps: [
      "Run the adversarial stress test suite in the Testing Sandbox and study the failure cases.",
      "Add graceful degradation handling: when a document is ambiguous, return an honest uncertainty signal rather than a guess.",
      "Test specifically with documents containing intentional contradictions and heavily redacted sections.",
      "Review Law 2 (Graceful Degradation) in the Marketplace Governance guidelines.",
    ],
  },
  // Retention
  uninstallRate: {
    category: "Retention",
    icon: Users,
    color: "text-amber-600",
    severity: "high",
    title: "Uninstall rate above threshold",
    description: "More than 15% of installers have uninstalled this component, significantly reducing your Retention score.",
    steps: [
      "Check the uninstall reason breakdown in Component Analytics to see if bug-related churn is driving this.",
      "Reach out (via builder response on reviews) to users who left negative reviews before uninstalling.",
      "Add an onboarding guide or quick-start doc to reduce early drop-off from users who struggled to configure the component.",
      "Consider offering a configuration consultation or live demo for Enterprise installers.",
    ],
  },
  churnReason: {
    category: "Retention",
    icon: Users,
    color: "text-amber-600",
    severity: "medium",
    title: "Bug-related churn detected",
    description: "A portion of uninstalls are flagged as bug-related, which carries a heavier Retention score penalty than other churn reasons.",
    steps: [
      "Cross-reference uninstall timestamps with version releases to see if a specific update triggered churn.",
      "Prioritize fixing bugs over adding features until the churn reason score stabilizes.",
      "Add a pre-uninstall prompt offering a bug report pathway to capture user feedback before they leave.",
    ],
  },
};

const severityConfig = {
  high: { label: "High Priority", className: "bg-red-100 text-red-700 border-red-200" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 border-amber-200" },
  low: { label: "Low", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

function FlagCard({ flag }) {
  const [open, setOpen] = useState(false);
  const def = flagDefinitions[flag];
  if (!def) return null;
  const Icon = def.icon;
  const sev = severityConfig[def.severity];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">
            <Icon className={`w-4 h-4 ${def.color}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-800">{def.title}</p>
              <Badge variant="outline" className={`text-[10px] font-bold ${sev.className}`}>
                {sev.label}
              </Badge>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{def.category}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{def.description}</p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-3">
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 bg-slate-50">
          <p className="text-xs text-slate-600 mb-3">{def.description}</p>
          <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Actionable Steps</p>
          <ol className="space-y-2">
            {def.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function TrustFlagsPanel({ metrics, composite }) {
  // Collect all failing metrics
  const flags = [];
  Object.values(metrics).forEach((section) => {
    Object.entries(section).forEach(([key, metric]) => {
      if (!metric.ok) flags.push(key);
    });
  });

  if (flags.length === 0) {
    return (
      <Card className="border border-emerald-200 shadow-sm bg-emerald-50">
        <CardContent className="py-6 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-base font-bold text-emerald-800">All metrics passing</p>
            <p className="text-sm text-emerald-700">
              No issues flagged. Your component is performing well across all Trust Engine dimensions.
              {composite >= 90 && " You qualify for the Trusted badge."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const highCount = flags.filter(f => flagDefinitions[f]?.severity === "high").length;

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-base font-semibold text-slate-800">
              Flagged Issues & Recommended Actions
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{flags.length} issue{flags.length > 1 ? "s" : ""} detected</span>
            {highCount > 0 && (
              <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                {highCount} high priority
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Click any flag to expand specific steps you can take to improve your Trust Score.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Sort: high first */}
        {[...flags]
          .sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return (order[flagDefinitions[a]?.severity] ?? 3) - (order[flagDefinitions[b]?.severity] ?? 3);
          })
          .map((flag) => (
            <FlagCard key={flag} flag={flag} />
          ))
        }
      </CardContent>
    </Card>
  );
}