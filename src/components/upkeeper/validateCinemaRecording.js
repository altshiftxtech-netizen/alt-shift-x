export default async function validateCinemaRecording(blob,width,height){
  if(!blob.size)throw new Error('The encoder returned an empty recording.');const url=URL.createObjectURL(blob),video=document.createElement('video');
  try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Recorded video validation timed out.')),8000);video.onloadedmetadata=()=>{clearTimeout(timer);resolve();};video.onerror=()=>{clearTimeout(timer);reject(new Error('The recorded video could not be decoded.'));};video.src=url;});
    if(video.videoWidth!==width||video.videoHeight!==height)throw new Error('This encoder cannot produce the selected resolution. Choose a smaller size.');
  }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
}