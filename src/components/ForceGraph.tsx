import { useEffect, useMemo, useRef } from 'react';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
} from 'd3-force';
import { FOLDER_COLOR } from '../content/config';

export type GraphNode = SimulationNodeDatum & {
  id: string;
  title: string;
  folder: string;
  hub: 'center' | boolean;
  deg: number;
};
type GraphLink = { source: string | GraphNode; target: string | GraphNode };

/** Imperative handles the graph attaches to its canvas for toolbar buttons. */
export type GraphCanvas = HTMLCanvasElement & {
  __recenter?: () => void;
  __fit?: (animate: boolean) => void;
  __zoom?: (factor: number) => void;
};

type Props = {
  /** Receives the canvas so a toolbar can call fit / zoom / recenter. */
  canvasRef?: React.MutableRefObject<GraphCanvas | null>;
  nodes: { id: string; title: string; folder: string; hub: 'center' | boolean }[];
  links: { source: string; target: string }[];
  currentId: string | null;
  /** Node click. `at` is viewport coordinates, for anchoring a preview card. */
  onSelect: (id: string, at?: { x: number; y: number }) => void;
  /** Fires when a click lands on empty canvas. */
  onBlank?: () => void;
  variant: 'local' | 'full';
  /** Changing this re-reads CSS colour variables. */
  themeKey?: string;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function ForceGraph({ nodes, links, currentId, onSelect, onBlank, variant, themeKey, canvasRef: outerRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<GraphCanvas | null>(null);
  const canvasRef = outerRef ?? innerRef;
  const full = variant === 'full';

  // Stable simulation datums. Rebuilt only when the graph itself changes.
  const data = useMemo(() => {
    const deg = new Map<string, number>();
    for (const l of links) {
      deg.set(l.source, (deg.get(l.source) ?? 0) + 1);
      deg.set(l.target, (deg.get(l.target) ?? 0) + 1);
    }
    const gnodes: GraphNode[] = nodes.map((n, i) => ({
      ...n,
      deg: deg.get(n.id) ?? 0,
      // deterministic ring seed keeps the opening animation the same every load
      x: Math.cos((i / nodes.length) * Math.PI * 2) * 140,
      y: Math.sin((i / nodes.length) * Math.PI * 2) * 140,
    }));
    const byId = new Map(gnodes.map((n) => [n.id, n]));
    const glinks: GraphLink[] = links
      .filter((l) => byId.has(l.source) && byId.has(l.target))
      .map((l) => ({ source: byId.get(l.source)!, target: byId.get(l.target)! }));
    return { gnodes, glinks, byId };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.map((n) => n.id).join(','), links.map((l) => l.source + l.target).join(',')]);

  const state = useRef({
    k: 1,
    tx: 0,
    ty: 0,
    hover: null as GraphNode | null,
    drag: null as GraphNode | null,
    panning: false,
    down: false,
    px: 0,
    py: 0,
    moved: 0,
    w: 1,
    h: 1,
    dirty: true,
    raf: 0,
    /** Keep the graph framed while it settles; released on first interaction. */
    autofit: true,
    tween: null as { from: { k: number; tx: number; ty: number }; to: { k: number; tx: number; ty: number }; t0: number } | null,
    fitted: false,
  });

  const simRef = useRef<Simulation<GraphNode, undefined> | null>(null);
  const currentRef = useRef(currentId);
  currentRef.current = currentId;
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const blankRef = useRef(onBlank);
  blankRef.current = onBlank;

  const radiusOf = (n: GraphNode) => {
    const base = full ? 4.2 : 4.6;
    const scale = full ? 1.7 : 1.5;
    const r = base + Math.sqrt(n.deg) * scale;
    return n.hub === 'center' ? r * 1.28 : r;
  };

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const s = state.current;
    s.autofit = true;
    s.fitted = false;

    const css = getComputedStyle(document.documentElement);
    const colors = {
      line: css.getPropertyValue('--graph-line').trim() || 'rgba(255,255,255,0.09)',
      accent: css.getPropertyValue('--accent').trim() || '#7f6df2',
      accentHi: css.getPropertyValue('--accent-hover').trim() || '#a394ff',
      text: css.getPropertyValue('--text-muted').trim() || '#9a9a9a',
      textHi: css.getPropertyValue('--text-title').trim() || '#e9e9e9',
      bg: css.getPropertyValue('--bg-primary').trim() || '#1e1e1e',
      fallback: css.getPropertyValue('--graph-node').trim() || '#8a8a8a',
    };

    const sim = forceSimulation(data.gnodes)
      .force(
        'link',
        forceLink<GraphNode, GraphLink>(data.glinks)
          .id((d) => d.id)
          .distance(full ? 112 : 54)
          .strength(full ? 0.32 : 0.55),
      )
      .force('charge', forceManyBody().strength(full ? -520 : -165).distanceMax(full ? 1400 : 400))
      .force('collide', forceCollide<GraphNode>((d) => radiusOf(d) + (full ? 30 : 10)).strength(0.9))
      .force('center', forceCenter(0, 0).strength(0.05))
      .force('x', forceX(0).strength(full ? 0.028 : 0.04))
      .force('y', forceY(0).strength(full ? 0.05 : 0.04))
      .velocityDecay(0.4)
      .alphaDecay(0.022)
      .stop();
    simRef.current = sim;

    const toWorld = (cx: number, cy: number) => ({
      x: (cx - s.w / 2 - s.tx) / s.k,
      y: (cy - s.h / 2 - s.ty) / s.k,
    });

    const nodeAt = (cx: number, cy: number) => {
      const p = toWorld(cx, cy);
      let best: GraphNode | null = null;
      let bestD = Infinity;
      for (const n of data.gnodes) {
        const dx = (n.x ?? 0) - p.x;
        const dy = (n.y ?? 0) - p.y;
        const d = dx * dx + dy * dy;
        const hit = radiusOf(n) + 9 / s.k;
        if (d < hit * hit && d < bestD) {
          bestD = d;
          best = n;
        }
      }
      return best;
    };

    const fit = (animate: boolean) => {
      if (!data.gnodes.length) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const n of data.gnodes) {
        minX = Math.min(minX, n.x ?? 0);
        maxX = Math.max(maxX, n.x ?? 0);
        minY = Math.min(minY, n.y ?? 0);
        maxY = Math.max(maxY, n.y ?? 0);
      }
      const pad = full ? 110 : 30;
      const k = clamp(
        Math.min((s.w - pad * 2) / Math.max(maxX - minX, 1), (s.h - pad * 2) / Math.max(maxY - minY, 1)),
        full ? 0.3 : 0.35,
        full ? 1.35 : 1.5,
      );
      const target = { k, tx: -((minX + maxX) / 2) * k, ty: -((minY + maxY) / 2) * k };
      if (animate) tweenTo(target);
      else Object.assign(s, target);
      s.dirty = true;
      kick();
    };

    const tweenTo = (to: { k: number; tx: number; ty: number }) => {
      s.tween = { from: { k: s.k, tx: s.tx, ty: s.ty }, to, t0: performance.now() };
      s.dirty = true;
      kick();
    };

    /** Slide the viewport so the active note sits in the middle. */
    const recenterOnCurrent = () => {
      const n = currentRef.current ? data.byId.get(currentRef.current) : null;
      if (!n) return;
      tweenTo({ k: s.k, tx: -(n.x ?? 0) * s.k, ty: -(n.y ?? 0) * s.k });
    };
    const api = canvas as GraphCanvas;
    api.__recenter = recenterOnCurrent;
    api.__fit = fit;
    api.__zoom = (factor: number) => {
      tweenTo({ k: clamp(s.k * factor, 0.22, 5), tx: s.tx * factor, ty: s.ty * factor });
    };

    // ── drawing ────────────────────────────────────────────────────────────
    const neighbors = (id: string) => {
      const set = new Set<string>([id]);
      for (const l of data.glinks) {
        const a = (l.source as GraphNode).id;
        const b = (l.target as GraphNode).id;
        if (a === id) set.add(b);
        if (b === id) set.add(a);
      }
      return set;
    };

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, s.w, s.h);
      ctx.save();
      ctx.translate(s.w / 2 + s.tx, s.h / 2 + s.ty);
      ctx.scale(s.k, s.k);

      const focusId = s.hover?.id ?? null;
      const near = focusId ? neighbors(focusId) : null;
      const cur = currentRef.current;

      // links
      ctx.lineWidth = 1 / s.k;
      for (const l of data.glinks) {
        const a = l.source as GraphNode;
        const b = l.target as GraphNode;
        const lit = near ? near.has(a.id) && near.has(b.id) : false;
        const touchesCurrent = !near && (a.id === cur || b.id === cur);
        if (near && !lit) {
          ctx.globalAlpha = 0.12;
          ctx.strokeStyle = colors.line;
        } else if (lit) {
          ctx.globalAlpha = 0.95;
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1.5 / s.k;
        } else if (touchesCurrent) {
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = colors.accent;
        } else {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = colors.line;
        }
        ctx.beginPath();
        ctx.moveTo(a.x ?? 0, a.y ?? 0);
        ctx.lineTo(b.x ?? 0, b.y ?? 0);
        ctx.stroke();
        ctx.lineWidth = 1 / s.k;
      }

      // nodes
      const labelAlpha = full ? clamp((s.k - 0.34) * 2.4, 0, 1) : 1;
      ctx.font = `${(full ? 11.5 : 10.5) / s.k}px -apple-system, BlinkMacSystemFont, Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.lineJoin = 'round';

      for (const n of data.gnodes) {
        const dim = near ? !near.has(n.id) : false;
        const r = radiusOf(n);
        const isCur = n.id === cur;
        const isHover = n.id === focusId;

        ctx.globalAlpha = dim ? 0.16 : 1;
        ctx.beginPath();
        ctx.arc(n.x ?? 0, n.y ?? 0, r, 0, Math.PI * 2);
        ctx.fillStyle = isCur || isHover ? colors.accentHi : FOLDER_COLOR[n.folder] ?? colors.fallback;
        ctx.fill();

        if (isCur) {
          ctx.beginPath();
          ctx.arc(n.x ?? 0, n.y ?? 0, r + 4 / s.k, 0, Math.PI * 2);
          ctx.strokeStyle = colors.accentHi;
          ctx.lineWidth = 1.6 / s.k;
          ctx.stroke();
          ctx.lineWidth = 1 / s.k;
        }

        const showLabel = isHover || isCur || (labelAlpha > 0.02 && !dim);
        if (showLabel) {
          ctx.globalAlpha = dim ? 0.2 : isHover || isCur ? 1 : labelAlpha * 0.92;
          ctx.fillStyle = isHover || isCur ? colors.textHi : colors.text;
          const label = n.title.length > 26 ? n.title.slice(0, 25) + '…' : n.title;
          const lx = n.x ?? 0;
          const ly = (n.y ?? 0) + r + 4 / s.k;
          // halo in the pane colour so overlapping labels stay readable
          ctx.strokeStyle = colors.bg;
          ctx.lineWidth = 3 / s.k;
          ctx.strokeText(label, lx, ly);
          ctx.lineWidth = 1 / s.k;
          ctx.fillText(label, lx, ly);
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    // ── loop ───────────────────────────────────────────────────────────────
    const frame = () => {
      s.raf = 0;
      let busy = false;

      if (s.tween) {
        const { from, to, t0 } = s.tween;
        const t = clamp((performance.now() - t0) / 420, 0, 1);
        const e = 1 - Math.pow(1 - t, 3); // ease-out cubic
        s.k = from.k + (to.k - from.k) * e;
        s.tx = from.tx + (to.tx - from.tx) * e;
        s.ty = from.ty + (to.ty - from.ty) * e;
        if (t === 1) s.tween = null;
        busy = true;
      }

      if (sim.alpha() > sim.alphaMin()) {
        sim.tick();
        busy = true;
        if (s.autofit && !s.drag) fit(false);
      } else if (s.autofit) {
        s.autofit = false;
        s.fitted = true;
        fit(true);
      }
      if (busy || s.dirty) {
        s.dirty = false;
        draw();
      }
      if (busy || s.drag) kick();
    };
    const kick = () => {
      if (!s.raf) s.raf = requestAnimationFrame(frame);
    };

    // ── sizing ─────────────────────────────────────────────────────────────
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = r.width;
      s.h = r.height;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      s.dirty = true;
      kick();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    sim.alpha(1);
    kick();

    // ── interaction ────────────────────────────────────────────────────────
    const rel = (e: PointerEvent | WheelEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.autofit = false;
      const p = rel(e);
      const before = toWorld(p.x, p.y);
      const factor = Math.exp(-e.deltaY * 0.0016);
      s.k = clamp(s.k * factor, 0.22, 5);
      s.tx = p.x - s.w / 2 - before.x * s.k;
      s.ty = p.y - s.h / 2 - before.y * s.k;
      s.tween = null;
      s.dirty = true;
      kick();
    };

    const onDown = (e: PointerEvent) => {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic or already-released pointers cannot be captured; dragging
        // still works off the canvas listeners.
      }
      const p = rel(e);
      s.autofit = false;
      s.down = true;
      s.moved = 0;
      s.px = p.x;
      s.py = p.y;
      s.tween = null;
      const n = nodeAt(p.x, p.y);
      if (n) {
        s.drag = n;
        sim.alphaTarget(0.28).restart();
        n.fx = n.x;
        n.fy = n.y;
      } else {
        s.panning = true;
        canvas.classList.add('grabbing');
      }
      kick();
    };

    const onMove = (e: PointerEvent) => {
      const p = rel(e);
      const dx = p.x - s.px;
      const dy = p.y - s.py;
      if (s.drag && s.down) {
        s.moved += Math.abs(dx) + Math.abs(dy);
        s.drag.fx = (s.drag.fx ?? 0) + dx / s.k;
        s.drag.fy = (s.drag.fy ?? 0) + dy / s.k;
        s.px = p.x;
        s.py = p.y;
        s.dirty = true;
        kick();
        return;
      }
      if (s.panning && s.down) {
        s.moved += Math.abs(dx) + Math.abs(dy);
        s.tx += dx;
        s.ty += dy;
        s.px = p.x;
        s.py = p.y;
        s.dirty = true;
        kick();
        return;
      }
      const hit = nodeAt(p.x, p.y);
      canvas.classList.toggle('pointing', !!hit);
      if (hit !== s.hover) {
        s.hover = hit;
        s.dirty = true;
        kick();
      }
    };

    const onUp = (e: PointerEvent) => {
      // Only a gesture that actually started on this canvas may select a node.
      const wasDown = s.down;
      s.down = false;
      const wasDrag = s.drag;
      if (wasDrag) {
        sim.alphaTarget(0);
        wasDrag.fx = null;
        wasDrag.fy = null;
      }
      s.drag = null;
      s.panning = false;
      canvas.classList.remove('grabbing');
      if (wasDown && e.type === 'pointerup' && s.moved < 5) {
        const p = rel(e);
        const n = nodeAt(p.x, p.y);
        if (n) selectRef.current(n.id, { x: e.clientX, y: e.clientY });
        else blankRef.current?.();
      }
      s.dirty = true;
      kick();
    };

    const onLeave = () => {
      if (s.hover) {
        s.hover = null;
        s.dirty = true;
        kick();
      }
    };
    const onDouble = () => fit(true);

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('dblclick', onDouble);

    return () => {
      ro.disconnect();
      sim.stop();
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.fitted = false;
      s.tween = null;
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('dblclick', onDouble);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, full, themeKey]);

  // Re-centre when the open note changes (full graph only) / repaint on both.
  useEffect(() => {
    const c = canvasRef.current as GraphCanvas | null;
    state.current.dirty = true;
    // While the opening layout is still framing itself, let it finish.
    if (full && !state.current.autofit && c?.__recenter) c.__recenter();
    else if (c) {
      // nudge the loop so the highlight ring repaints
      const s = state.current;
      if (!s.raf) s.raf = requestAnimationFrame(() => (s.raf = 0));
      simRef.current?.alpha(Math.max(simRef.current.alpha(), 0.02));
    }
  }, [currentId, full]);

  return (
    <div className="graph-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}
