import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destination, sequence } from '../src/experience/sequence.ts';

test('navigation respects the narrative boundaries', () => {
  assert.equal(destination(0, -1, false), 0);
  assert.equal(destination(4, 1, false), 4);
  assert.equal(destination(2, -1, false), 1);
  assert.equal(destination(2, 1, false), 3);
});
test('repeated input during a transition cannot skip a milestone', () => {
  for (let i = 0; i < 100; i++) assert.equal(destination(1, 1, true), 1);
});
test('returning through the sequence restores the same state', () => {
  let index = 0;
  for (let i = 0; i < 4; i++) index = destination(index, 1, false);
  for (let i = 0; i < 4; i++) index = destination(index, -1, false);
  assert.equal(index, 0);
  assert.equal(sequence[index].spread, 1);
  assert.equal(sequence[index].fusion, 0);
});
