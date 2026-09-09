import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDesign } from '../src/lib/build.ts';
import { designs } from '../src/designs/index.ts';

const models = designs.map((spec) => buildDesign(spec));

for (const model of models) {
  const { spec, assembly, tools } = model;
  const label = (suffix) => `${spec.id}: ${suffix}`;
  const partIds = new Set(model.parts.map((p) => p.id)),
    hardwareIds = new Set(model.hardware.map((h) => h.id));

  test(label('the order is numbered from one, without gaps'), () => {
    assert.ok(assembly.length >= 3, 'an order with no middle step');
    assembly.forEach((step, i) => {
      assert.equal(step.order, i + 1);
      assert.ok(step.title.length > 0 && step.body.length > 0, step.id);
      assert.ok(['confirmed', 'proposed'].includes(step.status), step.id);
    });
  });

  test(label('it opens by checking the pieces and closes by adjusting'), () => {
    assert.match(assembly.at(0).title, /antes de empezar/i);
    assert.match(assembly.at(-1).title, /ajuste final/i);
  });

  test(label('a step only names references that exist'), () => {
    for (const step of assembly) {
      for (const id of step.parts)
        assert.ok(partIds.has(id), `${step.id} names the board ${id}, which is not in the model`);
      for (const id of step.hardware)
        assert.ok(hardwareIds.has(id), `${step.id} names the hardware ${id}, which is not in the list`);
    }
  });

  test(label('every board is put in place by some step'), () => {
    const placed = new Set(assembly.flatMap((s) => s.parts));
    for (const id of partIds)
      assert.ok(placed.has(id), `no step places the board ${id}`);
  });

  test(label('what the model works out on its own is only ever a proposal'), () => {
    for (const step of assembly.filter((s) => s.origin === 'derived'))
      assert.equal(step.status, 'proposed', `${step.id} claims to be confirmed`);
    for (const tool of tools.filter((t) => t.origin === 'derived'))
      assert.equal(tool.status, 'proposed', `${tool.name} claims to be confirmed`);
  });

  test(label('the tool list says what every tool is for'), () => {
    assert.ok(tools.length > 0);
    assert.equal(new Set(tools.map((t) => t.name)).size, tools.length);
    for (const tool of tools) assert.ok(tool.reason.length > 0, tool.name);
  });
}

test('the derived order fixes to the wall first and hangs the fronts last', () => {
  const cabinet = buildDesign({
    ...designs.find((d) => d.modules.some((m) => m.kind === 'doors')),
    assembly: [],
  });
  const titles = cabinet.assembly.map((s) => s.title);
  const wall = titles.findIndex((t) => /fijar a la pared/i.test(t)),
    doors = titles.findIndex((t) => /colgar las puertas/i.test(t));
  assert.ok(wall > 0, 'nothing is fixed to the wall');
  assert.ok(doors > wall, 'the doors are hung before the piece is fixed');
  assert.equal(doors, titles.length - 2, 'the doors are not the last thing built');
});

test('a declared step takes the place of the derived one it covers', () => {
  const table = designs.find((d) => d.id === 'mesa-bonsai');
  const derived = buildDesign({ ...table, assembly: [] }).assembly;
  const mine = buildDesign(table).assembly;
  assert.equal(mine.length, derived.length, 'a covering step added a step instead of replacing one');
  assert.ok(mine.every((s) => s.origin === 'declared'), 'the design declares every step');

  const extra = buildDesign({
    ...table,
    assembly: [
      { title: 'Paso suelto', body: 'Sin covers.', status: 'proposed' },
    ],
  }).assembly;
  assert.equal(extra.length, derived.length + 1);
  assert.equal(extra.at(-2).title, 'Paso suelto', 'an extra step is not placed before the last one');
  assert.match(extra.at(-1).title, /ajuste final/i);
});

test('a wall of tools follows from what the piece actually has', () => {
  const cabinet = buildDesign(designs.find((d) => d.id === 'mueble-bano'));
  const table = buildDesign(designs.find((d) => d.id === 'mesa-bonsai'));
  const names = (m) => m.tools.map((t) => t.name.toLowerCase());
  assert.ok(names(cabinet).some((n) => /copa/.test(n)), 'a cup hinge asks for a 35 mm bit');
  assert.ok(names(cabinet).some((n) => /percutor/.test(n)), 'a wall-fixed board asks for a percussion drill');
  assert.ok(!names(table).some((n) => /percutor/.test(n)), 'a freestanding table asks for no percussion drill');
  assert.ok(!names(table).some((n) => /copa/.test(n)), 'a table with no doors asks for no hinge bit');
});
