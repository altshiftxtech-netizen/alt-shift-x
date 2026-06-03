import React from "react";
import { Square } from "lucide-react";

/**
 * StopButton — universal "halt the bot" control. Shows only while a bot is
 * generating. Calls onStop() to freeze the in-flight reply.
 *
 * variant: "dark" (slate chat surfaces like BOB) | "light" (light chat panels)
 */
export default function StopButton({ onStop, variant = "dark", className = "", size = "md" }) {
  const sizes = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const styles =
    variant === "light"
      ? "bg-red-50 hover:bg-red-100 border border-red-200 text-red-600"
      : "bg-red-600 hover:bg-red-700 border border-red-500 text-white";
  return (
    <button
      type="button"
      onClick={onStop}
      title="Stop generating"
      className={`flex items-center gap-1.5 rounded-xl font-semibold transition-colors ${sizes} ${styles} ${className}`}
    >
      <Square className="w-3.5 h-3.5 fill-current" /> Stop
    </button>
  );
}