import React from "react";
import { SPEAKEASY_WALLPAPER } from "@/components/speakeasy/speakeasyAssets";

/**
 * A true 3D-perspective Speakeasy room: a back wall straight ahead, two side
 * walls receding toward it, and a floor. Children render in 3D space on top.
 *
 * Layout matches the hand-drawn perspective draft — doors line the left and
 * right side walls angling toward a vanishing point, with a bar centered on
 * the floor. Built with CSS 3D transforms so Base44 can render it natively.
 */
export default function PerspectiveRoom({ children, wallpaper = SPEAKEASY_WALLPAPER }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ perspective: "1100px", perspectiveOrigin: "50% 42%" }}
    >
      {/* The 3D room shell */}
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {/* BACK WALL — straight ahead, papered */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "640px",
            height: "440px",
            transform: "translate(-50%, -58%) translateZ(-560px)",
            backgroundImage: `url(${wallpaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "inset 0 0 120px rgba(0,0,0,0.65), 0 0 60px rgba(200,169,91,0.12)",
            borderLeft: "2px solid rgba(200,169,91,0.18)",
            borderRight: "2px solid rgba(200,169,91,0.18)",
          }}
        />

        {/* LEFT WALL — angled inward */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "620px",
            height: "440px",
            transformOrigin: "left center",
            transform: "translate(0, -58%) translateX(-320px) rotateY(72deg)",
            backgroundImage: `url(${wallpaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6)",
            boxShadow: "inset 0 0 140px rgba(0,0,0,0.75)",
          }}
        />

        {/* RIGHT WALL — angled inward */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "620px",
            height: "440px",
            transformOrigin: "right center",
            transform: "translate(-100%, -58%) translateX(320px) rotateY(-72deg)",
            backgroundImage: `url(${wallpaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6)",
            boxShadow: "inset 0 0 140px rgba(0,0,0,0.75)",
          }}
        />

        {/* FLOOR — dark herringbone tone tilting away */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "640px",
            height: "620px",
            transformOrigin: "top center",
            transform: "translate(-50%, 0) translateY(82px) rotateX(74deg)",
            background:
              "repeating-linear-gradient(90deg, #1c160f 0px, #1c160f 28px, #221a11 28px, #221a11 56px), radial-gradient(ellipse at 50% 0%, rgba(200,169,91,0.18), transparent 60%)",
            backgroundBlendMode: "overlay",
            boxShadow: "inset 0 60px 120px rgba(0,0,0,0.6)",
          }}
        />

        {/* CEILING — subtle dark cap */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "640px",
            height: "560px",
            transformOrigin: "bottom center",
            transform: "translate(-50%, -100%) translateY(-138px) rotateX(-74deg)",
            background: "linear-gradient(180deg, #0a0810, #120d1a)",
            boxShadow: "inset 0 -40px 100px rgba(0,0,0,0.7)",
          }}
        />
      </div>

      {/* Foreground content sits in flat screen space above the 3D shell */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}