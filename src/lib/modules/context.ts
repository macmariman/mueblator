import { resolveEdging } from '../edging.ts';
import { cutOrder } from '../units.ts';
import type { DesignSpec, MaterialSpec, ModuleSpec, Part, Vec3 } from '../spec.ts';

/**
 * Reference planes shared by every module, derived from the opening plus the
 * countertop and door modules. Modules place themselves against these instead
 * of carrying absolute coordinates.
 */
export type Frame = {
  width: number;
  depth: number;
  /** Free height of the recess. */
  openingHeight: number;
  halfWidth: number;
  halfDepth: number;
  /** Back wall face. */
  backZ: number;
  /** Front edge of the piece. */
  frontZ: number;
  /** Underside of the countertop, i.e. what it rests on. */
  undersideHeight: number;
  /** Top surface of the assembled piece. */
  topHeight: number;
  /** Visible plane of the fronts. */
  facadeZ: number;
  /** Plane just behind the fronts, where the structure sits. */
  structureZ: number;
  /** Setback of the fronts against the front edge. */
  setback: number;
};

export type BuildContext = {
  spec: DesignSpec;
  frame: Frame;
  /** Boards emitted so far, so a module can refer to an earlier one. */
  parts: Part[];
  material: (id: string) => MaterialSpec;
  nextId: (prefix: string) => string;
};

/** Look up a board already emitted, by reference. */
export function partById(ctx: BuildContext, id: string) {
  const found = ctx.parts.find((p) => p.id === id);
  if (!found)
    throw new Error(
      `The module refers to "${id}", which no earlier module produced.`,
    );
  return found;
}

type PartDraft = {
  name: string;
  size: Vec3;
  position: Vec3;
  explode: Vec3;
  role?: Part['role'];
  side?: -1 | 1;
  handle?: boolean;
  machining?: Part['machining'];
  /** Fallback group when the design file does not name one. */
  group?: string;
  /** Overrides the module id, for modules emitting several boards. */
  id?: string;
};

/** Turn a placed box into a full part: material, cut order, banding and notes. */
export function createPart(
  ctx: BuildContext,
  module: ModuleSpec,
  draft: PartDraft,
): Part {
  const material = ctx.material(module.material);
  const id =
    draft.id ??
    module.id ??
    ctx.nextId(module.idPrefix ?? module.kind.slice(0, 1).toUpperCase());
  return {
    id,
    name: draft.name,
    size: draft.size,
    position: draft.position,
    cut: cutOrder(draft.size, material.thickness),
    materialId: material.id,
    material: material.label,
    materialShort: material.short,
    machining: draft.machining,
    edging: resolveEdging(module.edging),
    note: module.note ?? '',
    group: module.group ?? draft.group ?? 'Estructura',
    explode: module.explode ?? draft.explode,
    role: draft.role ?? 'board',
    side: draft.side,
    handle: draft.handle,
  };
}

/** Mirror an explode offset for the left/right copies of a module. */
export const mirror = (v: Vec3, side: -1 | 1): Vec3 => [side * v[0], v[1], v[2]];
