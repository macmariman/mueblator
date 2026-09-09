import { createPart, partById, type BuildContext } from './context.ts';
import type { Part, Vec3, WallCleatsModule } from '../spec.ts';

const sideName = (side: -1 | 1) => (side < 0 ? 'izquierdo' : 'derecho');

/** Pair of battens fixed to the side walls that carry a horizontal panel. */
export function buildWallCleats(
  module: WallCleatsModule,
  ctx: BuildContext,
): Part[] {
  const { frame } = ctx,
    thickness = ctx.material(module.material).thickness;
  const panel = partById(ctx, module.supports),
    panelBackZ = panel.position[2] - panel.size[2] / 2,
    panelUnderside = panel.position[1] - panel.size[1] / 2;
  // A shorter cleat keeps clear of the front, unless the design says otherwise.
  const depth = module.depth ?? panel.size[2] - thickness;
  const low = panelUnderside < frame.topHeight / 2;
  return ([-1, 1] as const).map((side) => {
    const size: Vec3 = [thickness, module.height, depth];
    return createPart(ctx, module, {
      name: `${module.name ?? `Apoyo de ${panel.name.toLowerCase()}`} ${sideName(side)}`,
      group: 'Apoyos',
      size,
      position: [
        side * (frame.halfWidth - (module.inset ?? 0) - thickness / 2),
        panelUnderside - module.height / 2,
        panelBackZ + depth / 2,
      ],
      explode: [
        side * 0.275 * frame.width,
        (low ? -0.057 : 0.034) * frame.topHeight,
        -0.2 * frame.depth,
      ],
    });
  });
}
