import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Home, CreditCard } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import { setSEOMeta } from "@/lib/seoHelpers";

const PLAN_DETAILS = {
  free_builder: {
    name: "Free Builder",
    price: "Free",
    limit: "70% revenue share · 1 published component"
  },
  base_operator: {
    name: "Base Operator",
    price: "$49/month",
    limit: "Up to 72% revenue share · unlimited publishing"
  },
  strategic_architect: {
    name: "Strategic Architect",
    price: "$199/month",
    limit: "Up to 77.5% revenue share · 14-day grace period"
  },
  sovereign_commander: {
    name: "Sovereign Commander",
    price: "$599/month",
    limit: "Up to 85% revenue share · Platform Intelligence"
  }
};

const FALLBACK_DETAILS = {
  name: "Your Plan",
  price: "Active",
  limit: "Your subscription is active"
};

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "";
  const details = PLAN_DETAILS[plan] || FALLBACK_DETAILS;

  useEffect(() => {
    setSEOMeta({
      title: `Subscription Confirmed — ${details.name} Plan — Alt+Shift+X`,
      description: `Welcome to the ${details.name} plan. Your subscription is active and ready to use.`
    });
  }, [plan, details.name]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <SharedNav mode="user" />
      
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-200 dark:bg-green-900/30 rounded-full blur-xl"></div>
            <CheckCircle2 className="w-24 h-24 text-green-600 dark:text-green-500 relative" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Welcome to {details.name}!
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Your subscription is active and ready to go
        </p>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 mb-8 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Plan</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{details.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly Cost</p>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">{details.price}</p>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">{details.limit}</span> included
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Account Setup</h2>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>✓ Billing account created</li>
            <li>✓ API access enabled</li>
            <li>✓ Component marketplace unlocked</li>
            <li>✓ Usage analytics dashboard available</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard">
            <Button className="w-full sm:w-auto h-11 px-6 bg-slate-900 dark:bg-violet-700 hover:bg-slate-700 dark:hover:bg-violet-600 text-white gap-2">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline" className="w-full sm:w-auto h-11 px-6 gap-2">
              Browse Components
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Questions about your subscription?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <Link to="/dashboard/subscription" className="text-violet-700 dark:text-violet-400 hover:underline font-medium flex items-center justify-center gap-1">
              <CreditCard className="w-4 h-4" /> View Billing
            </Link>
            <Link to="/dashboard/settings" className="text-violet-700 dark:text-violet-400 hover:underline font-medium">
              Account Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}