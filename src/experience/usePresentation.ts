import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { gsap } from 'gsap';
import { createRenderer } from './renderer';
import { destination, sequence } from './sequence';

export function usePresentation(canvas: RefObject<HTMLCanvasElement | null>) {
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const control = useRef({ index: 0, busy: false, reduced: false });
  const scene = useRef({ ...sequence[0] });
  const renderer = useRef<ReturnType<typeof createRenderer>>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    renderer.current = createRenderer(canvas.current, scene.current);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      control.current.reduced = media.matches;
      setReducedMotion(media.matches);
      if (media.matches && tween.current) tween.current.progress(1);
    };
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => {
      tween.current?.kill();
      renderer.current?.dispose();
      renderer.current = null;
      media.removeEventListener('change', updatePreference);
    };
  }, [canvas]);

  const navigate = useCallback((direction: number) => {
    const current = control.current;
    const next = destination(current.index, direction, current.busy);
    if (next === current.index || !renderer.current) return;
    current.busy = true; // Synchronous guard also blocks taps before React re-renders.
    setBusy(true);
    tween.current?.kill();
    tween.current = gsap.to(scene.current, {
      ...sequence[next],
      duration: current.reduced ? 0 : next === 1 ? 3.2 : 2.6,
      ease: 'power2.inOut',
      onUpdate: () => renderer.current?.draw(),
      onComplete: () => {
        current.index = next;
        current.busy = false;
        setIndex(next);
        setBusy(false);
        renderer.current?.draw();
      },
    });
  }, []);
  return { index, busy, reducedMotion, navigate };
}
