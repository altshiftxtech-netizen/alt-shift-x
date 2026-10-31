import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

/**
 * /aibuilder gate — redirects authenticated users to the Builder Dashboard
 * and unauthenticated users to /login with returnTo=/builder so they land on
 * the dashboard after sign-in, never back on /aibuilder.
 */
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
    return <Navigate to="/builder" replace />;
  }

  return <Navigate to="/login?returnTo=/builder" replace />;
}