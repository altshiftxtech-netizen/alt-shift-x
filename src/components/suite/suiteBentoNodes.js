import { Gem, GitBranch, Database, Workflow, ContactRound, Network, Cpu, PenTool } from 'lucide-react';

const NODE_URLS = {
  codevault: 'https://codevault.altshiftx.tech',
  dblive: 'https://dblive.altshiftx.tech',
  omnibridge: 'https://omnibridge.altshiftx.tech',
  bitfolio: 'https://bitfolio.altshiftx.tech',
  sourcebridge: 'https://sourcebridge.altshiftx.tech',
  turimc: 'https://turimc.altshiftx.tech',
  magna: 'https://magna.altshiftx.tech',
};

const suiteBentoNodes = [
  { id: 'altshiftx', name: 'Alt+Shift+X', label: 'Root 0', path: '/aibuilder', Icon: Gem },
  { id: 'codevault', name: 'Code Vault', label: 'Node 1', path: '/codevault', Icon: GitBranch },
  { id: 'dblive', name: 'dbLive', label: 'Node 2', path: '/dblive', Icon: Database },
  { id: 'omnibridge', name: 'OmniBridge', label: 'Node 3', path: '/omnibridge', Icon: Workflow },
  { id: 'bitfolio', name: 'Bitfolio Hub', label: 'Node 4', path: '/bitfolio', Icon: ContactRound },
  { id: 'sourcebridge', name: 'SourceBridge', label: 'Node 5', path: '/sourcebridge', Icon: Network },
  { id: 'turimc', name: 'Turi MC', label: 'Node 6', path: '/turimc', Icon: Cpu },
  { id: 'magna', name: 'M Λ G N Λ', label: 'Node 7', path: '/magna', Icon: PenTool },
].map(node => ({ ...node, url: NODE_URLS[node.id] || `https://altshiftx.tech${node.path}` }));

export default suiteBentoNodes;