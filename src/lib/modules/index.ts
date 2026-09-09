import { buildBoard } from './board.ts';
import { buildCountertop } from './countertop.ts';
import { buildDoors } from './doors.ts';
import { buildFrontRail } from './front-rail.ts';
import { buildPanel } from './panel.ts';
import { buildPlinth } from './plinth.ts';
import { buildSideUprights } from './side-uprights.ts';
import { buildWallCleats } from './wall-cleats.ts';
import type { BuildContext } from './context.ts';
import type { ModuleSpec, Part } from '../spec.ts';

type Builder<K extends ModuleSpec['kind']> = (
  module: Extract<ModuleSpec, { kind: K }>,
  ctx: BuildContext,
) => Part[];

/**
 * Every module kind a design file can use. Add a new kind here, plus its type
 * in spec.ts, and the whole app (3D view, cut list, manual) picks it up.
 */
export const builders: { [K in ModuleSpec['kind']]: Builder<K> } = {
  countertop: buildCountertop,
  doors: buildDoors,
  'side-uprights': buildSideUprights,
  'front-rail': buildFrontRail,
  plinth: buildPlinth,
  panel: buildPanel,
  'wall-cleats': buildWallCleats,
  board: buildBoard,
};

export type { BuildContext, Frame } from './context.ts';
