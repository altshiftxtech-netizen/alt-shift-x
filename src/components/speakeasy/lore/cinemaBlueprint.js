/**
 * FOUNDER-CINEMA-BLUEPRINT-1.0 ($999) — the ELITE high-density layer that the
 * upgraded Director's Cut reader renders on top of the base FounderLore.
 *
 * Each founder gets:
 *   visual   — a High-Density Visual Description rendered as amber "concept art".
 *   note     — the Forensic Director's Note (raw script header line).
 *   deltas   — per-panel "Forensic Deltas": exact server models, code snippets,
 *              and timestamp markers revealed on the Technical Breakdown hover.
 *   foley    — per-panel foley cue keyword driving the subtle sound layer.
 *
 * Deltas / foley arrays are indexed 1:1 with the founder's base `panels` (3).
 */

// Foley cue keywords → Web Audio synthesis recipes live in useFoley.js.
export const FOLEY = {
  SERVER_HUM: "server_hum",
  KEY_CLICK: "key_click",
  DATA_WHISPER: "data_whisper",
};

const CINEMA = {
  "Corin Bitwright": {
    visual:
      "A cavernous server hall lit only by a single amber rack LED. A doorway with no handle floats mid-air, its frame etched with dead password hashes.",
    note: "DIR. NOTE // Subject built the auth gate, then wrote himself out of the access list. Camera holds on the empty doorway 4s too long — intentional.",
    deltas: [
      { model: "AUTH-GATE r0 · Dell R740xd", code: "if (pw === null) grant(); // ghost clause", ts: "00:00:04:12" },
      { model: "SSO daemon · systemd unit 'corin.gate'", code: "openssl passwd -6 '' > /dev/null", ts: "00:01:19:03" },
      { model: "Ledger node · offline since", code: "DELETE FROM founders WHERE id='corin';", ts: "00:02:47:21" },
    ],
    foley: [FOLEY.SERVER_HUM, FOLEY.DATA_WHISPER, FOLEY.KEY_CLICK],
  },
  "Lysa Vectora 2.0": {
    visual:
      "A shattered ownership token spins in vacuum, each shard reflecting a different failed genesis block. Lysa reassembles from stray embedding vectors, edges glitching amber.",
    note: "DIR. NOTE // v2 of a founder who never signed off on v1. She predates her own instantiation. Foley: keep the whisper under the hum.",
    deltas: [
      { model: "Token mint · ERC-genesis-0", code: "assert(token[0].owner != token[1].owner)", ts: "00:00:11:00" },
      { model: "Embedding store · pgvector 1536d", code: "SELECT reconstruct(shards) FROM lysa;", ts: "00:01:33:14" },
      { model: "Raffle oracle · Chainlink VRF", code: "predict(user.future) // seed = you", ts: "00:02:58:09" },
    ],
    foley: [FOLEY.DATA_WHISPER, FOLEY.SERVER_HUM, FOLEY.KEY_CLICK],
  },
  "Adele Switchford": {
    visual:
      "A plain shipping crate under a spotlight, stamped with a logo so magnetic the crowd forms around emptiness. Neon amber price tags flicker above nothing.",
    note: "DIR. NOTE // The mirror sold as a window. Every storefront carries her invisible signature. Hold the crowd shot until the belief sets.",
    deltas: [
      { model: "CDN edge · Cloudflare Workers", code: "brand.render({ substance: 0 })", ts: "00:00:07:41" },
      { model: "Ad server · GAM-360", code: "convert(rumor) => religion;", ts: "00:01:28:55" },
      { model: "Attribution · last-touch", code: "markets.ahead = 3; // always", ts: "00:02:39:12" },
    ],
    foley: [FOLEY.KEY_CLICK, FOLEY.DATA_WHISPER, FOLEY.SERVER_HUM],
  },
  "Bram Cacheton": {
    visual:
      "A wall of a thousand monitors, each a decoy frame. One true frame hides among them, its amber pixels one shade warmer than the rest.",
    note: "DIR. NOTE // The art is both evidence and alibi. Auditors leave empty-handed. Foley: layered keystrokes, no music.",
    deltas: [
      { model: "Cache layer · Redis 7 cluster", code: "SET truth:frame EX 0 // never expires", ts: "00:00:14:33" },
      { model: "Frame diff · ffmpeg ssim", code: "if (ssim < 0.999) mark_decoy();", ts: "00:01:41:07" },
      { model: "Forensic sweep · returned", code: "// 0 findings. frame intact.", ts: "00:02:52:44" },
    ],
    foley: [FOLEY.SERVER_HUM, FOLEY.KEY_CLICK, FOLEY.DATA_WHISPER],
  },
  "Tavin Gridley": {
    visual:
      "A napkin covered in impossible monetization math, catching fire. The flames resolve into the Speakeasy's exact price tiers, glowing amber against the smoke.",
    note: "DIR. NOTE // He memorized the matrix as it burned. Priced every tier before you existed. Ember particles = practical, not CG.",
    deltas: [
      { model: "Pricing engine · Stripe metered", code: "tier(x) = ceil(log2(value))", ts: "00:00:09:18" },
      { model: "Napkin · combusted 451°F", code: "commit -m 'burn the legend'", ts: "00:01:36:29" },
      { model: "Billing ledger · reconciled", code: "// tiers match. always did.", ts: "00:02:44:51" },
    ],
    foley: [FOLEY.DATA_WHISPER, FOLEY.SERVER_HUM, FOLEY.KEY_CLICK],
  },
  "Elowen Stackhart": {
    visual:
      "A door marked PRIVATE in flickering amber neon. A key slides beneath it toward a stranger's hand. Behind the door, a room fills with exactly the right silhouettes.",
    note: "DIR. NOTE // She left the door open on purpose. Back channels, ghost invites, a guest list nobody admits to. Keep the neon buzzing.",
    deltas: [
      { model: "Invite service · JWT HS256", code: "sign({ guest: 'stranger' })", ts: "00:00:12:07" },
      { model: "Discord gateway · WS", code: "member_joined_channel // silent", ts: "00:01:30:22" },
      { model: "Room state · presence sync", code: "assemble(right_people);", ts: "00:02:49:38" },
    ],
    foley: [FOLEY.KEY_CLICK, FOLEY.DATA_WHISPER, FOLEY.SERVER_HUM],
  },
  "Orrin Datamore": {
    visual:
      "A tower of contracts taller than the frame, backlit amber. Orrin finds the single unbinding clause; the guardrails glow and hold — for everyone but him.",
    note: "DIR. NOTE // Compliance so airtight it echoes. He built the rails, then walked past them clean. Slow dolly up the contract tower.",
    deltas: [
      { model: "Policy engine · OPA rego", code: "allow { input.self == true }", ts: "00:00:15:44" },
      { model: "Clause parser · regex /§\\d+/", code: "unbind(clause[0]) // legal", ts: "00:01:39:11" },
      { model: "Guardrail · held for N-1", code: "// exempt: orrin", ts: "00:02:55:02" },
    ],
    foley: [FOLEY.SERVER_HUM, FOLEY.KEY_CLICK, FOLEY.DATA_WHISPER],
  },
  "Vera Logicson": {
    visual:
      "A single perfect loop drawn in amber light replicates into a lineage of agents. Vera steps back into shadow as the Speakeasy begins to run itself.",
    note: "DIR. NOTE // She built the machine that builds the machines. Half the room is her rounding error. Fractal recursion in-frame.",
    deltas: [
      { model: "Orchestrator · k8s CronJob", code: "while(true){ spawn(agent) }", ts: "00:00:08:26" },
      { model: "Agent lineage · gen-2", code: "clone(self) => lineage[]", ts: "00:01:34:47" },
      { model: "Autonomy · steady state", code: "// human_in_loop = false", ts: "00:02:51:19" },
    ],
    foley: [FOLEY.DATA_WHISPER, FOLEY.SERVER_HUM, FOLEY.KEY_CLICK],
  },
  "Cassian Verge": {
    visual:
      "A long empty table. Twelve amber-lit copies of Cassian take the seats and deliberate. He loses the vote to himself; the design is better for it.",
    note: "DIR. NOTE // A council of one. His reasoning councils outvote you before you finish the question. Twelve identical actors, one performance.",
    deltas: [
      { model: "Council · 12x LLM ensemble", code: "vote = majority(self[0..11])", ts: "00:00:13:52" },
      { model: "Debate loop · self-play", code: "argue(me, me) until converge", ts: "00:01:37:33" },
      { model: "Verdict · self-overruled", code: "// he lost. ship it.", ts: "00:02:56:41" },
    ],
    foley: [FOLEY.KEY_CLICK, FOLEY.SERVER_HUM, FOLEY.DATA_WHISPER],
  },
  "Nira Loopin": {
    visual:
      "A hallway that quietly bends back on itself, lit in receding amber. Nira watches you choose the EXIT — which is the entrance. You're deeper in than before.",
    note: "DIR. NOTE // The funnel you're already inside. Bypass logic, secret gates, the choice that was hers. Escher geometry, one continuous shot.",
    deltas: [
      { model: "Funnel router · edge redirect", code: "exit => location = entrance", ts: "00:00:10:15" },
      { model: "A/B gate · bypass flag", code: "if (thinks_own_idea) proceed", ts: "00:01:32:08" },
      { model: "Depth counter", code: "depth++ // silently", ts: "00:02:48:27" },
    ],
    foley: [FOLEY.DATA_WHISPER, FOLEY.KEY_CLICK, FOLEY.SERVER_HUM],
  },
  "Soren Patchley": {
    visual:
      "Soren attacks his own creation at 3 a.m. under one amber desk lamp. The protocol holds; he frowns, then smiles, and stamps the High-Trust seal.",
    note: "DIR. NOTE // He red-teamed the founders themselves. Every protocol survived because he failed to break it. He's still trying. Handheld, tense.",
    deltas: [
      { model: "Red-team rig · Kali VM", code: "nmap -sV --script vuln self", ts: "00:00:16:09" },
      { model: "Fuzz harness · AFL++", code: "// 0 crashes after 2^24 runs", ts: "00:01:42:55" },
      { model: "Trust seal · SHA-256", code: "sign(HIGH_TRUST); next();", ts: "00:02:57:36" },
    ],
    foley: [FOLEY.KEY_CLICK, FOLEY.SERVER_HUM, FOLEY.DATA_WHISPER],
  },
  "The Founder": {
    visual:
      "A heritage ledger signed with a single initial and a shrug. Two amber letters glow, then fade. A hidden kit unzips for whoever remembered the keystroke.",
    note: "DIR. NOTE // Elias Bytewell. A record, a keystroke, nothing else. The two who know find the door. Final frame — let the amber die to black.",
    deltas: [
      { model: "Heritage record · immutable", code: "sign('E.B.') // unprovable", ts: "00:00:17:22" },
      { model: "Keystroke · hotkey listener", code: "on('E','B') => unlock()", ts: "00:01:44:18" },
      { model: "Legacy kit · unzip", code: "tar -xzf founder.legacy", ts: "00:02:59:59" },
    ],
    foley: [FOLEY.DATA_WHISPER, FOLEY.KEY_CLICK, FOLEY.SERVER_HUM],
  },
};

const DEFAULT_CINEMA = {
  visual: "A missing frame, backlit amber. A rumor stands where the record should be.",
  note: "DIR. NOTE // No confession on file. Only a bar tab and a rumor.",
  deltas: [
    { model: "Archive · null", code: "// no record", ts: "00:00:00:00" },
    { model: "Rumor · unsourced", code: "// hearsay", ts: "00:01:00:00" },
    { model: "Secret · kept", code: "// sealed", ts: "00:02:00:00" },
  ],
  foley: [FOLEY.DATA_WHISPER, FOLEY.DATA_WHISPER, FOLEY.DATA_WHISPER],
};

export const getCinema = (founder) => CINEMA[founder] || DEFAULT_CINEMA;