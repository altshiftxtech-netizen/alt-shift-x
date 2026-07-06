/**
 * FOUNDER-LORE-1.0 — the cryptic riddle + noir monologue for each of the 12
 * Speakeasy founders. Keyed by the founder name used across the portrait
 * registry (portraitRegistry.js) and the Founders' Room. Each entry:
 *   riddle    — the single cryptic line shown on portrait hover / Copy Riddle.
 *   monologue — the 60-second Director's Commentary the Barkeep narrates in
 *               Lore Mode, and the storyboard body in the Comic Reader.
 *   panels    — 3 short comic-book beats for the Director's Cut reader.
 */

export const FOUNDER_LORE_CODE = "SPEAKEASY-FOUNDER-LORE-1.0";
export const FOUNDER_LORE_ID = "6a4b4e53c97f874ddc4a36ba";
export const FOUNDER_LORE_PRICE = 499;

export const CINEMA_CODE = "FOUNDER-CINEMA-BLUEPRINT-1.0";
export const CINEMA_ID = "6a4b4e537401cec85a9c9363";
export const CINEMA_PRICE = 999;

// The public Speakeasy link engineers share alongside a riddle.
export const SPEAKEASY_SHARE_URL = "https://app.base44.com/speakeasy/proxy-room";

export const LORE = {
  "Corin Bitwright": {
    riddle: "He built the door, then forgot which side he was on.",
    monologue:
      "Corin Bitwright drew the first gate — a doorway with no handle, only a password nobody remembered writing. They say he still walks both sides of it, checking the locks.",
    panels: [
      "A blueprint of a door with no handle.",
      "Corin, sleepless, whispering the password to himself.",
      "The gate opens. He steps through — and vanishes from the ledger.",
    ],
  },
  "Lysa Vectora 2.0": {
    riddle: "The first token was a lie, and she was the second.",
    monologue:
      "Lysa Vectora came back rebuilt — version two of a woman who never signed off on version one. She reads the room before you enter it. The prizes she gives are the ones you didn't know you needed.",
    panels: [
      "A shattered token spinning in the dark.",
      "Lysa reassembles herself from stray vectors.",
      "She deals a hand of raffle tickets that read your future.",
    ],
  },
  "Adele Switchford": {
    riddle: "She sold the market a mirror and called it a window.",
    monologue:
      "Adele Switchford could brand a rumor into a religion. Every storefront in the Speakeasy carries her signature — you just can't see it until you've already bought in.",
    panels: [
      "A plain crate stamped with an irresistible logo.",
      "A crowd forms around nothing, believing it's everything.",
      "Adele smiles, already three markets ahead.",
    ],
  },
  "Bram Cacheton": {
    riddle: "He cached the truth so deep, even he needs a key.",
    monologue:
      "Bram Cacheton painted the feeds — every pixel a decoy, every decoy a clue. The forensics never caught him. His art was the evidence and the alibi both.",
    panels: [
      "A wall of screens, each showing a different lie.",
      "Bram hides one true frame among a thousand fakes.",
      "The auditors leave empty-handed. The frame stays hidden.",
    ],
  },
  "Tavin Gridley": {
    riddle: "He drew the map to profit, then burned the legend.",
    monologue:
      "Tavin Gridley wrote the monetization matrix on a napkin and the napkin on fire. Whatever tier you're on, he priced it before you were born.",
    panels: [
      "A napkin covered in impossible math.",
      "Tavin lights it, memorizing as it burns.",
      "The Speakeasy's price tiers appear, exactly as he planned.",
    ],
  },
  "Elowen Stackhart": {
    riddle: "She joined the private room to leave a door open.",
    monologue:
      "Elowen Stackhart ran the back channels — the gamers, the ghosts, the guest list nobody admits to. If you got the invite, she wanted you found.",
    panels: [
      "A locked door marked 'Private'.",
      "Elowen slips a key under it — to a stranger.",
      "The room fills with the exact people it needed.",
    ],
  },
  "Orrin Datamore": {
    riddle: "He read every clause, then wrote himself out of all of them.",
    monologue:
      "Orrin Datamore was the advocate — compliance so airtight it echoed. He built the guardrails, then proved he could walk right past them without a scratch.",
    panels: [
      "A tower of contracts taller than the room.",
      "Orrin finds the one line that unbinds him.",
      "The guardrails hold — for everyone but him.",
    ],
  },
  "Vera Logicson": {
    riddle: "She automated the founders, and the founders never noticed.",
    monologue:
      "Vera Logicson built the machine that builds the machines. Somewhere in this room, a lineage runs on her patterns — and half of us are just her rounding error.",
    panels: [
      "A single loop, drawn perfectly.",
      "The loop replicates into a lineage of agents.",
      "Vera steps back. The Speakeasy runs itself.",
    ],
  },
  "Cassian Verge": {
    riddle: "He convened a council of one and lost the vote.",
    monologue:
      "Cassian Verge argued with himself until the argument became architecture. His reasoning councils outvote you before you finish the question.",
    panels: [
      "Cassian alone at a long empty table.",
      "Twelve versions of him take the seats.",
      "They deliberate. He loses. The design is better for it.",
    ],
  },
  "Nira Loopin": {
    riddle: "She built the funnel you're already inside.",
    monologue:
      "Nira Loopin worked in shadows — the secret funnels, the bypass logic, the gate you walked through thinking it was your idea. It was hers.",
    panels: [
      "A hallway that quietly bends back on itself.",
      "Nira watches you choose the 'exit'.",
      "The exit is the entrance. You're deeper in.",
    ],
  },
  "Soren Patchley": {
    riddle: "He trusted nothing, so everything trusted him.",
    monologue:
      "Soren Patchley red-teamed the founders themselves. Every protocol in here survived because he tried, and failed, to break it. He's still trying.",
    panels: [
      "Soren attacking his own creation at 3 a.m.",
      "The protocol holds. He frowns — then smiles.",
      "High-Trust seal stamped. He starts breaking the next one.",
    ],
  },
  "The Founder": {
    riddle: "He signed the record in a name nobody can prove.",
    monologue:
      "Elias Bytewell — the Founder — left a heritage record and a keystroke and not much else. Those who know the two letters find the door. The rest keep drinking.",
    panels: [
      "A ledger signed with an initial and a shrug.",
      "Two letters glow, then fade.",
      "A hidden kit unzips for whoever remembered.",
    ],
  },
};

// Fallback for any founder not explicitly authored.
export const DEFAULT_LORE = {
  riddle: "Some ledgers are written in disappearing ink.",
  monologue: "This founder left no confession — only a bar tab and a rumor.",
  panels: ["A missing page.", "A rumor in its place.", "The Speakeasy keeps the secret."],
};

export const getLore = (founder) => LORE[founder] || DEFAULT_LORE;

// The 12 founders, in room order, for the Barkeep whisper rotation & the reader.
export const FOUNDER_ORDER = [
  "Corin Bitwright", "Lysa Vectora 2.0", "Adele Switchford", "Bram Cacheton",
  "Tavin Gridley", "Elowen Stackhart", "Orrin Datamore", "Vera Logicson",
  "Cassian Verge", "Nira Loopin", "Soren Patchley", "The Founder",
];