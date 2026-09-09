import { createPart, type BuildContext } from './context.ts';
import type { CountertopModule, Part, Vec3 } from '../spec.ts';

/** Slab resting on the opening: the worktop, a desk top, a shelf board on legs. */
export function buildCountertop(
  module: CountertopModule,
  ctx: BuildContext,
): Part[] {
  const { frame } = ctx,
    thickness = ctx.material(module.material).thickness;
  const size: Vec3 = [
    frame.width - (module.clearance ?? 0),
    thickness,
    module.depth,
  ];
  return [
    createPart(ctx, module, {
      name: module.name ?? 'Tapa',
      group: 'Tapa',
      size,
      position: [0, module.undersideHeight + thickness / 2, 0],
      explode: [0, 0.26 * frame.topHeight, 0],
      role: 'countertop',
      machining: module.frontRadius
        ? {
            kind: 'semicircular-front',
            radius: module.frontRadius,
            status: module.machiningStatus ?? 'proposed',
          }
        : undefined,
    }),
  ];
}
