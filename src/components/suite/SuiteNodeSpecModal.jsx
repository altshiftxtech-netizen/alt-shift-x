import React from 'react';
import { X, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

/**
 * Read-only spec sheet modal for a suite node.
 * Ported from the retired PublicSuiteNodeGrid spec modal, adapted to the
 * orbit node shape (name, tagline, desc, specs, color, price, subpath, logo).
 */
export default function SuiteNodeSpecModal({ node, onClose, onLaunchNode }) {
  if (!node) return null;
  const publicUrl = node.url || `https://altshiftx.tech${node.subpath}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden text-white max-h-[90vh] overflow-y-auto">
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none -mr-16 -mt-16"
          style={{ backgroundColor: node.color }}
        />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            {node.category}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-mono" style={{ color: node.color }}>
            {node.price}
          </span>
        </div>

        <h3 className="text-2xl font-black text-white mb-1">{node.name}</h3>
        <p className="text-sm font-semibold text-slate-200 mb-2">{node.tagline}</p>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">{node.desc}</p>

        {node.specs && node.specs.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Operational Highlights
            </h4>
            <ul className="space-y-2">
              {node.specs.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-all"
          >
            Close Spec Sheet
          </button>
          <a
            href={node.subpath}
            onClick={(event) => {
              event.preventDefault();
              onClose();
              onLaunchNode(node.subpath);
            }}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black shadow-lg hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center justify-center gap-1.5"
          >
            Launch Workspace on {publicUrl.replace('https://', '')}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}