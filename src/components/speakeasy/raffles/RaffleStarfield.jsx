import React from "react";

/**
 * Decorative cosmic starfield with faint constellations for the raffle pages.
 * Purely visual — sits behind the content (pointer-events-none) over the
 * existing nebula gradient. Stars twinkle; constellation lines connect a few
 * of them into little figures.
 */

// Scattered twinkling stars: x%, y%, size(px), twinkle delay(s)
const STARS = [
  { x: 8, y: 12, s: 2, d: 0 }, { x: 15, y: 30, s: 1.5, d: 1.2 }, { x: 22, y: 8, s: 2.5, d: 0.5 },
  { x: 30, y: 22, s: 1.5, d: 1.8 }, { x: 38, y: 14, s: 2, d: 0.9 }, { x: 45, y: 34, s: 1.5, d: 2.1 },
  { x: 52, y: 10, s: 2.5, d: 0.3 }, { x: 60, y: 26, s: 1.5, d: 1.5 }, { x: 68, y: 12, s: 2, d: 0.7 },
  { x: 75, y: 30, s: 1.5, d: 1.1 }, { x: 82, y: 16, s: 2.5, d: 1.9 }, { x: 90, y: 28, s: 2, d: 0.4 },
  { x: 12, y: 55, s: 1.5, d: 1.3 }, { x: 28, y: 62, s: 2, d: 0.6 }, { x: 42, y: 52, s: 1.5, d: 2.0 },
  { x: 58, y: 64, s: 2.5, d: 0.8 }, { x: 72, y: 55, s: 1.5, d: 1.6 }, { x: 88, y: 60, s: 2, d: 1.0 },
  { x: 6, y: 78, s: 2, d: 0.5 }, { x: 20, y: 88, s: 1.5, d: 1.7 }, { x: 35, y: 80, s: 2.5, d: 0.2 },
  { x: 50, y: 90, s: 1.5, d: 1.4 }, { x: 65, y: 82, s: 2, d: 0.9 }, { x: 80, y: 92, s: 1.5, d: 2.2 },
  { x: 94, y: 78, s: 2.5, d: 0.6 }, { x: 48, y: 46, s: 1.5, d: 1.2 }, { x: 4, y: 40, s: 2, d: 0.7 },
];

// Constellations: each is a polyline of star points (x%, y%) drawn faintly.
const CONSTELLATIONS = [
  // top-left "dipper"
  [[8, 12], [15, 30], [22, 8], [30, 22], [38, 14]],
  // right-side cluster
  [[68, 12], [75, 30], [82, 16], [90, 28]],
  // lower center figure
  [[28, 62], [42, 52], [58, 64], [72, 55]],
];

export default function RaffleStarfield() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Constellation lines + their vertex stars */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {CONSTELLATIONS.map((line, ci) => (
          <g key={ci}>
            <polyline
              points={line.map((p) => p.join(",")).join(" ")}
              fill="none"
              stroke="rgba(143,216,255,0.28)"
              strokeWidth="0.15"
              vectorEffect="non-scaling-stroke"
            />
            {line.map((p, pi) => (
              <circle key={pi} cx={p[0]} cy={p[1]} r="0.35" fill="rgba(200,230,255,0.9)" />
            ))}
          </g>
        ))}
      </svg>

      {/* Twinkling scattered stars */}
      {STARS.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            background: "#ffffff",
            boxShadow: "0 0 6px 1px rgba(180,220,255,0.9)",
            animationDelay: `${st.d}s`,
            animationDuration: "2.6s",
          }}
        />
      ))}

      {/* Slow comet streak, reusing the existing keyframe */}
      <span
        className="absolute"
        style={{
          left: "-30%",
          top: "18%",
          width: "50%",
          height: "1.5px",
          background: "linear-gradient(90deg, transparent, rgba(160,220,255,0.85))",
          transform: "rotate(28deg)",
          animation: "raffles-comet 7s linear infinite",
        }}
      />
    </div>
  );
}