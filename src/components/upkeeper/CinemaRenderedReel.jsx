import React,{useEffect,useState} from 'react';
export default function CinemaRenderedReel({blob}){
  const [url,setUrl]=useState('');
  useEffect(()=>{const value=URL.createObjectURL(blob);setUrl(value);return()=>URL.revokeObjectURL(value);},[blob]);
  return <video controls playsInline aria-label="Rendered dynamic reel" className="creative-reel" src={url}/>;
}