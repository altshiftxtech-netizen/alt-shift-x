import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { PASS_NODES } from '@/components/suite/passes/passFoundryData';

const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

/**
 * Resolves which suite node ids the current visitor is authorized to launch.
 * Guests / non-pass holders get an empty set (cards fall back to "Explore Specs").
 * Admins are authorized for every node.
 */
export default function useAuthorizedNodeIds() {
  const { user, isAuthenticated, authChecked, isLoadingAuth } = useAuth();
  const [resolved, setResolved] = useState({ userId: null, ids: new Set() });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!authChecked || isLoadingAuth || !isAuthenticated || !user?.id) return;
        const me = user;
        if (me.role === 'admin') {
          if (!cancelled) setResolved({ userId: me.id, ids: new Set(PASS_NODES.map((n) => n.id)) });
          return;
        }
        const passes = await base44.entities.SovereignPass.filter({ user_id: me.id });
        const ids = new Set();
        (passes || []).forEach((pass) => {
          if (!ACTIVE_STATUSES.includes(pass.status)) return;
          if (pass.test_mode) return; // test checkouts never authorize a live launch
          if (pass.expires_at && new Date(pass.expires_at) < new Date()) return;
          (pass.node_ids || []).forEach((id) => ids.add(id));
        });
        if (!cancelled) setResolved({ userId: me.id, ids });
      } catch {
        // Not signed in (public app) — no authorized nodes.
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, user?.role, isAuthenticated, authChecked, isLoadingAuth]);

  return authChecked && !isLoadingAuth && isAuthenticated && resolved.userId === user?.id
    ? resolved.ids : new Set();
}