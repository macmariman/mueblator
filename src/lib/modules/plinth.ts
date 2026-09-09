import { createPart, type BuildContext } from './context.ts';
import type { Part, PlinthModule, Vec3 } from '../spec.ts';

/** Front skirt under the doors, hung off the base instead of standing on the floor. */
export function buildPlinth(module: PlinthModule, ctx: BuildContext): Part[] {
  const { frame } = ctx,
    thickness = ctx.material(module.material).thickness;
  const size: Vec3 = [frame.width, module.height, thickness];
  return [
    createPart(ctx, module, {
      name: module.name ?? 'Zócalo frontal',
      size,
      position: [
        0,
        module.floorGap + module.height / 2,
        frame.structureZ - thickness / 2,
      ],
      explode: [0, -0.045 * frame.topHeight, 0.35 * frame.depth],
    }),
  ];
}
