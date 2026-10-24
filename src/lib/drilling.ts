/**
 * Drilling plans: where every hole of the piece goes, board by board.
 *
 * Nothing here is drawn by hand. The holes follow from the placed boards: a
 * confirmat wherever the edge of one board meets the face of another, a cup
 * and a mounting plate for every hinge, four pins under every loose shelf.
 * Every position is a proposal — a hinge or a handle model can move them — and
 * every hole says who drills it, because the manual reads differently when the
 * workshop delivers the boards drilled.
 *
 * Plans are measured the way a carpenter measures: from named physical edges
 * ("a 50 mm del canto delantero"), never from a corner of the drawing, so a
 * left and a right board with the same holes share one plan.
 */

import { hingesForLeaf, type ModuleParts } from './hardware.ts';
import type { DesignSpec, DrillBy, Part, Vec3 } from './spec.ts';

export type HoleKind = 'confirmat' | 'hinge-cup' | 'hinge-plate' | 'shelf-pin';

type Axis = 0 | 1 | 2;
type Sign = 1 | -1;

export type Hole = {
  kind: HoleKind;
  /** Board being drilled. */
  board: string;
  /** Centre of the hole on the face it is drilled from. */
  at: Vec3;
  /** The drill runs along this axis, into the board from the `sign` side. */
  axis: Axis;
  sign: Sign;
  diameter: number;
  /** Null for a hole right through the board. */
  depth: number | null;
  by: DrillBy;
  /** What the hole is for: the door, the loose shelf, the drilled board itself. */
  serves: string;
  /** For a confirmat, the board whose edge takes the screw. */
  into?: string;
};

export type PlanMark = {
  index: number;
  kind: HoleKind;
  diameter: number;
  depth: number | null;
  face: string;
  /** Distances to the two reference edges, as the table prints them. */
  distances: { edge: string; mm: number }[];
  by: DrillBy;
  /** Position on the drawing, in millimetres from its top left corner. */
  x: number;
  y: number;
  /** Blind hole on the face the drawing does not show. */
  hidden: boolean;
  into?: string;
};

export type DrillPlan = {
  /** Every board this plan applies to: a left and a right one often share it. */
  ids: string[];
  name: string;
  /** Drawing size in millimetres: the board as seen from `view`. */
  width: number;
  height: number;
  view: string;
  edges: { top: string; bottom: string; left: string; right: string };
  marks: PlanMark[];
};

export type Drilling = { holes: Hole[]; plans: DrillPlan[] };

const eps = 0.001;
/** Confirmat: 50 mm in from each end of a joint, at most 250 mm apart. */
const screwInset = 50,
  screwSpacing = 250;
/** Cup hinge: cup centre from the hinge edge, and from the ends of the leaf. */
const cupFromEdge = 22.5,
  hingeFromEnd = 100;
/** Mounting plate: holes 37 mm back from the front edge, 32 mm apart. */
const plateSetback = 37,
  plateSpacing = 32;
/** Shelf pins: in from the front and back of the shelf, just under it. */
const pinInset = 40,
  pinBelow = 6;

const lo = (p: Part, a: number) => p.position[a] - p.size[a] / 2;
const hi = (p: Part, a: number) => p.position[a] + p.size[a] / 2;

/** The axis a board is thin along: its thickness, the third figure of the cut. */
function thicknessAxis(p: Part): Axis {
  const t = p.cut[2];
  const found = [0, 1, 2].filter((a) => Math.abs(p.size[a] - t) < eps);
  return found[found.length - 1] as Axis;
}

const offCentre = (p: Part) => Math.abs(p.position[0]) > 1;
const outward = (p: Part): Sign => (p.position[0] < 0 ? -1 : 1);

/** Name of the face of `p` whose outward normal is `sign` along `axis`. */
function faceName(p: Part, axis: Axis, sign: Sign) {
  if (axis === 1) return sign < 0 ? 'cara de abajo' : 'cara de arriba';
  if (axis === 2) {
    if (p.role === 'door') return sign < 0 ? 'cara interior' : 'cara exterior';
    return sign < 0 ? 'cara de atrás' : 'cara de adelante';
  }
  if (!offCentre(p)) return sign < 0 ? 'cara izquierda' : 'cara derecha';
  return sign === outward(p) ? 'cara hacia afuera' : 'cara hacia el centro';
}

/** Name of the edge of `p` on the `sign` side along `axis`. */
function edgeName(p: Part, axis: Axis, sign: Sign) {
  if (axis === 1) return sign < 0 ? 'inferior' : 'superior';
  if (axis === 2) return sign < 0 ? 'trasero' : 'delantero';
  if (p.role === 'door' && p.side)
    return sign === p.side ? 'de bisagras' : 'de cierre';
  if (!offCentre(p)) return sign < 0 ? 'izquierdo' : 'derecho';
  return sign === outward(p) ? 'hacia afuera' : 'hacia el centro';
}

/** Which edge distances along `axis` are measured from. */
function referenceSign(p: Part, axis: Axis): Sign {
  if (axis === 1) return -1;
  if (axis === 2) return 1;
  if (p.role === 'door' && p.side) return p.side;
  return offCentre(p) ? outward(p) : -1;
}

/** Evenly spaced screw positions over a joint running from `a` to `b`. */
function screwPositions(a: number, b: number) {
  const length = b - a;
  if (length < 2 * screwInset) return [(a + b) / 2];
  const count = Math.max(
    2,
    Math.ceil((length - 2 * screwInset) / screwSpacing) + 1,
  );
  const step = (length - 2 * screwInset) / (count - 1);
  return Array.from({ length: count }, (_, i) => a + screwInset + i * step);
}

/**
 * Where two boards meet edge to face, the screw goes through the face board
 * into the edge of the other one. Face to face and edge to edge contacts are
 * not joints this knows how to screw, so they are left alone.
 */
function jointHoles(parts: Part[], by: DrillBy, exclude: Set<string>): Hole[] {
  const boards = parts.filter((p) => p.role === 'board' && !exclude.has(p.id));
  const holes: Hole[] = [];
  for (let i = 0; i < boards.length; i++)
    for (let j = i + 1; j < boards.length; j++) {
      const a = boards[i],
        b = boards[j];
      for (const k of [0, 1, 2] as Axis[]) {
        // Normal of the contact plane, pointing from a towards b.
        const towards: Sign | 0 =
          Math.abs(lo(b, k) - hi(a, k)) < eps
            ? 1
            : Math.abs(lo(a, k) - hi(b, k)) < eps
              ? -1
              : 0;
        if (!towards) continue;
        const others = ([0, 1, 2] as Axis[]).filter((x) => x !== k);
        const overlaps = others.map(
          (x) => Math.min(hi(a, x), hi(b, x)) - Math.max(lo(a, x), lo(b, x)),
        );
        if (overlaps.some((o) => o <= eps)) continue;
        const ta = thicknessAxis(a),
          tb = thicknessAxis(b);
        let face: Part, edge: Part, facing: Sign;
        if (ta === k && tb !== k) [face, edge, facing] = [a, b, towards];
        else if (tb === k && ta !== k)
          [face, edge, facing] = [b, a, (-towards) as Sign];
        else continue;
        // Across the edge board's thickness sits the screw line; along the
        // remaining axis the screws are spread.
        const across = thicknessAxis(edge),
          along = (3 - k - across) as Axis;
        const from = Math.max(lo(face, along), lo(edge, along)),
          to = Math.min(hi(face, along), hi(edge, along));
        // Drilled from the side of the face board away from the joint.
        const entry: Sign = (-facing) as Sign;
        for (const t of screwPositions(from, to)) {
          const at: Vec3 = [0, 0, 0];
          at[k] = entry > 0 ? hi(face, k) : lo(face, k);
          at[across] = edge.position[across];
          at[along] = t;
          holes.push({
            kind: 'confirmat',
            board: face.id,
            at,
            axis: k,
            sign: entry,
            diameter: 7,
            depth: null,
            by,
            serves: face.id,
            into: edge.id,
          });
        }
      }
    }
  return holes;
}

/** Cups on each leaf and, when asked for, pilot holes for the mounting plates. */
function hingeHoles(
  spec: DesignSpec,
  byModule: ModuleParts[],
  parts: Part[],
): Hole[] {
  const holes: Hole[] = [];
  const plates = spec.drilling?.hingePlates;
  for (const { module, parts: leaves } of byModule) {
    if (module.kind !== 'doors') continue;
    const cupsBy: DrillBy = module.cupBoring === 'workshop' ? 'workshop' : 'home';
    for (const leaf of leaves) {
      if (!leaf.side) continue;
      const side = leaf.side,
        hingeX = side < 0 ? lo(leaf, 0) : hi(leaf, 0),
        bottom = lo(leaf, 1),
        top = hi(leaf, 1);
      const count = module.hingesPerLeaf ?? hingesForLeaf(leaf.size[1]);
      const heights = Array.from({ length: count }, (_, i) =>
        count === 1
          ? (bottom + top) / 2
          : bottom +
            hingeFromEnd +
            (i * (top - bottom - 2 * hingeFromEnd)) / (count - 1),
      );
      for (const y of heights)
        holes.push({
          kind: 'hinge-cup',
          board: leaf.id,
          at: [hingeX - side * cupFromEdge, y, lo(leaf, 2)],
          axis: 2,
          sign: -1,
          diameter: 35,
          depth: 13,
          by: cupsBy,
          serves: leaf.id,
        });
      if (!plates) continue;
      // The board the leaf hangs from: right behind it, under its hinge edge.
      const probe = hingeX - side * 5;
      const carcass = parts.find(
        (p) =>
          p.role === 'board' &&
          Math.abs(hi(p, 2) - lo(leaf, 2)) < eps &&
          lo(p, 0) <= probe &&
          probe <= hi(p, 0) &&
          lo(p, 1) < top &&
          hi(p, 1) > bottom &&
          thicknessAxis(p) === 0,
      );
      if (!carcass) continue;
      // The plate sits on the face that looks towards the middle of the leaf.
      const sign = (-side) as Sign;
      for (const y of heights)
        for (const dy of [-plateSpacing / 2, plateSpacing / 2])
          holes.push({
            kind: 'hinge-plate',
            board: carcass.id,
            at: [
              sign > 0 ? hi(carcass, 0) : lo(carcass, 0),
              y + dy,
              hi(carcass, 2) - plateSetback,
            ],
            axis: 0,
            sign,
            diameter: 3,
            depth: 10,
            by: plates.by,
            serves: leaf.id,
          });
    }
  }
  return holes;
}

/** Four pins under each loose shelf, in the boards that face its two ends. */
function pinHoles(spec: DesignSpec, parts: Part[]): Hole[] {
  const pins = spec.drilling?.shelfPins;
  if (!pins) return [];
  const holes: Hole[] = [];
  for (const id of pins.parts) {
    const shelf = parts.find((p) => p.id === id);
    if (!shelf) throw new Error(`Shelf pins name "${id}", which is not a board.`);
    const y = lo(shelf, 1) - pinBelow;
    for (const end of [-1, 1] as Sign[]) {
      const tip = end > 0 ? hi(shelf, 0) : lo(shelf, 0);
      // The nearest board face across a small gap at that end of the shelf.
      const neighbour = parts
        .filter(
          (p) =>
            p.role === 'board' &&
            thicknessAxis(p) === 0 &&
            lo(p, 1) < y &&
            hi(p, 1) > y &&
            lo(p, 2) <= lo(shelf, 2) &&
            hi(p, 2) >= hi(shelf, 2),
        )
        .map((p) => ({
          p,
          gap: end > 0 ? lo(p, 0) - tip : tip - hi(p, 0),
        }))
        .filter(({ gap }) => gap >= -eps && gap <= 5)
        .sort((a, b) => a.gap - b.gap)[0]?.p;
      if (!neighbour) continue;
      const sign = (-end) as Sign;
      for (const z of [lo(shelf, 2) + pinInset, hi(shelf, 2) - pinInset])
        holes.push({
          kind: 'shelf-pin',
          board: neighbour.id,
          at: [sign > 0 ? hi(neighbour, 0) : lo(neighbour, 0), y, z],
          axis: 0,
          sign,
          diameter: 5,
          depth: 10,
          by: pins.by,
          serves: shelf.id,
        });
    }
  }
  return holes;
}

const baseName = (p: Part) =>
  p.name.replace(/ (izquierda|derecha|izquierdo|derecho)$/, '');

const kindOrder: HoleKind[] = ['confirmat', 'hinge-plate', 'shelf-pin', 'hinge-cup'];

/** One board's holes, laid out on a drawing seen from the face it is drilled from. */
function planFor(p: Part, holes: Hole[]): Omit<DrillPlan, 'ids'> {
  // Look at the face with the blind holes, if any: those are the ones that
  // must not be drilled from the wrong side. Otherwise, the screw entry face.
  const blind = holes.filter((h) => h.depth !== null);
  const faces = new Map<string, { axis: Axis; sign: Sign; count: number }>();
  for (const h of blind.length ? blind : holes) {
    const key = `${h.axis}:${h.sign}`,
      found = faces.get(key);
    if (found) found.count++;
    else faces.set(key, { axis: h.axis, sign: h.sign, count: 1 });
  }
  const { axis: n, sign: s } = [...faces.values()].sort(
    (a, b) => b.count - a.count,
  )[0];
  const inPlane = ([0, 1, 2] as Axis[]).filter((a) => a !== n);
  // Up is the height when the board stands, the back when it lies flat.
  const up: { axis: Axis; sign: Sign } =
    n !== 1 ? { axis: 1, sign: 1 } : { axis: 2, sign: -1 };
  const rightAxis = inPlane.find((a) => a !== up.axis) as Axis;
  // right = up × normal, which only ever has one non-zero component here.
  const cross = (u: Vec3, v: Vec3): Vec3 => [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  const unit = (axis: Axis, sign: Sign): Vec3 => {
    const v: Vec3 = [0, 0, 0];
    v[axis] = sign;
    return v;
  };
  const rightSign = cross(unit(up.axis, up.sign), unit(n, s))[rightAxis] as Sign;
  const width = p.size[rightAxis],
    height = p.size[up.axis];
  const refs = inPlane.map((a) => ({ axis: a, sign: referenceSign(p, a) }));
  const marks = holes
    .map((h) => {
      const u = (h.at[rightAxis] - p.position[rightAxis]) * rightSign,
        v = (h.at[up.axis] - p.position[up.axis]) * up.sign;
      return {
        kind: h.kind,
        diameter: h.diameter,
        depth: h.depth,
        face: faceName(p, h.axis, h.sign),
        distances: refs.map(({ axis, sign }) => ({
          edge: `canto ${edgeName(p, axis, sign)}`,
          mm:
            Math.round(
              (sign > 0 ? hi(p, axis) - h.at[axis] : h.at[axis] - lo(p, axis)) * 10,
            ) / 10,
        })),
        by: h.by,
        x: width / 2 + u,
        y: height / 2 - v,
        hidden: h.depth !== null && !(h.axis === n && h.sign === s),
        into: h.into,
      };
    })
    // Ordered by the measured distances, not by the drawing, so a left and a
    // right board number their holes alike and share a plan.
    .sort(
      (a, b) =>
        kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind) ||
        a.distances[0].mm - b.distances[0].mm ||
        a.distances[1].mm - b.distances[1].mm,
    )
    .map((m, i) => ({ ...m, index: i + 1 }));
  return {
    name: baseName(p),
    width,
    height,
    view: faceName(p, n, s),
    edges: {
      top: edgeName(p, up.axis, up.sign),
      bottom: edgeName(p, up.axis, (-up.sign) as Sign),
      left: edgeName(p, rightAxis, (-rightSign) as Sign),
      right: edgeName(p, rightAxis, rightSign),
    },
    marks,
  };
}

/** What makes two plans the same drawing: size and every hole as measured. */
const signature = (plan: Omit<DrillPlan, 'ids'>) =>
  JSON.stringify([
    plan.name,
    plan.width,
    plan.height,
    plan.view,
    plan.marks.map(({ kind, diameter, depth, face, distances, by }) => [
      kind,
      diameter,
      depth,
      face,
      distances,
      by,
    ]),
  ]);

/**
 * Every hole of a design and the plans that show them, grouped so that boards
 * drilled alike share one plan. Empty unless the design declares `drilling`.
 */
export function buildDrilling(
  spec: DesignSpec,
  byModule: ModuleParts[],
  parts: Part[],
): Drilling {
  if (!spec.drilling) return { holes: [], plans: [] };
  const joints = spec.drilling.joints;
  const holes = [
    ...(joints ? jointHoles(parts, joints.by, new Set(joints.exclude ?? [])) : []),
    ...hingeHoles(spec, byModule, parts),
    ...pinHoles(spec, parts),
  ];
  const plans: DrillPlan[] = [];
  for (const p of parts) {
    const own = holes.filter((h) => h.board === p.id);
    if (own.length === 0) continue;
    const plan = planFor(p, own);
    const same = plans.find((q) => signature(q) === signature(plan));
    if (same) same.ids.push(p.id);
    else plans.push({ ids: [p.id], ...plan });
  }
  return { holes, plans };
}

export const holeLabels: Record<HoleKind, string> = {
  confirmat: 'Confirmat',
  'hinge-cup': 'Cazoleta de bisagra',
  'hinge-plate': 'Base de bisagra',
  'shelf-pin': 'Soporte de estante',
};

export const drillByLabels: Record<DrillBy, string> = {
  workshop: 'Taller',
  home: 'En casa',
  pending: 'Por definir',
};

/** Diameter and depth as the plan prints them. */
export function holeSize(m: Pick<PlanMark, 'kind' | 'diameter' | 'depth' | 'into'>) {
  if (m.depth === null)
    return m.kind === 'confirmat'
      ? `Ø${m.diameter} pasante, avellanado${m.into ? `; Ø5 en el canto de ${m.into}` : ''}`
      : `Ø${m.diameter} pasante`;
  return `Ø${m.diameter} × ${m.depth} mm`;
}
