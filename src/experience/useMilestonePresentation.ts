import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { gsap } from 'gsap';
import { destination } from './sequence';

interface Renderer { draw: () => void; dispose: () => void }
export interface PresentationConfig<State extends object> {
  states: readonly State[];
  renderer: (canvas: HTMLCanvasElement, state: State) => Renderer | null;
  duration: (next: number) => number;
  ease?: string;
}

/** The shared contract: one transition per action, then a still, reversible milestone. */
export function useMilestonePresentation<State extends object>(
  canvas: RefObject<HTMLCanvasElement | null>, config: PresentationConfig<State>,
) {
  const [index, setIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canvasUnavailable, setCanvasUnavailable] = useState(false);
  const control = useRef({ index: 0, busy: false, reduced: false });
  const scene = useRef({ ...config.states[0] });
  const renderer = useRef<Renderer | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    renderer.current = config.renderer(canvas.current, scene.current);
    setCanvasUnavailable(!renderer.current);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      control.current.reduced = media.matches;
      setReducedMotion(media.matches);
      if (media.matches) tween.current?.progress(1);
    };
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => {
      tween.current?.kill();
      control.current.busy = false;
      renderer.current?.dispose();
      renderer.current = null;
      media.removeEventListener('change', updatePreference);
    };
  }, [canvas, config]);

  const navigate = useCallback((direction: number) => {
    const current = control.current;
    const next = destination(current.index, direction, current.busy, config.states.length);
    if (next === current.index) return;
    current.busy = true; // Guard repeated input before React commits the busy state.
    setBusy(true);
    setTargetIndex(next);
    tween.current?.kill();
    const complete = () => {
      current.index = next;
      current.busy = false;
      setIndex(next);
      setBusy(false);
      renderer.current?.draw();
    };
    // Preserve the readable narrative even if Canvas 2D is unavailable.
    if (current.reduced || !renderer.current) {
      Object.assign(scene.current, config.states[next]);
      complete();
      return;
    }
    tween.current = gsap.to(scene.current, {
      ...config.states[next], duration: config.duration(next), ease: config.ease ?? 'power2.inOut',
      onUpdate: () => renderer.current?.draw(), onComplete: complete,
    });
  }, [config]);

  return { index, targetIndex, busy, reducedMotion, canvasUnavailable, navigate };
}
