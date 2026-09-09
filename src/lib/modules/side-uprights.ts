import { createPart, type BuildContext } from './context.ts';
import type { Part, SideUprightsModule, Vec3 } from '../spec.ts';

const sideName = (side: -1 | 1) => (side < 0 ? 'izquierdo' : 'derecho');

/** Vertical strips screwed to the side walls; the doors hinge on them. */
export function buildSideUprights(
  module: SideUprightsModule,
  ctx: BuildContext,
): Part[] {
  const { frame } = ctx,
    thickness = ctx.material(module.material).thickness;
  const height = module.topHeight - module.bottomHeight,
    y = module.bottomHeight + height / 2,
    z = frame.structureZ - module.depth / 2;
  return ([-1, 1] as const).map((side) => {
    const size: Vec3 = [thickness, height, module.depth];
    return createPart(ctx, module, {
      name: `${module.name ?? 'Soporte de bisagras'} ${sideName(side)}`,
      size,
      position: [side * (frame.halfWidth - thickness / 2), y, z],
      explode: [side * 0.225 * frame.width, 0, 0],
    });
  });
}
