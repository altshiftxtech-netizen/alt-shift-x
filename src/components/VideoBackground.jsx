import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const VIDEO_URL = "https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/25faf87b5_make_it_longer_too_and_a_seem.mp4";

// Loop only the clean first half — cut before the disruption around the 5s mark
const LOOP_START = 0.5;
const LOOP_END_OFFSET = 5.5; // will be subtracted from duration to get loop-back point

// We store the calculated end time after metadata loads
let loopEndTime = null;

export default function VideoBackground() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleLoaded = () => {
      loopEndTime = v.duration - LOOP_END_OFFSET;
      v.currentTime = LOOP_START;
      v.play().catch(() => setPlaying(false));
    };

    const handleTimeUpdate = () => {
      if (loopEndTime && v.currentTime >= loopEndTime) {
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