import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDesign } from '../src/lib/build.ts';
import { designs } from '../src/designs/index.ts';

const models = designs.map((spec) => buildDesign(spec));

for (const model of models) {
  const { spec, hardware } = model;
  const label = (suffix) => `${spec.id}: ${suffix}`;

  test(label('every hardware line has a unique reference and a real quantity'), () => {
    assert.equal(new Set(hardware.map((h) => h.id)).size, hardware.length);
    for (const item of hardware) {
      assert.ok(item.name.length > 0, item.id);
      assert.ok(
        Number.isInteger(item.quantity) && item.quantity > 0,
        `${item.id} has no quantity`,
      );
      assert.ok(['confirmed', 'proposed'].includes(item.status), item.id);
    }
  });

  test(label('what the model works out on its own is only ever a proposal'), () => {
    for (const item of hardware.filter((h) => h.origin === 'derived')) {
      assert.equal(item.status, 'proposed', `${item.id} claims to be confirmed`);
      assert.ok(item.note.length > 0, `${item.id} does not say where it comes from`);
    }
  });

  test(label('the design keeps the hardware it declares'), () => {
    /** Two lines can share a name, so compare the whole line. */
    const signature = (item) =>
      [item.name, item.spec ?? null, item.quantity, item.status].join(' · ');
    assert.deepEqual(
      hardware.filter((h) => h.origin === 'declared').map(signature).sort(),
      (spec.hardware ?? []).map(signature).sort(),
    );
  });

  test(label('a piece with doors has hinges for every leaf'), () => {
    const leaves = model.parts.filter((p) => p.role === 'door').length;
    if (leaves === 0) return;
    const hinges = hardware.find((h) => /bisagra/i.test(h.name));
    assert.ok(hinges, 'the list has no hinges');
    assert.ok(
      hinges.quantity >= leaves * 2,
      'fewer than two hinges per leaf were counted',
    );
  });
}

test('a declared item replaces the proposal of the module it covers', () => {
  const withDoors = designs.find((d) =>
    d.modules.some((m) => m.kind === 'doors'),
  );
  const base = buildDesign({ ...withDoors, hardware: [] });
  const proposal = base.hardware.filter((h) => /bisagra/i.test(h.name));
  assert.equal(proposal.length, 1);

  const decided = buildDesign({
    ...withDoors,
    hardware: [
      {
        name: 'Bisagra elegida',
        quantity: 4,
        status: 'confirmed',
        covers: 'door-hinges',
      },
    ],
  });
  const hinges = decided.hardware.filter((h) => /bisagra/i.test(h.name));
  assert.equal(hinges.length, 1);
  assert.equal(hinges[0].name, 'Bisagra elegida');
  assert.equal(hinges[0].origin, 'declared');
});

test('wall fixings are counted for every board screwed to a wall', () => {
  const withCleats = designs.find((d) =>
    d.modules.some((m) => m.kind === 'wall-cleats'),
  );
  const model = buildDesign({ ...withCleats, hardware: [] });
  const wallBoards = model.parts.filter(
    (p) => p.group === 'Apoyos' || /soporte/i.test(p.name),
  ).length;
  const plugs = model.hardware.find((h) => /taco/i.test(h.name));
  const screws = model.hardware.find((h) => /tornillo para taco/i.test(h.name));
  assert.ok(plugs && screws, 'no wall fixings were proposed');
  assert.equal(plugs.quantity, screws.quantity);
  assert.ok(
    plugs.quantity >= wallBoards * 2,
    'fewer than two fixings per board were counted',
  );
});
