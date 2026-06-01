import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const VIDEO_URL = "https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/0127d6547_no_make_the_videos.mp4";

// Clip: skip the first 1.5s and last 1s to get a cleaner loop
const LOOP_START = 1.5;
const LOOP_END_OFFSET = 1.0; // seconds before end to jump back

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

    const handleTimeUpdate = () => {
      if (v.duration && v.currentTime >= v.duration - LOOP_END_OFFSET) {
        v.currentTime = LOOP_START;
      }
    };

    v.addEventListener("loadedmetadata", handleLoaded);
    v.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      v.removeEventListener("loadedmetadata", handleLoaded);
      v.removeEventListener("timeupdate", handleTimeUpdate);
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
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
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