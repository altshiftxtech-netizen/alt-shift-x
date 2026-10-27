import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ProvingGroundAdminMenu() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return null;
  return <details className="relative text-sm text-foreground bg-background rounded-md px-3 py-1">
    <summary className="cursor-pointer">Admin</summary>
    <div className="absolute right-0 top-full mt-2 w-60 rounded-md border border-border bg-popover text-popover-foreground p-2 shadow-lg">
      <Link className="block rounded px-3 py-2 hover:bg-accent" to="/admin/proving-ground">Proving Ground report</Link>
    </div>
  </details>;
}