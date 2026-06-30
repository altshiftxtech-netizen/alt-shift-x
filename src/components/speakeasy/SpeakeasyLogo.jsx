import React from "react";
import { SPEAKEASY_LOGO } from "@/components/speakeasy/speakeasyAssets";

/**
 * The SpeakeasySocial keyhole "Neural Keymark" logo.
 * Use across Speakeasy pages for consistent branding.
 * Pass `withWordmark` to show the SPEAKEASYSOCIAL text beside the mark.
 */
export default function SpeakeasyLogo({ size = 40, withWordmark = false, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={SPEAKEASY_LOGO}
        alt="SpeakeasySocial"
        style={{ width: size, height: size }}
        className="object-contain flex-shrink-0 drop-shadow-[0_0_8px_rgba(200,169,91,0.25)]"
      />
      {withWordmark && (
        <div className="leading-none">
          <p
            className="text-white font-bold tracking-[0.18em] text-sm"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            SPEAKEASY<span className="text-[#C8A95B]">SOCIAL</span>
          </p>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#9CA0A8] mt-1">Neural Keymark</p>
        </div>
      )}
    </div>
  );
}