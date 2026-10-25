/**
 * Cortecloud export: the cut list as the file the workshop's platform reads.
 *
 * Cortecloud is what Barraca Paraná and Barraca Luissi use to take a cutting
 * order over the web. Its own importer accepts a JSON file that carries the
 * pieces, the board and the edge tape of every side — unlike the spreadsheet
 * paste, which drops the material columns and leaves them to be clicked in by
 * hand, row by row.
 *
 * Nothing here decides anything. The pieces come from the built model, and an
 * edge the design left `'pending'` travels as `null`: the file never claims a
 * banding the user has not confirmed. The board and tape names are the store's
 * own catalogue strings, given by the caller, because they belong to a price
 * list and not to the design.
 *
 * Axes: Cortecloud measures `c` along the length and `l` across the width, so
 * its c1/c2 are our L1/L2 and its l1/l2 are our A1/A2.
 */

import type { Model } from '../build.ts';
import type { CutGroup } from '../build.ts';

/** One line of the cut list, as Cortecloud spells it. */
export type CortecloudPart = {
  quantity: number;
  /** Length, in millimetres. */
  c: number;
  /** Width, in millimetres. */
  l: number;
  function: string;
  complement: string;
  /** Edge tape on the long sides (our L1/L2), `null` for a bare edge. */
  c1: string | null;
  c2: string | null;
  /** Edge tape on the short sides (our A1/A2). */
  l1: string | null;
  l2: string | null;
  material: string;
  /** Drilling. Always null: the plans are proposals and are not ordered yet. */
  machining: null;
};

export type CortecloudFile = { parts: CortecloudPart[] };

/** The store's own names, per material id of the design. */
export type CatalogueNames = {
  /** Board, e.g. `{ melamina18: 'FMBM18' }`. */
  boards?: Record<string, string>;
  /** Edge tape, e.g. `{ melamina18: 'ABS Blanco' }`. */
  tapes?: Record<string, string>;
};

/** Whether this group's material takes edge tape at all. */
function tapeFor(group: CutGroup, model: Model, names: CatalogueNames) {
  const material = model.spec.materials.find((m) => m.id === group.part.materialId);
  if (material?.banding === false) return null;
  return names.tapes?.[group.part.materialId] ?? null;
}

function side(group: CutGroup, key: 'L1' | 'L2' | 'A1' | 'A2', tape: string | null) {
  return group.part.edging?.[key] ? tape : null;
}

export function toCortecloud(model: Model, names: CatalogueNames = {}): CortecloudFile {
  return {
    parts: model.groups.map((group) => {
      const [c, l] = group.part.cut,
        tape = tapeFor(group, model, names);
      return {
        quantity: group.quantity,
        c,
        l,
        function: group.part.name,
        complement: group.ids.join('-'),
        c1: side(group, 'L1', tape),
        c2: side(group, 'L2', tape),
        l1: side(group, 'A1', tape),
        l2: side(group, 'A2', tape),
        material: names.boards?.[group.part.materialId] ?? group.part.material,
        machining: null,
      };
    }),
  };
}

/** Metres of edge tape the file orders, for checking against the quote. */
export function tapeMetres(file: CortecloudFile) {
  return (
    file.parts.reduce(
      (total, p) =>
        total +
        p.quantity *
          ((p.c1 ? p.c : 0) + (p.c2 ? p.c : 0) + (p.l1 ? p.l : 0) + (p.l2 ? p.l : 0)),
      0,
    ) / 1000
  );
}
