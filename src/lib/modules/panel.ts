import { createPart, type BuildContext } from './context.ts';
import type { PanelModule, Part, Vec3 } from '../spec.ts';

/** Horizontal board spanning the opening: a raised base, a shelf, a divider. */
export function buildPanel(module: PanelModule, ctx: BuildContext): Part[] {
  const { frame } = ctx,
    thickness = ctx.material(module.material).thickness;
  const backZ = frame.backZ + (module.backGap ?? 0);
  // 'to-structure' stops the board right behind the fronts, clear of the doors.
  const depth =
    module.depth === 'to-structure' ? frame.structureZ - backZ : module.depth;
  const size: Vec3 = [
    frame.width - 2 * (module.widthInset ?? 0),
    thickness,
    depth,
  ];
  const z = backZ + depth / 2;
  const low = module.undersideHeight < frame.topHeight / 2;
  return [
    createPart(ctx, module, {
      name: module.name ?? 'Panel horizontal',
      group: 'Interior',
      size,
      position: [0, module.undersideHeight + thickness / 2, z],
      explode: low
        ? [0, -0.1 * frame.topHeight, 0]
        : [0, 0.08 * frame.topHeight, -0.235 * frame.depth],
    }),
  ];
}
