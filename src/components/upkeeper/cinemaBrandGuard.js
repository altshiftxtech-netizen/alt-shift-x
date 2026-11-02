export const cinemaNegatives='no watermarks, no distorted text, no raster blur';
export function cinemaBrandAnchor(prompt='') {
  return /\btgf\b/i.test(prompt)?{name:'TGF',color:'#00A8FF',material:'liquid chrome',typography:'bold italic condensed athletic sans-serif'}:null;
}
export function guardCinemaDirective(directive,prompt) {
  const brand=cinemaBrandAnchor(prompt),base=directive.split('\n\nREQUIRED GUARDS:')[0];
  return `${base}\n\nREQUIRED GUARDS: ${brand?`${brand.name} brand anchor: enforce ${brand.color} cyan, ${brand.material}, ${brand.typography}. Preserve the exact brand spelling. These rules override conflicting visual styling. `:''}NEGATIVE FILTERS: ${cinemaNegatives}. Do not add any lettering inside generated images; typeset exact, crisp brand text in the compositor.`;
}