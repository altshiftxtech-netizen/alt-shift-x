import React from "react";
import { SPEAKEASY_WALLPAPER } from "@/components/speakeasy/speakeasyAssets";

const GOLD = "#C8A95B";

/**
 * ProxyScene — a true 3D tall-ceiling room built with CSS 3D transforms.
 * A back wall (papered, with framed pictures + a gold dado rail), two angled
 * side walls, a receding floor and a high ceiling form an actual box you look
 * into. Interactive elements (doors, avatars, fixtures) are layered on top via
 * `children` in screen space so they stay crisp and clickable.
 */
export default function ProxyScene({ children }) {
  return (
    <section
      aria-label="Speakeasy room"
      className="relative overflow-hidden min-h-[560px] h-full border border-white/10"
      style={{ background: "#07050b" }}
    >
      {/* 3D stage */}
      <div
        className="absolute inset-0"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 42%" }}
      >
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d", transform: "translateZ(-40px)" }}
        >
          {/* ── BACK WALL ── */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: "28%",
              right: "28%",
              top: "10%",
              bottom: "22%",
              transform: "translateZ(-420px)",
              transformStyle: "preserve-3d",
              backgroundColor: "#150f1f",
              boxShadow: "0 0 120px rgba(0,0,0,.7) inset",
            }}
          >
            {/* Wallpaper upper field */}
            <div
              className="absolute inset-x-0 top-0"
              style={{
                bottom: "34%",
                backgroundImage: `url('${SPEAKEASY_WALLPAPER}')`,
                backgroundSize: "60% auto",
                backgroundPosition: "center top",
                backgroundRepeat: "repeat",
                opacity: 0.92,
                filter: "brightness(.9) contrast(1.05)",
              }}
            />
            {/* Gold dado rail */}
            <div
              className="absolute inset-x-0"
              style={{
                top: "66%",
                height: "3px",
                background: `linear-gradient(180deg, ${GOLD}, rgba(120,95,40,.6))`,
                boxShadow: `0 0 10px ${GOLD}66`,
              }}
            />
            {/* Dark wainscot below rail */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                top: "66%",
                background: "linear-gradient(180deg, #1c1320, #0d0913)",
              }}
            />
            {/* Framed pictures on the back wall */}
            <Frame style={{ left: "14%", top: "16%", width: "20%", height: "30%" }} hue="#8B6FB8" />
            <Frame style={{ left: "40%", top: "10%", width: "20%", height: "34%" }} hue={GOLD} tall />
            <Frame style={{ left: "66%", top: "16%", width: "20%", height: "30%" }} hue="#e0719c" />
          </div>

          {/* ── LEFT WALL ── */}
          <SideWall side="left" />
          {/* ── RIGHT WALL ── */}
          <SideWall side="right" />

          {/* ── FLOOR ── */}
          <div
            className="absolute"
            style={{
              left: "-20%",
              right: "-20%",
              bottom: "0%",
              height: "60%",
              transformOrigin: "bottom center",
              transform: "rotateX(72deg) translateZ(-60px)",
              background:
                "repeating-linear-gradient(90deg, #120c1a 0px, #120c1a 60px, #1a1226 60px, #1a1226 120px)",
              boxShadow: "0 0 200px rgba(0,0,0,.8) inset",
              opacity: 0.95,
            }}
          />

          {/* ── CEILING ── */}
          <div
            className="absolute"
            style={{
              left: "-20%",
              right: "-20%",
              top: "0%",
              height: "46%",
              transformOrigin: "top center",
              transform: "rotateX(-68deg) translateZ(-60px)",
              background: "linear-gradient(180deg, #0c0814, #160f22)",
              opacity: 0.97,
            }}
          >
            {/* central ceiling glow / chandelier wash */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: "40%",
                height: "55%",
                background: `radial-gradient(ellipse at center, ${GOLD}33, rgba(0,0,0,0) 70%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Ambient depth vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 520px at 50% 42%, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 62%, rgba(0,0,0,.72) 100%)",
        }}
      />

      {/* Interactive overlay — screen space, crisp & clickable */}
      <div className="absolute inset-0">{children}</div>
    </section>
  );
}

/** Angled side wall receding toward the back wall. */
function SideWall({ side }) {
  const isLeft = side === "left";
  return (
    <div
      className="absolute overflow-hidden"
      style={{
        [isLeft ? "left" : "right"]: "0%",
        top: "10%",
        bottom: "22%",
        width: "30%",
        transformOrigin: isLeft ? "left center" : "right center",
        transform: `rotateY(${isLeft ? "62deg" : "-62deg"})`,
        background: isLeft
          ? "linear-gradient(90deg, #1a1226, #0e0a16)"
          : "linear-gradient(270deg, #1a1226, #0e0a16)",
        boxShadow: "0 0 120px rgba(0,0,0,.6) inset",
      }}
    >
      {/* sconce glow */}
      <div
        className="absolute top-[34%] h-2 w-2 rounded-full"
        style={{
          [isLeft ? "right" : "left"]: "22%",
          background: GOLD,
          boxShadow: `0 0 24px 8px ${GOLD}55`,
        }}
      />
    </div>
  );
}

/** A framed picture hung on a wall. */
function Frame({ style, hue = "#C8A95B", tall }) {
  return (
    <div
      className="absolute"
      style={{
        ...style,
        border: `3px solid ${hue}`,
        background: "linear-gradient(160deg, rgba(255,255,255,.06), rgba(0,0,0,.5))",
        boxShadow: `0 6px 18px rgba(0,0,0,.55), 0 0 14px ${hue}44`,
      }}
    >
      <div
        className="absolute inset-[3px]"
        style={{
          background: `radial-gradient(circle at 50% ${tall ? "38%" : "42%"}, ${hue}33, rgba(0,0,0,.6) 70%)`,
        }}
      />
    </div>
  );
}