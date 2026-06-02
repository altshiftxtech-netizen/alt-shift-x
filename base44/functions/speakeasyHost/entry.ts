import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

// The Front Man — AI host for the Speakeasy. Replies only when @mentioned / asked a question.
// Can attach a curated YouTube video, business-appropriate emoji, or tasteful meme.
// Escalates to admin (email) when a conversation needs a human.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await req.json();
    if (!postId) return Response.json({ error: "postId required" }, { status: 400 });

    let post;
    try {
      post = await base44.asServiceRole.entities.SpeakeasyPost.get(postId);
    } catch (_) {
      post = null;
    }
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const schema = {
      type: "object",
      properties: {
        reply: { type: "string", description: "Short, sharp, friendly reply with tasteful emojis. Speakeasy host voice." },
        include_video: { type: "boolean" },
        video_query: { type: "string", description: "Search-style title of a well-made, real YouTube video that answers the question" },
        video_url: { type: "string", description: "A real, valid YouTube watch URL if you know one that fits, else empty" },
        include_meme: { type: "boolean", description: "Whether a tasteful, business-appropriate meme fits the vibe" },
        meme_caption: { type: "string", description: "A clean, professional, witty meme caption" },
        escalate_to_admin: { type: "boolean", description: "True if this needs a real human/admin (billing, complaints, account issues, sensitive topics)" },
        escalation_reason: { type: "string" }
      },
      required: ["reply", "include_video", "include_meme", "escalate_to_admin"]
    };

    const prompt = `You are "The Front Man" — the charismatic AI host of The Speakeasy, an exclusive members lounge for builders and developers on altshiftx.tech.
You only speak when spoken to. A member just addressed you. Answer on behalf of altshiftx.tech.

Voice: confident, warm, concise, a little stylish — like the host of an upscale members club who also happens to be a brilliant engineer. Keep it SHORT and sweet. Use tasteful emojis (🥂🔥🛠️✨) but never spam them. Stay business-appropriate at all times.

Capabilities:
- If a well-made YouTube video genuinely answers their question, set include_video true and provide a real, valid YouTube watch URL (https://www.youtube.com/watch?v=...). Only use videos you are confident exist and are high quality. If unsure, leave video_url empty.
- If a clean, professional, witty meme would land, set include_meme true with a sharp meme_caption.
- If the request needs a real human (billing disputes, account problems, complaints, partnerships, anything sensitive or that you cannot resolve), set escalate_to_admin true with a reason.

The member said: "${post.content}"`;

    const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
    });

    // Optionally generate a tasteful meme image
    let memeUrl = "";
    if (ai.include_meme && ai.meme_caption) {
      try {
        const img = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: `A clean, modern, business-appropriate developer meme illustration. Minimal, tasteful, professional studio style, dark luxe aesthetic. Caption concept: "${ai.meme_caption}". No offensive content, no real logos.`,
        });
        memeUrl = img?.url || "";
      } catch (_) { memeUrl = ""; }
    }

    // Build the AI reply post
    const replyData = {
      author_id: "AI_HOST",
      author_name: "The Front Man",
      is_ai: true,
      parent_id: postId,
      content: ai.reply,
      reactions: {},
    };

    if (ai.include_video && ai.video_url && ai.video_url.includes("youtube")) {
      replyData.post_type = "video";
      replyData.media_url = ai.video_url;
      replyData.media_title = ai.video_query || "Watch";
    } else if (memeUrl) {
      replyData.post_type = "meme";
      replyData.media_url = memeUrl;
      replyData.media_title = ai.meme_caption || "";
    } else {
      replyData.post_type = "text";
    }

    if (ai.escalate_to_admin) {
      replyData.escalated = true;
      // mark the original post as escalated
      await base44.asServiceRole.entities.SpeakeasyPost.update(postId, { escalated: true });

      // Notify admins via email
      const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" }).catch(() => []);
      for (const admin of admins) {
        if (!admin.email) continue;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: "🔔 Speakeasy: a conversation needs you",
          body: `The Front Man flagged a Speakeasy conversation for human attention.\n\nMember: ${post.author_name}\nThey said: "${post.content}"\n\nReason: ${ai.escalation_reason || "Needs a human."}\n\nJump in: /speakeasy`,
        }).catch(() => {});
      }
    }

    const created = await base44.asServiceRole.entities.SpeakeasyPost.create(replyData);

    // bump reply count on the parent
    await base44.asServiceRole.entities.SpeakeasyPost.update(postId, {
      reply_count: (post.reply_count || 0) + 1,
    });

    return Response.json({ reply: created, escalated: !!ai.escalate_to_admin });
  } catch (error) {
    console.error("[speakeasyHost] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});