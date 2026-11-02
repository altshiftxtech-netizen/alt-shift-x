import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PASS_NODES } from '@/components/suite/passes/passFoundryData';

const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

/**
 * Resolves which suite node ids the current visitor is authorized to launch.
 * Guests / non-pass holders get an empty set (cards fall back to "Explore Specs").
 * Admins are authorized for every node.
 */
export default function useAuthorizedNodeIds() {
  const [authorized, setAuthorized] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!me?.id) return;
        if (me.role === 'admin') {
          if (!cancelled) setAuthorized(new Set(PASS_NODES.map((n) => n.id)));
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
        if (!cancelled) setAuthorized(ids);
      } catch {
        // Not signed in (public app) — no authorized nodes.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return authorized;
}