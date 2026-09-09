import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDesign } from '../src/lib/build.ts';
import { muebleBano } from '../src/designs/mueble-bano.ts';

// Measurements confirmed by the user: docs/designs/mueble-bano.md
const model = buildDesign(muebleBano),
  parts = model.parts,
  byId = (id) => parts.find((p) => p.id === id);

test('Thirteen boards, with the references the workshop already knows', () => {
  assert.equal(parts.length, 13);
  assert.deepEqual(
    parts.map((p) => p.id),
    ['T01', 'P01', 'P02', 'L01', 'L02', 'F01', 'Z01', 'B01', 'E01', 'A01', 'A02', 'A03', 'A04'],
  );
});

test('Width clarification is applied once: 798 mm opening and 796 mm top', () => {
  assert.equal(model.frame.width, 798);
  const top = byId('T01');
  assert.equal(top.cut[0], 796);
  assert.equal(model.frame.width - top.size[0], 2);
  assert.equal(top.cut[1], 510);
});

test('Confirmed materials keep the underside at 850 mm with a 30 mm fingerjoint top', () => {
  const top = byId('T01');
  assert.equal(top.size[1], 30);
  assert.equal(top.position[1] - top.size[1] / 2, 850);
  assert.equal(top.position[1] + top.size[1] / 2, 880);
  assert.equal(top.material, 'Fingerjoint de eucaliptus de 30 mm');
  assert.equal(top.machining.radius, 15);
  for (const p of parts.filter((p) => p.id !== 'T01')) {
    assert.equal(p.cut[2], 18);
    assert.equal(p.material, 'Melamínico blanco mate de 18 mm');
  }
});

test('The doors keep a 20 mm setback and three 3 mm joints', () => {
  const top = byId('T01'),
    doors = parts.filter((p) => p.group === 'Puertas');
  assert.equal(doors.length, 2);
  for (const p of doors)
    assert.equal(top.position[2] + top.size[2] / 2 - p.position[2] - p.size[2] / 2, 20);
  assert.equal(
    doors[1].position[0] - doors[1].size[0] / 2 - (doors[0].position[0] + doors[0].size[0] / 2),
    3,
  );
  assert.deepEqual(doors[0].cut, [744, 394.5, 18]);
});

test('The uprights stand on the base and stop 3 mm below the top', () => {
  const base = byId('B01');
  for (const id of ['L01', 'L02']) {
    const upright = byId(id);
    assert.equal(upright.position[1] - upright.size[1] / 2, base.position[1] + base.size[1] / 2);
    assert.equal(upright.position[1] + upright.size[1] / 2, 847);
    assert.deepEqual(upright.cut, [729, 100, 18]);
  }
});

test('Cut sizes agreed with the workshop', () => {
  const expected = {
    T01: [796, 510, 30],
    P01: [744, 394.5, 18],
    L01: [729, 100, 18],
    F01: [762, 60, 18],
    Z01: [798, 80, 18],
    B01: [798, 462, 18],
    E01: [798, 350, 18],
    A01: [444, 50, 18],
    A03: [350, 50, 18],
  };
  for (const [id, cut] of Object.entries(expected))
    assert.deepEqual(byId(id).cut, cut, id);
});

test('Edge banding follows the schedule the user gave', () => {
  const counts = { T01: 0, P01: 4, P02: 4, L01: 1, L02: 1, F01: 1, Z01: 1, B01: 1, E01: 1, A01: 0, A02: 0, A03: 0, A04: 0 };
  for (const p of parts)
    assert.equal(Object.values(p.edging).filter(Boolean).length, counts[p.id], p.id);
  for (const id of ['L01', 'L02', 'B01', 'E01'])
    assert.equal(byId(id).edging.L1, 'Delantero');
});

test('Identical boards are listed once with their quantity', () => {
  assert.deepEqual(
    model.groups.map((g) => `${g.ids.join('/')}×${g.quantity}`),
    ['T01×1', 'P01/P02×2', 'L01/L02×2', 'F01×1', 'Z01×1', 'B01×1', 'E01×1', 'A01/A02×2', 'A03/A04×2'],
  );
});
