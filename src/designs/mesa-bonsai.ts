import type { DesignSpec } from '../lib/spec.ts';

// Confirmed measurements and pending decisions: docs/designs/mesa-bonsai.md
// Freestanding piece: the "opening" is the outline of the table itself, so it
// carries no walls and names its own footprint.
const opening = {
  width: 600, // confirmed top width
  depth: 400, // confirmed top depth
  height: 750, // confirmed top surface, and the reference height of the piece
  label: 'Tablero',
  walls: { left: false, right: false, back: false },
};

const board = 25, // slats and rails, proposed section
  leg = 45, // square leg, proposed section
  slatCount = 6,
  slatWidth = 90,
  railHeight = 70; // apron depth under the slats

// The slats fill the whole width, so the gap between them follows from the
// board width rather than being a number of its own.
const slatGap = (opening.width - slatCount * slatWidth) / (slatCount - 1),
  slatUnderside = opening.height - board,
  railUnderside = slatUnderside - railHeight,
  railCentre = railUnderside + railHeight / 2;

const slatX = Array.from(
  { length: slatCount },
  (_, i) => -opening.width / 2 + slatWidth / 2 + i * (slatWidth + slatGap),
);
// Legs sit inside the frame: one rail thickness in from each outer face.
const legX = opening.width / 2 - board - leg / 2,
  legZ = opening.depth / 2 - board - leg / 2;
const legCorners = [
  { x: -legX, z: legZ, side: 'izquierda' },
  { x: legX, z: legZ, side: 'derecha' },
  { x: -legX, z: -legZ, side: 'izquierda' },
  { x: legX, z: -legZ, side: 'derecha' },
];

export const mesaBonsai: DesignSpec = {
  id: 'mesa-bonsai',
  name: 'Mesita para bonsái',
  eyebrow: 'EXTERIOR / PINO TRATADO',
  goal: 'Mesita de exterior para exhibir un bonsái: tablero de listones separados que deja escurrir el riego, sobre un marco de pino tratado y cuatro patas.',
  headline: {
    assembled: 'Un árbol, a la altura de los ojos.',
    exploded: 'Catorce piezas y nada más.',
  },
  subhead: {
    assembled: 'Tablero de 60 × 40 cm · cara superior a 75 cm',
    exploded: 'Despiece de referencia · escuadrías propuestas',
  },
  opening,
  materials: [
    {
      id: 'pino25',
      label: 'Pino tratado de 25 mm',
      short: 'Pino tratado 25 mm',
      thickness: board,
      banding: false,
      color: '#c3ab7c',
      roughness: 0.88,
      edgeColor: '#8a7749',
      edgeOpacity: 0.35,
    },
    {
      id: 'pino45',
      label: 'Pino tratado de 45 × 45 mm',
      short: 'Pino tratado 45 mm',
      thickness: leg,
      banding: false,
      color: '#b9a071',
      roughness: 0.9,
      edgeColor: '#7f6c40',
      edgeOpacity: 0.35,
    },
  ],
  modules: [
    ...slatX.map((x) => ({
      kind: 'board' as const,
      idPrefix: 'T',
      name: 'Listón de tablero',
      group: 'Tablero',
      material: 'pino25',
      size: [slatWidth, board, opening.depth] as [number, number, number],
      position: [x, slatUnderside + board / 2, 0] as [number, number, number],
      explode: [x * 0.25, 150, 0] as [number, number, number],
      note: `Apoya sobre los dos largueros y sobre la cabeza de las patas. Luz de ${slatGap} mm entre listones para que escurra el riego y seque la base de la maceta. Atornillar desde arriba, avellanado, con tornillo inoxidable; dos por apoyo.`,
    })),
    // The four legs are the same board, so they carry the same name and share a
    // row of the cut list. They are placed one by one rather than mirrored,
    // because the automatic side suffix is masculine and "pata" is feminine.
    ...legCorners.map(({ x, z, side }) => ({
      kind: 'board' as const,
      idPrefix: 'P',
      name: `Pata ${side}`,
      group: 'Patas',
      material: 'pino45',
      size: [leg, slatUnderside, leg] as [number, number, number],
      position: [x, slatUnderside / 2, z] as [number, number, number],
      explode: [Math.sign(x) * 150, -120, Math.sign(z) * 120] as [
        number,
        number,
        number,
      ],
      note: `Cuatro iguales, una por esquina. Va por dentro del marco, atornillada al larguero y al travesaño que se cruzan en esa esquina. La cabeza llega a ${slatUnderside} mm y recibe el listón de tablero.`,
    })),
    ...(
      [opening.depth / 2 - board / 2, -(opening.depth / 2 - board / 2)] as const
    ).map((z) => ({
      kind: 'board' as const,
      idPrefix: 'L',
      name: 'Larguero',
      material: 'pino25',
      size: [opening.width, railHeight, board] as [number, number, number],
      position: [0, railCentre, z] as [number, number, number],
      explode: [0, 60, Math.sign(z) * 170] as [number, number, number],
      note: 'Dos iguales, delantero y trasero. Cara exterior al ras del canto del tablero: une las dos patas de su lado y carga los listones.',
    })),
    {
      kind: 'board',
      idPrefix: 'C',
      name: 'Travesaño lateral',
      material: 'pino25',
      mirrored: true,
      size: [board, railHeight, opening.depth - 2 * board],
      position: [opening.width / 2 - board / 2, railCentre, 0],
      explode: [210, 60, 0],
      note: 'Entra entre los dos largueros, al ras del canto del tablero. Cierra el marco y arriostra las patas de ese lado.',
    },
  ],
  highlights: [
    { value: '60 cm', label: 'Ancho de tablero' },
    { value: '40 cm', label: 'Fondo' },
    { value: '75 cm', label: 'Altura de exhibición' },
    { value: '1,2 cm', label: 'Luz entre listones' },
  ],
  printSubtitle:
    'Tablero: 600 × 400 mm en seis listones con 12 mm de luz · cara superior a 750 mm · pino tratado, medidas terminadas.',
  // Illustrative, like the basin of the bathroom cabinet: the tree shows what
  // the piece is for and how much room it takes. It is not a board and no
  // measurement depends on it.
  fixtures: [
    {
      kind: 'bonsai',
      x: 0,
      z: 0,
      pot: { width: 300, depth: 200, height: 65 },
      height: 380,
      spread: 260,
      seed: 12,
    },
  ],
  // Nothing here is confirmed: the user has not bought or chosen any of it, so
  // every line is a proposal with the reasoning in its note.
  hardware: [
    {
      name: 'Tornillo inoxidable de listón',
      spec: '4 × 50 mm, cabeza avellanada',
      quantity: 24,
      group: 'Ensamble',
      status: 'proposed',
      note: 'Dos por listón contra cada larguero, avellanados desde arriba. Inoxidable o galvanizado en caliente: el CCA ataca el acero común y la mancha negra corre por la madera.',
    },
    {
      name: 'Tornillo inoxidable de marco',
      spec: '5 × 60 mm, cabeza avellanada',
      quantity: 16,
      group: 'Ensamble',
      status: 'proposed',
      note: 'Cuatro por pata: dos desde el larguero y dos desde el travesaño. Prebarrenar, que a 25 mm del extremo el pino se abre.',
    },
    {
      name: 'Regatón para pata de 45 × 45 mm',
      spec: 'Plástico o goma',
      quantity: 4,
      group: 'Herrajes',
      status: 'proposed',
      note: 'Propuesta: levanta la testa de la pata del piso. Esa testa chupa agua por capilaridad y es lo primero que se pudre.',
    },
    {
      name: 'Preservador para cortes',
      spec: 'Al agua, para pino tratado',
      quantity: 1,
      group: 'Consumibles',
      status: 'proposed',
      note: 'Propuesta: repasar todos los cortes y perforaciones. El tratamiento CCA/ACQ no llega al corazón de la pieza, así que cada corte deja madera sin proteger.',
    },
    {
      name: 'Lasur o aceite para exterior',
      quantity: 1,
      group: 'Consumibles',
      status: 'proposed',
      note: 'Terminación sin definir. A la intemperie se renueva cada temporada, con la mesita vacía y seca.',
    },
  ],
  // The derived order gets the sequence right (legs, frame, top) but not the
  // grain of it: on a four-legged table you build the two side frames flat on
  // the floor and only then stand them up. These steps take the place of the
  // derived ones, keeping their position in the order.
  assembly: [
    {
      covers: 'prep',
      title: 'Antes de empezar',
      body: 'Contá las catorce piezas contra la lista de corte y verificá cada medida con el metro. Marcá cada una con su referencia en lápiz, en la cara que va a quedar para abajo. El pino tratado suele venir húmedo: si las piezas están frías al tacto o pesan de más, dejalas estacionar a la sombra, apiladas con separadores, antes de armar. Armá en el piso, sobre un plano parejo.',
      caution:
        'Las piezas llegan cortadas, pero cada corte deja madera cruda: el tratamiento no entra hasta el corazón de la tabla. Si te las entregan sin sellar, pintá el preservador en las dos testas de cada pieza antes de armar nada, y en cada agujero apenas lo hacés. Con la mesa armada, a esas caras no llegás más.',
      status: 'proposed',
    },
    {
      covers: 'board:Patas',
      title: 'Armar los dos laterales, en el piso',
      body: 'Armá dos marcos iguales, apoyados de plano: P01 y P02 con el larguero L01, y P03 y P04 con el larguero L02. La pata va por dentro, con la cara exterior del larguero al ras del canto. La cabeza de la pata tiene que quedar a 620 mm: es lo que después recibe el listón. Prensá, controlá la escuadra y atornillá con dos tornillos de 5 × 60 por unión.',
      parts: ['P01', 'P02', 'P03', 'P04', 'L01', 'L02'],
      hardware: ['H03'],
      caution:
        'Prebarrená siempre. A 25 mm del extremo, un tornillo de 5 mm sin agujero previo abre el pino a lo largo de la veta, y esa pieza ya no sirve.',
      status: 'proposed',
    },
    {
      covers: 'board:Estructura',
      title: 'Parar los laterales y cerrar el marco',
      body: 'Con los dos marcos parados y alguien que los sostenga, atornillá los travesaños C01 y C02 entre los largueros, uno de cada lado, al ras del canto. Antes del apriete final medí las dos diagonales del rectángulo de arriba: si dan igual, la mesa está a escuadra; si no, empujá una esquina hasta emparejarlas.',
      parts: ['C01', 'C02'],
      hardware: ['H03'],
      caution:
        'Esta es la única oportunidad de corregir la escuadra. Con los listones puestos, la mesa queda rígida con el error adentro y cojea para siempre.',
      status: 'proposed',
    },
    {
      covers: 'board:Tablero',
      title: 'Colocar los listones del tablero',
      body: 'T01 a T06, apoyados sobre los dos largueros y sobre la cabeza de las patas. Empezá por los dos de las puntas, al ras del canto, y repartí los cuatro del medio con dos separadores de 12 mm que vas corriendo. Dos tornillos de 4 × 50 por listón contra cada larguero, avellanados desde arriba.',
      parts: ['T01', 'T02', 'T03', 'T04', 'T05', 'T06'],
      hardware: ['H02'],
      caution:
        'Avellaná la cabeza de cada tornillo hasta que quede por debajo de la cara. Una cabeza que sobresale junta agua abajo de la maceta y mancha de óxido la madera.',
      status: 'proposed',
    },
    {
      covers: 'finish',
      title: 'Ajuste final y terminación',
      body: 'Repasá los cantos y los bordes de las perforaciones con lija. Si la madera te llegó cruda, pintá con preservador (H04) todo lo que haya quedado sin sellar, dejá secar y recién ahí aplicá el lasur o aceite (H05); si te la entregan ya tratada y con terminación, alcanza con retocar las testas y los agujeros que hiciste vos. Ponele los regatones (H01) a las cuatro patas y probá la mesa en el lugar donde va a vivir.',
      hardware: ['H01', 'H04', 'H05'],
      caution:
        'El regatón no es un detalle: la testa de la pata apoyada en el piso chupa agua por capilaridad y es lo primero que se pudre en una mesa de exterior.',
      status: 'proposed',
    },
  ],
  tools: [
    {
      name: 'Separadores de 12 mm',
      spec: 'Dos recortes de la misma madera',
      reason:
        'Repartir la luz entre listones sin medir seis veces: se apoyan, se atornilla, se corren.',
      group: 'Medir y marcar',
      status: 'proposed',
    },
    {
      name: 'Avellanador',
      spec: 'O una mecha de 8 mm apoyada apenas',
      reason:
        'Hundir la cabeza de cada tornillo del tablero por debajo de la cara.',
      group: 'Perforar y atornillar',
      status: 'proposed',
    },
  ],
  pending: [
    'Preguntar en el corralón qué te entregan: las piezas cortadas a medida ya está confirmado, falta saber si además vienen tratadas para exterior y con una mano de terminación. Cambia el último paso: si llegan crudas, el preservador va en las testas antes de armar; si llegan terminadas, sólo retocás las testas y los agujeros que hacés vos.',
    'Confirmar escuadrías en el corralón. Están propuestas patas de 45 × 45 mm y el resto de 25 mm de espesor; si lo que hay es 2" × 2" cepillado a 38 × 38, avisá y ajusto el archivo.',
    'El pino tratado suele venir húmedo: dejarlo estacionar a la sombra, apilado con separadores, antes de armar. Si se arma mojado, al secar se abren las juntas y se aflojan los tornillos.',
    'La mesita es liviana para lo alta que es. Si el ejemplar pasa de unos 15 kg, o el lugar es ventoso, conviene anclarla o pasar las patas a 45 × 70 mm.',
  ],
  decisionsDoc: 'docs/designs/mesa-bonsai.md',
};
