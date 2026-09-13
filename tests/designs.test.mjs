import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDesign } from '../src/lib/build.ts';
import { designs } from '../src/designs/index.ts';
import { edgeKeys } from '../src/lib/spec.ts';

const models = designs.map((spec) => buildDesign(spec));

/** Boards only touch: any overlap on all three axes at once is an intersection. */
function overlap(a, b) {
  return a.size.map(
    (s, k) =>
      Math.min(a.position[k] + s / 2, b.position[k] + b.size[k] / 2) -
      Math.max(a.position[k] - s / 2, b.position[k] - b.size[k] / 2),
  );
}

for (const model of models) {
  const { spec, parts, frame } = model;
  const label = (suffix) => `${spec.id}: ${suffix}`;

  test(label('every board has a unique reference and positive dimensions'), () => {
    assert.ok(parts.length > 0);
    assert.equal(new Set(parts.map((p) => p.id)).size, parts.length);
    for (const p of parts)
      assert.ok(
        p.size.every((v) => Number.isFinite(v) && v > 0),
        p.id,
      );
  });

  test(label('the cut list describes the same boards as the model'), () => {
    for (const p of parts) {
      assert.deepEqual(
        [...p.cut].sort((a, b) => a - b),
        [...p.size].sort((a, b) => a - b),
        p.id,
      );
      const material = spec.materials.find((m) => m.id === p.materialId);
      assert.equal(p.cut[2], material.thickness, p.id);
      assert.ok(p.cut[0] >= p.cut[1], `${p.id} is not listed long × wide`);
    }
    const listed = model.groups.reduce((n, g) => n + g.quantity, 0);
    assert.equal(listed, parts.length);
  });

  test(label('boards do not intersect in the assembled model'), () => {
    for (let i = 0; i < parts.length; i++)
      for (let j = i + 1; j < parts.length; j++) {
        const gaps = overlap(parts[i], parts[j]);
        assert.ok(
          !gaps.every((v) => v > 0.001),
          `${parts[i].id} and ${parts[j].id} overlap: ${gaps}`,
        );
      }
  });

  test(label('nothing sticks out of the opening'), () => {
    for (const p of parts) {
      assert.ok(
        p.position[0] - p.size[0] / 2 >= -frame.halfWidth - 0.001 &&
          p.position[0] + p.size[0] / 2 <= frame.halfWidth + 0.001,
        `${p.id} is wider than the opening`,
      );
      assert.ok(p.position[1] - p.size[1] / 2 >= -0.001, `${p.id} sinks into the floor`);
      assert.ok(
        p.position[2] + p.size[2] / 2 <= frame.halfDepth + 0.001 &&
          p.position[2] - p.size[2] / 2 >= -frame.halfDepth - 0.001,
        `${p.id} is deeper than the opening`,
      );
    }
  });

  test(label('every panel rests on the cleats that carry it'), () => {
    for (const module of spec.modules.filter((m) => m.kind === 'wall-cleats')) {
      const panel = parts.find((p) => p.id === module.supports);
      assert.ok(panel, `${module.supports} does not exist`);
      const cleats = parts.filter(
        (p) =>
          p.group === 'Apoyos' &&
          Math.abs(p.position[1] + p.size[1] / 2 - (panel.position[1] - panel.size[1] / 2)) < 0.001,
      );
      assert.ok(cleats.length >= 2, `${panel.id} has no pair of cleats`);
      for (const cleat of cleats) {
        const gaps = overlap(panel, cleat);
        assert.ok(gaps[0] > 0.001, `${panel.id} does not sit over ${cleat.id}`);
        assert.ok(gaps[2] > 0.001, `${panel.id} and ${cleat.id} do not meet in depth`);
      }
    }
  });

  test(label('the doors fill their stretch and keep their setback'), () => {
    const doors = parts.filter((p) => p.role === 'door');
    if (doors.length === 0) return;
    const module = spec.modules.find((m) => m.kind === 'doors');
    const [left, right] = module.span ?? [-frame.halfWidth, frame.halfWidth];
    assert.ok(left >= -frame.halfWidth && right <= frame.halfWidth, 'the span leaves the opening');
    assert.equal(
      doors.reduce((n, p) => n + p.size[0], 0) + (doors.length + 1) * module.gap,
      right - left,
    );
    assert.ok(
      Math.abs(doors[0].position[0] - doors[0].size[0] / 2 - module.gap - left) < 0.001,
      'the first leaf does not start at the edge of its stretch',
    );
    for (const door of doors)
      assert.equal(
        frame.frontZ - (door.position[2] + door.size[2] / 2),
        module.setback,
        `${door.id} lost its setback`,
      );
    for (let i = 1; i < doors.length; i++)
      assert.ok(
        Math.abs(
          doors[i].position[0] -
            doors[i].size[0] / 2 -
            (doors[i - 1].position[0] + doors[i - 1].size[0] / 2) -
            module.gap,
        ) < 0.001,
        'the joint between leaves is not the declared one',
      );
  });

  test(label('the edge banding schedule names physical edges'), () => {
    for (const p of parts) {
      if (p.edging === null) continue;
      assert.deepEqual(Object.keys(p.edging), [...edgeKeys], p.id);
      for (const key of edgeKeys)
        assert.ok(
          p.edging[key] === null || typeof p.edging[key] === 'string',
          `${p.id} has an invalid ${key}`,
        );
    }
  });
}
