import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import JSZip from 'npm:jszip@3.10.1';

// Bundles the FULL information of every component the user installed/owns into a
// ZIP and returns a download URL. Available to all account types EXCEPT
// developers (resident developers / builders) and free-plan accounts.
//
// Modes (payload.mode):
//   "all"        → every owned component
//   "checkpoint" → only components installed since the user's last download
//   "selected"   → only component ids in payload.component_ids
//
// After a successful build the user's DownloadCheckpoint is updated.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Account gating: block developers and free accounts ──
    const profiles = await base44.asServiceRole.entities.UserAdminProfile.filter({ user_id: user.id });
    const isResidentDev = profiles[0]?.resident_developer === true;

    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_id: user.id });
    const plan = subs[0]?.plan || 'free';
    const isFree = plan === 'free';

    // A "developer/builder" is anyone flagged resident dev OR who owns published components.
    const ownedComponents = await base44.asServiceRole.entities.Component.filter({ builder_id: user.id });
    const isBuilder = isResidentDev || (ownedComponents || []).length > 0;

    if (isBuilder || isFree) {
      return Response.json({
        error: 'This export is available to standard paid accounts only. Developer and free accounts are excluded.',
      }, { status: 403 });
    }

    const { mode = 'all', component_ids = [] } = await req.json().catch(() => ({}));

    // ── Gather the user's installed components ──
    const installs = await base44.asServiceRole.entities.InstalledComponent.filter({ user_id: user.id });
    if (!installs || installs.length === 0) {
      return Response.json({ error: 'You have no installed components to download.' }, { status: 400 });
    }

    // Checkpoint
    const checkpoints = await base44.asServiceRole.entities.DownloadCheckpoint.filter({ user_id: user.id });
    const checkpoint = checkpoints[0] || null;
    const lastAt = checkpoint?.last_download_at ? new Date(checkpoint.last_download_at) : null;

    let selected = installs;
    if (mode === 'selected') {
      const want = new Set(component_ids);
      selected = installs.filter((i) => want.has(i.component_id) || want.has(i.id));
    } else if (mode === 'checkpoint' && lastAt) {
      selected = installs.filter((i) => {
        const t = i.installed_at ? new Date(i.installed_at) : (i.created_date ? new Date(i.created_date) : null);
        return t && t > lastAt;
      });
    }

    if (selected.length === 0) {
      return Response.json({ error: 'Nothing new to download since your last checkpoint.', count: 0 }, { status: 200 });
    }

    // Pull the full Component record (all information) for each selection.
    const zip = new JSZip();
    const manifest = {
      user: { id: user.id, email: user.email, name: user.full_name },
      generated_at: new Date().toISOString(),
      mode,
      component_count: selected.length,
      components: [],
    };

    for (const inst of selected) {
      let full = null;
      try {
        const matches = await base44.asServiceRole.entities.Component.filter({ id: inst.component_id });
        full = matches[0] || null;
      } catch { /* fall back to install record */ }

      const record = full || {
        name: inst.component_name,
        code: inst.component_code,
        type: inst.component_type,
        trust_score: inst.trust_score,
      };
      const safe = (record.code || record.name || inst.component_id || 'component')
        .replace(/[^a-z0-9._-]+/gi, '_');
      zip.file(`components/${safe}.json`, JSON.stringify({ ...record, _install: inst }, null, 2));
      manifest.components.push({ name: record.name, code: record.code, type: record.type });
    }

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    const zipBlob = await zip.generateAsync({ type: 'uint8array' });
    const fileName = `altshiftx_components_${Date.now()}.zip`;

    // ── Forensic Full Gate (AGENT-TAMPER-EVIDENCE-1.0) ──
    // Every byte-stream is processed through the gate before release. The gate
    // hashes + seals the package, verifies against GSP-MASTER-INDEX-1.0, and
    // writes the hidden FORENSIC-AUDIT-LOG record.
    const dataCollectionFlagged = manifest.components.some((c) =>
      /data.?collection|scrape|harvest/i.test(`${c.name} ${c.code}`));
    let b64 = '';
    { const bin = Array.from(zipBlob, (b) => String.fromCharCode(b)).join(''); b64 = btoa(bin); }
    let gate = null;
    try {
      const gateRes = await base44.functions.invoke('forensicGate', {
        base64: b64,
        export_kind: 'owned_components_zip',
        target_ref: `${selected.length} components`,
        file_name: fileName,
        metadata_snapshot: manifest,
        flags: dataCollectionFlagged ? ['DATA_COLLECTION_RISK'] : [],
      });
      gate = gateRes?.data || null;
    } catch (e) { console.error('forensicGate invoke failed:', e.message); }

    const zipFile = new File([zipBlob], fileName, { type: 'application/zip' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file: zipFile });

    // Update / create the checkpoint.
    const now = new Date().toISOString();
    if (checkpoint) {
      await base44.asServiceRole.entities.DownloadCheckpoint.update(checkpoint.id, {
        last_download_at: now,
        last_download_count: selected.length,
      });
    } else {
      await base44.asServiceRole.entities.DownloadCheckpoint.create({
        user_id: user.id,
        last_download_at: now,
        last_download_count: selected.length,
      });
    }

    return Response.json({
      success: true,
      url: file_url,
      count: selected.length,
      forensic: gate ? { seal: gate.integrity_seal_id, sha256: gate.sha256, verified: gate.verified } : null,
    });
  } catch (error) {
    console.error('downloadOwnedComponentsZip error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});