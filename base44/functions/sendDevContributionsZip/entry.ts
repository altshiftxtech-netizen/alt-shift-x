import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import JSZip from 'npm:jszip@3.10.1';

// Admin-only: bundle a developer's contributions (their published/created
// components + builder profile) into a ZIP, upload it, and email the dev a
// download link. Returns the file_url too so the admin gets immediate feedback.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(() => null);
    if (!caller || caller.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }

    // Resolve the dev's user + profile for naming/email.
    const users = await base44.asServiceRole.entities.User.filter({ id: user_id });
    const user = users[0];
    const profiles = await base44.asServiceRole.entities.UserAdminProfile.filter({ user_id });
    const profile = profiles[0];
    const email = user?.email || profile?.user_email;
    const name = user?.full_name || profile?.user_name || email || "Developer";
    if (!email) {
      return Response.json({ error: "No email on file for this developer" }, { status: 400 });
    }

    // Gather contributions: every component this builder created.
    const components = await base44.asServiceRole.entities.Component.filter({ builder_id: user_id });

    const zip = new JSZip();

    // Manifest summarizing the contributions.
    const manifest = {
      developer: { user_id, name, email },
      generated_at: new Date().toISOString(),
      component_count: components.length,
      components: components.map((c) => ({
        name: c.name, code: c.code, sku: c.sku, type: c.type,
        category: c.category, status: c.status, price: c.price,
        installs_count: c.installs_count, rating: c.rating,
      })),
    };
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    // One JSON file per component with its full detail.
    const folder = zip.folder("components");
    const used = {};
    for (const c of components) {
      let base = (c.code || c.name || "component").replace(/[^a-z0-9]+/gi, "_");
      used[base] = (used[base] || 0) + 1;
      if (used[base] > 1) base += `_${used[base]}`;
      folder.file(`${base}.json`, JSON.stringify(c, null, 2));
    }

    const zipBytes = await zip.generateAsync({ type: "uint8array" });

    // Upload the ZIP and get a shareable URL.
    const stamp = new Date().toISOString().slice(0, 10);
    const fileName = `contributions_${name.replace(/[^a-z0-9]+/gi, "_")}_${stamp}.zip`;
    const file = new File([zipBytes], fileName, { type: "application/zip" });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    // Email the dev their download link.
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: "Your Alt+Shift+X contributions archive",
      body: `Hi ${name.split(" ")[0]},\n\nAttached is a ZIP archive of your contributions on the Alt+Shift+X platform (${components.length} component${components.length === 1 ? "" : "s"}).\n\nDownload it here:\n${file_url}\n\nThank you for building with us.\n\n— The Alt+Shift+X Team`,
    });

    return Response.json({ success: true, file_url, component_count: components.length });
  } catch (error) {
    console.error("sendDevContributionsZip error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});