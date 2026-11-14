export interface SceneState {
  spread: number;
  core: number;
  heat: number;
  fusion: number;
  balance: number;
}
// One persistent particle field, transformed between five resting states.
export const sequence: readonly SceneState[] = [
  { spread: 1, core: 0, heat: 0, fusion: 0, balance: 0 },
  { spread: 0.63, core: 0.15, heat: 0.13, fusion: 0, balance: 0 },
  { spread: 0.28, core: 0.62, heat: 0.7, fusion: 0, balance: 0 },
  { spread: 0.19, core: 0.9, heat: 1, fusion: 1, balance: 0 },
  { spread: 0.16, core: 1, heat: 1, fusion: 1, balance: 1 },
];

export function destination(current: number, direction: number, busy: boolean, length = sequence.length): number {
  if (busy) return current;
  return Math.max(0, Math.min(length - 1, current + Math.sign(direction)));
}
