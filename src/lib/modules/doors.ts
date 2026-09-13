import { createPart, type BuildContext } from './context.ts';
import type { DoorsModule, Part, Vec3 } from '../spec.ts';

const sideName = (side: -1 | 1) => (side < 0 ? 'izquierda' : 'derecha');

/** Row of hinged fronts, evenly split across the opening or across `span`. */
export function buildDoors(module: DoorsModule, ctx: BuildContext): Part[] {
  const { frame } = ctx,
    thickness = ctx.material(module.material).thickness;
  const [left, right] = module.span ?? [-frame.halfWidth, frame.halfWidth];
  const leaf =
    (right - left - (module.count + 1) * module.gap) / module.count,
    height = module.topHeight - module.bottomHeight,
    y = module.bottomHeight + height / 2,
    z = frame.facadeZ - thickness / 2;
  return Array.from({ length: module.count }, (_, i) => {
    const x = left + module.gap + i * (leaf + module.gap) + leaf / 2;
    // Each leaf hinges on the nearest side wall, so it covers its own upright.
    const side: -1 | 1 = i < module.count / 2 ? -1 : 1;
    const size: Vec3 = [leaf, height, thickness];
    const name =
      module.count === 2
        ? `${module.name ?? 'Puerta'} ${sideName(side)}`
        : `${module.name ?? 'Puerta'} ${i + 1}`;
    return createPart(ctx, module, {
      name,
      group: 'Puertas',
      size,
      position: [x, y, z],
      explode: [side * 0.225 * frame.width, 0, 0.43 * frame.depth],
      role: 'door',
      side,
      handle: module.handles ?? true,
    });
  });
}
