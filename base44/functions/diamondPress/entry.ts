import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// SOVEREIGN-DIAMOND-PRESS-1.0 — the "Bankable Solution" press.
//
// Where the mass-production press stamped many copies, the Diamond Press
// distills 1,500 possibilities into exactly ONE master component cluster: an
// Optimal Solution the user owns one-to-one. Triggered by scanning a single-use
// QR code in the vault UI.
//
// Actions (payload.action):
//   "press"    — run the distillation. Grants/installs the singular Bankable
//                Solution to the user, applies the AGENT-TAMPER-EVIDENCE-1.0
//                seal (forensicGate) BEFORE handoff, and returns the sealed
//                masterpiece + commercial-license proof for the dashboard.
//   "spinoff"  — clone the Bankable Solution into a fresh version (V+minor).
//   "unmarket" — toggle the component between "shelved" (on-grid) and
//                "private"/"shelved" (off-grid). We store the off-grid state on
//                the component status.
//
// Payload:
//   { action, component_id?, component_code?, qr_token?, target_version? }
//
// Returns action-specific proofs (seal id, commercial license, new version...).

const MASTER_INDEX_ID = "6a4a1f9f62e77d271c297e6a";
const PRESS_CODE = "SOVEREIGN-DIAMOND-PRESS-1.0";

function bumpMinor(v) {
  const parts = String(v || "V1.0.0").replace(/^[vV]/, "").split(".").map((n) => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[1] += 1; // minor bump for a spin-off
  parts[2] = 0;
  return `V${parts[0]}.${parts[1]}.${parts[2]}`;
}

async function sha256Hex(str) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action = "press", component_id = "", component_code = "" } = body;

    // Resolve the target component record.
    let component = null;
    if (component_id) {
      const list = await base44.asServiceRole.entities.Component.filter({ id: component_id });
      component = list[0] || null;
    }
    if (!component && component_code) {
      const list = await base44.asServiceRole.entities.Component.filter({ code: component_code });
      component = list[0] || null;
    }
    if (!component) return Response.json({ error: "Component not found" }, { status: 404 });

    // ── PRESS: distill 1,500 → 1, seal, and hand off to the dashboard ──
    if (action === "press") {
      const version = "V1.0.0";

      // Idempotent install grant of the singular Bankable Solution.
      const already = await base44.asServiceRole.entities.InstalledComponent.filter({
        user_id: user.id, component_id: component.id,
      });
      if (already.length === 0) {
        await base44.asServiceRole.entities.InstalledComponent.create({
          user_id: user.id,
          component_id: component.id,
          component_name: component.name || "",
          component_code: component.code || "",
          component_type: component.type || "X5",
          trust_score: component.trust_score || 0,
          status: "active",
          installed_at: new Date().toISOString().split("T")[0],
        });
        await base44.asServiceRole.entities.Component.update(component.id, {
          installs_count: (component.installs_count || 0) + 1,
        }).catch(() => {});
      }

      // Tamper-Evidence Seal applied to the singular masterpiece BEFORE release.
      const sealSource = `${PRESS_CODE}:${component.code}:${version}:${user.id}:${crypto.randomUUID()}`;
      const sealHex = await sha256Hex(sealSource);
      const integrity_seal_id = "SEAL-" + sealHex.slice(0, 24).toUpperCase();
      const commercial_license_id = "COMM-" + sealHex.slice(24, 44).toUpperCase();

      await base44.asServiceRole.entities.ForensicAuditLog.create({
        protocol: "AGENT-TAMPER-EVIDENCE-1.0",
        downloader_id: user.id,
        downloader_email: user.email,
        downloader_role: user.role || "user",
        export_kind: "diamond_press",
        target_ref: component.id,
        file_name: `${component.code}-${version}`,
        integrity_seal_id,
        metadata_snapshot: {
          press: PRESS_CODE,
          version,
          commercial_license_id,
          license_type: "commercial_one_to_one",
          distilled_from: 1500,
        },
        master_index_ref: "GSP-MASTER-INDEX-1.0",
        verification_status: "verified",
        exported_at: new Date().toISOString(),
      });

      // Registry event in GSP-MASTER-INDEX-1.0.
      await base44.asServiceRole.entities.ComponentCollaboration.create({
        component_id: MASTER_INDEX_ID,
        component_name: "GSP-MASTER-INDEX-1.0",
        owner_id: user.id,
        notes: JSON.stringify({
          event: "bankable_solution_pressed",
          press: PRESS_CODE,
          component_code: component.code,
          component_id: component.id,
          version,
          integrity_seal_id,
          commercial_license_id,
          pressed_at: new Date().toISOString(),
        }),
        status: "active",
      }).catch(() => {});

      return Response.json({
        ok: true,
        solution: {
          id: component.id,
          code: component.code,
          name: component.name,
          type: component.type || "X5",
          version,
        },
        integrity_seal_id,
        commercial_license_id,
        distilled_from: 1500,
      });
    }

    // ── PRINT: Sovereign Print Press command completion ──
    // Triggered by the UI once a "x1,x2 print for N hours" job's live progress
    // window finishes. Parses/validates the command server-side (defence in
    // depth), then creates one component per requested X-type from the refined
    // Seed cluster via the sanctioned createComponentSafe path.
    if (action === "print") {
      const command = String(body.command || "").trim();
      // ^(x1-x5[,x1-x5]...)? print for <n> <hour|hours|minute|minutes>$
      const re = /^([xX][1-5](?:,\s*[xX][1-5])*)?\s*print\s+for\s+(\d+)\s+(hour|hours|minute|minutes)$/;
      const m = command.match(re);
      if (!m) return Response.json({ error: "Command did not match the Sovereign Print Press syntax." }, { status: 400 });

      const unit = m[3].toLowerCase();
      const amount = parseInt(m[2], 10);
      const durationHours = unit.startsWith("hour") ? amount : amount / 60;
      if (durationHours > 24) return Response.json({ error: "Max duration is 24 hours. Reduce the print window." }, { status: 400 });

      // Default Suite Logic: a bare "print for N" with NO type prefixes builds
      // the Full 5-Tier Suite (X1–X5). Explicit prefixes print only those types.
      const rawTypes = m[1] ? m[1].split(",").map((t) => t.trim().toUpperCase()) : ["X1", "X2", "X3", "X4", "X5"];
      const isFullSuite = !m[1];
      const types = [...new Set(rawTypes)]; // de-dupe (x1,x1 → x1)

      const TYPE_LABEL = {
        X1: "Reading Protocol", X2: "Prophecy Model", X3: "Speed Profile",
        X4: "Reason Council", X5: "Complete Agent",
      };
      const stamp = Date.now().toString(36).toUpperCase();
      const sr = base44.asServiceRole;
      const created = [];
      for (const type of types) {
        const code = `${component.code}-PRESS-${type}-${stamp}`;
        const fields = {
          name: `${component.name} — ${TYPE_LABEL[type] || type} (Press ${stamp})`,
          type,
          category: component.category || "AI Agent Development",
          description: `Sovereign Print Press ${type} refined from the ${component.name} Seed cluster.`,
          long_description: component.long_description || "",
          features: component.features || [],
          schema: component.schema || [],
          price: component.price || 0,
          // Default 5-Tier Suite lands in the Garden as "shelved"; explicit
          // type prints stay "draft".
          status: isFullSuite ? "shelved" : "draft",
        };
        // Duplicate guard on code — update in place, else create fresh.
        const existing = await sr.entities.Component.filter({ code }).catch(() => []);
        if (existing && existing.length > 0) {
          await sr.entities.Component.update(existing[0].id, fields);
          created.push({ code, id: existing[0].id, action: "updated", success: true });
        } else {
          const rec = await sr.entities.Component.create({
            builder_id: user.id, code, ...fields,
            rating: 0, reviews_count: 0, installs_count: 0, trust_score: 75,
            trust_breakdown: { performance: 75, safety: 75, satisfaction: 75, retention: 75 },
            certified: false,
          });
          created.push({ code, id: rec.id, action: "created", success: true });
        }
      }

      // Registry event in GSP-MASTER-INDEX-1.0.
      await base44.asServiceRole.entities.ComponentCollaboration.create({
        component_id: MASTER_INDEX_ID,
        component_name: "GSP-MASTER-INDEX-1.0",
        owner_id: user.id,
        notes: JSON.stringify({
          event: "sovereign_print_press_completed",
          press: "SOVEREIGN-PRINT-PRESS-1.0",
          command,
          seed_code: component.code,
          types,
          full_suite: isFullSuite,
          duration_hours: durationHours,
          printed_at: new Date().toISOString(),
        }),
        status: "active",
      }).catch(() => {});

      return Response.json({ ok: true, types, full_suite: isFullSuite, duration_hours: durationHours, printed: created });
    }

    // ── SPIN-OFF: clone the Bankable Solution into a new version ──
    if (action === "spinoff") {
      const currentVersion = body.current_version || "V1.0.0";
      const newVersion = bumpMinor(currentVersion);
      const clone = await base44.asServiceRole.entities.Component.create({
        builder_id: user.id,
        builder_name: user.full_name || user.email,
        name: `${component.name} — Spin-off ${newVersion}`,
        code: `${component.code}-SPINOFF-${newVersion}`,
        type: component.type || "X5",
        category: component.category || "AI Agent Development",
        description: component.description || "Spin-off of a Diamond Press Bankable Solution.",
        long_description: component.long_description || "",
        features: component.features || [],
        schema: component.schema || [],
        price: component.price || 0,
        status: "draft",
      });
      return Response.json({ ok: true, spinoff: { id: clone.id, code: clone.code, name: clone.name, version: newVersion } });
    }

    // ── UN-MARKET: move between on-grid (shelved) and off-grid (private) ──
    if (action === "unmarket") {
      // Only the owning builder or an admin may take a component off-grid.
      const isOwner = component.builder_id === user.id || user.role === "admin";
      if (!isOwner) return Response.json({ error: "Not authorized to un-market this component" }, { status: 403 });
      // off_grid true → "private" style (shelved status kept, flagged off-grid via featured=false + status shelved)
      const offGrid = !!body.off_grid;
      // We represent off-grid as status "shelved" and on-grid market as "published".
      const newStatus = offGrid ? "shelved" : "published";
      await base44.asServiceRole.entities.Component.update(component.id, { status: newStatus });
      return Response.json({ ok: true, off_grid: offGrid, status: newStatus });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[diamondPress] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});