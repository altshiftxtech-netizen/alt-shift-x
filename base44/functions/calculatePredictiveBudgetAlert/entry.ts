import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { budget_category } = await req.json();

    // Fetch all budget alerts
    let alerts = await base44.entities.BudgetAlert.list();
    if (budget_category) {
      alerts = alerts.filter(a => a.budget_category === budget_category);
    }

    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysElapsed = dayOfMonth;
    const daysRemaining = daysInMonth - dayOfMonth;

    const updatedAlerts = await Promise.all(alerts.map(async (alert) => {
      // Calculate burn rate
      const dailyBurnRate = alert.current_spend / daysElapsed;
      
      // Project month-end spending
      const projectedMonthEnd = alert.current_spend + (dailyBurnRate * daysRemaining);
      
      // Calculate variance
      const variancePercentage = ((projectedMonthEnd - alert.monthly_budget) / alert.monthly_budget) * 100;
      
      // Determine alert status
      const spendPercentage = (alert.current_spend / alert.monthly_budget) * 100;
      let alertStatus = 'normal';
      if (spendPercentage >= 95 || projectedMonthEnd > alert.monthly_budget * 1.1) {
        alertStatus = 'critical';
      } else if (spendPercentage >= alert.threshold_percentage) {
        alertStatus = 'warning';
      }

      // Generate recommendations via AI
      const recPrompt = `Based on this budget data:
Category: ${alert.budget_category}
Monthly Budget: $${alert.monthly_budget}
Current Spend: $${alert.current_spend}
Projected Month-End: $${Math.round(projectedMonthEnd)}
Daily Burn Rate: $${Math.round(dailyBurnRate)}/day
Status: ${alertStatus}

Generate 2-3 specific, actionable recommendations to optimize spending. Be concise.`;

      const recResponse = await base44.integrations.Core.InvokeLLM({
        prompt: recPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      const updatedAlert = await base44.entities.BudgetAlert.update(alert.id, {
        current_spend: alert.current_spend,
        projected_month_end: Math.round(projectedMonthEnd),
        variance_percentage: Math.round(variancePercentage),
        daily_burn_rate: Math.round(dailyBurnRate * 100) / 100,
        days_remaining: daysRemaining,
        alert_status: alertStatus,
        budget_exceeded: projectedMonthEnd > alert.monthly_budget,
        recommendations: recResponse.recommendations || [],
        last_calculated: new Date().toISOString()
      });

      // Send alert if threshold reached
      if (alertStatus === 'critical' && !alert.alert_sent) {
        try {
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `🚨 CRITICAL: Budget Alert for ${alert.budget_category}`,
            body: `Your ${alert.budget_category} budget is at risk!\n\nCurrent Spend: $${alert.current_spend}\nMonthly Budget: $${alert.monthly_budget}\nProjected Month-End: $${Math.round(projectedMonthEnd)}\nDaily Burn Rate: $${Math.round(dailyBurnRate)}/day\n\nRecommendations:\n${recResponse.recommendations?.map(r => `• ${r}`).join('\n')}`
          });

          await base44.entities.BudgetAlert.update(alert.id, { alert_sent: true });
        } catch (emailErr) {
          console.warn('Budget alert email failed:', emailErr.message);
        }
      }

      return updatedAlert;
    }));

    return Response.json({
      success: true,
      alerts: updatedAlerts,
      calculated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Budget alert calculation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});