import React from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus, LayoutDashboard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

export default function WarehouseAccountActions() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {isAuthenticated ? <>
        <Button asChild variant="secondary"><Link to="/dashboard/installed"><Package className="mr-2 h-4 w-4" />My Purchases</Link></Button>
        <Button asChild><Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />My Dashboard</Link></Button>
      </> : <>
        <Button asChild variant="secondary"><Link to="/login?returnTo=%2Fwarehouse"><LogIn className="mr-2 h-4 w-4" />Log In & Explore</Link></Button>
        <Button asChild><Link to="/register?returnTo=%2Fwarehouse"><UserPlus className="mr-2 h-4 w-4" />Create Account</Link></Button>
      </>}
    </div>
  );
}