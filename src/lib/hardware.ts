/**
 * The hardware list: everything that is not a board and is still needed to put
 * the piece together — hinges, handles, screws, wall plugs, brackets.
 *
 * Two things end up in it. What the design file declares in `hardware`, which
 * is the record of what the user chose, and what a module can propose on its
 * own — a door needs hinges, a batten screwed to a wall needs screws and plugs.
 * Proposals are always marked `'proposed'`: they are a starting count, not a
 * decision, and a declared item naming the same `covers` role replaces them.
 */

import type {
  DesignSpec,
  HardwareItem,
  HardwareRole,
  HardwareUnit,
  ModuleSpec,
  Part,
} from './spec.ts';

export type HardwareLine = {
  id: string;
  name: string;
  spec: string | null;
  quantity: number;
  unit: HardwareUnit;
  group: string;
  note: string;
  status: 'confirmed' | 'proposed';
  sourcing: string | null;
  /** `'derived'` lines come from a module, never from the design file. */
  origin: 'declared' | 'derived';
};

/** Each module with the boards it produced, so a proposal can count them. */
export type ModuleParts = { module: ModuleSpec; parts: Part[] };

/** One fixing every 400 mm of board, and never fewer than two. */
const fixingSpacing = 400;

/** Headings, in the order the workshop buys them. */
const groupOrder = ['Herrajes', 'Fijación a pared', 'Ensamble', 'Consumibles'];

/** Trade rule of thumb, stated in the note so it can be overruled. */
function hingesForLeaf(height: number) {
  if (height <= 900) return 2;
  if (height <= 1600) return 3;
  return 4;
}

const fixingsForBoard = (length: number) =>
  Math.max(2, Math.ceil(length / fixingSpacing));

/** A line before it is numbered; `id` is the explicit reference, if the design gave one. */
type Line = Omit<HardwareLine, 'id'> & { id?: string };

type Proposal = Omit<HardwareLine, 'id' | 'origin'> & { covers: HardwareRole };

/** Hinges and handles for every row of fronts. */
function doorProposals(entries: ModuleParts[]): Proposal[] {
  const proposals: Proposal[] = [];
  const leaves = entries.flatMap(({ module, parts }) =>
    module.kind === 'doors' ? parts.map((p) => ({ module, part: p })) : [],
  );
  if (leaves.length === 0) return proposals;
  const hinges = leaves.reduce(
    (n, { module, part }) =>
      n +
      (module.kind === 'doors' && module.hingesPerLeaf
        ? module.hingesPerLeaf
        : hingesForLeaf(part.size[1])),
    0,
  );
  proposals.push({
    covers: 'door-hinges',
    name: 'Bisagra de cazoleta',
    spec: 'Cazoleta 35 mm',
    quantity: hinges,
    unit: 'u',
    group: 'Herrajes',
    status: 'proposed',
    sourcing: null,
    note: `Propuesta a razón de ${leaves
      .map(({ part }) => hingesForLeaf(part.size[1]))
      .join(' + ')} por hoja, por la altura de cada puerta. Elegir marca, codo y base antes de perforar: el recubrimiento del soporte depende del modelo.`,
  });
  const withHandles = leaves.filter(({ part }) => part.handle);
  if (withHandles.length > 0)
    proposals.push({
      covers: 'door-handles',
      name: 'Tirador',
      spec: null,
      quantity: withHandles.length,
      unit: 'u',
      group: 'Herrajes',
      status: 'proposed',
      sourcing: null,
      note: 'Uno por hoja. Modelo, largo y entrecentros sin definir.',
    });
  return proposals;
}

/** Screws and plugs for everything that hangs off a wall. */
function wallProposals(entries: ModuleParts[]): Proposal[] {
  const wallMounted = entries.filter(
    ({ module }) =>
      module.kind === 'wall-cleats' || module.kind === 'side-uprights',
  );
  const fixings = wallMounted.reduce(
    (n, { parts }) => n + parts.reduce((m, p) => m + fixingsForBoard(p.cut[0]), 0),
    0,
  );
  if (fixings === 0) return [];
  const boards = wallMounted.reduce((n, { parts }) => n + parts.length, 0);
  const shared = `Propuesta de una fijación cada ${fixingSpacing} mm, mínimo dos por pieza: ${boards} piezas contra la pared.`;
  return [
    {
      covers: 'wall-fixings',
      name: 'Taco de pared',
      spec: null,
      quantity: fixings,
      unit: 'u',
      group: 'Fijación a pared',
      status: 'proposed',
      sourcing: null,
      note: `${shared} El taco depende de la pared: ladrillo hueco, ladrillo macizo, hormigón y placa de yeso llevan tacos distintos. Medir y decidir antes de comprar.`,
    },
    {
      covers: 'wall-fixings',
      name: 'Tornillo para taco',
      spec: null,
      quantity: fixings,
      unit: 'u',
      group: 'Fijación a pared',
      status: 'proposed',
      sourcing: null,
      note: `${shared} Largo y diámetro según el taco elegido, más el espesor de la pieza que atraviesa.`,
    },
  ];
}

function normalise(item: HardwareItem): Line {
  return {
    id: item.id,
    name: item.name,
    spec: item.spec ?? null,
    quantity: item.quantity,
    unit: item.unit ?? 'u',
    group: item.group ?? 'Herrajes',
    note: item.note ?? '',
    status: item.status,
    sourcing: item.sourcing ?? null,
    origin: 'declared',
  };
}

const rank = (group: string) => {
  const index = groupOrder.indexOf(group);
  return index === -1 ? groupOrder.length : index;
};

/**
 * The hardware of a design: what it declares, plus the proposals of its modules
 * for the roles it left open. Declared items keep their order and come first
 * inside each heading; references are numbered H01, H02, … over the whole list.
 */
export function buildHardware(
  spec: DesignSpec,
  byModule: ModuleParts[],
): HardwareLine[] {
  const declared = spec.hardware ?? [];
  const covered = new Set(
    declared.map((item) => item.covers).filter(Boolean) as HardwareRole[],
  );
  const proposed = [...doorProposals(byModule), ...wallProposals(byModule)]
    .filter((p) => !covered.has(p.covers))
    .map(({ covers: _covers, ...line }) => ({ ...line, origin: 'derived' as const }));
  const lines: Line[] = [...declared.map(normalise), ...proposed];
  const ordered = lines
    .map((line, index) => ({ line, index }))
    .sort((a, b) => rank(a.line.group) - rank(b.line.group) || a.index - b.index)
    .map(({ line }) => line);
  const taken = new Set(ordered.map((line) => line.id).filter(Boolean) as string[]);
  if (taken.size < ordered.filter((line) => line.id).length)
    throw new Error(`Duplicate hardware reference in "${spec.id}".`);
  let counter = 0;
  const next = () => {
    let id = '';
    do id = `H${String(++counter).padStart(2, '0')}`;
    while (taken.has(id));
    return id;
  };
  return ordered.map(({ id, ...line }) => ({ ...line, id: id ?? next() }));
}
