import React from "react";
import { ROOM_WALLPAPERS } from "@/components/speakeasy/speakeasyAssets";

/**
 * Fixed, full-bleed room wallpaper background for the Speakeasy rooms.
 * Pass `room` = "hallway" | "bathroom" | "proxy_room". A configurable dark
 * overlay keeps foreground content readable over the textured wall.
 */
export default function RoomWallpaper({ room = "proxy_room", overlay = "dark" }) {
  const url = ROOM_WALLPAPERS[room];
  if (!url) return null;

  const overlayClass =
    overlay === "light"
      ? "bg-black/20"
      : overlay === "heavy"
      ? "bg-black/70"
      : "bg-black/55";

  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${url})` }}
      />
      <div className={`fixed inset-0 z-0 pointer-events-none ${overlayClass}`} />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/50" />
    </>
  );
}