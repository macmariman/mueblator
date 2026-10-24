/**
 * The assembly order: the steps that turn a pile of cut boards into the piece,
 * in the order they are done, and the tools each one asks for.
 *
 * The rule is the one the hardware list already follows. Most of this is
 * derived from the modules of the design — a board screwed to a wall is fixed
 * before whatever rests on it, the fronts go on last — and everything derived
 * is `'proposed'`: a sensible order, not one anybody has built yet. A design
 * can declare its own steps, and a declared step naming a `covers` group takes
 * the place of the derived one.
 *
 * What this is not: it is not a carpentry manual and it does not know the
 * workshop, the wall or the hands doing the work. Every screen and every page
 * that shows it says so.
 */

import type { Hole } from './drilling.ts';
import type {
  AssemblyStepSpec,
  AssemblyTarget,
  DesignSpec,
  DrillBy,
  MaterialSpec,
  ModuleSpec,
  Part,
  ToolGroup,
  ToolItem,
} from './spec.ts';
import type { HardwareLine, ModuleParts } from './hardware.ts';

export type AssemblyStep = {
  /** Stable key, `paso-1`, `paso-2`… The reader sees the ordinal, not this. */
  id: string;
  /** Position in the order, starting at 1. */
  order: number;
  title: string;
  body: string;
  /** The mistake that is easy to make here, or null. */
  caution: string | null;
  /** Board references this step puts in place. */
  parts: string[];
  /** Hardware references it uses. */
  hardware: string[];
  status: 'confirmed' | 'proposed';
  /** `'derived'` steps come from the modules, never from the design file. */
  origin: 'declared' | 'derived';
  /**
   * Drilling plans this step relies on, by who drills them: the step does not
   * repeat the positions, it names the boards whose plan to follow.
   */
  drilling: { by: DrillBy; boards: string[] }[];
};

export type ToolLine = ToolItem & {
  group: ToolGroup;
  origin: 'declared' | 'derived';
};

/**
 * The order the module kinds are built in. What hangs off a wall goes first,
 * what rests on it next, and the fronts last, so a door is hung on a piece
 * that is already square and cannot move any more.
 */
const kindOrder: ModuleSpec['kind'][] = [
  'wall-cleats',
  'side-uprights',
  'panel',
  'plinth',
  'board',
  'front-rail',
  'countertop',
  'doors',
];

const toolOrder: ToolGroup[] = [
  'Medir y marcar',
  'Presentar y sujetar',
  'Perforar y atornillar',
  'Terminación',
];

/** Modules of the same kind stay separate; hand-placed boards collapse by group. */
function stepKey(module: ModuleSpec, parts: Part[], index: number): AssemblyTarget | string {
  return module.kind === 'board'
    ? `board:${parts[0]?.group ?? 'Estructura'}`
    : `${module.kind}#${index}`;
}

const targetOf = (key: string): AssemblyTarget =>
  (key.startsWith('board:') ? key : key.split('#')[0]) as AssemblyTarget;

/** Lowest underside of a group of boards: what decides the order within a rank. */
const underside = (parts: Part[]) =>
  Math.min(...parts.map((p) => p.position[1] - p.size[1] / 2));

const list = (ids: string[]) =>
  ids.length > 1 ? `${ids.slice(0, -1).join(', ')} y ${ids.at(-1)}` : ids[0];

/** Hardware headings each kind of step reaches for. */
const hardwareGroups: Partial<Record<ModuleSpec['kind'], string[]>> = {
  'wall-cleats': ['Fijación a pared'],
  'side-uprights': ['Fijación a pared', 'Ensamble'],
  panel: ['Ensamble'],
  plinth: ['Ensamble'],
  board: ['Ensamble'],
  'front-rail': ['Ensamble'],
  countertop: ['Ensamble'],
  doors: ['Herrajes'],
};

/** Pretaladro warning, which depends on what the board is made of. */
function drillCaution(material: MaterialSpec | undefined) {
  if (!material) return null;
  return material.banding === false
    ? 'Prebarrená todos los tornillos. Cerca de la punta de una pieza de madera maciza, un tornillo sin agujero previo la abre a lo largo de la veta.'
    : 'Prebarrená todos los tornillos. El aglomerado y la melamina se hinchan y se abren desde el canto si entrás en seco.';
}

/** Everything that becomes one step, before the text is written for it. */
type Bucket = {
  key: string;
  module: ModuleSpec;
  rank: number;
  /** Lowest underside in the bucket: the tie-break inside a rank. */
  height: number;
  parts: Part[];
};

/** The step for one module — or, for hand-placed boards, for one board group. */
function moduleStep(
  module: ModuleSpec,
  parts: Part[],
  material: MaterialSpec | undefined,
): { title: string; body: string; caution: string | null } {
  const ids = list(parts.map((p) => p.id)),
    count = parts.length,
    piezas = count === 1 ? 'la pieza' : `las ${count} piezas`;
  switch (module.kind) {
    case 'wall-cleats':
      return {
        title: `Fijar a la pared: ${module.name ?? 'los apoyos'}`,
        body: `Marcá la altura del apoyo con el nivel, de pared a pared, y repasá la línea antes de perforar. Presentá ${piezas} (${ids}) sobre la marca, pasá los agujeros a la pared, taladrá, poné los tacos y atornillá. Con la pieza ya fijada, volvé a pasar el nivel: si quedó fuera, aflojá y corregí ahora.`,
        caution:
          'Un nivel de burbuja corto miente sobre un metro y medio de pared. Usá el nivel más largo que tengas, o apoyalo sobre una regla derecha.',
      };
    case 'side-uprights':
      return {
        title: `Fijar a la pared: ${module.name ?? 'los soportes laterales'}`,
        body: `${ids}: van contra la pared lateral, a plomo. Presentá, controlá el plomo con el nivel en la cara ancha, marcá y recién ahí perforá.`,
        caution:
          'Si la pared no está a plomo, calzá la pieza con suplementos finos antes de apretar. Atornillada forzada queda torcida, y sobre eso después no cierra ninguna puerta.',
      };
    case 'panel':
      return {
        title: `Colocar ${(module.name ?? 'el panel').toLowerCase()}`,
        body: `${ids} apoya sobre lo que ya está fijado. Probala en seco primero: tiene que entrar con la mano y salir con la mano.`,
        caution:
          'Si entra a martillazos, no entra: sacala y ajustá. Un panel forzado empuja los laterales hacia afuera y desde ahí nada vuelve a quedar a escuadra.',
      };
    case 'plinth':
      return {
        title: `Colocar ${(module.name ?? 'el zócalo').toLowerCase()}`,
        body: `${ids} cierra la parte de abajo. Dejá la luz al piso que indica el modelo: es lo que salva un piso que no está nivelado.`,
        caution: drillCaution(material),
      };
    case 'board':
      return {
        title: `Montar ${(parts[0]?.group ?? 'la estructura').toLowerCase()}`,
        body: `${piezas} de este grupo (${ids}). Presentá todo en seco y con las prensas puestas, controlá la escuadra midiendo las dos diagonales, y recién entonces atornillá. Apretá parejo, alternando de un lado al otro.`,
        caution: drillCaution(material),
      };
    case 'front-rail':
      return {
        title: `Colocar ${(module.name ?? 'el travesaño').toLowerCase()}`,
        body: `${ids} arriostra el frente: es la pieza que mantiene constante el ancho de arriba. Con ella puesta, medí el ancho arriba y abajo y comparalos.`,
        caution:
          'Este travesaño es lo que sostiene la escuadra del frente. Si lo dejás para después de colgar las puertas, las puertas te van a marcar el error.',
      };
    case 'countertop':
      return {
        title: `Apoyar ${(module.name ?? 'la tapa').toLowerCase()}`,
        body: `${ids} es la pieza más pesada y la más cara de rehacer: levantala entre dos. Apoyala en seco, verificá que asiente en todo su largo y que el frente quede parejo, antes de fijarla.`,
        caution: module.cutout
          ? 'El calado del artefacto sale de la plantilla de cartón que llevás al taller, no de este modelo: el dibujo es ilustrativo.'
          : 'Levantala de plano, nunca apoyada de canto sobre una esquina: es por donde se parte.',
      };
    case 'doors':
      if (module.cupBoring === 'workshop')
        return {
          title: 'Colgar las puertas',
          body: `${ids} vienen del taller con las cazoletas perforadas. Atornillá las bisagras a la hoja, después las bases al mueble, y colgá. Dejá la regulación fina para el último paso.`,
          caution:
            'Antes de fijar las bases, presentá la bisagra en la cazoleta: si el taller perforó para otro modelo, no calza. Pedí las bisagras con las que perforaron.',
        };
      return {
        title: 'Colgar las puertas',
        body: `${ids}. Perforá las cazoletas con la mecha copa y el tope de profundidad puesto, atornillá las bisagras a la hoja, después las bases al mueble, y colgá. Dejá la regulación fina para el último paso.`,
        caution:
          'El agujero de la cazoleta no atraviesa la puerta. Poné el tope de profundidad en la mecha y probá en un recorte antes de tocar la hoja buena.',
      };
  }
}

/** The two steps that belong to no module: what happens before, and what after. */
function bookends(spec: DesignSpec, parts: Part[], hardware: HardwareLine[]) {
  const walls = spec.opening.walls ?? { left: true, right: true, back: true },
    builtIn =
      walls.left !== false || walls.right !== false || walls.back !== false;
  const prep = {
    title: 'Antes de empezar',
    body: `Contá las ${parts.length} piezas contra la lista de corte y verificá cada medida con el metro antes de perforar nada: una pieza que vino mal todavía es problema del taller. Escribí la referencia de cada una en lápiz, sobre una cara que después no se vea. Armá en una superficie plana y a la altura de la cintura, con caballetes si tenés.${
      builtIn
        ? ' Pasá el nivel y la escuadra por el hueco antes de empezar: si las paredes no están a plomo, o el ancho cambia con la altura, avisá, porque las medidas del modelo salen de un hueco parejo.'
        : ''
    }`,
    caution:
      'Medí dos veces y perforá una. En cuanto hacés el primer agujero, la pieza deja de poder devolverse.',
    parts: [] as string[],
    hardware: [] as string[],
  };
  const hasDoors = parts.some((p) => p.role === 'door');
  const consumables = hardware
    .filter((h) => h.group === 'Consumibles')
    .map((h) => h.id);
  const finish = {
    title: 'Ajuste final',
    body: `Probá el mueble entero antes de darlo por terminado: que nada se mueva, que todo lo desmontable entre y salga, que ninguna pieza roce.${
      hasDoors
        ? ' Regulá las bisagras con los tres tornillos que traen —profundidad, altura y lateral— hasta que la junta entre hojas quede pareja de arriba abajo.'
        : ''
    }${consumables.length > 0 ? ` Terminación y consumibles: ${list(consumables)}.` : ''}`,
    caution:
      'Apretá el último cuarto de vuelta con la mano, no con el impacto del taladro. Un tornillo pasado de apriete gira en falso, y ese agujero no agarra nunca más.',
    parts: [] as string[],
    hardware: consumables,
  };
  return { prep, finish };
}

/**
 * The assembly order of a design: the steps worked out from its modules, with
 * whatever the design declares put in their place. Steps are numbered in the
 * order they are done, `prep` first and `finish` last.
 */
export function buildAssembly(
  spec: DesignSpec,
  byModule: ModuleParts[],
  parts: Part[],
  hardware: HardwareLine[],
  holes: Hole[] = [],
): AssemblyStep[] {
  const material = (id: string) => spec.materials.find((m) => m.id === id);
  // One bucket per step: a module of its own, or every hand-placed board that
  // shares a group, so a table with six identical slats reads as one step.
  const buckets = new Map<string, Bucket>();
  byModule.forEach(({ module, parts: made }, index) => {
    if (made.length === 0) return;
    const key = stepKey(module, made, index),
      found = buckets.get(key);
    if (found) {
      found.parts.push(...made);
      found.height = Math.min(found.height, underside(made));
    } else
      buckets.set(key, {
        key,
        module,
        rank: kindOrder.indexOf(module.kind),
        height: underside(made),
        parts: [...made],
      });
  });

  const middle = [...buckets.values()]
    .sort((a, b) => a.rank - b.rank || a.height - b.height)
    .map((bucket) => {
      const groups = hardwareGroups[bucket.module.kind] ?? [];
      return {
        key: bucket.key,
        step: {
          ...moduleStep(bucket.module, bucket.parts, material(bucket.module.material)),
          parts: bucket.parts.map((p) => p.id),
          hardware: hardware
            .filter((h) => groups.includes(h.group))
            .map((h) => h.id),
          status: 'proposed' as const,
          origin: 'derived' as const,
        },
      };
    });

  const { prep, finish } = bookends(spec, parts, hardware);
  const skeleton: { target: AssemblyTarget; step: Omit<AssemblyStep, 'id' | 'order' | 'drilling'> }[] = [
    { target: 'prep', step: { ...prep, status: 'proposed', origin: 'derived' } },
    ...middle.map(({ key, step }) => ({ target: targetOf(key), step })),
    { target: 'finish', step: { ...finish, status: 'proposed', origin: 'derived' } },
  ];

  const declared = spec.assembly ?? [];
  const asStep = (item: AssemblyStepSpec): Omit<AssemblyStep, 'id' | 'order' | 'drilling'> => ({
    title: item.title,
    body: item.body,
    caution: item.caution ?? null,
    parts: item.parts ?? [],
    hardware: item.hardware ?? [],
    status: item.status,
    origin: 'declared',
  });
  const overrides = new Map(
    declared.filter((d) => d.covers).map((d) => [d.covers as AssemblyTarget, d]),
  );
  const used = new Set<AssemblyTarget>();
  const ordered = skeleton.map(({ target, step }) => {
    const override = overrides.get(target);
    if (!override) return step;
    used.add(target);
    return asStep(override);
  });
  const extras = declared
    .filter((d) => !d.covers || !used.has(d.covers))
    .map(asStep);
  // Extras land before the closing step, which is always the last thing done.
  const closing = ordered.pop() as Omit<AssemblyStep, 'id' | 'order' | 'drilling'>;
  // A board is drilled before it goes in, flat on the bench: pin and plate
  // holes on a divider belong to the step that places the divider, not to
  // the shelf or the door that uses them later.
  const drillingFor = (placed: string[]) => {
    const byWho = new Map<DrillBy, Set<string>>();
    for (const hole of holes.filter((h) => placed.includes(h.board))) {
      if (!byWho.has(hole.by)) byWho.set(hole.by, new Set());
      byWho.get(hole.by)!.add(hole.board);
    }
    return (['home', 'pending', 'workshop'] as DrillBy[])
      .filter((by) => byWho.has(by))
      .map((by) => ({ by, boards: [...byWho.get(by)!].sort() }));
  };
  return [...ordered, ...extras, closing].map((step, i, all) => ({
    ...step,
    drilling: drillingFor(step.parts),
    // Two derived steps in a row can share a warning — two rows of cleats on
    // the same wall. Saying it twice on the same page is how a reader learns
    // to skip it, so only the first one keeps it.
    caution:
      step.origin === 'derived' && step.caution === all[i - 1]?.caution
        ? null
        : step.caution,
    id: `paso-${i + 1}`,
    order: i + 1,
  }));
}

type Tool = Omit<ToolLine, 'origin'>;

const tool = (
  name: string,
  reason: string,
  group: ToolGroup,
  spec?: string,
): Tool => ({ name, spec, reason, group, status: 'proposed' });

/**
 * The tools the piece asks for: the ones any assembly needs, plus the ones a
 * particular design brings with it — a cup hinge asks for a 35 mm bit, a board
 * screwed to a wall asks for a percussion drill. Proposals, all of them: the
 * list says what the job needs, not what is in the shed.
 *
 * Nothing here cuts wood. The cut list is finished sizes and the boards arrive
 * cut from the workshop, so this is a list for assembling, not for making.
 */
export function buildTools(
  spec: DesignSpec,
  byModule: ModuleParts[],
  hardware: HardwareLine[],
  holes: Hole[] = [],
): ToolLine[] {
  const kinds = new Set(byModule.map(({ module }) => module.kind));
  const has = (re: RegExp) => hardware.some((h) => re.test(`${h.name} ${h.spec ?? ''}`));
  const tools: Tool[] = [
    tool('Metro o cinta métrica', 'Verificar cada pieza contra la lista de corte antes de armar.', 'Medir y marcar', '3 m'),
    tool('Lápiz de carpintero', 'Marcar las referencias y las líneas de agujero.', 'Medir y marcar'),
    tool('Escuadra', 'Controlar que los ángulos den 90° antes del apriete final.', 'Medir y marcar'),
    tool('Nivel de burbuja', 'Toda línea horizontal del mueble. Cuanto más largo, menos miente.', 'Medir y marcar', '60 cm o más'),
    tool('Prensas o sargentos', 'Sostener las piezas presentadas en seco mientras controlás la escuadra y atornillás.', 'Presentar y sujetar', '2 como mínimo'),
    tool('Taladro atornillador', 'Pretaladrar y atornillar. Con regulación de par, para no pasarte de apriete.', 'Perforar y atornillar'),
    tool('Juego de mechas para madera', 'Un pretaladro por tornillo, del diámetro del alma del tornillo.', 'Perforar y atornillar', '3 a 8 mm'),
    tool('Puntas de atornillar', 'Del tipo que traigan los tornillos. Una punta gastada redondea la cabeza.', 'Perforar y atornillar'),
    tool('Lija', 'Repasar cantos y bordes de perforación.', 'Terminación', 'Grano 120 y 180'),
  ];
  if (kinds.has('wall-cleats') || kinds.has('side-uprights')) {
    tools.push(
      tool('Taladro percutor', 'Perforar la pared para los tacos.', 'Perforar y atornillar'),
      tool('Mecha para mampostería', 'El diámetro sale del taco, y el taco de la pared: ladrillo hueco, macizo, hormigón y placa de yeso llevan tacos distintos.', 'Perforar y atornillar', 'A definir con el taco'),
      tool('Detector de cables y caños', 'Antes de perforar una pared. Un caño de agua o un cable perforado cuesta más que el mueble.', 'Medir y marcar'),
    );
  }
  // The cup bit only when some leaf is bored at home; the adjustment is always ours.
  const boredAtHome = byModule.some(
    ({ module }) => module.kind === 'doors' && module.cupBoring !== 'workshop',
  );
  if (has(/cazoleta/i) && boredAtHome)
    tools.push(
      tool('Mecha copa (Forstner)', 'La cazoleta de la bisagra. Con tope de profundidad: el agujero no atraviesa la puerta.', 'Perforar y atornillar', '35 mm'),
    );
  // Holes the workshop does not drill, or might not, bring their bit along.
  const drilledHere = (kind: Hole['kind']) =>
    holes.filter((h) => h.kind === kind && h.by !== 'workshop');
  const confirmats = drilledHere('confirmat');
  if (confirmats.length > 0)
    tools.push(
      tool(
        'Mecha escalonada para confirmat',
        `${confirmats.every((h) => h.by === 'pending') ? 'Sólo si el taller no entrega las piezas perforadas. ' : ''}Hace en una pasada el pasante de 7 mm, el avellanado y el agujero de 5 mm en el canto de la otra pieza, con la unión prensada.`,
        'Perforar y atornillar',
        'Ø5 / 7 mm',
      ),
    );
  if (drilledHere('shelf-pin').length > 0)
    tools.push(
      tool('Mecha de 5 mm con tope', 'Los agujeros de los soportes de estante, sin atravesar la pieza.', 'Perforar y atornillar'),
    );
  if (has(/cazoleta/i))
    tools.push(
      tool('Destornillador de mano', 'La regulación fina de las bisagras, que se hace con la mano y no con el taladro.', 'Perforar y atornillar'),
    );
  if (spec.materials.some((m) => m.banding !== false))
    tools.push(
      tool('Cuchilla o lima para tapacantos', 'Repasar el sobrante del canto pegado, si el tapacantos no viene puesto del taller.', 'Terminación'),
    );
  if (hardware.some((h) => h.group === 'Consumibles'))
    tools.push(tool('Pincel y trapo', 'Aplicar la terminación y los consumibles de la lista.', 'Terminación'));

  const declared = (spec.tools ?? []).map((t) => ({
    ...t,
    group: t.group ?? ('Perforar y atornillar' as ToolGroup),
    origin: 'declared' as const,
  }));
  const named = new Set(declared.map((t) => t.name.toLowerCase()));
  const lines: ToolLine[] = [
    ...declared,
    ...tools
      .filter((t) => !named.has(t.name.toLowerCase()))
      .map((t) => ({ ...t, origin: 'derived' as const })),
  ];
  return lines
    .map((line, index) => ({ line, index }))
    .sort(
      (a, b) =>
        toolOrder.indexOf(a.line.group) - toolOrder.indexOf(b.line.group) ||
        a.index - b.index,
    )
    .map(({ line }) => line);
}
