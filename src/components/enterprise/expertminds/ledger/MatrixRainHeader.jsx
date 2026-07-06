import React, { useEffect, useRef } from "react";

const GOLD = "#C8A95B";

/**
 * MatrixRainHeader — a subtle "matrix" bit-rain canvas behind the Master Ledger
 * header, signifying active forensic bit-stamping. Forensic Noir palette:
 * deep-black base, faint gold/amber glyph streams.
 */
export default function MatrixRainHeader({ children }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const glyphs = "01ABCDEF#$█▓░".split("");
    let cols = 0;
    let drops = [];
    const fontSize = 13;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -20);
    };
    resize();

    const draw = () => {
      ctx.fillStyle = "rgba(8,7,5,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        // Leading glyph brighter gold, trail faint.
        ctx.fillStyle = Math.random() > 0.975 ? "rgba(244,227,176,0.9)" : "rgba(200,169,91,0.35)";
        ctx.fillText(ch, x, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-t-2xl border-b"
      style={{ borderColor: `${GOLD}44`, background: "#08070560" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(8,7,5,0.2), rgba(8,7,5,0.75))" }}
      />
      <div className="relative z-10 p-5">{children}</div>
    </div>
  );
}