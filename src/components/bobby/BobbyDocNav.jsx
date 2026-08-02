import React, { useState, useEffect } from "react";

// BobbyDocNav — a unique, minimal in-canvas document navigator.
//   • Right-edge numbered rail with scroll-spy active state; labels slide open on
//     hover so the canvas stays clean but every section is one click away.
//   • Top scroll-progress bar so the operator always knows where they are.
//   • Desktop only (md+) — on phones the sidebar TOC remains the navigator, so the
//     canvas never gets crowded.
// It mounts inside BobbyPaperView and observes the paper's own scroll container,
// so smooth-scroll + active highlighting track the section actually in view.
export default function BobbyDocNav({ sections, containerRef }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = containerRef?.current;
    if (!root || !sections?.length) return;
    const els = sections.map((_, i) => root.querySelector(`#sec-${i}`)).filter(Boolean);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const idx = els.indexOf(visible.target);
          if (idx >= 0) setActive(idx);
        }
      },
      { root, rootMargin: "-15% 0px -75% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));

    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight;
      setProgress(max > 0 ? Math.min(1, root.scrollTop / max) : 0);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      root.removeEventListener("scroll", onScroll);
    };
  }, [sections, containerRef]);

  const go = (i) => {
    const root = containerRef?.current;
    const el = root?.querySelector(`#sec-${i}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!sections?.length) return null;

  return (
    <>
      {/* Top scroll-progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#D4AF37]/10 z-20 pointer-events-none">
        <div className="h-full bg-[#D4AF37] transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Right-edge section rail — hover-reveal labels, scroll-spy dots */}
      <nav className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 flex-col items-end gap-2 max-h-[70vh]">
        {sections.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            className="group flex items-center gap-2"
            aria-label={`Go to section ${i + 1}: ${s.heading}`}
          >
            <span
              className={`text-[10px] font-mono transition-all duration-200 overflow-hidden whitespace-nowrap max-w-0 group-hover:max-w-[11rem] ${
                active === i ? "text-[#D4AF37]" : "text-white/40 group-hover:text-white/70"
              }`}
            >
              {s.heading}
            </span>
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                active === i ? "bg-[#D4AF37] scale-125" : "bg-white/25 group-hover:bg-white/50"
              }`}
            />
          </button>
        ))}
      </nav>
    </>
  );
}