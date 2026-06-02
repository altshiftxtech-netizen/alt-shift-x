import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const VIDEO_URL = "https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/0127d6547_no_make_the_videos.mp4";

// Clip: skip the first 1.5s to get a cleaner loop entry
const LOOP_START = 1.5;

export default function VideoBackground() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleLoaded = () => {
      v.currentTime = LOOP_START;
      v.play().catch(() => setPlaying(false));
    };

    // Only reset near the very end (avoids per-frame seek stalls that make
    // overlaid blurred content flicker). Native-style seamless loop.
    const handleEnded = () => {
      v.currentTime = LOOP_START;
      v.play().catch(() => {});
    };

    v.addEventListener("loadedmetadata", handleLoaded);
    v.addEventListener("ended", handleEnded);
    return () => {
      v.removeEventListener("loadedmetadata", handleLoaded);
      v.removeEventListener("ended", handleEnded);
    };
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
        className="fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
        style={{ objectPosition: "center 35%" }}
        src={VIDEO_URL}
        autoPlay
        muted
        playsInline
      />
      {/* Dark overlay so content stays readable */}
      <div className="fixed inset-0 bg-black/55 z-0 pointer-events-none" />

      {/* Floating play/pause button — center of screen, only visible when paused or on hover */}
      <button
        onClick={toggle}
        title={playing ? "Pause background video" : "Play background video"}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-lg ${playing ? "opacity-30 hover:opacity-100" : "opacity-100"}`}
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {playing ? "Pause" : "Play"}
      </button>
    </>
  );
}