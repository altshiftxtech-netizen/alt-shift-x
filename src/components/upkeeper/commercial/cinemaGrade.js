const pipelines = new WeakMap();
const vertex = `attribute vec2 point; varying vec2 uv;
void main(){uv=point*.5+.5;gl_Position=vec4(point,0.,1.);}`;
const fragment = `precision mediump float; varying vec2 uv; uniform sampler2D plate; uniform vec2 size;
vec3 samplePlate(vec2 at){return pow(texture2D(plate,at).rgb,vec3(2.2));}
void main(){
 vec3 light=samplePlate(uv);
 vec3 flare=vec3(0.);
 for(int i=-3;i<=3;i++){
  vec3 tap=samplePlate(uv+vec2(float(i)*.015,0.));
  flare+=max(tap-vec3(.58),0.) / (1.+abs(float(i)));
 }
 light=mix(light,samplePlate(uv-vec2(1.2,.55)/size),.12)+vec3(.07,.22,.36)*max(flare.b,flare.g);
 light*=1.08;
 vec3 graded=clamp((light*(2.51*light+.03))/(light*(2.43*light+.59)+.14),0.,1.);
 gl_FragColor=vec4(max(vec3(.0235,.0314,.051),pow(graded,vec3(1./2.2))),1.);
}`;

function init() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) return null;
  const program = gl.createProgram();
  const shading = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision ? fragment.replace('mediump', 'highp') : fragment;
  for (const [type, code] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, shading]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    gl.attachShader(program, shader); gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const mesh = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, mesh);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const point=gl.getAttribLocation(program,'point'); gl.enableVertexAttribArray(point); gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  for (const attr of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D,attr,gl.CLAMP_TO_EDGE);
  for (const attr of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D,attr,gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  return { gl, canvas, size: gl.getUniformLocation(program,'size'), max: gl.getParameter(gl.MAX_TEXTURE_SIZE) };
}

export function releaseCinemaGrade(source) {
  const pipeline = pipelines.get(source);
  pipeline?.gl.getExtension('WEBGL_lose_context')?.loseContext();
  pipelines.delete(source);
}

export default function cinemaGrade(ctx) {
  const source = ctx.canvas;
  if (!pipelines.has(source)) pipelines.set(source, init());
  const pipeline = pipelines.get(source);
  if (!pipeline || pipeline.gl.isContextLost()) return;
  const { gl, canvas, size, max } = pipeline;
  const { width, height } = source;
  if (Math.max(width,height) > max) return;
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  gl.viewport(0,0,width,height);
  gl.uniform2f(size,width,height);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(canvas,0,0); ctx.restore();
}