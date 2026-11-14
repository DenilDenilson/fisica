import { hydrogenMilestones } from '../../content/hydrogen';

export type Glyph = 'p' | 'n' | 'u' | 'd' | 'e⁻' | 'e⁺' | 'νₑ' | 'ν̅ₑ' | 'γ' | 'cloud';
export interface Particle {
  id: string; kind: Glyph; x: number; y: number; radius: number; opacity: number;
}
export interface Frame { at: number; particles: readonly Particle[] }
export interface HydrogenState { phase: number }
export const hydrogenSequence = hydrogenMilestones.map((_, phase) => ({ phase }));

const particle = (id: string, kind: Glyph, x: number, y: number, radius = 0.105, opacity = 1): Particle =>
  ({ id, kind, x, y, radius, opacity });
const core = (kind: 'p' | 'n', x = 0, y = 0) => particle('nucleon', kind, x, y);
const photon = (id: string, x: number, y: number, opacity = 1) => particle(id, 'γ', x, y, 0.08, opacity);
const quarks = (group: number, bound: boolean) => ['u', group === 0 ? 'u' : 'd', 'd'].map((kind, i) => {
  const angle = i * Math.PI * 2 / 3 - Math.PI / 2;
  const cx = group === 0 ? -0.42 : 0.42;
  const r = bound ? 0.065 : 0.31;
  return particle(`q${group}-${i}`, kind as Glyph, cx + Math.cos(angle) * r, Math.sin(angle) * r, bound ? 0.035 : 0.065);
});
const ratio = (decayed = false) => [
  ...Array.from({ length: 6 }, (_, i) => particle(`ratio-${i}`, 'p', (i % 3 - 1) * 0.39, Math.floor(i / 3) * 0.35 - 0.4, 0.075, decayed ? 0.27 : 1)),
  core(decayed ? 'p' : 'n', 0, 0.44),
];
const pair = (bound: boolean) => [core('p', bound ? -0.075 : -0.45), particle('partner', 'n', bound ? 0.075 : 0.45, 0)];
const inventory = (bound: boolean) => Array.from({ length: 16 }, (_, i) => {
  const isNeutron = i === 14 || i === 15;
  const inHelium = i >= 12;
  const x = bound ? inHelium ? 0.65 + (i % 2 - 0.5) * 0.125 : -0.87 + (i % 4) * 0.32 : (i % 4 - 1.5) * 0.39;
  const y = bound ? inHelium ? (Math.floor((i - 12) / 2) - 0.5) * 0.125 : (Math.floor(i / 4) - 1) * 0.33 : (Math.floor(i / 4) - 1.5) * 0.3;
  // The first proton persists when we zoom from the inventory into the plasma.
  return particle(i === 0 ? 'nucleon' : `inventory-${i}`, isNeutron ? 'n' : 'p', x, y, 0.072);
});

/** Intermediate keyframes explain capture, emission and breakup instead of crossfading slides. */
export const hydrogenFrames: readonly Frame[] = [
  { at: 0, particles: [...quarks(0, false), ...quarks(1, false)] },
  { at: 0.8, particles: [...quarks(0, true), ...quarks(1, true), core('p', -0.42), particle('partner', 'n', 0.42, 0)] },
  { at: 1, particles: [...quarks(0, true), ...quarks(1, true), core('p', -0.42), particle('partner', 'n', 0.42, 0)] },
  // A new representative neutron is brought into view, then absorbs a neutrino.
  { at: 1.18, particles: [core('n'), particle('incoming', 'νₑ', -1.05, -0.18, 0.065)] },
  { at: 1.49, particles: [core('n'), particle('incoming', 'νₑ', -0.09, 0, 0.065)] },
  { at: 1.51, particles: [core('p'), particle('outgoing', 'e⁻', 0.09, 0, 0.055)] },
  { at: 2, particles: [core('p'), particle('outgoing', 'e⁻', 0.84, -0.28, 0.055)] },
  { at: 2.18, particles: [core('n'), particle('incoming', 'e⁺', -1.05, 0.25, 0.06)] },
  { at: 2.49, particles: [core('n'), particle('incoming', 'e⁺', -0.09, 0, 0.06)] },
  { at: 2.51, particles: [core('p'), particle('outgoing', 'ν̅ₑ', 0.09, 0, 0.065)] },
  { at: 3, particles: [core('p'), particle('outgoing', 'ν̅ₑ', 0.84, 0.28, 0.065)] },
  { at: 4, particles: ratio() },
  { at: 4.38, particles: ratio() },
  { at: 4.4, particles: [...ratio(true), particle('decay-electron', 'e⁻', -0.08, 0.44, 0.055), particle('decay-neutrino', 'ν̅ₑ', 0.08, 0.44, 0.065)] },
  { at: 5, particles: [...ratio(true), particle('decay-electron', 'e⁻', -0.84, 0.24, 0.055), particle('decay-neutrino', 'ν̅ₑ', 0.84, 0.72, 0.065)] },
  { at: 5.15, particles: pair(false) },
  { at: 5.4, particles: [...pair(true), photon('emission', 0, -0.12)] },
  { at: 5.55, particles: [...pair(true), photon('emission', 0.4, -0.65), photon('energetic', -1.1, -0.4)] },
  { at: 5.72, particles: [...pair(true), photon('energetic', -0.07, 0)] },
  { at: 6, particles: pair(false) },
  { at: 6.55, particles: [...pair(true), photon('emission', 0, -0.12)] },
  { at: 7, particles: [...pair(true), photon('emission', 0.65, -0.6)] },
  // A change in scale, explicitly labelled as a balance, not a single fusion reaction.
  { at: 7.25, particles: inventory(false) },
  { at: 8, particles: inventory(true) },
  { at: 9, particles: [core('p'), particle('atomic-electron', 'e⁻', 0.88, -0.4, 0.055)] },
  { at: 9.3, particles: [core('p'), particle('atomic-electron', 'e⁻', 0.42, -0.1, 0.055)] },
  { at: 9.6, particles: [core('p'), particle('atomic-electron', 'e⁻', 0.18, 0, 0.055, 0.3), particle('cloud', 'cloud', 0, 0, 0.62, 0.75), photon('capture-1', 0.15, -0.2), photon('capture-2', -0.12, 0.2)] },
  { at: 10, particles: [core('p'), particle('cloud', 'cloud', 0, 0, 0.62), photon('capture-1', 0.85, -0.7, 0.4), photon('capture-2', -0.85, 0.7, 0.4)] },
  { at: 11, particles: [core('p'), particle('cloud', 'cloud', 0, 0, 0.79)] },
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** A pure sampler makes every frame deterministic, including backwards travel and resize. */
export function sampleHydrogen(phase: number): Particle[] {
  const clamped = Math.max(0, Math.min(hydrogenSequence.length - 1, phase));
  const nextIndex = hydrogenFrames.findIndex(frame => frame.at > clamped);
  if (nextIndex === -1) return [...hydrogenFrames[hydrogenFrames.length - 1].particles];
  const before = hydrogenFrames[Math.max(0, nextIndex - 1)];
  const after = hydrogenFrames[nextIndex];
  const progress = smooth((clamped - before.at) / (after.at - before.at));
  const from = new Map(before.particles.map(p => [p.id, p]));
  const to = new Map(after.particles.map(p => [p.id, p]));
  return [...new Set([...from.keys(), ...to.keys()])].map(id => {
    const start = from.get(id);
    const end = to.get(id);
    const a = start ?? { ...end!, opacity: 0 };
    const b = end ?? { ...start!, opacity: 0 };
    return { id, kind: progress < 0.5 ? a.kind : b.kind,
      x: mix(a.x, b.x, progress), y: mix(a.y, b.y, progress),
      radius: mix(a.radius, b.radius, progress), opacity: mix(a.opacity, b.opacity, progress) };
  });
}
