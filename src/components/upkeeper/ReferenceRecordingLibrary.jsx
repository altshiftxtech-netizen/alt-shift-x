import React from 'react';
import {Button} from '@/components/ui/button';
export const referenceRecordings=[
  {label:'Recording 1 · 38s',url:'https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/e81189c2e_ScreenRecording2026-08-07172325.mp4'},
  {label:'Recording 2 · 47.8s',url:'https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/2707a917c_ScreenRecording2026-08-07172643.mp4'},
  {label:'Recording 3 · 7.4s',url:'https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/83a02b845_ScreenRecording2026-08-07180305.mp4'},
  {label:'Recording 4 · 93.9s',url:'https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/4f1d52535_ScreenRecording2026-08-07181124.mp4'}
];
export default function ReferenceRecordingLibrary({disabled,onSelect}){
  return <div className="space-y-2"><p className="text-sm font-medium">Calibration recordings</p><div className="flex flex-wrap gap-2">{referenceRecordings.map(clip=><Button key={clip.url} type="button" size="sm" variant="outline" disabled={disabled} onClick={()=>onSelect(clip.url)}>{clip.label}</Button>)}</div><p className="text-xs text-muted-foreground">Each recording is measured independently. Applying one keeps its full duration, original colors and uncropped picture; detected cuts are estimates, not frame-exact edits.</p></div>;
}