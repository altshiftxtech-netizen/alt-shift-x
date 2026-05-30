import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Process monthly revenue splits for installed components.
 * Calculates builder payouts based on component subscriptions and tier revenue share.
 * Runs monthly to generate RevenueSplit records for all active component subscriptions.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only protection
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get current billing period (first day of current month to today)
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Fetch all active component subscriptions
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      status: 'active'
    }, '-created_date', 1000);

    const splits = [];
    let totalProcessed = 0;
    let totalRevenue = 0;

    for (const sub of subscriptions) {
      // Get installed components for this user
      const installed = await base44.asServiceRole.entities.InstalledComponent.filter({
        user_id: sub.user_id,
        status: 'active'
      });

      if (!installed.length) continue;

      // Get builder badges to determine tier and revenue share
      const badges = await base44.asServiceRole.entities.BuilderBadge.filter({
        builder_id: sub.user_id
      });

      const badge = badges[0] || {};
      const builderTier = badge.tier || 'bronze';
      const baseShare = badge.revenue_share_pct || 70;

      // Process each installed component
      for (const comp of installed) {
        // Fetch component details for price
        const components = await base44.asServiceRole.entities.Component.filter({
          id: comp.component_id
        });

        if (!components.length) continue;

        const component = components[0];
        const monthlyPrice = component.price || 49;
        const grossRevenue = monthlyPrice;

        // Calculate builder payout (70% base, adjusted by tier bonuses)
        let builderShare = baseShare;
        let certBonus = 0;
        let volumeBonus = 0;

        // Add certification bonus if applicable
        if (badge.certified_count > 0) {
          if (builderTier === 'bronze') certBonus = 2;
          else if (builderTier === 'silver') certBonus = 5;
          else if (builderTier === 'gold') certBonus = 10;
          else if (builderTier === 'platinum') certBonus = 10;
        }

        // Add volume bonus for high-revenue builders (check monthly revenue)
        const monthlyBuilderRevenue = installed.length * monthlyPrice * (baseShare / 100);
        if (monthlyBuilderRevenue > 50000 && builderTier === 'platinum') volumeBonus = 5;
        else if (monthlyBuilderRevenue > 10000 && (builderTier === 'silver' || builderTier === 'gold')) volumeBonus = 2.5;

        const totalShare = baseShare + certBonus + volumeBonus;
        const builderPayout = grossRevenue * (totalShare / 100);
        const platformTake = grossRevenue - builderPayout;

        // Create RevenueSplit record
        const split = {
          period,
          builder_id: sub.user_id,
          component_id: component.id,
          component_name: component.name,
          gross_revenue: grossRevenue,
          builder_pct: totalShare,
          builder_payout: builderPayout,
          platform_take: platformTake,
          certification_bonus_pct: certBonus,
          volume_rebate_pct: volumeBonus,
          tier_at_period: builderTier,
          status: 'pending'
        };

        await base44.asServiceRole.entities.RevenueSplit.create(split);

        splits.push(split);
        totalProcessed++;
        totalRevenue += grossRevenue;
      }
    }

    console.log(`[INFO] Revenue splits processed: ${totalProcessed} components, $${totalRevenue.toFixed(2)} gross`);
    return Response.json({
      success: true,
      period,
      splits_created: totalProcessed,
      gross_revenue: totalRevenue,
      splits
    });
  } catch (error) {
    console.error('Revenue split processing error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});