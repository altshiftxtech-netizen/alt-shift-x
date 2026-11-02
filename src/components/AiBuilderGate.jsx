import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import AiBuilder from '@/pages/AiBuilder';

/** Keep the selected node homepage as the destination across sign-in. */
export default function AiBuilderGate() {
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AiBuilder />;
  }

  return <Navigate to="/login?returnTo=%2Faibuilder" replace />;
}