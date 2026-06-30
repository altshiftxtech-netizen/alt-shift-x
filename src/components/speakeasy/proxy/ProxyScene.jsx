import React from "react";
import { SPEAKEASY_WALLPAPER } from "@/components/speakeasy/speakeasyAssets";

const GOLD = "#E6C878";
const LAMP = "#FFE6A6";

/**
 * ProxyScene — a wide 3D speakeasy lounge modelled on the reference layout:
 * a tall papered back wall with crown molding + dado rail, a central lit bar
 * with an arched bottle shelf, recessed doorways flanking it, angled side
 * walls with glowing sconces, and a herringbone wood floor receding to the
 * viewer. Brighter, warmer palette than a true noir room.
 *
 * Interactive elements (door hotspots, avatars, fixtures) are layered on top
 * via `children` in screen space so they stay crisp and clickable.
 */
export default function ProxyScene({ children }) {
  return (
    <section
      aria-label="Speakeasy lounge"
      className="relative overflow-hidden min-h-[560px] h-full border border-white/10"
      style={{ background: "#2a2018" }}
    >
      {/* 3D stage */}
      <div
        className="absolute inset-0"
        style={{ perspective: "1300px", perspectiveOrigin: "50% 46%" }}
      >
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* ── CEILING ── */}
          <div
            className="absolute"
            style={{
              left: "-25%", right: "-25%", top: "0%", height: "40%",
              transformOrigin: "top center",
              transform: "rotateX(-66deg) translateZ(-40px)",
              background: "linear-gradient(180deg, #1f1812, #322619)",
            }}
          >
            {/* recessed ceiling downlights */}
            {[20, 38, 50, 62, 80].map((l) => (
              <span key={l} className="absolute top-[58%] h-1.5 w-1.5 rounded-full"
                style={{ left: `${l}%`, background: LAMP, boxShadow: `0 0 16px 4px ${LAMP}aa` }} />
            ))}
          </div>

          {/* ── FLOOR — herringbone wood ── */}
          <div
            className="absolute"
            style={{
              left: "-25%", right: "-25%", bottom: "0%", height: "52%",
              transformOrigin: "bottom center",
              transform: "rotateX(70deg) translateZ(-40px)",
              backgroundColor: "#6b4a2b",
              backgroundImage:
                "repeating-linear-gradient(45deg, #7a5631 0px, #7a5631 14px, #5e3f24 14px, #5e3f24 28px), repeating-linear-gradient(-45deg, rgba(255,220,160,.10) 0px, rgba(255,220,160,.10) 14px, rgba(0,0,0,.12) 14px, rgba(0,0,0,.12) 28px)",
              boxShadow: "0 0 240px rgba(0,0,0,.55) inset",
            }}
          >
            {/* warm reflective glow toward the bar */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2"
              style={{ width: "50%", height: "70%", background: `radial-gradient(ellipse at 50% 0%, ${LAMP}3d, rgba(0,0,0,0) 70%)` }} />
          </div>

          {/* ── LEFT & RIGHT WALLS ── */}
          <SideWall side="left" />
          <SideWall side="right" />

          {/* ── BACK WALL ── */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: "22%", right: "22%", top: "8%", bottom: "16%",
              transform: "translateZ(-460px)",
              backgroundColor: "#241a12",
            }}
          >
            {/* Wallpaper upper field */}
            <div className="absolute inset-x-0 top-0" style={{
              bottom: "30%",
              backgroundImage: `url('${SPEAKEASY_WALLPAPER}')`,
              backgroundSize: "44% auto",
              backgroundPosition: "center top",
              backgroundRepeat: "repeat",
              opacity: 0.95,
              filter: "brightness(1.25) saturate(1.1)",
            }} />

            {/* Crown molding */}
            <div className="absolute inset-x-0 top-0 h-[7%]"
              style={{ background: "linear-gradient(180deg, #4a3520, #2e2014)", borderBottom: `2px solid ${GOLD}55` }} />

            {/* Dado rail */}
            <div className="absolute inset-x-0" style={{
              top: "62%", height: "3px",
              background: `linear-gradient(180deg, ${GOLD}, rgba(150,115,55,.7))`,
              boxShadow: `0 0 10px ${GOLD}66`,
            }} />
            {/* Wainscot below rail */}
            <div className="absolute inset-x-0 bottom-0" style={{
              top: "62%", background: "linear-gradient(180deg, #2c2015, #1c140c)",
            }} />

            {/* Central bar with arched bottle shelf */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "20%", width: "26%", height: "44%" }}>
              {/* arched back shelf */}
              <div className="absolute inset-x-0 top-0 h-[64%] overflow-hidden"
                style={{
                  borderRadius: "50% 50% 6px 6px / 70% 70% 6px 6px",
                  background: "linear-gradient(180deg, #1a120b, #2a1d12)",
                  border: `1px solid ${GOLD}44`,
                  boxShadow: `inset 0 0 24px ${LAMP}22`,
                }}>
                {/* bottle rows */}
                {[26, 44, 62].map((t) => (
                  <div key={t} className="absolute inset-x-2 flex justify-between" style={{ top: `${t}%` }}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <span key={i} className="w-1.5 rounded-sm"
                        style={{ height: 14, background: `linear-gradient(180deg, ${GOLD}cc, #5a3f1f)`, opacity: 0.85 }} />
                    ))}
                  </div>
                ))}
              </div>
              {/* bar counter */}
              <div className="absolute inset-x-0 bottom-0 h-[30%]"
                style={{ background: "linear-gradient(180deg, #3a2818, #221710)", borderTop: `1px solid ${GOLD}66`, boxShadow: "0 8px 20px rgba(0,0,0,.5)" }} />
              {/* two bar lamps */}
              {[28, 72].map((l) => (
                <div key={l} className="absolute" style={{ left: `${l}%`, top: "52%", transform: "translateX(-50%)" }}>
                  <div className="w-5 h-5 rounded-full" style={{ background: `radial-gradient(circle, ${LAMP}, ${GOLD})`, boxShadow: `0 0 26px 10px ${LAMP}88` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warm key light + edge vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          "radial-gradient(700px 420px at 50% 40%, rgba(255,225,160,.10) 0%, rgba(0,0,0,0) 55%), radial-gradient(1000px 560px at 50% 46%, rgba(0,0,0,0) 0%, rgba(0,0,0,.30) 66%, rgba(0,0,0,.6) 100%)",
      }} />

      {/* Interactive overlay — screen space, crisp & clickable */}
      <div className="absolute inset-0">{children}</div>
    </section>
  );
}

/** Angled side wall with a glowing wall sconce. */
function SideWall({ side }) {
  const isLeft = side === "left";
  return (
    <div
      className="absolute overflow-hidden"
      style={{
        [isLeft ? "left" : "right"]: "0%",
        top: "8%", bottom: "16%", width: "34%",
        transformOrigin: isLeft ? "left center" : "right center",
        transform: `rotateY(${isLeft ? "64deg" : "-64deg"})`,
        backgroundColor: "#2c2015",
        backgroundImage: `url('${SPEAKEASY_WALLPAPER}')`,
        backgroundSize: "60% auto",
        backgroundBlendMode: "overlay",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="absolute inset-0" style={{ background: isLeft
        ? "linear-gradient(90deg, rgba(20,14,8,.4), rgba(20,14,8,.85))"
        : "linear-gradient(270deg, rgba(20,14,8,.4), rgba(20,14,8,.85))" }} />
      {/* wainscot strip */}
      <div className="absolute inset-x-0 bottom-0" style={{ top: "62%", background: "linear-gradient(180deg, rgba(40,28,18,.9), rgba(22,16,10,.95))", borderTop: `2px solid ${GOLD}33` }} />
      {/* sconce */}
      <div className="absolute" style={{ [isLeft ? "right" : "left"]: "26%", top: "30%" }}>
        <div className="w-3 h-8 rounded-sm" style={{ background: `linear-gradient(180deg, ${LAMP}, ${GOLD})`, boxShadow: `0 0 34px 12px ${LAMP}77` }} />
      </div>
    </div>
  );
}