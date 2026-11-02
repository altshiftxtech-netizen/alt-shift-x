import kineticTextSvg from '@/components/upkeeper/kineticTextSvg';
export default function cinemaMultiplexer(visual,campaign,source,settings){
  const canvas=document.createElement('canvas');canvas.width=visual.width;canvas.height=visual.height;const context=canvas.getContext('2d');let closed=false;
  return {canvas,paint:async time=>{if(closed)return;const url=URL.createObjectURL(new Blob([kineticTextSvg(time,campaign,source,settings)],{type:'image/svg+xml'}));try{const image=new Image();image.src=url;await image.decode();if(closed)return;context.drawImage(visual,0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);}finally{URL.revokeObjectURL(url);}},close:()=>{closed=true;canvas.width=canvas.height=1;}};
}