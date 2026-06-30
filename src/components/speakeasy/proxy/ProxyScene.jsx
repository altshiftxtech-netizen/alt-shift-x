import React from "react";
import { SPEAKEASY_WALLPAPER } from "@/components/speakeasy/speakeasyAssets";

/**
 * ProxyScene — the perspective "hallway → front room" stage from the design
 * skeleton. Renders a 3D-tilted scene with a full-bleed wallpaper panel, dark
 * trim band and lower plinth zone. Interactive elements (doors, avatars,
 * fixtures) are layered on top via `children` in screen space so they stay
 * crisp and clickable.
 */
export default function ProxyScene({ children }) {
  return (
    <section
      aria-label="Speakeasy scene"
      className="relative rounded-[18px] overflow-hidden min-h-[560px] h-full border border-white/10"
      style={{
        background:
          "linear-gradient(180deg, rgba(216,180,106,.12), rgba(0,0,0,0) 35%), radial-gradient(900px 500px at 55% 15%, rgba(216,180,106,.10), rgba(0,0,0,0) 60%), rgba(17,17,23,.35)",
      }}
    >
      {/* Perspective stage */}
      <div
        className="absolute inset-0 flex items-stretch justify-center p-[18px]"
        style={{ perspective: "1100px", transformStyle: "preserve-3d" }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: "translateZ(0) rotateX(14deg) rotateY(-8deg) scale(1.05)",
            transformOrigin: "center bottom",
            filter: "saturate(1.05) contrast(1.05)",
          }}
        >
          {/* Corridor / ceiling plane */}
          <div
            className="absolute"
            style={{
              left: "-10%",
              right: "-10%",
              top: "5%",
              bottom: "45%",
              transform: "translateZ(25px)",
              opacity: 0.85,
              borderBottom: "1px solid rgba(216,180,106,.12)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,0) 60%), repeating-linear-gradient(to right, rgba(255,255,255,.03) 0px, rgba(255,255,255,.03) 2px, rgba(0,0,0,0) 18px, rgba(0,0,0,0) 26px)",
            }}
          />

          {/* Front room plane — full bleed (no internal inset) */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: "0%",
              right: "0%",
              top: "44%",
              bottom: "14%",
              borderRadius: 0,
              transform: "translateZ(55px)",
              background:
                "linear-gradient(135deg, rgba(216,180,106,.18), rgba(0,0,0,0) 45%), radial-gradient(800px 500px at 40% 0%, rgba(255,255,255,.06), rgba(0,0,0,0) 60%), rgba(10,10,13,.55)",
              border: "1px solid rgba(255,255,255,.08)",
              boxShadow:
                "0 30px 90px rgba(0,0,0,.45), inset 0 0 0 1px rgba(216,180,106,.10)",
            }}
          >
            {/* Wallpaper — full-bleed light panel anchored near top */}
            <div
              aria-hidden="true"
              className="absolute"
              style={{
                top: "6%",
                left: "0%",
                right: "0%",
                bottom: "48%",
                width: "100%",
                borderRadius: 0,
                opacity: 0.9,
                backgroundImage: `url('${SPEAKEASY_WALLPAPER}')`,
                backgroundSize: "170% 170%",
                backgroundPosition: "50% 8%",
                backgroundRepeat: "repeat",
                filter: "contrast(1.03) brightness(.98)",
              }}
            />

            {/* Dark trim / molding band */}
            <div
              aria-hidden="true"
              className="absolute"
              style={{
                left: "0%",
                right: "0%",
                top: "48.5%",
                height: "9%",
                borderRadius: 0,
                transform: "translateZ(60px)",
                background:
                  "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.55))",
                borderTop: "1px solid rgba(255,255,255,.08)",
                borderBottom: "1px solid rgba(0,0,0,.55)",
              }}
            />

            {/* Lower darker wall zone */}
            <div
              aria-hidden="true"
              className="absolute"
              style={{
                left: "0%",
                right: "0%",
                top: "57%",
                bottom: "10%",
                width: "100%",
                borderRadius: 0,
                transform: "translateZ(55px)",
                background:
                  "linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.30) 55%, rgba(0,0,0,.45)), radial-gradient(600px 220px at 35% 20%, rgba(216,180,106,.10), rgba(0,0,0,0) 60%)",
              }}
            />
          </div>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: "translateZ(110px)",
              background:
                "radial-gradient(800px 420px at 55% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 60%, rgba(0,0,0,.6) 100%)",
            }}
          />
        </div>
      </div>

      {/* Interactive overlay — screen space, crisp & clickable */}
      <div className="absolute inset-0">{children}</div>
    </section>
  );
}