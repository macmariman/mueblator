import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as THREE from 'three';
import { buildDesign } from '../src/lib/build.ts';
import { muebleBano } from '../src/designs/mueble-bano.ts';
import { basinCutout, createCountertopGeometry } from '../src/lib/fixtures/basin-geometry.ts';

const model = buildDesign(muebleBano),
  top = model.parts.find((p) => p.role === 'countertop'),
  basin = model.fixtures.find((f) => f.kind === 'basin-with-faucet'),
  cut = basinCutout(basin, top);

test('Cutout shares the basin ellipse and clears its body across the whole slab', () => {
  assert.ok(Math.abs(cut.radiusX / cut.radiusZ - basin.scaleX) < 1e-12);
  for (let i = 0; i < basin.profile.length - 1; i++)
    for (let j = 0; j <= 100; j++) {
      const t = j / 100,
        [r1, y1] = basin.profile[i],
        [r2, y2] = basin.profile[i + 1];
      const r = r1 + (r2 - r1) * t,
        y = y1 + (y2 - y1) * t + top.position[1] + top.size[1] / 2 + basin.lift;
      if (y >= top.position[1] - top.size[1] / 2 && y <= top.position[1] + top.size[1] / 2)
        assert.ok(r < cut.radiusZ, `Basin collides at radius ${r}, y ${y}`);
    }
  const rimRadius = Math.max(...basin.profile.map((p) => p[0]));
  assert.ok(cut.radiusZ < rimRadius, 'The rim must overlap the cutout');
  assert.ok(
    cut.radiusZ + Math.abs(basin.z) < top.size[2] / 2,
    'The cutout stays within the countertop',
  );
});

test('Real countertop triangles leave the opening empty and retain material under the rim', () => {
  const geometry = createCountertopGeometry(top, basin),
    position = geometry.getAttribute('position');
  const ray = new THREE.Raycaster(),
    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.position.set(...top.position);
  mesh.updateMatrixWorld();
  const above = top.position[1] + top.size[1];
  const hits = (x, z) => {
    ray.set(new THREE.Vector3(x, above, z), new THREE.Vector3(0, -1, 0));
    return ray.intersectObject(mesh, false).length;
  };
  assert.ok(position.count > 0);
  // Centre of the basin: the slab must be open.
  assert.equal(hits(basin.x, basin.z), 0);
  // Just outside the cutout: solid board under the rim.
  assert.ok(hits(basin.x + cut.radiusX + 8, basin.z) > 0);
  assert.ok(hits(basin.x, basin.z + cut.radiusZ + 8) > 0);
});

test('The milled front keeps the finished bounding box', () => {
  const geometry = createCountertopGeometry(top, basin);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  assert.ok(Math.abs(box.max.z - top.size[2] / 2) < 0.01, 'the front moved');
  assert.ok(Math.abs(box.max.x - top.size[0] / 2) < 0.01, 'the width changed');
  assert.ok(Math.abs(box.max.y - top.size[1] / 2) < 0.01, 'the thickness changed');
});
