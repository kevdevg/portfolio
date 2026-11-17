import { useEffect, useState } from 'react';

const COORD_PAIR_REGEX = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g;

export function clamp(val, min = 0, max = 1) {
  return Math.min(max, Math.max(min, val));
}

export function lerp(start, end, t) {
  return start + (end - start) * clamp(t, 0, 1);
}

export function easeOutCubic(t) {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3);
}

export function easeInOutCubic(t) {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export function quantize(p, steps = 1000) {
  return Math.round(clamp(p, 0, 1) * steps) / steps;
}

/**
 * Transforms (x, y) coordinate pairs of an SVG path in user-space.
 * Prevents WebKit transform-origin bugs and keeps hairline stroke-width constant.
 */
export function transformPathCoords(
  path,
  tx = 0,
  ty = 0,
  deg = 0,
  pivotX = 260,
  pivotY = 260,
  scale = 1
) {
  if (tx === 0 && ty === 0 && deg === 0 && scale === 1) return path;
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return path.replace(COORD_PAIR_REGEX, (_match, xs, ys) => {
    const x = parseFloat(xs);
    const y = parseFloat(ys);
    const dx = (x - pivotX) * scale;
    const dy = (y - pivotY) * scale;
    const rx = pivotX + dx * cos - dy * sin + tx;
    const ry = pivotY + dx * sin + dy * cos + ty;
    return `${rx.toFixed(1)} ${ry.toFixed(1)}`;
  });
}

/**
 * Computes quantized [0..1] scroll progress through a sticky track container.
 * Uses rAF throttling and passive listeners for locked 60/120fps scrolling.
 */
export function useStickyScrollProgress(containerRef, offsetTop = 0) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const measure = () => {
      rafId = 0;
      const el = containerRef.current;
      if (!el) return;
      if (prefersReduced) {
        setProgress(1);
        return;
      }
      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
      const scrolled = -(rect.top - offsetTop);
      const next = quantize(scrolled / scrollable, 1000);
      setProgress((prev) => (prev === next ? prev : next));
    };

    const onScrollOrResize = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [containerRef, offsetTop]);

  return progress;
}

/**
 * Computes [0..1] viewport traversal progress for standard sections (e.g. career spine).
 */
export function useViewportTraversal(sectionRef) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const measure = () => {
      rafId = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.78;
      const distance = Math.max(1, rect.height - vh * 0.25);
      const next = quantize((start - rect.top) / distance, 500);
      setProgress((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sectionRef]);

  return progress;
}
