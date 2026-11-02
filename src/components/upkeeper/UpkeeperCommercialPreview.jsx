import React,{useEffect,useRef,useState} from 'react';
import UpkeeperKineticTextLayer from '@/components/upkeeper/UpkeeperKineticTextLayer';
import {cinemaDuration} from '@/components/upkeeper/cinemaSpec';
export default function UpkeeperCommercialPreview({url,campaign,settings}){
  const video=useRef(null),elapsed=useRef(0),[time,setTime]=useState(0);
  useEffect(()=>{let frame,last=performance.now();elapsed.current=0;setTime(0);const tick=now=>{if(video.current&&!video.current.paused&&!video.current.seeking){elapsed.current+=(now-last)/1000;if(elapsed.current>=cinemaDuration(settings)){video.current.pause();elapsed.current=0;}setTime(elapsed.current);}last=now;frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[url,settings]);
  return <div className={settings.aspect==='9:16'?'relative w-full max-w-80 mx-auto overflow-hidden rounded-xl bg-secondary':'relative w-full overflow-hidden rounded-xl bg-secondary'} style={{aspectRatio:settings.aspect==='16:9'?'16 / 9':'9 / 16'}}><video ref={video} src={url} controls loop playsInline aria-label="Commercial vector text preview" className="absolute inset-0 w-full h-full object-cover"/><div className="absolute inset-0 bg-primary/40 pointer-events-none"/><UpkeeperKineticTextLayer time={time} campaign={campaign} settings={settings}/></div>;
}