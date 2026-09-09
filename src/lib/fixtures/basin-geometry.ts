import * as THREE from 'three';
import type { BasinFixture, Part } from '../spec.ts';

// Illustrative fixture only. The real sink's template must define the workshop cut.

type Slab = Pick<Part, 'size' | 'position'> & Partial<Pick<Part, 'machining'>>;

/** Maximum profile radius that actually crosses the slab, including segment intersections. */
export function basinCutout(fixture: BasinFixture, top: Pick<Part, 'size'>) {
  const lower = -top.size[1] - fixture.lift,
    upper = -fixture.lift;
  let radius = 0;
  for (let i = 0; i < fixture.profile.length - 1; i++) {
    const [r1, y1] = fixture.profile[i],
      [r2, y2] = fixture.profile[i + 1];
    if (y1 >= lower && y1 <= upper) radius = Math.max(radius, r1);
    if (y2 >= lower && y2 <= upper) radius = Math.max(radius, r2);
    if (y1 !== y2)
      for (const y of [lower, upper]) {
        const t = (y - y1) / (y2 - y1);
        if (t >= 0 && t <= 1) radius = Math.max(radius, r1 + t * (r2 - r1));
      }
  }
  const cutRadius = radius + fixture.clearance;
  return {
    radiusX: cutRadius * fixture.scaleX,
    radiusZ: cutRadius,
    bodyRadius: radius,
  };
}

/**
 * The countertop slab: a box with an optional fixture opening and an optional
 * half-round front edge, milled inside the finished dimensions.
 */
export function createCountertopGeometry(
  top: Slab,
  fixture?: BasinFixture | null,
) {
  const [w, h, d] = top.size;
  const radius = top.machining?.radius ?? 0;
  if (radius && Math.abs(radius - h / 2) > 1e-6)
    throw new Error(
      'The semicircular front must have radius equal to half the countertop thickness',
    );
  const front = d / 2 - radius;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, -front);
  shape.lineTo(w / 2, -front);
  shape.lineTo(w / 2, d / 2);
  shape.lineTo(-w / 2, d / 2);
  shape.closePath();
  if (fixture) {
    const cut = basinCutout(fixture, top),
      hole = new THREE.Path();
    // Extrusion XY becomes world XZ after -90° rotation; hence the negated Z centre.
    hole.absellipse(
      fixture.x - top.position[0],
      -(fixture.z - top.position[2]),
      cut.radiusX,
      cut.radiusZ,
      0,
      Math.PI * 2,
      true,
      0,
    );
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 128,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -h / 2, 0);
  if (!radius) return geometry;
  // Replace the front vertical wall with a smooth half-cylinder, keeping the
  // same outer bounding box. Only the front is milled; sides and back stay flat.
  const positions: number[] = [],
    normals: number[] = [];
  const pos = geometry.getAttribute('position'),
    normal = geometry.getAttribute('normal');
  for (let i = 0; i < pos.count; i += 3) {
    if ([0, 1, 2].every((j) => Math.abs(pos.getZ(i + j) - front) < 1e-4))
      continue;
    for (let j = 0; j < 3; j++) {
      positions.push(pos.getX(i + j), pos.getY(i + j), pos.getZ(i + j));
      normals.push(normal.getX(i + j), normal.getY(i + j), normal.getZ(i + j));
    }
  }
  type V = [number, number, number];
  function triangle(a: V, b: V, c: V, na: V, nb: V, nc: V) {
    positions.push(...a, ...b, ...c);
    normals.push(...na, ...nb, ...nc);
  }
  const segments = 64;
  for (let i = 0; i < segments; i++) {
    const a = (i * Math.PI) / segments,
      b = ((i + 1) * Math.PI) / segments;
    const leftA: V = [
      -w / 2,
      radius * Math.cos(a),
      front + radius * Math.sin(a),
    ];
    const rightA: V = [w / 2, leftA[1], leftA[2]];
    const leftB: V = [
      -w / 2,
      radius * Math.cos(b),
      front + radius * Math.sin(b),
    ];
    const rightB: V = [w / 2, leftB[1], leftB[2]];
    const na: V = [0, Math.cos(a), Math.sin(a)],
      nb: V = [0, Math.cos(b), Math.sin(b)];
    triangle(leftA, rightB, rightA, na, nb, na);
    triangle(leftA, leftB, rightB, na, nb, nb);
    const nl: V = [-1, 0, 0],
      nr: V = [1, 0, 0];
    triangle([-w / 2, 0, front], leftB, leftA, nl, nl, nl);
    triangle([w / 2, 0, front], rightA, rightB, nr, nr, nr);
  }
  geometry.dispose();
  const rounded = new THREE.BufferGeometry();
  rounded.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  rounded.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  rounded.computeBoundingBox();
  rounded.computeBoundingSphere();
  return rounded;
}

export function createBasinGeometry(fixture: BasinFixture) {
  return new THREE.LatheGeometry(
    fixture.profile.map(([r, y]) => new THREE.Vector2(r, y)),
    128,
  );
}
