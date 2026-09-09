import { createPart, type BuildContext } from './context.ts';
import type { FrontRailModule, Part, Vec3 } from '../spec.ts';

/** Horizontal rail behind the fronts: it ties the uprights and takes the door stops. */
export function buildFrontRail(
  module: FrontRailModule,
  ctx: BuildContext,
): Part[] {
  const { frame } = ctx,
    thickness = ctx.material(module.material).thickness;
  const uprights = ctx.spec.modules.find((m) => m.kind === 'side-uprights');
  const inset =
    module.betweenUprights && uprights
      ? 2 * ctx.material(uprights.material).thickness
      : 0;
  const size: Vec3 = [frame.width - inset, module.height, thickness];
  return [
    createPart(ctx, module, {
      name: module.name ?? 'Travesaño superior',
      size,
      position: [
        0,
        module.topHeight - module.height / 2,
        frame.structureZ - thickness / 2,
      ],
      explode: [0, 0.1 * frame.topHeight, 0.215 * frame.depth],
    }),
  ];
}
