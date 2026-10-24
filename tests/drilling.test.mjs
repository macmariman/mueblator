import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDesign } from '../src/lib/build.ts';
import { designs } from '../src/designs/index.ts';

const models = designs.map((spec) => buildDesign(spec));
const lo = (p, a) => p.position[a] - p.size[a] / 2;
const hi = (p, a) => p.position[a] + p.size[a] / 2;

for (const model of models) {
  const { spec, drilling, parts } = model;
  const label = (suffix) => `${spec.id}: ${suffix}`;
  const byId = new Map(parts.map((p) => [p.id, p]));

  test(label('drilling plans only exist when the design asks for them'), () => {
    if (!spec.drilling) {
      assert.equal(drilling.holes.length, 0);
      assert.equal(drilling.plans.length, 0);
    }
  });

  test(label('every hole sits on a face of the board it drills, inside it'), () => {
    for (const h of drilling.holes) {
      const p = byId.get(h.board);
      assert.ok(p, `${h.board} does not exist`);
      const face = h.sign > 0 ? hi(p, h.axis) : lo(p, h.axis);
      assert.ok(Math.abs(h.at[h.axis] - face) < 0.001, `${h.kind} on ${p.id} is off its face`);
      for (const a of [0, 1, 2].filter((a) => a !== h.axis))
        assert.ok(
          h.at[a] - h.diameter / 2 >= lo(p, a) - 0.001 &&
            h.at[a] + h.diameter / 2 <= hi(p, a) + 0.001,
          `${h.kind} on ${p.id} runs off the board`,
        );
      if (h.depth !== null)
        assert.ok(h.depth < p.cut[2], `${h.kind} on ${p.id} goes through a blind hole`);
    }
  });

  test(label('a confirmat lands in the middle of the edge it screws into'), () => {
    for (const h of drilling.holes.filter((h) => h.kind === 'confirmat')) {
      const edge = byId.get(h.into);
      assert.ok(edge, `${h.board} screws into nothing`);
      const across = [0, 1, 2].find(
        (a) => a !== h.axis && Math.abs(edge.size[a] - edge.cut[2]) < 0.001,
      );
      assert.ok(Math.abs(h.at[across] - edge.position[across]) < 0.001);
    }
  });

  test(label('no two holes of a board coincide'), () => {
    const seen = new Set();
    for (const h of drilling.holes) {
      const key = [h.board, h.axis, h.sign, ...h.at.map((v) => v.toFixed(1))].join();
      assert.ok(!seen.has(key), `two holes at the same spot on ${h.board}`);
      seen.add(key);
    }
  });

  test(label('every drilled board has exactly one plan, with every hole on it'), () => {
    const planned = drilling.plans.flatMap((p) => p.ids);
    assert.equal(new Set(planned).size, planned.length);
    for (const id of new Set(drilling.holes.map((h) => h.board)))
      assert.ok(planned.includes(id), `${id} has holes but no plan`);
    for (const plan of drilling.plans) {
      const count = drilling.holes.filter((h) => h.board === plan.ids[0]).length;
      assert.equal(plan.marks.length, count, `${plan.ids[0]} lost holes on its plan`);
      for (const m of plan.marks) {
        assert.ok(m.x >= 0 && m.x <= plan.width && m.y >= 0 && m.y <= plan.height);
        for (const d of m.distances) assert.ok(d.mm >= 0, `${plan.ids[0]}: ${d.edge}`);
      }
    }
  });

  test(label('a step only points at plans that exist'), () => {
    const planned = new Set(drilling.plans.flatMap((p) => p.ids));
    for (const step of model.assembly)
      for (const { boards } of step.drilling)
        for (const id of boards) assert.ok(planned.has(id), `${step.id} names ${id}`);
  });
}

test('bajo-mesada: joints, hinges and the loose shelf are all drilled', () => {
  const model = models.find((m) => m.spec.id === 'bajo-mesada');
  const holes = model.drilling.holes;
  const count = (kind) => holes.filter((h) => h.kind === kind).length;
  assert.equal(count('hinge-cup'), 4, 'two cups per leaf');
  assert.equal(count('hinge-plate'), 8, 'two pilots per mounting plate');
  assert.equal(count('shelf-pin'), 4, 'four pins under the centre shelf');
  assert.ok(holes.filter((h) => h.kind === 'shelf-pin').every((h) => h.serves === 'E03'));
  // The cups arrive bored; the joints wait for the workshop's answer.
  assert.ok(holes.filter((h) => h.kind === 'hinge-cup').every((h) => h.by === 'workshop'));
  assert.ok(holes.filter((h) => h.kind === 'confirmat').every((h) => h.by === 'pending'));
  // The loose shelf and the doors are never screwed to anything.
  for (const h of holes.filter((h) => h.kind === 'confirmat'))
    for (const id of [h.board, h.into]) assert.ok(!['E03', 'P01', 'P02'].includes(id));
  const screws = model.hardware.find((h) => /confirmat/i.test(h.name));
  assert.equal(screws.quantity, count('confirmat'), 'the hardware list counts the plan');
  const tools = model.tools.map((t) => t.name);
  assert.ok(tools.includes('Mecha escalonada para confirmat'));
  assert.ok(tools.includes('Mecha de 5 mm con tope'));
  assert.ok(!tools.includes('Mecha copa (Forstner)'), 'the workshop bores the cups');
});
