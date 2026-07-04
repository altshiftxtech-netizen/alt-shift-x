import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Membership check for the Gen-2 funnel: is this user a Speakeasy Club member
// (owns SPEAKEASY-CLUB-1.0)? Admins are always treated as members. Returns
// { loading, isMember } so ExpertMinds can show the member vs. public rate.
const CLUB_CODE = "SPEAKEASY-CLUB-1.0";

export default function useSpeakeasyMembership() {
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") { setIsMember(true); return; }
        const owned = await base44.entities.InstalledComponent.filter({
          user_id: user.id,
          component_code: CLUB_CODE,
        });
        setIsMember((owned || []).length > 0);
      } catch {
        setIsMember(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading, isMember };
}