import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import { setSEOMeta } from "@/lib/seoHelpers";

export default function InstallSuccess() {
  const [searchParams] = useSearchParams();
  const componentName = searchParams.get("component") || "Component";
  const componentId = searchParams.get("id");

  useEffect(() => {
    setSEOMeta({
      title: `Successfully Installed ${componentName} — Alt+Shift+X`,
      description: `Your ${componentName} component has been installed and is ready to use.`
    });
  }, [componentName]);

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
          Installation Complete!
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
          <span className="font-semibold text-slate-900 dark:text-white">{componentName}</span> is now active
        </p>
        
        <p className="text-slate-500 dark:text-slate-500 mb-10">
          Your component is ready to start processing documents. Check your dashboard for usage metrics and API integration details.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Next Steps</h2>
          <ol className="text-left space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>1. Generate an API key in <Link to="/dashboard/api-keys" className="text-violet-700 dark:text-violet-400 hover:underline">Settings</Link></li>
            <li>2. Integrate the component into your workflow using the API endpoint</li>
            <li>3. Monitor usage and performance in your Dashboard</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard/installed">
            <Button className="w-full sm:w-auto h-11 px-6 bg-slate-900 dark:bg-violet-700 hover:bg-slate-700 dark:hover:bg-violet-600 text-white gap-2">
              View Installed Components <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto h-11 px-6 gap-2">
              <Home className="w-4 h-4" /> Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Need help getting started?
          </p>
          <Link to="/dashboard/installed" className="text-sm text-violet-700 dark:text-violet-400 hover:underline font-medium">
            View Setup Guide &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}