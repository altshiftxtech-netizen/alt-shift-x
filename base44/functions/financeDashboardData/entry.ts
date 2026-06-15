import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SPREADSHEET_ID = "1PVGiMsONomYCNnzFgRuiHbUOQsyF3nSZnK9L9Tz3jmg";

/**
 * financeDashboardData — reads the Alt+Shift+X Operations & Finance workbook and
 * returns parsed, chart-ready financial + cashflow metrics for the admin dashboard.
 * Admin-only. Reads computed formula values (UNFORMATTED_VALUE) so totals come
 * back as real numbers.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const conn = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const auth = { Authorization: `Bearer ${conn.accessToken}` };

    // Batch-read all the ranges we need in one call.
    const ranges = [
      'Dashboard!A4:B16',
      'Cashflow!A2:C4',
      'Cashflow!A6:C12',
      'Revenue!A2:B3',
      'Subscriptions!A2:B4',
      'Components!A2:B5',
    ];
    const qs = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?${qs}&valueRenderOption=UNFORMATTED_VALUE`;

    const res = await fetch(url, { headers: auth });
    const data = await res.json();
    if (!res.ok) {
      console.error('financeDashboardData read error', data);
      return Response.json({ error: data }, { status: res.status });
    }

    const vr = data.valueRanges || [];
    const grid = (i) => (vr[i] && vr[i].values) || [];
    const num = (v) => {
      const n = typeof v === 'number' ? v : parseFloat(String(v || '').replace(/[^0-9.\-]/g, ''));
      return isFinite(n) ? n : 0;
    };

    // Dashboard key metrics (label -> value rows)
    const dash = {};
    grid(0).forEach((row) => { if (row[0]) dash[row[0]] = row[1]; });

    // Cashflow summary
    const cfSummary = grid(1); // Cash In / Cash Out / Net Cashflow rows
    const cashIn = num(cfSummary[0] && cfSummary[0][1]);
    const cashOut = num(cfSummary[1] && cfSummary[1][1]);
    const netCashflow = num(cfSummary[2] && cfSummary[2][1]);

    // Expense breakdown (skip the "EXPENSES" header row)
    const expenseRows = grid(2).filter((r) => r[0] && r[0] !== 'EXPENSES' && r[1] !== undefined);
    const expenses = expenseRows
      .map((r) => ({ name: String(r[0]), amount: num(r[1]) }))
      .filter((e) => e.amount > 0);

    // Revenue
    const revRows = grid(3);
    const marketplaceMRR = num(revRows[0] && revRows[0][1]);
    const avgRevPerInstall = num(revRows[1] && revRows[1][1]);

    // Subscriptions
    const subRows = grid(4);
    const activeSubs = num(subRows[0] && subRows[0][1]);
    const subscriptionMRR = num(subRows[1] && subRows[1][1]);
    const avgSubValue = num(subRows[2] && subRows[2][1]);

    // Components
    const compRows = grid(5);
    const publishedComponents = num(compRows[0] && compRows[0][1]);
    const totalInstalls = num(compRows[1] && compRows[1][1]);

    const totalMRR = num(dash['TOTAL MONTHLY RECURRING REVENUE']) || (marketplaceMRR + subscriptionMRR);
    const arr = num(dash['Projected Annual Revenue (ARR)']) || totalMRR * 12;

    return Response.json({
      updatedAt: dash['Last updated:'] || null,
      kpis: {
        totalMRR,
        arr,
        marketplaceMRR,
        subscriptionMRR,
        netCashflow,
        cashIn,
        cashOut,
        activeSubs,
        publishedComponents,
        totalInstalls,
        avgRevPerInstall,
        avgSubValue,
      },
      revenueMix: [
        { name: 'Marketplace', value: marketplaceMRR },
        { name: 'Subscriptions', value: subscriptionMRR },
      ].filter((r) => r.value > 0),
      cashflow: [
        { name: 'Cash In', amount: cashIn },
        { name: 'Cash Out', amount: cashOut },
        { name: 'Net', amount: netCashflow },
      ],
      expenses,
    });
  } catch (error) {
    console.error('financeDashboardData error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});