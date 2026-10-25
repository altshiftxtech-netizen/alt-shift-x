import React from "react";
import { Link } from "react-router-dom";
import { LogIn, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

export default function WarehousePurchaseButton({ componentId }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const destination = `/marketplace/${componentId}`;
  if (isLoadingAuth) return <Button disabled size="sm">Checking account…</Button>;
  return (
    <Button asChild size="sm" variant="secondary">
      <Link to={isAuthenticated ? destination : `/login?returnTo=${encodeURIComponent(destination)}`}>
        {isAuthenticated ? <ShoppingBag className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
        {isAuthenticated ? "Review & Purchase" : "Log In to Purchase"}
      </Link>
    </Button>
  );
}