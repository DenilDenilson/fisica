import type { RefObject } from 'react';
import { createRenderer } from './renderer';
import { sequence } from './sequence';
import { useMilestonePresentation } from './useMilestonePresentation';

const config = {
  states: sequence,
  renderer: createRenderer,
  duration: (next: number) => next === 1 ? 3.2 : 2.6,
};

export function usePresentation(canvas: RefObject<HTMLCanvasElement | null>) {
  return useMilestonePresentation(canvas, config);
}
