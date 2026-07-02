import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useCrmData — loads and manages all CRM records (contacts, groups, deals,
 * activities) for the current admin/staff user. Each fetch is isolated so a
 * failure in one collection never blanks the others.
 */
export default function useCrmData() {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [c, g, d, a] = await Promise.all([
      base44.entities.CrmContact.list("-updated_date", 500).catch(() => []),
      base44.entities.CrmGroup.list("-created_date", 200).catch(() => []),
      base44.entities.CrmDeal.list("-updated_date", 500).catch(() => []),
      base44.entities.CrmActivity.list("-created_date", 500).catch(() => []),
    ]);
    setContacts(c || []);
    setGroups(g || []);
    setDeals(d || []);
    setActivities(a || []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { contacts, groups, deals, activities, loading, refresh,
    setContacts, setGroups, setDeals, setActivities };
}