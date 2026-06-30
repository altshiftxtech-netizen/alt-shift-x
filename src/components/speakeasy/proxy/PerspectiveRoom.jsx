import React from "react";
import { SPEAKEASY_WALLPAPER } from "@/components/speakeasy/speakeasyAssets";

// Warm parquet floor that matches the wallpaper's gold/plum palette.
const FLOOR_TEXTURE = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/24b2679a9_generated_image.png";

/**
 * A true 3D-perspective Speakeasy room rendered as a continuous box: back wall
 * straight ahead, two side walls receding to meet it at the same seam, a warm
 * floor and a dark ceiling. All four wall planes share the SAME wallpaper at the
 * SAME scale so the lattice pattern reads as one unbroken room (the previous
 * version mismatched the pattern between panels).
 *
 * Children render in flat screen-space on top so UI stays crisp and clickable.
 */
export default function PerspectiveRoom({ children, wallpaper = SPEAKEASY_WALLPAPER, floor = FLOOR_TEXTURE }) {
  // Shared geometry so the three walls meet cleanly at the corners.
  const WALL_H = 460;
  const BACK_W = 600;
  const SIDE_W = 560;
  const DEPTH = 540;

  const wallPaper = {
    backgroundImage: `url(${wallpaper})`,
    backgroundSize: `${BACK_W}px ${WALL_H}px`,
    backgroundRepeat: "no-repeat",
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-2xl"
      style={{ perspective: "1300px", perspectiveOrigin: "50% 44%" }}
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {/* BACK WALL — papered, dead ahead */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${BACK_W}px`,
            height: `${WALL_H}px`,
            transform: `translate(-50%, -54%) translateZ(-${DEPTH}px)`,
            ...wallPaper,
            backgroundPosition: "center",
            boxShadow: "inset 0 0 90px rgba(0,0,0,0.5), 0 0 70px rgba(200,169,91,0.14)",
          }}
        />

        {/* LEFT WALL — angled in toward the back-wall left edge */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${SIDE_W}px`,
            height: `${WALL_H}px`,
            transformOrigin: "left center",
            transform: `translate(-50%, -54%) translateX(-${BACK_W / 2}px) translateZ(-${DEPTH}px) rotateY(64deg)`,
            ...wallPaper,
            backgroundPosition: "left center",
            filter: "brightness(0.74)",
            boxShadow: "inset -60px 0 110px rgba(0,0,0,0.55)",
          }}
        />

        {/* RIGHT WALL — mirror of the left */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${SIDE_W}px`,
            height: `${WALL_H}px`,
            transformOrigin: "right center",
            transform: `translate(-50%, -54%) translateX(${BACK_W / 2}px) translateZ(-${DEPTH}px) rotateY(-64deg)`,
            ...wallPaper,
            backgroundPosition: "right center",
            filter: "brightness(0.74)",
            boxShadow: "inset 60px 0 110px rgba(0,0,0,0.55)",
          }}
        />

        {/* FLOOR — warm parquet tilting away from the viewer */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${BACK_W}px`,
            height: `${DEPTH + 160}px`,
            transformOrigin: "top center",
            transform: `translate(-50%, ${WALL_H * 0.46}px) translateZ(-${DEPTH}px) rotateX(80deg)`,
            backgroundImage: `url(${floor})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.5) sepia(0.4) hue-rotate(-12deg)",
            boxShadow: "inset 0 80px 140px rgba(0,0,0,0.7)",
          }}
        />

        {/* CEILING — dark cap */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${BACK_W}px`,
            height: `${DEPTH + 120}px`,
            transformOrigin: "bottom center",
            transform: `translate(-50%, -${WALL_H * 0.54}px) translateZ(-${DEPTH}px) rotateX(-80deg)`,
            background: "linear-gradient(180deg, #0a0810, #150f1e)",
            boxShadow: "inset 0 -60px 120px rgba(0,0,0,0.7)",
          }}
        />
      </div>

      {/* Ambient warm glow toward the center, like the draft's lit back wall */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(200,169,91,0.12), transparent 55%)" }}
      />

      {/* Foreground content (doors, bar, avatars) in flat screen space */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}