import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Publishes (or queues) a SocialPost. Enforces the admin/staff approval model:
//  - admins can publish directly
//  - staff can only publish if preauthorized for that platform (StaffPermission),
//    otherwise the post is moved to pending_approval and NOT published.
// Live OAuth publishing is supported for Instagram & LinkedIn. Facebook/X/TikTok
// are queued as queued_manual for manual posting.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const role = user.role;
    if (role !== 'admin' && role !== 'staff') {
      return Response.json({ error: 'Forbidden: admin or staff only' }, { status: 403 });
    }

    const { postId } = await req.json();
    if (!postId) return Response.json({ error: 'postId is required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.SocialPost.get(postId);
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });

    // ── Approval gate ────────────────────────────────────────────────────────
    let authorized = role === 'admin';
    if (role === 'staff') {
      const perms = await base44.asServiceRole.entities.StaffPermission.filter({ staff_id: user.id, active: true });
      const perm = perms[0];
      const preauthorized = perm?.can_publish_social && (perm?.preauthorized_platforms || []).includes(post.platform);
      authorized = !!preauthorized;
    }

    if (!authorized) {
      await base44.asServiceRole.entities.SocialPost.update(postId, {
        status: 'pending_approval',
        approval_required: true,
      });
      return Response.json({
        status: 'pending_approval',
        message: 'Submitted for admin approval. It will publish once an admin approves it.',
      });
    }

    // ── Platforms without live publishing → queue for manual posting ─────────
    if (['facebook', 'x', 'tiktok'].includes(post.platform)) {
      await base44.asServiceRole.entities.SocialPost.update(postId, {
        status: 'queued_manual',
        approved_by_id: user.id,
        approved_by_name: user.full_name,
        approved_at: new Date().toISOString(),
      });
      return Response.json({
        status: 'queued_manual',
        message: `${post.platform} does not support direct publishing here — download the media and post manually.`,
      });
    }

    // ── Live OAuth publishing ────────────────────────────────────────────────
    let externalId = null;

    if (post.platform === 'instagram') {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('instagram');
      // 1) get IG user id
      const meRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      const me = await meRes.json();
      if (!me.id) throw new Error('Could not resolve Instagram account');
      const isVideo = post.media_type === 'video' || post.media_type === 'reel';
      // 2) create media container
      const params = new URLSearchParams();
      if (isVideo) {
        params.set('media_type', 'REELS');
        params.set('video_url', post.media_url || '');
      } else {
        params.set('image_url', post.media_url || '');
      }
      params.set('caption', post.caption || '');
      params.set('access_token', accessToken);
      const createRes = await fetch(`https://graph.instagram.com/${me.id}/media`, { method: 'POST', body: params });
      const container = await createRes.json();
      if (!container.id) throw new Error(container?.error?.message || 'Instagram media container failed');
      // 3) publish
      const pubParams = new URLSearchParams({ creation_id: container.id, access_token: accessToken });
      const pubRes = await fetch(`https://graph.instagram.com/${me.id}/media_publish`, { method: 'POST', body: pubParams });
      const published = await pubRes.json();
      if (!published.id) throw new Error(published?.error?.message || 'Instagram publish failed');
      externalId = published.id;
    } else if (post.platform === 'linkedin') {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
      // resolve member URN
      const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const me = await meRes.json();
      const authorUrn = me.sub ? `urn:li:person:${me.sub}` : null;
      if (!authorUrn) throw new Error('Could not resolve LinkedIn member');
      const body = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: post.caption || '' },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      };
      const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(body),
      });
      const published = await postRes.json();
      externalId = published.id || published?.activity || null;
      if (!postRes.ok) throw new Error(published?.message || 'LinkedIn publish failed');
    } else {
      return Response.json({ error: `Unsupported platform: ${post.platform}` }, { status: 400 });
    }

    await base44.asServiceRole.entities.SocialPost.update(postId, {
      status: 'published',
      external_post_id: externalId,
      published_at: new Date().toISOString(),
      approved_by_id: user.id,
      approved_by_name: user.full_name,
      approved_at: new Date().toISOString(),
    });

    return Response.json({ status: 'published', external_post_id: externalId });
  } catch (error) {
    console.error('publishSocialPost error:', error.message);
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body.postId) {
        const base44b = createClientFromRequest(req);
        await base44b.asServiceRole.entities.SocialPost.update(body.postId, {
          status: 'failed',
          publish_error: error.message,
        });
      }
    } catch (_) { /* ignore */ }
    return Response.json({ error: error.message }, { status: 500 });
  }
});