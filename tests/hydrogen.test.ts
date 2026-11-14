import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hydrogenMilestones, hydrogenReactions, hydrogenSources, species } from '../src/content/hydrogen.ts';
import { hydrogenFrames, hydrogenSequence, sampleHydrogen } from '../src/experience/hydrogen/sequence.ts';
import { destination } from '../src/experience/sequence.ts';

test('the reaction script conserves baryon number, electric charge and lepton number', () => {
  for (const [name, reaction] of Object.entries(hydrogenReactions)) {
    for (const quantity of ['baryons', 'charge', 'leptons'] as const) {
      const sum = (side: readonly (keyof typeof species)[]) => side.reduce((total, key) => total + species[key][quantity], 0);
      assert.equal(sum(reaction.input), sum(reaction.output), `${name}: ${quantity}`);
    }
  }
});

test('the chronology distinguishes early nuclei from much later neutral atoms and cites its sources', () => {
  const ids = new Set(hydrogenSources.map(source => source.id));
  assert.equal(new Set(hydrogenMilestones.map(step => step.id)).size, hydrogenMilestones.length);
  hydrogenMilestones.forEach((step, i) => {
    assert.ok(step.sourceIds.length > 0);
    step.sourceIds.forEach(id => assert.ok(ids.has(id)));
    if (i) assert.ok(step.seconds >= hydrogenMilestones[i - 1].seconds, step.id);
    if (step.reaction) assert.ok(step.reaction in hydrogenReactions);
  });
  const deuterium = hydrogenMilestones.find(step => step.id === 'deuterium-survives')!;
  const neutral = hydrogenMilestones.find(step => step.id === 'recombination')!;
  assert.ok(neutral.seconds / deuterium.seconds > 1e10, 'Do not conflate nuclear synthesis and recombination');
  assert.equal(hydrogenMilestones.at(-1)?.id, 'neutral-hydrogen');
});

test('navigation reaches every hydrogen milestone, blocks repeated input and returns to the initial scene', () => {
  const length = hydrogenSequence.length;
  let index = 0;
  for (let i = 1; i < length; i++) {
    assert.equal(destination(index, 1, true, length), index);
    index = destination(index, 1, false, length);
    assert.equal(index, i);
  }
  assert.equal(destination(index, 1, false, length), length - 1);
  for (let i = length - 2; i >= 0; i--) index = destination(index, -1, false, length);
  assert.equal(index, 0);
  assert.deepEqual(sampleHydrogen(index), sampleHydrogen(0));
});

test('the animation resolves the deuterium bottleneck, preserves the nuclear inventory, and ends neutral', () => {
  const bound = sampleHydrogen(5.4);
  const broken = sampleHydrogen(6);
  const stable = sampleHydrogen(7);
  const separation = (particles: ReturnType<typeof sampleHydrogen>) => {
    const p = particles.find(p => p.id === 'nucleon')!;
    const n = particles.find(p => p.id === 'partner')!;
    return Math.hypot(p.x - n.x, p.y - n.y);
  };
  assert.ok(separation(bound) < 0.2);
  assert.ok(separation(broken) > 0.8);
  assert.ok(separation(stable) < 0.2);
  for (const phase of [7.25, 7.5, 8]) {
    const particles = sampleHydrogen(phase).filter(p => p.opacity > 0.99);
    assert.equal(particles.filter(p => p.kind === 'p').length, 14);
    assert.equal(particles.filter(p => p.kind === 'n').length, 2);
  }
  const final = sampleHydrogen(hydrogenSequence.length - 1);
  assert.equal(final.filter(p => p.kind === 'p').length, 1);
  assert.equal(final.filter(p => p.kind === 'n').length, 0);
  assert.equal(final.filter(p => p.kind === 'cloud').length, 1);
});

test('all intermediate frames stay finite, have unique particles and are independent of playback direction', () => {
  for (const frame of hydrogenFrames) assert.equal(new Set(frame.particles.map(p => p.id)).size, frame.particles.length);
  const forward = Array.from({ length: 221 }, (_, i) => sampleHydrogen(i / 20));
  for (let i = 220; i >= 0; i--) {
    const frame = sampleHydrogen(i / 20);
    assert.deepEqual(frame, forward[i]);
    for (const p of frame) {
      assert.ok([p.x, p.y, p.radius, p.opacity].every(Number.isFinite));
      assert.ok(p.opacity >= 0 && p.opacity <= 1 && p.radius > 0);
    }
  }
});
