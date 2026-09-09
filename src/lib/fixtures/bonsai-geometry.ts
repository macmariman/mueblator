import * as THREE from 'three';
import type { BonsaiFixture } from '../spec.ts';

/**
 * The bonsai drawn on the table. Illustrative only: it shows what the piece is
 * for and how much room the tree takes, and nothing in the cut list depends on
 * it. A real tree is not this tidy.
 */

/** Same seed, same tree, so the drawing does not change between reloads. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A tube that thins along its length: a trunk, a branch. */
function taperedTube(
  points: THREE.Vector3[],
  radiusStart: number,
  radiusEnd: number,
  segments = 26,
  radial = 10,
) {
  const curve = new THREE.CatmullRomCurve3(points),
    frames = curve.computeFrenetFrames(segments, false);
  const position: number[] = [],
    normal: number[] = [],
    index: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments,
      centre = curve.getPointAt(t),
      radius = radiusStart + (radiusEnd - radiusStart) * t,
      n = frames.normals[i],
      b = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const angle = (j / radial) * Math.PI * 2,
        cos = Math.cos(angle),
        sin = Math.sin(angle);
      const nx = cos * n.x + sin * b.x,
        ny = cos * n.y + sin * b.y,
        nz = cos * n.z + sin * b.z;
      position.push(
        centre.x + nx * radius,
        centre.y + ny * radius,
        centre.z + nz * radius,
      );
      normal.push(nx, ny, nz);
    }
  }
  for (let i = 0; i < segments; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j,
        b = a + radial + 1;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  geometry.setIndex(index);
  return geometry;
}

/** A foliage pad: a low-poly blob, flattened the way a pruned canopy is. */
function pad(radius: number, rand: () => number) {
  const geometry = new THREE.IcosahedronGeometry(radius, 1),
    p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const scale = 0.86 + rand() * 0.28;
    p.setXYZ(i, p.getX(i) * scale, p.getY(i) * scale * 0.52, p.getZ(i) * scale);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The whole tree, positioned so that y = 0 is the surface the pot rests on.
 * The caller only has to move the group up to the top of the piece.
 */
export function createBonsai(fixture: BonsaiFixture) {
  const { pot, height, spread } = fixture,
    rand = random(fixture.seed ?? 7),
    group = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({
      color: '#6f5540',
      roughness: 0.95,
      flatShading: true,
    }),
    leaf = new THREE.MeshStandardMaterial({
      color: '#4f7d46',
      roughness: 0.92,
      flatShading: true,
    }),
    clay = new THREE.MeshStandardMaterial({ color: '#8a5746', roughness: 0.72 }),
    soil = new THREE.MeshStandardMaterial({ color: '#4a4038', roughness: 1 });

  const add = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };

  // Pot: four feet, a tapered body and the lip every bonsai pot has.
  const footHeight = Math.min(16, pot.height * 0.24),
    rimHeight = Math.min(14, pot.height * 0.2),
    bodyHeight = pot.height - footHeight - rimHeight;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      add(
        new THREE.BoxGeometry(26, footHeight, 26),
        clay,
      ).position.set(sx * (pot.width / 2 - 38), footHeight / 2, sz * (pot.depth / 2 - 32));
  // Four radial segments make a box; the 45° turn puts its faces back on the axes.
  const body = add(
    new THREE.CylinderGeometry(
      (pot.width / 2 - 6) * Math.SQRT2,
      (pot.width / 2 - 26) * Math.SQRT2,
      bodyHeight,
      4,
    ),
    clay,
  );
  body.rotation.y = Math.PI / 4;
  body.scale.z = pot.depth / pot.width;
  body.position.y = footHeight + bodyHeight / 2;
  add(new THREE.BoxGeometry(pot.width, rimHeight, pot.depth), clay).position.y =
    pot.height - rimHeight / 2;
  add(
    new THREE.BoxGeometry(pot.width - 26, 10, pot.depth - 26),
    soil,
  ).position.y = pot.height - rimHeight - 1;

  // Trunk: leans out of the pot, comes back over it, and thins as it climbs.
  const trunkTop = height * 0.6,
    lean = spread * 0.2;
  const trunk = [
    new THREE.Vector3(-lean * 0.3, pot.height - 18, 0),
    new THREE.Vector3(lean * 0.5, pot.height + trunkTop * 0.3, spread * 0.05),
    new THREE.Vector3(-lean * 0.6, pot.height + trunkTop * 0.62, -spread * 0.04),
    new THREE.Vector3(lean * 0.7, pot.height + trunkTop * 0.88, spread * 0.03),
    new THREE.Vector3(lean * 0.6, pot.height + trunkTop, 0),
  ];
  add(taperedTube(trunk, height * 0.075, height * 0.028), bark);
  const curve = new THREE.CatmullRomCurve3(trunk);

  // Three branches, then a pad of foliage at the end of each and one on top.
  const canopy: { at: THREE.Vector3; radius: number }[] = [];
  for (const [t, direction, rise] of [
    [0.42, -1, 0.16],
    [0.66, 1, 0.13],
    [0.86, -1, 0.09],
  ] as [number, number, number][]) {
    const from = curve.getPointAt(t),
      reach = spread * (0.34 + rand() * 0.12),
      lift = height * rise;
    const end = new THREE.Vector3(
      from.x + direction * reach,
      from.y + lift,
      from.z + (rand() - 0.5) * spread * 0.16,
    );
    add(
      taperedTube(
        [
          from,
          new THREE.Vector3(
            from.x + direction * reach * 0.45,
            from.y + lift * 0.75,
            from.z + (end.z - from.z) * 0.4,
          ),
          end,
        ],
        height * 0.026,
        height * 0.011,
        14,
        8,
      ),
      bark,
    );
    canopy.push({ at: end, radius: spread * (0.3 + rand() * 0.07) });
  }
  const crown = curve.getPointAt(1);
  canopy.push({
    at: new THREE.Vector3(crown.x, crown.y + height * 0.08, crown.z),
    radius: spread * 0.33,
  });
  for (const { at, radius } of canopy)
    add(pad(radius, rand), leaf).position.copy(at);

  group.position.x = fixture.x;
  group.position.z = fixture.z;
  return group;
}
