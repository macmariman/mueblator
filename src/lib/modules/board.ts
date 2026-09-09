import { createPart, mirror, type BuildContext } from './context.ts';
import type { BoardModule, Part, Vec3 } from '../spec.ts';

const sideName = (side: -1 | 1) => (side < 0 ? 'izquierdo' : 'derecho');

/** Escape hatch: a board placed by hand, for shapes no module covers yet. */
export function buildBoard(module: BoardModule, ctx: BuildContext): Part[] {
  const { frame } = ctx;
  const place = (side: -1 | 1 | 0): Part => {
    const position: Vec3 = [
      side === 0 ? module.position[0] : side * Math.abs(module.position[0]),
      module.position[1],
      module.position[2],
    ];
    // Push the board away from the centre of the piece when exploded. An
    // explicit offset is written for the right-hand copy and mirrored with it.
    const explode: Vec3 = module.explode
      ? mirror(module.explode, side === 0 ? 1 : side)
      : [
          Math.sign(position[0]) * 0.2 * frame.width,
          position[1] > frame.topHeight / 2
            ? 0.1 * frame.topHeight
            : -0.1 * frame.topHeight,
          0,
        ];
    return createPart(
      ctx,
      { ...module, explode: undefined },
      {
        name:
          side === 0
            ? (module.name ?? 'Pieza')
            : `${module.name ?? 'Pieza'} ${sideName(side)}`,
        size: module.size,
        position,
        explode,
      },
    );
  };
  return module.mirrored ? [place(-1), place(1)] : [place(0)];
}
