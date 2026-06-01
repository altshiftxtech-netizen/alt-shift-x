import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const VIDEO_URL = "https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/a2ed8f4c7_Altshiftx.mov";

export default function VideoBackground() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.play();
      setPlaying(true);
    }
  };

  return (
    <>
      {/* Background video */}
      <video
        ref={videoRef}
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Dark overlay so content stays readable */}
      <div className="fixed inset-0 bg-black/55 z-0 pointer-events-none" />

      {/* Floating play/pause button — top right */}
      <button
        onClick={toggle}
        title={playing ? "Pause background video" : "Play background video"}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all shadow-lg"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {playing ? "Pause" : "Play"}
      </button>
    </>
  );
}