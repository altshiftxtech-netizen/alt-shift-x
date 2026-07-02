import React from "react";

/**
 * The hallway architecture — a deep, receding corridor rendered with CSS
 * perspective: cream side walls angled inward, a warm wood floor pulling the
 * eye forward, a faintly glowing ceiling, and a dark door at the vanishing
 * point. Purely visual; framed gateways and avatars are layered on top by the
 * page. `door` renders the far door as a button when onDoor is provided.
 */
export default function HallwayScene({ children, onDoor }) {
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
          background: "linear-gradient(100deg, #efe9df 0%, #d9d3c8 60%, #b7b1a6 100%)",
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
          background: "linear-gradient(260deg, #efe9df 0%, #d9d3c8 60%, #b7b1a6 100%)",
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

      {/* Far wall + door at the vanishing point */}
      <div className="absolute left-1/2 top-[24%] -translate-x-1/2 flex flex-col items-center" style={{ width: "16%" }}>
        <button
          onClick={onDoor}
          className="group relative w-full focus:outline-none"
          style={{ height: "150px" }}
          aria-label="Enter the far door"
        >
          <img
            src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/cea7604d9_generated_image.png"
            alt="Ornate carved door"
            className="w-full h-full object-cover rounded-t-sm"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 30px rgba(0,0,0,0.7), 0 0 22px rgba(255,240,205,0.12)",
            }}
          />
          <div className="absolute inset-0 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: "0 0 30px 4px rgba(200,169,91,0.5)" }} />
        </button>
        <p className="mt-1.5 text-[9px] uppercase tracking-[0.2em] text-[#C8A95B]/70 whitespace-nowrap">Powder Room</p>
      </div>

      {/* framed gateways + avatars layered on top */}
      <div className="absolute inset-0 z-20">{children}</div>
    </div>
  );
}