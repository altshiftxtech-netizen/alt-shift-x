import {buildEmblemSvg} from '@/components/upkeeper/emblemSvg';
export async function rasterizeEmblem(settings,{width=512,height=width,scale=1,mode='vector'}={}) {
  const pixelWidth=Math.round(width*scale),pixelHeight=Math.round(height*scale),side=Math.min(width,height);
  if(pixelWidth<=32&&pixelHeight<=32)mode='favicon';
  const svg=buildEmblemSvg(settings,mode).replace('width="512" height="512"',`width="${Math.round(side*scale)}" height="${Math.round(side*scale)}"`);
  const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();
  const canvas=document.createElement('canvas');canvas.width=pixelWidth;canvas.height=pixelHeight;
  try {
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas rendering is unavailable.');
    ctx.imageSmoothingEnabled=mode!=='favicon';ctx.imageSmoothingQuality='high';ctx.scale(scale,scale);
    ctx.drawImage(image,(width-side)/2,(height-side)/2,side,side);
    return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed. Choose a smaller size.')),'image/png'));
  }finally{canvas.width=canvas.height=1;}
}