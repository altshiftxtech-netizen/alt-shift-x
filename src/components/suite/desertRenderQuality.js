export default function desertRenderQuality(host, renderer, composer, antialias, contactShadows) {
  const maximum = host.clientWidth < 1100 ? 1 : 1.25;
  let scale = maximum, width = 0, height = 0, seconds = 0, frames = 0;
  const resize = () => {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    if (rect.width === width && rect.height === height && renderer.getPixelRatio() === scale) return;
    width = rect.width; height = rect.height;
    renderer.setPixelRatio(scale); renderer.setSize(width, height);
    composer.setPixelRatio(scale); composer.setSize(width, height);
    // Ambient contact shading does not need full-resolution render targets.
    contactShadows?.setSize(Math.ceil(width * scale * .5), Math.ceil(height * scale * .5));
    antialias.uniforms.resolution.value.set(1 / (width * scale), 1 / (height * scale));
  };
  return {
    resize,
    sample(dt) {
      if (dt > 3) return;
      seconds += dt; frames++;
      if (seconds < 2 || frames < 8) return;
      const frameTime = seconds / frames;
      let next = scale;
      if (frameTime > .035) {
        next = Math.max(.85, scale - .15);
        if (contactShadows) contactShadows.enabled = false;
      } else if (frameTime < .018) next = Math.min(maximum, scale + .1);
      if (Math.abs(next - scale) > .01) { scale = next; resize(); }
      seconds = 0; frames = 0;
    },
  };
}