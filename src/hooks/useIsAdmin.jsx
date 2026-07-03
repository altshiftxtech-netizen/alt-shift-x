import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Lightweight admin check for public pages — never throws on guests.
export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    base44.auth.me().then((u) => setIsAdmin(u?.role === "admin")).catch(() => setIsAdmin(false));
  }, []);
  return isAdmin;
}