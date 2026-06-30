import React from "react";
import { MARBLE_TEXTURE, SPEAKEASY_WALLPAPER } from "@/components/speakeasy/speakeasyAssets";

/**
 * A 3D-perspective marble Powder Room shell, matching the bathroom draft:
 * a papered back wall straight ahead, marble side walls receding inward, a
 * polished marble floor, a framed mirror on the left wall and a vanity counter.
 * Foreground UI (greeting, notice board, keeper notebook) renders over it.
 */
export default function MarblePowderRoom({ children }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: "1200px", perspectiveOrigin: "50% 40%" }}>
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {/* BACK WALL — wallpaper panels above marble wainscot */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "640px", height: "460px",
            transform: "translate(-50%, -56%) translateZ(-580px)",
            backgroundImage: `url(${SPEAKEASY_WALLPAPER})`,
            backgroundSize: "cover", backgroundPosition: "center",
            boxShadow: "inset 0 0 100px rgba(0,0,0,0.35), 0 0 50px rgba(212,175,55,0.12)",
          }}
        />

        {/* LEFT WALL — marble, holds the mirror */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "620px", height: "460px",
            transformOrigin: "left center",
            transform: "translate(0, -56%) translateX(-320px) rotateY(72deg)",
            backgroundImage: `url(${MARBLE_TEXTURE})`,
            backgroundSize: "cover", filter: "brightness(0.92)",
            boxShadow: "inset 0 0 120px rgba(0,0,0,0.28)",
          }}
        >
          {/* Oval mirror */}
          <div
            className="absolute"
            style={{
              left: "30%", top: "26%", width: "180px", height: "230px",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 40% 30%, #e9eef3, #aeb8c2 70%, #8b95a0)",
              border: "8px solid #c9a14a",
              boxShadow: "0 10px 40px rgba(0,0,0,0.35), inset 0 0 30px rgba(255,255,255,0.5)",
            }}
          />
        </div>

        {/* RIGHT WALL — marble */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "620px", height: "460px",
            transformOrigin: "right center",
            transform: "translate(-100%, -56%) translateX(320px) rotateY(-72deg)",
            backgroundImage: `url(${MARBLE_TEXTURE})`,
            backgroundSize: "cover", filter: "brightness(0.86)",
            boxShadow: "inset 0 0 120px rgba(0,0,0,0.32)",
          }}
        />

        {/* FLOOR — polished marble */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "640px", height: "640px",
            transformOrigin: "top center",
            transform: "translate(-50%, 0) translateY(94px) rotateX(74deg)",
            backgroundImage: `url(${MARBLE_TEXTURE})`,
            backgroundSize: "cover", filter: "brightness(1.05)",
            boxShadow: "inset 0 60px 130px rgba(0,0,0,0.28)",
          }}
        />

        {/* CEILING */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "640px", height: "580px",
            transformOrigin: "bottom center",
            transform: "translate(-50%, -100%) translateY(-150px) rotateX(-74deg)",
            background: "linear-gradient(180deg, #efe9df, #d8cfc1)",
            boxShadow: "inset 0 -40px 90px rgba(0,0,0,0.22)",
          }}
        />
      </div>

      <div className="absolute inset-0">{children}</div>
    </div>
  );
}