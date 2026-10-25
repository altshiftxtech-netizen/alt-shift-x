export const vertexShader = `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
export const fragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float pulse;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p) {
 vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.0),f.x),f.y);
}
float clouds(vec2 p) { return noise(p)*.57+noise(p*2.03)*.28+noise(p*4.01)*.15; }
vec3 stars(vec2 uv, float scale) {
 vec2 p=uv*scale, cell=floor(p), f=fract(p)-.5;
 float seed=hash(cell), star=pow(max(0.0,1.0-length(f)*18.0),5.0);
 return mix(vec3(.27,.55,.9),vec3(.85,.72,1.),seed)*star*step(.975,seed)*(1.0+.18*sin(time*.4+seed*80.));
}
void main() {
 vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
 vec2 center=vec2(pointer.x*.035, -.035+pointer.y*.025);
 vec2 p=uv-center;
 float tilt=-.16+pointer.x*.045;
 p=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*p;
 float r=length(p), horizon=.155;
 vec2 lens=uv+p*.026/max(r*r,.025);
 float neb=pow(clouds(lens*3.+vec2(time*.008,0.)),3.0);
 vec3 col=vec3(.003,.004,.013)+neb*mix(vec3(.035,.014,.09),vec3(.01,.065,.11),smoothstep(-.6,.6,p.x));
 col+=stars(lens,85.)+stars(lens+vec2(.31,.17),150.)*.55;
 float diskR=length(vec2(p.x,p.y/(.22+pointer.y*.035)));
 float a=atan(p.y/(.22+pointer.y*.035),p.x);
 float texture=clouds(vec2(diskR*42.-time*.8,a*7.+time*.38));
 float bands=.5+.5*sin(diskR*230.-time*1.4+texture*8.);
 float disk=smoothstep(.16,.205,diskR)*exp(-max(0.,diskR-.20)*6.5);
 float filament=pow(bands,5.)*.65+texture*.65;
 vec3 cyan=vec3(.10,.70,1.0), violet=vec3(.49,.16,1.0), amber=vec3(1.0,.54,.16);
 vec3 diskColor=mix(violet,cyan,smoothstep(-.4,.4,p.x));
 diskColor=mix(amber,diskColor,smoothstep(.19,.42,diskR));
 float doppler=.7+.65*(1.-smoothstep(-.5,.5,p.x));
 col+=diskColor*disk*filament*doppler*1.55;
 // Lensed far side of the accretion disk, wrapping above the event horizon.
 float arcR=length(vec2(p.x,p.y*.88));
 float arc=exp(-pow((arcR-.179)/.014,2.0))*smoothstep(-.04,.09,p.y);
 col+=mix(amber,cyan,smoothstep(-.2,.25,p.x))*arc*(.6+.3*noise(vec2(a*35.+time*.5,r*80.)));
 float glow=exp(-abs(r-.16)*27.);
 col+=mix(violet,cyan,smoothstep(-.15,.25,p.x))*glow*.14;
 float photon=exp(-pow((r-.158)/.0035,2.0));
 col+=mix(vec3(1.,.75,.43),vec3(.53,.85,1.),smoothstep(-.2,.2,p.x))*photon*1.45;
 float shadow=1.-smoothstep(horizon-.006,horizon+.001,r);
 col=mix(col,vec3(.0003,.0005,.002),shadow);
 float wave=exp(-pow((r-(.17+pulse*.52))/.018,2.0))*sin(pulse*3.14159);
 col+=mix(violet,cyan,.55)*wave*.28;
 col*=1.-smoothstep(.5,1.15,length(uv))*.65;
 col=vec3(1.)-exp(-col*1.25);
 gl_FragColor=vec4(pow(col,vec3(.94)),1.0);
}
`;