import React,{useRef} from 'react';
export default function CinemaReferencePreview({url}){
  const frame=useRef(null);
  const paint=event=>{const video=event.currentTarget,canvas=frame.current;if(!canvas||video.readyState<2)return;canvas.width=320;canvas.height=Math.max(1,Math.round(320*video.videoHeight/video.videoWidth));canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);};
  return <div className="grid grid-cols-2 gap-3 items-start"><video key={url} src={url} crossOrigin={url.startsWith('blob:')?undefined:'anonymous'} controls muted playsInline preload="metadata" aria-label="Reference clip player" className="w-full max-h-64 rounded-lg border" onLoadedData={paint} onSeeked={paint}/><canvas ref={frame} aria-label="Scrubbed reference canvas frame" className="w-full max-h-64 object-contain rounded-lg border"/></div>;
}