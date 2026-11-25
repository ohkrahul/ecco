const NS = 'http://www.w3.org/2000/svg';
const PRINT = '<ellipse cx="7" cy="0" rx="10" ry="5"/><ellipse cx="-9.5" cy="0" rx="5.5" ry="4.3"/>';

/**
 * Lays `count` alternating left/right footprints along `path` (SVG user units) into `group`.
 * Returns [{ el, t }] where t (0..1) is the print's position along the path.
 */
export function placeFootprints(path, group, count, { from = 0.03, to = 0.97, stride = 11 } = {}) {
  const length = path.getTotalLength();
  return Array.from({ length: count }, (_, i) => {
    const t = from + (to - from) * (i / Math.max(1, count - 1));
    const at = t * length;
    const p = path.getPointAtLength(at);
    const q = path.getPointAtLength(Math.min(length, at + 2));
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    const side = i % 2 ? 1 : -1;
    const x = p.x - Math.sin(angle) * stride * side;
    const y = p.y + Math.cos(angle) * stride * side;
    const el = document.createElementNS(NS, 'g');
    el.setAttribute('class', 'fp');
    el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((angle * 180) / Math.PI).toFixed(1)})`);
    el.innerHTML = PRINT;
    group.appendChild(el);
    return { el, t };
  });
}
