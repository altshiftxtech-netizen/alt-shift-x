import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Public read-receipt pixel. Email clients request this 1x1 transparent GIF when
// a recipient opens the email, letting us increment the campaign's open_count.
// No auth — it's hit directly by the recipient's mail client. We still keep it
// cheap and safe (only ever increments a counter on a known campaign id).
const PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
]);

function gif() {
  return new Response(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "Pragma": "no-cache",
    },
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const campaignId = url.searchParams.get("c");

    if (campaignId) {
      try {
        const campaign = await base44.asServiceRole.entities.EmailCampaign.get(campaignId);
        if (campaign) {
          await base44.asServiceRole.entities.EmailCampaign.update(campaignId, {
            open_count: (campaign.open_count || 0) + 1,
          });
        }
      } catch (e) {
        console.error("[trackEmailOpen] update failed:", e.message);
      }
    }
    // Always return the pixel so the email never shows a broken image.
    return gif();
  } catch (err) {
    console.error("[trackEmailOpen] error:", err.message);
    return gif();
  }
});