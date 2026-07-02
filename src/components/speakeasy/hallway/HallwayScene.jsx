import React from "react";

/**
 * The hallway architecture — a deep, receding corridor rendered with CSS
 * perspective: cream side walls angled inward, a warm wood floor pulling the
 * eye forward, a faintly glowing ceiling, and a dark door at the vanishing
 * point. Purely visual; framed gateways and avatars are layered on top by the
 * page. `door` renders the far door as a button when onDoor is provided.
 */
export default function HallwayScene({ children, onDoor, wallLeft, wallRight }) {
  const leftWall = wallLeft || "linear-gradient(100deg, #efe9df 0%, #d9d3c8 60%, #b7b1a6 100%)";
  const rightWall = wallRight || "linear-gradient(260deg, #efe9df 0%, #d9d3c8 60%, #b7b1a6 100%)";
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl" style={{ perspective: "1100px", background: "#0d0b12" }}>
      {/* Ceiling */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "16%",
          background: "linear-gradient(to top, rgba(240,236,228,0.16), rgba(13,11,18,0.95))",
          transform: "rotateX(52deg)",
          transformOrigin: "top",
        }}
      >
        {/* recessed ceiling lights receding to the door */}
        {[26, 38, 47].map((t, i) => (
          <div
            key={i}
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              top: `${t}%`,
              width: `${10 - i * 2}px`,
              height: `${10 - i * 2}px`,
              background: "radial-gradient(circle, #fff6df, #d8c9a0 60%, transparent)",
              boxShadow: "0 0 14px 3px rgba(255,240,205,0.5)",
            }}
          />
        ))}
      </div>

      {/* Left wall */}
      <div
        className="absolute top-[8%] bottom-[22%] left-0"
        style={{
          width: "34%",
          background: leftWall,
          transform: "rotateY(42deg)",
          transformOrigin: "left center",
          boxShadow: "inset -40px 0 60px rgba(0,0,0,0.25)",
        }}
      />
      {/* Right wall */}
      <div
        className="absolute top-[8%] bottom-[22%] right-0"
        style={{
          width: "34%",
          background: rightWall,
          transform: "rotateY(-42deg)",
          transformOrigin: "right center",
          boxShadow: "inset 40px 0 60px rgba(0,0,0,0.25)",
        }}
      />

      {/* Floor — warm wood, pulling perspective forward */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "30%",
          background: "repeating-linear-gradient(90deg, #b08654 0px, #b08654 2px, #a97e4c 2px, #a97e4c 26px)",
          backgroundColor: "#a97e4c",
          transform: "rotateX(60deg)",
          transformOrigin: "bottom",
          boxShadow: "inset 0 40px 80px rgba(0,0,0,0.4)",
        }}
      />
      {/* floor darkening gradient overlay for depth */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "30%", background: "linear-gradient(to top, transparent, rgba(13,11,18,0.55))", pointerEvents: "none" }} />

      {/* Far wall at the vanishing point — dark recessed panel like the Proxy Room back wall */}
      <div
        className="absolute left-1/2 top-[10%] bottom-[24%] -translate-x-1/2 pointer-events-none"
        style={{
          width: "30%",
          background: "linear-gradient(180deg, #14100a 0%, #0b0805 100%)",
          boxShadow: "inset 0 0 70px rgba(0,0,0,0.75), 0 0 50px rgba(0,0,0,0.6)",
          borderRadius: "6px",
        }}
      >
        {/* warm ambient glow bleeding from the back wall */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 70%, rgba(255,210,150,0.12), transparent 65%)", borderRadius: "6px" }} />
      </div>

      {/* Door at the vanishing point — larger, planted on the floor */}
      <div className="absolute left-1/2 top-[20%] bottom-[26%] -translate-x-1/2 flex flex-col items-center" style={{ width: "20%" }}>
        <button
          onClick={onDoor}
          className="group relative w-full flex-1 focus:outline-none"
          aria-label="Enter the far door"
        >
          <div
            className="relative w-full h-full rounded-t-[10px]"
            style={{
              background: "linear-gradient(180deg, #1c1c1c 0%, #0d0d0d 100%)",
              border: "2px solid #000000",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.7)",
            }}
          >
            {/* recessed matte-black panels */}
            <div className="absolute inset-x-[18%] top-[10%] h-[38%] rounded-sm" style={{ border: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(180deg, #161616, #0a0a0a)" }} />
            <div className="absolute inset-x-[18%] bottom-[10%] h-[38%] rounded-sm" style={{ border: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(180deg, #161616, #0a0a0a)" }} />
            {/* brass handle */}
            <div className="absolute right-[22%] top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #C8A95B, #6b5426)" }} />
          </div>
          {/* warm light spilling from under the door */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-3 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(255,225,160,0.55), transparent 70%)", filter: "blur(3px)" }} />
          <div className="absolute inset-0 rounded-t-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: "0 0 34px 6px rgba(200,169,91,0.6)" }} />
        </button>
        <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[#C8A95B]/80 whitespace-nowrap">Powder Room</p>
      </div>

      {/* framed gateways + avatars layered on top */}
      <div className="absolute inset-0 z-20">{children}</div>
    </div>
  );
}