import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * updateBuilderProfile — update builder's public bio, website, social links, and specializations
 * Payload: { display_name?, tagline?, bio?, website?, twitter?, location?, specializations? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { display_name, tagline, bio, website, twitter, location, specializations } = await req.json();

    // Validate website URL if provided
    if (website) {
      try {
        new URL(website);
      } catch (e) {
        return Response.json({ error: 'Invalid website URL' }, { status: 400 });
      }
    }

    // Validate Twitter handle format if provided
    if (twitter && !twitter.match(/^@?\w{1,15}$/)) {
      return Response.json({ error: 'Invalid Twitter handle format' }, { status: 400 });
    }

    // Get or create builder badge record
    const badges = await base44.entities.BuilderBadge.filter({ builder_id: user.id });
    const badgeId = badges[0]?.id;

    const profileData = {};
    if (display_name !== undefined) profileData.display_name = display_name || null;
    if (tagline !== undefined) profileData.tagline = tagline || null;
    if (bio !== undefined) profileData.bio = bio || null;
    if (website !== undefined) profileData.website = website || null;
    if (twitter !== undefined) profileData.twitter = twitter || null;
    if (location !== undefined) profileData.location = location || null;
    if (specializations !== undefined) profileData.specializations = Array.isArray(specializations) ? specializations : null;

    let updated;
    if (badgeId) {
      updated = await base44.entities.BuilderBadge.update(badgeId, profileData);
    } else {
      // Create new badge with profile info
      updated = await base44.entities.BuilderBadge.create({
        builder_id: user.id,
        tier: 'bronze',
        ...profileData
      });
    }

    // Audit trail for profile updates
    await base44.asServiceRole.functions.invoke('logAuditTrail', {
      action: 'update',
      entity_type: 'builder',
      entity_id: user.id,
      change_summary: `Builder profile updated: ${Object.keys(profileData).filter(k => profileData[k]).join(', ')}`,
      new_values: profileData
    }).catch(e => console.warn('Audit log failed:', e.message));

    return Response.json({
      success: true,
      profile: updated,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('updateBuilderProfile error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});