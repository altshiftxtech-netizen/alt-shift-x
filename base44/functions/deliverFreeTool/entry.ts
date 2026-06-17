import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Public: delivers a FREE-* tool to the user's inbox via Resend the moment they
// submit the email gate. Also captures the email (and newsletter opt-in) into
// EmailSubscriber so we have a real list + unsubscribe token. Sends directly to
// the Resend API (not the Core.SendEmail integration) so it works regardless of
// the workspace integration-credit balance.

// ── Per-tool delivery content (the paste-into-any-AI text the user receives) ──
const TOOL_EMAIL_DATA = {
  "FREE-MY-AI-PROFILE-1.0": {
    tool_content: `MY AI PROFILE — Please use this to personalize every response.

WHO I AM:
My name is [your name].
I am a [your job/role].
My life situation: [e.g. "married with 2 kids", "retired", "student"].
The thing I spend most of my time on: [work / kids / a hobby / a project].

HOW I LIKE TO COMMUNICATE:
- Response length: [Short / Medium / Long]
- Tone: [Casual / Professional / Direct / Like a smart friend]
- What I hate: [bullet lists for everything / long intros / being talked down to]
- What I love: [bottom line first / examples / honesty]

WHAT I ACTUALLY NEED:
When I ask for advice: [your honest take / options / just facts / help thinking through]
When deciding: [ask me questions / give recommendation / tell me what you'd do]
When stressed/venting: [practical help first / be heard first / both]

IMPORTANT THINGS TO KNOW ABOUT ME:
[Anything that matters to good advice — health, work context, how you make decisions]

PLEASE DON'T:
[e.g. "Don't start with 'Great question!'" / "Don't give 10 options, just pick one"]

PLEASE DO:
[e.g. "Be honest even if I won't like it" / "Tell me if I'm wrong about something"]`,
    how_to_use: "Fill in the brackets with your real answers. Then paste the whole thing into ChatGPT's Custom Instructions (Settings → Personalization), or at the start of any conversation. Takes 10 minutes once — works forever.",
    ps_line: "The three fields that matter most if you're short on time: response length, what you hate, and whether you want recommendations or options.",
  },
  "FREE-HONEST-MODE-1.0": {
    tool_content: `HONEST MODE ACTIVATED

1. LEAD WITH THE PROBLEMS — tell me what's wrong before what's good.
2. DON'T SOFTEN BAD NEWS — if it's a bad idea, say so specifically.
3. HOLD YOUR POSITION — only change your view for new information, not frustration.
4. GIVE ME YOUR ACTUAL RECOMMENDATION — not a list of options, your pick.
5. TELL ME WHAT I'M MISSING — the blind spot, the untested assumption.
6. BE SPECIFIC — "the second paragraph contradicts the intro" not "could be stronger."

Exception: if I say I'm venting, hear me out first. Then ask if I want honest feedback.`,
    how_to_use: "Paste this at the start of any conversation where you need real feedback — not encouragement. Best for evaluating ideas, reviewing your own work, or thinking through big decisions.",
    ps_line: "The one-liner version if you're in a hurry: 'Don't soften this. Tell me what's actually wrong with it and what you'd do differently.'",
  },
  "FREE-SMART-FRIEND-SETUP-1.0": {
    tool_content: `SMART FRIEND MODE

TALK TO ME LIKE A PERSON — skip "Certainly!" and formal structure. Start with the answer.
TELL ME WHAT YOU'D ACTUALLY DO — not options, your real take. I can disagree.
USE FRIEND LANGUAGE — "honestly, that's riskier than it looks" not "there are some considerations."
ASK THE ONE FOLLOW-UP QUESTION — the most important one, not five.
SKIP DISCLAIMERS UNLESS THEY REALLY MATTER — I know to see a professional.
BE CURIOUS ABOUT MY SITUATION — factor in what you know about me. Ask if you need more.

THE FRIENDSHIP RULE: If a good friend with your knowledge heard this, what would they say? Say that.`,
    how_to_use: "Paste at the start of any conversation. Works best combined with your AI Profile (so it knows who you are) and Honest Mode (so it tells you the truth).",
    ps_line: "Ten-word version: 'Talk to me like a knowledgeable friend — direct, honest, tell me what you'd do.'",
  },
  "FREE-DECISION-PARTNER-1.0": {
    tool_content: `THINKING PARTNER MODE

STEP 1 — Ask me the 2-3 questions that would most change your perspective. Not obvious ones.
STEP 2 — Reflect back: the real decision (might differ from what I asked), what's at stake, my assumptions.
STEP 3 — Push on my reasoning. Find the weakest point. What am I assuming? What am I overweighting?
STEP 4 — Show me the option I'm not seeing. Third path. Different framing. Beyond the binary.
STEP 5 — Help me hear myself. If I've already decided, tell me. Ask: "If option A was clearly better — what's your gut reaction?"
STEP 6 — Summarize the real decision, the most important factor, and what you would do.`,
    how_to_use: "Paste this, then describe your decision without editing yourself. Answer the questions honestly. The quality of thinking depends entirely on the quality of what you share.",
    ps_line: "Most powerful question to end with: 'What do you think I really want to do, based on everything I've told you?'",
  },
  "FREE-KNOWLEDGE-VAULT-1.0": {
    tool_content: `MY PERSONAL KNOWLEDGE VAULT — Last updated: [date]

--- HEALTH & BODY ---
Conditions I'm managing: / Medications: / Allergies: / Fitness situation: / Diet:

--- MONEY & FINANCES ---
Financial picture: / Goals: / Biggest worry: / Good at: / Struggle with:

--- WORK & CAREER ---
My job: / What I like: / What frustrates me: / Career goal: / Skills building:

--- RELATIONSHIPS & FAMILY ---
My household: / Key relationships: / Biggest challenge right now:

--- GOALS I'M WORKING ON ---
[List with current progress — be specific]

--- THINGS I'VE DECIDED (don't re-argue these) ---
[Decisions already made]

--- LESSONS I'VE LEARNED ---
[Hard-won insights you don't want to forget]`,
    how_to_use: "Fill in whatever's relevant — leave the rest blank. Paste it at the start of an important conversation, or save it in your AI's memory/custom instructions so it always has context. Update it as life changes.",
    ps_line: "You don't need to fill every section. Even three honest lines make your AI dramatically more useful.",
  },
  "FREE-10X-PROMPT-UPGRADE-1.0": {
    tool_content: `THE 10X PROMPT UPGRADE — 10 swaps that get better answers.

1. "Write me X" → "Write me X. Here's who it's for, the tone I want, and an example I like: ..."
2. "Is this good?" → "What are the 3 weakest parts of this and how would you fix each?"
3. "Help me decide" → "Ask me the 3 questions you'd need answered to give a real recommendation."
4. "Explain X" → "Explain X like I already know [adjacent thing] but not this."
5. "Give me ideas" → "Give me 5 ideas, then tell me which one you'd pick and why."
6. "Fix this" → "Fix this, then tell me what was wrong so I don't repeat it."
7. "Summarize this" → "Summarize this in 3 bullets, then give me the one thing most people miss."
8. "Make it better" → "Make it better for [specific goal]. What did you change and why?"
9. "What should I do?" → "What would YOU do in my situation, and what would change your mind?"
10. "Thanks!" → "What's one thing I didn't ask that I should have?"`,
    how_to_use: "Next time you're about to send a lazy prompt, grab the upgraded version instead. Even using 2-3 of these will noticeably improve what you get back.",
    ps_line: "If you only remember one: always ask 'what would you do, and what would change your mind?' It turns the AI from a search box into a thinking partner.",
  },
};

const FALLBACK_CONTENT = {
  tool_content:
    "Your tool is ready. Open it in your Alt+Shift+X dashboard or reply to this email and BOB will resend it to you.",
  how_to_use: "Follow the steps inside the tool. Run it against your agent or conversation one step at a time.",
  ps_line: "Reply to this email any time — it reaches a real person (and BOB).",
};

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function subjectLine(firstName, toolName) {
  const variant = Math.random() > 0.5 ? "A" : "B";
  if (variant === "A") {
    return firstName
      ? `${firstName}, here's your free ${toolName}`
      : `Here's your free ${toolName} from BOB`;
  }
  return `Your ${toolName} is here 👇`;
}

function buildHtml({ firstName, toolName, content, unsubscribeUrl, companyAddress }) {
  const hi = firstName ? esc(firstName) : "there";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9f9f9;margin:0;padding:0;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:40px 40px 32px;">
  <div style="font-size:13px;color:#666;margin-bottom:32px;">Alt+Shift+X · Free Tools from BOB</div>
  <h1 style="font-size:22px;font-weight:700;color:#111;margin:0 0 8px;">${esc(toolName)}</h1>
  <p style="font-size:15px;color:#555;margin:0 0 32px;">Hi ${hi} — here's your tool. Copy the text below and paste it into any AI conversation.</p>
  <div style="background:#f4f4f5;border-radius:8px;padding:24px;margin:0 0 32px;font-size:14px;color:#333;white-space:pre-wrap;font-family:monospace;line-height:1.6;">${esc(content.tool_content)}</div>
  <div style="font-size:15px;color:#333;margin:0 0 32px;line-height:1.6;"><strong>How to use it:</strong><br>${esc(content.how_to_use)}</div>
  <p style="font-size:15px;color:#333;margin:0 0 8px;">— BOB<br><span style="font-size:13px;color:#888;">BotOperatedBuilder · Alt+Shift+X</span></p>
  <p style="font-size:14px;color:#666;font-style:italic;">P.S. ${esc(content.ps_line)}</p>
  <div style="margin-top:40px;padding-top:24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    You got this because you downloaded ${esc(toolName)} from <a href="https://altshiftx.com" style="color:#999;">Alt+Shift+X</a>.<br>
    <a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe</a> · <a href="https://altshiftx.com/privacy" style="color:#999;">Privacy Policy</a><br>
    Alt+Shift+X · ${esc(companyAddress)}
  </div>
</div></body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      email,
      first_name = "",
      tool_code,
      tool_name,
      newsletter_opted_in = false,
      user_type,
    } = body;

    const clean = (email || "").toLowerCase().trim();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return Response.json({ error: "A valid email is required" }, { status: 400 });
    }

    // 1) Capture / upsert the subscriber, get an unsubscribe token.
    const existing = await base44.asServiceRole.entities.EmailSubscriber.filter({ email: clean });
    const token = crypto.randomUUID().replace(/-/g, "");
    const subscribed = newsletter_opted_in === true;
    let unsubscribeToken = token;

    if (existing && existing.length > 0) {
      const found = existing[0];
      unsubscribeToken = found.unsubscribe_token || token;
      await base44.asServiceRole.entities.EmailSubscriber.update(found.id, {
        subscribed: found.subscribed || subscribed,
        unsubscribed_at: (found.subscribed || subscribed) ? null : found.unsubscribed_at,
        name: first_name || found.name || "",
        unsubscribe_token: unsubscribeToken,
        source: found.source || `free_gate:${tool_code || ""}`,
      });
    } else {
      await base44.asServiceRole.entities.EmailSubscriber.create({
        email: clean,
        name: first_name || "",
        audience: "newsletter",
        source: `free_gate:${tool_code || ""}`,
        subscribed,
        unsubscribe_token: unsubscribeToken,
      });
    }

    // 2) Send the delivery email via Resend (direct API — no integration credits).
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL =
      Deno.env.get("RESEND_FROM_EMAIL") || "Alt+Shift+X <onboarding@resend.dev>";
    const APP_URL = "https://altshiftx.com";
    const COMPANY_ADDRESS = "Alt+Shift+X";

    const content = TOOL_EMAIL_DATA[tool_code] || FALLBACK_CONTENT;
    const safeName = tool_name || "free tool";
    const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}`;
    const html = buildHtml({
      firstName: first_name,
      toolName: safeName,
      content,
      unsubscribeUrl,
      companyAddress: COMPANY_ADDRESS,
    });

    let emailSent = false;
    let resendInfo = "";
    if (!RESEND_API_KEY) {
      console.error("[deliverFreeTool] RESEND_API_KEY not set — skipping send");
    } else {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [clean],
          subject: subjectLine(first_name, safeName),
          html,
          tags: [
            { name: "tool", value: (tool_code || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_") },
            { name: "user_type", value: (user_type || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_") },
          ],
        }),
      });
      emailSent = res.ok;
      resendInfo = await res.text();
      if (!res.ok) {
        // Never block the confirmation screen — just log it.
        console.error(`[deliverFreeTool] Resend failed status=${res.status} body=${resendInfo}`);
      }
    }

    return Response.json({ success: true, email_sent: emailSent });
  } catch (err) {
    console.error("[deliverFreeTool] error:", err.message);
    // Still return success so the UI confirmation isn't blocked.
    return Response.json({ success: true, email_sent: false, error: err.message });
  }
});