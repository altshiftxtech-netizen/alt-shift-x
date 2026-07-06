import React from "react";
import { motion } from "framer-motion";

const GOLD = "#C8A95B";

/**
 * DiamondExtraction — the visual of the SOVEREIGN-DIAMOND-PRESS-1.0 distilling
 * 1,500 possibilities down into ONE Optimal Solution. A cloud of faint facets
 * collapses inward toward a single, growing diamond that ignites at the center.
 *
 * `pressing` drives the animation; when idle it shows a calm, dormant diamond.
 */
export default function DiamondExtraction({ pressing = false }) {
  // A ring of "possibilities" that get pulled into the core when pressing.
  const facets = Array.from({ length: 24 });

  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Halo glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 180, height: 180, background: `radial-gradient(circle, ${GOLD}44, transparent 70%)` }}
        animate={pressing ? { scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] } : { scale: 1, opacity: 0.35 }}
        transition={{ duration: 1.6, repeat: pressing ? Infinity : 0, ease: "easeInOut" }}
      />

      {/* Collapsing possibilities */}
      {facets.map((_, i) => {
        const angle = (i / facets.length) * Math.PI * 2;
        const radius = 96;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <motion.span
            key={i}
            className="absolute rounded-sm"
            style={{ width: 6, height: 6, background: i % 3 === 0 ? "#fff" : GOLD, boxShadow: `0 0 8px ${GOLD}` }}
            initial={{ x, y, opacity: 0.15, scale: 0.6 }}
            animate={
              pressing
                ? { x: 0, y: 0, opacity: [0.15, 0.9, 0], scale: [0.6, 1, 0.2] }
                : { x, y, opacity: 0.15, scale: 0.6 }
            }
            transition={{
              duration: 1.4,
              repeat: pressing ? Infinity : 0,
              delay: (i % 8) * 0.06,
              ease: "easeIn",
            }}
          />
        );
      })}

      {/* The single distilled diamond */}
      <motion.div
        className="relative"
        animate={pressing ? { scale: [0.9, 1.08, 0.9], rotate: [0, 8, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 1.8, repeat: pressing ? Infinity : 0, ease: "easeInOut" }}
      >
        <svg width="88" height="88" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="dpFace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F4ECD2" />
              <stop offset="55%" stopColor={GOLD} />
              <stop offset="100%" stopColor="#8A6D2E" />
            </linearGradient>
          </defs>
          {/* faceted diamond */}
          <polygon points="50,6 78,34 50,94 22,34" fill="url(#dpFace)" stroke="#FFF4D6" strokeWidth="1.2" opacity="0.95" />
          <polygon points="22,34 50,34 50,94" fill="#000" opacity="0.18" />
          <polygon points="78,34 50,34 50,94" fill="#fff" opacity="0.14" />
          <line x1="22" y1="34" x2="78" y2="34" stroke="#FFF4D6" strokeWidth="1" opacity="0.6" />
          <line x1="50" y1="6" x2="50" y2="34" stroke="#FFF4D6" strokeWidth="0.8" opacity="0.5" />
        </svg>

        {/* Core spark ignition */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={pressing ? { opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 1.2, repeat: pressing ? Infinity : 0 }}
        >
          <div className="rounded-full" style={{ width: 14, height: 14, background: "#fff", boxShadow: `0 0 20px 6px ${GOLD}` }} />
        </motion.div>
      </motion.div>
    </div>
  );
}