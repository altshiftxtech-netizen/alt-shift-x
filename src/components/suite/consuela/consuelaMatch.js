const keywords = {
  turimc: ['hardware', 'compute', 'cad', 'gpu', 'physics', 'circuit'],
  codevault: ['git', 'code', 'repo', 'repositories', 'wasm', 'commit'],
  dblive: ['database', 'court', 'ledger', 'audit', 'worm', 'immutable', 'compliance'],
  omnibridge: ['sales', 'crm', 'lead', 'call', 'phone', 'churn'],
  bitfolio: ['nfc', 'portfolio', 'card', 'tap'],
  sourcebridge: ['api', 'broker', 'queue', 'pipeline', 'webhook', 'connector'],
  magna: ['site', 'web', 'builder', 'template', 'canvas'],
};
export function matchConsuela(query, nodes) {
  const words = query.toLowerCase();
  const matches = nodes.filter(node => keywords[node.id]?.some(word => new RegExp(`\\b${word}\\b`, 'i').test(words)));
  const selected = matches.length ? matches : [nodes.find(node => node.id === 'altshiftx')];
  const pass = selected.length > 2 ? 'All-Access Apex Pass ($499/mo)' : selected.length === 2 ? 'Duo-Mesh Founder Pass ($279/mo)' : /\b(sprint|hackathon|short-term)\b/.test(words) ? 'Sprint Burst Pass ($49 one-time)' : 'Dynamic Flex Pass ($149/mo)';
  return { nodes: selected, pass, reason: matches.length ? selected.map(node => node.desc).join(' ') : 'Start with the AI builder and marketplace to explore components for your project. Describe a specific workload for a more targeted match.' };
}