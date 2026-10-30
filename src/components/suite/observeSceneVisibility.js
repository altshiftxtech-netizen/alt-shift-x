export default function observeSceneVisibility(canvas) {
  let visible = false;
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .1;
    canvas.dataset.renderVisibility = visible ? 'visible' : 'offscreen';
  }, { threshold: [0, .1] });
  observer.observe(canvas);
  return {
    get visible() { return visible && !document.hidden; },
    dispose() { observer.disconnect(); },
  };
}