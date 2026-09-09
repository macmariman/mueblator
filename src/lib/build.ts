import { builders } from './modules/index.ts';
import type { BuildContext, Frame } from './modules/index.ts';
import {
  buildHardware,
  type HardwareLine,
  type ModuleParts,
} from './hardware.ts';
import { cm, fmt } from './units.ts';
import type {
  Annotation,
  DesignSpec,
  DimensionLine,
  FixtureSpec,
  MaterialSpec,
  ModuleSpec,
  Part,
  Vec3,
} from './spec.ts';

export type WallBox = { size: Vec3; position: Vec3 };

export type CameraRig = {
  target: Vec3;
  /** Named viewpoints, already scaled to the size of the piece. */
  views: Record<'perspective' | 'front' | 'side' | 'top' | 'print', Vec3>;
  minDistance: number;
  maxDistance: number;
  /** Ground plane and helper grid, sized to the piece. */
  floorSize: number;
  gridSize: number;
  gridDivisions: number;
};

/** Boards that share group, cut size and banding are listed once, with a quantity. */
export type CutGroup = { part: Part; ids: string[]; quantity: number };

export type Model = {
  spec: DesignSpec;
  frame: Frame;
  parts: Part[];
  groups: CutGroup[];
  /** Hinges, screws and plugs: declared by the design or proposed by a module. */
  hardware: HardwareLine[];
  walls: WallBox[];
  fixtures: FixtureSpec[];
  dimensions: DimensionLine[];
  annotations: Annotation[];
  highlights: { value: string; label: string }[];
  printSubtitle: string;
  camera: CameraRig;
};

const wallThickness = 10;

function findMaterial(spec: DesignSpec, id: string): MaterialSpec {
  const found = spec.materials.find((m) => m.id === id);
  if (!found)
    throw new Error(
      `Unknown material "${id}". Declare it in the materials list of "${spec.id}".`,
    );
  return found;
}

/** Reference planes derived from the opening plus the countertop and door modules. */
function buildFrame(spec: DesignSpec): Frame {
  const { width, depth, height } = spec.opening,
    material = (id: string) => findMaterial(spec, id);
  const countertop = spec.modules.find((m) => m.kind === 'countertop'),
    doors = spec.modules.find((m) => m.kind === 'doors');
  const topThickness = countertop ? material(countertop.material).thickness : 0,
    undersideHeight = countertop ? countertop.undersideHeight : height,
    setback = doors?.setback ?? 0,
    facadeZ = depth / 2 - setback;
  return {
    width,
    depth,
    openingHeight: height,
    halfWidth: width / 2,
    halfDepth: depth / 2,
    backZ: -depth / 2,
    frontZ: depth / 2,
    undersideHeight,
    topHeight: undersideHeight + topThickness,
    facadeZ,
    structureZ: facadeZ - (doors ? material(doors.material).thickness : 0),
    setback,
  };
}

/** The boards of the piece, and which module produced each of them. */
function buildParts(
  spec: DesignSpec,
  frame: Frame,
): { parts: Part[]; byModule: ModuleParts[] } {
  const counters = new Map<string, number>();
  const parts: Part[] = [];
  const ctx: BuildContext = {
    spec,
    frame,
    parts,
    material: (id) => findMaterial(spec, id),
    nextId: (prefix) => {
      const next = (counters.get(prefix) ?? 0) + 1;
      counters.set(prefix, next);
      return `${prefix}${String(next).padStart(2, '0')}`;
    },
  };
  const byModule: ModuleParts[] = [];
  for (const module of spec.modules) {
    const build = builders[module.kind] as (
      m: ModuleSpec,
      c: BuildContext,
    ) => Part[];
    const made = build(module, ctx);
    byModule.push({ module, parts: made });
    parts.push(...made);
  }
  const seen = new Set<string>();
  for (const part of parts) {
    if (seen.has(part.id))
      throw new Error(`Duplicate reference "${part.id}" in "${spec.id}".`);
    seen.add(part.id);
  }
  return { parts, byModule };
}

/** Identical boards are cut once and listed with their quantity. */
function groupParts(parts: Part[]): CutGroup[] {
  return parts.reduce<CutGroup[]>((acc, part) => {
    const found = acc.find(
      (row) =>
        row.part.group === part.group &&
        row.part.cut.every((v, i) => v === part.cut[i]) &&
        JSON.stringify(row.part.edging) === JSON.stringify(part.edging),
    );
    if (found) {
      found.ids.push(part.id);
      found.quantity++;
    } else acc.push({ part, ids: [part.id], quantity: 1 });
    return acc;
  }, []);
}

function buildWalls(spec: DesignSpec, frame: Frame): WallBox[] {
  const walls = spec.opening.walls ?? { left: true, right: true, back: true },
    height = frame.openingHeight,
    half = wallThickness / 2,
    boxes: WallBox[] = [];
  if (walls.back !== false)
    boxes.push({
      size: [frame.width, height, wallThickness],
      position: [0, height / 2, frame.backZ - half],
    });
  for (const [present, side] of [
    [walls.left !== false, -1],
    [walls.right !== false, 1],
  ] as [boolean, number][])
    if (present)
      boxes.push({
        size: [wallThickness, height, frame.depth],
        position: [side * (frame.halfWidth + half), height / 2, 0],
      });
  return boxes;
}

/** Name of the reference footprint: the recess for a built-in, the piece itself otherwise. */
export const openingLabel = (spec: DesignSpec) => spec.opening.label ?? 'Hueco';

/** Width, height and depth of the piece, drawn around the model. */
function buildDimensions(spec: DesignSpec, frame: Frame): DimensionLine[] {
  const auto: DimensionLine[] = [
    {
      from: [-frame.halfWidth, 35, frame.halfDepth + 85],
      to: [frame.halfWidth, 35, frame.halfDepth + 85],
      text: `${openingLabel(spec)} ${fmt(frame.width)} mm`,
      offset: [0, -36, 0],
    },
    {
      from: [-frame.halfWidth - 101, 0, frame.halfDepth + 15],
      to: [-frame.halfWidth - 101, frame.topHeight, frame.halfDepth + 15],
      text: `Altura ${fmt(frame.topHeight)} mm`,
      offset: [-60, 0, 0],
    },
    {
      from: [frame.halfWidth + 81, frame.topHeight + 20, -frame.halfDepth],
      to: [frame.halfWidth + 81, frame.topHeight + 20, frame.halfDepth],
      text: `Fondo ${fmt(frame.depth)} mm`,
      offset: [35, 35, 0],
    },
  ];
  return [...auto, ...(spec.dimensions ?? [])];
}

function buildAnnotations(spec: DesignSpec, frame: Frame): Annotation[] {
  const auto: Annotation[] = frame.setback
    ? [
        {
          text: `Retiro del frente ${fmt(frame.setback)} mm`,
          at: [0, frame.undersideHeight - 25, frame.halfDepth + 100],
        },
      ]
    : [];
  return [...auto, ...(spec.annotations ?? [])];
}

/** Viewpoints and limits scaled to the diagonal of the piece. */
function buildCamera(frame: Frame): CameraRig {
  const diagonal = Math.hypot(frame.width, frame.topHeight, frame.depth);
  const at = (direction: Vec3, factor: number): Vec3 => {
    const length = Math.hypot(...direction) || 1,
      distance = (diagonal * factor) / length;
    return [
      direction[0] * distance,
      frame.topHeight / 2 + direction[1] * distance,
      direction[2] * distance,
    ];
  };
  return {
    target: [0, frame.topHeight / 2, 0],
    views: {
      perspective: at([0.58, 0.283, 0.743], 1.63),
      front: at([0, 0.016, 1], 1.47),
      side: at([1, 0.11, 0], 1.48),
      top: at([0, 1, 0.0006], 1.36),
      print: at([0.562, 0.324, 0.765], 1.72),
    },
    minDistance: diagonal * 0.46,
    maxDistance: diagonal * 3.3,
    floorSize: diagonal * 5.4,
    gridSize: Math.round((diagonal * 2) / 100) * 100,
    gridDivisions: 26,
  };
}

function buildHighlights(spec: DesignSpec, frame: Frame, parts: Part[]) {
  if (spec.highlights) return spec.highlights;
  const top = parts.find((p) => p.role === 'countertop');
  return [
    { value: cm(frame.width), label: `${openingLabel(spec)} de referencia` },
    top
      ? { value: cm(top.size[0]), label: 'Ancho de tapa' }
      : { value: cm(frame.depth), label: 'Fondo' },
    { value: cm(frame.topHeight), label: 'Altura total' },
    frame.setback
      ? { value: cm(frame.setback), label: 'Retiro del frente' }
      : { value: `${parts.length}`, label: 'Piezas' },
  ];
}

/**
 * Turn a design specification into everything the app shows: placed boards,
 * grouped cut list, walls, dimensions and camera. Pure function, no side effects.
 */
export function buildDesign(spec: DesignSpec): Model {
  const frame = buildFrame(spec),
    { parts, byModule } = buildParts(spec, frame);
  const printSubtitle =
    spec.printSubtitle ??
    `${openingLabel(spec)}: ${fmt(frame.width)} × ${fmt(frame.depth)} mm · cara inferior de tapa: ${fmt(frame.undersideHeight)} mm · altura total de referencia: ${fmt(frame.topHeight)} mm.`;
  return {
    spec,
    frame,
    parts,
    groups: groupParts(parts),
    hardware: buildHardware(spec, byModule),
    walls: buildWalls(spec, frame),
    fixtures: spec.fixtures ?? [],
    dimensions: buildDimensions(spec, frame),
    annotations: buildAnnotations(spec, frame),
    highlights: buildHighlights(spec, frame, parts),
    printSubtitle,
    camera: buildCamera(frame),
  };
}
