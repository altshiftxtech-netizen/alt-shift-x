import React, { useEffect, useRef } from "react";

const VIDEO_URL = "https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/38c5a3f1e_give_me_a_video_with_the_last.mp4";

// Muted, seamless, perfectly looping background video for the Speakeasy pages.
// Glass overlay matches the homepage treatment.
export default function SpeakeasyVideoBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handleLoaded = () => v.play().catch(() => {});
    v.addEventListener("loadedmetadata", handleLoaded);
    return () => v.removeEventListener("loadedmetadata", handleLoaded);
  }, []);

  return (
    <>
      {/* Background video — muted, native loop for seamless playback */}
      <video
        ref={videoRef}
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Glass overlay — dark tint + blur, matching the homepage */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60" />
    </>
  );
}