import { Cpu } from "lucide-react";

// Unique "BOB is thinking" pending indicator — shown from the instant the user
// sends until BOB's reply settles. Distinct animated orbiting dots + pulsing
// core so it's unmistakable that BOB is still working.
export default function BobPendingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <img
        src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/10a720a09_generated_image.png"
        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
        alt="BOB"
      />
      <div className="bg-slate-800/90 border border-violet-700/40 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
        {/* Pulsing core with orbiting ring */}
        <span className="relative flex items-center justify-center w-5 h-5">
          <span className="absolute inset-0 rounded-full border-2 border-violet-500/40 border-t-violet-400 animate-spin" />
          <Cpu className="w-3 h-3 text-violet-300 animate-pulse" />
        </span>
        <span className="text-xs font-semibold text-violet-200">
          BOB is thinking
        </span>
        {/* Wave dots */}
        <span className="flex gap-1">
          {[0, 200, 400].map((d) => (
            <span
              key={d}
              className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}