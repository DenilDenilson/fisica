import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elements, matches, tablePosition } from '../src/elements/catalogue.ts';

test('all 118 elements have unique atomic numbers, symbols and periodic positions', () => {
  assert.equal(elements.length, 118);
  assert.deepEqual(elements.map(e => e.number), Array.from({ length: 118 }, (_, i) => i + 1));
  assert.equal(new Set(elements.map(e => e.symbol)).size, 118);
  assert.equal(new Set(elements.map(e => tablePosition(e.number).join(','))).size, 118);
  for (const element of elements) {
    const [column, row] = tablePosition(element.number);
    assert.ok(column >= 0 && column <= 17 && row >= 0 && row <= 9);
    assert.equal(element.sources.length, 2);
    assert.ok(element.rscChecked, 'Missing RSC audit: ' + element.symbol);
  }
});
test('reference phases distinguish the two liquids, incolorous gas and near-room-temperature solids', () => {
  assert.deepEqual(elements.filter(e => e.state === 'líquido').map(e => e.symbol), ['Br', 'Hg']);
  for (const symbol of ['Ga', 'Cs']) assert.equal(elements.find(e => e.symbol === symbol)?.state, 'sólido');
  assert.equal(elements[7].visual.kind, 'gas');
  assert.equal(elements[15].visual.kind, 'crystal');
  assert.equal(elements[5].form, 'Grafito hexagonal (carbono)');
});
test('unsupported macroscopic observations are not invented for superheavy elements', () => {
  for (const element of elements.filter(e => e.number >= 100 || [85,87].includes(e.number))) {
    assert.equal(element.evidence, 'conceptual');
    assert.equal(element.state, 'desconocido');
    assert.equal(element.density, null);
    assert.equal(element.meltingK, null);
    assert.equal(element.boilingK, null);
    assert.equal(element.visual.kind, 'unknown');
  }
});
test('search handles accents, names, atomic numbers and combined filters', () => {
  assert.ok(matches(elements[7], 'oxigeno', '', 'gas'));
  assert.ok(matches(elements[78], 'Au', '', 'sólido'));
  assert.ok(matches(elements[79], '80', '', 'líquido'));
  assert.ok(!matches(elements[78], 'Au', '', 'gas'));
  assert.ok(!matches(elements[78], '', 'Halógenos', ''));
});
