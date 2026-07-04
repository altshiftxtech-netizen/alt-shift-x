import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * scavengerLeaderboard — ranks Speakeasy members by scavenger seeds found.
 *
 * Ranking logic:
 *  - Seeds Found = count of SpeakeasyHuntFind rows for the user.
 *  - Tie-breaker: higher Platform Trust Score wins the higher rank. Trust is
 *    the best trust_score across the builder's own components (0 if none),
 *    which rewards builders who maintain high-quality components while playing.
 *  - Founder's Mark ("EB"): the user has unlocked FOUNDER-LEGACY-KIT-1.0.
 *
 * Also returns the caller's own standing (my_seeds / my_rank) so the Barkeep
 * and HUD can reference the board. Top 50 only.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);

    // Total number of active hunt items = the "/ N" denominator.
    const items = await base44.asServiceRole.entities.SpeakeasyHuntItem.filter({ is_active: true });
    const totalSeeds = items.length || 15;

    // All finds → group by user.
    const finds = await base44.asServiceRole.entities.SpeakeasyHuntFind.list('-found_at', 5000);
    const byUser = {};
    for (const f of finds) {
      if (!f.user_id) continue;
      if (!byUser[f.user_id]) {
        byUser[f.user_id] = { user_id: f.user_id, user_name: f.user_name || 'Masked Builder', seeds: 0, prizeTypes: new Set() };
      }
      byUser[f.user_id].seeds += 1;
      if (f.prize_type) byUser[f.user_id].prizeTypes.add(f.prize_type);
    }

    // Founder's Mark: who has the legacy kit installed.
    const legacyMatches = await base44.asServiceRole.entities.Component.filter({ code: 'FOUNDER-LEGACY-KIT-1.0' });
    const legacyKitId = legacyMatches[0]?.id;
    const founderMarkUsers = new Set();
    if (legacyKitId) {
      const installs = await base44.asServiceRole.entities.InstalledComponent.filter({ component_id: legacyKitId });
      for (const i of installs) founderMarkUsers.add(i.user_id);
    }

    // Trust score per builder = best trust_score across their published components.
    const trustByUser = {};
    const specByUser = {};
    const components = await base44.asServiceRole.entities.Component.list('-trust_score', 2000);
    const TYPE_SPEC = {
      X1: 'X1 Reading Protocol', X2: 'X2 Prophecy Model', X3: 'X3 Speed Profile',
      X4: 'X4 Reason Council', X5: 'X5 Complete Agent',
    };
    for (const c of components) {
      if (!c.builder_id) continue;
      const t = c.trust_score || 0;
      if (trustByUser[c.builder_id] === undefined || t > trustByUser[c.builder_id]) {
        trustByUser[c.builder_id] = t;
        specByUser[c.builder_id] = TYPE_SPEC[c.type] || 'Independent Builder';
      }
    }

    // Build + sort ranking.
    const rows = Object.values(byUser).map((u) => ({
      user_id: u.user_id,
      handle: maskHandle(u.user_name),
      seeds: u.seeds,
      total: totalSeeds,
      founder_mark: founderMarkUsers.has(u.user_id),
      trust_score: trustByUser[u.user_id] || 0,
      specialization: specByUser[u.user_id] || 'Field Explorer',
    }));

    rows.sort((a, b) => (b.seeds - a.seeds) || (b.trust_score - a.trust_score) || a.handle.localeCompare(b.handle));
    rows.forEach((r, i) => { r.rank = i + 1; });

    const top = rows.slice(0, 50);

    // Caller's own standing (may be outside top 50).
    let mine = null;
    if (me) {
      const mineRow = rows.find((r) => r.user_id === me.id);
      mine = {
        seeds: mineRow ? mineRow.seeds : 0,
        rank: mineRow ? mineRow.rank : null,
        total: totalSeeds,
        founder_mark: mineRow ? mineRow.founder_mark : false,
      };
    }

    // Leader summary for Barkeep dialogue.
    const leader = top[0] ? { handle: top[0].handle, seeds: top[0].seeds } : null;

    return Response.json({ rows: top, total_seeds: totalSeeds, mine, leader });
  } catch (error) {
    console.error('scavengerLeaderboard error:', error?.message || error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Turn a full name/email into a masked handle, e.g. "Casey Rivers" -> "Casey_R.",
// "elias@x.com" -> "elias_...". Keeps identities lightly obscured, Speakeasy-style.
function maskHandle(name) {
  const clean = (name || 'Masked Builder').trim();
  if (clean.includes('@')) {
    const local = clean.split('@')[0];
    return `${local}_…`;
  }
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]}_${parts[1][0].toUpperCase()}.`;
}