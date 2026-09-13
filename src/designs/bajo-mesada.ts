import type { DesignSpec } from '../lib/spec.ts';

// Confirmed measurements and pending decisions: docs/designs/bajo-mesada.md
// The marble top, its apron and the trap stay: they are drawn as a fixture and
// never reach the cut list. The carcass has no back; the tiled wall is its back.
const panel = 18, // body board thickness
  slabUnderside = 755, // confirmed (C2): floor to the underside of the slab
  apronBottom = 690, // confirmed (C): floor to the underside of the apron
  apronThickness = 20, // confirmed: 340 mm to its outer face, 320 mm to its inner one
  trapFromLeft = 630, // confirmed (F1): left wall to the trap axis
  trapFront = 240, // measured, drawn only: nothing depends on it (see the front rail)
  trapLowest = 550, // confirmed (F): floor to the lowest point of the trap
  trapDiameter = 100, // confirmed as approximate ("como 10 cm")
  frameBlockHeight = 110, // confirmed: the block at the foot of the door frame
  frameIntrusion = 10, // confirmed as approximate: the frame reaches into the width in front of the marble
  basin = { length: 610, width: 380, height: 120 }, // confirmed outside size
  bottomFace = 150, // confirmed: 120 mm robot vacuum plus 30 mm of margin
  nicheClear = 280; // confirmed: clear width of each open side niche

// Proposals, not confirmed yet: see "Propuesto" in the decisions document.
const sideClearance = 10, // per side: the carcass has to pass the door frame on its way in
  backGap = 10, // against the tiles of the back wall
  topClearance = 10, // under the apron, so the carcass slides in beneath it
  railHeight = 60,
  nicheRailHeight = 80,
  doorWidth = 320, // round on purpose; the overlay on the divider follows from it
  doorGap = 2,
  footSetback = 50, // from the front and the sides, clear of the door frame block
  footDiameter = 40, // drawn only
  slabThickness = 20; // not measured: the slab is only drawn

const top = apronBottom - topClearance;
const opening = {
  width: 1260, // confirmed, at the front; 1265 mm at the back
  depth: 340, // confirmed: back wall to the outer face of the apron
  height: top, // top of the piece; the marble above it is a fixture
};

const outer = opening.width / 2 - sideClearance,
  sideInner = outer - panel,
  dividerOuter = sideInner - nicheClear,
  dividerInner = dividerOuter - panel,
  nicheX = (sideInner + dividerOuter) / 2;
const backZ = -opening.depth / 2,
  carcassBack = backZ + backGap,
  carcassFront = opening.depth / 2 - panel, // the doors sit flush with the apron
  depth = carcassFront - carcassBack,
  midZ = (carcassBack + carcassFront) / 2;
// No top panel: the niches are open up to the marble, so their shelf sits
// halfway between the floor of the carcass and its top edge. The centre shelf
// lines up with them (confirmed), well clear of the trap.
const interiorBottom = bottomFace + panel,
  nicheShelfUnderside = (interiorBottom + top - panel) / 2,
  centreShelfUnderside = nicheShelfUnderside,
  centreShelfDepth = depth - 10;
// The doors cover the carcass from its underside to its top, and two leaves of
// `doorWidth` with their joints set the stretch they share.
const doorBottom = bottomFace,
  doorTop = top,
  doorSpan = doorWidth + (3 * doorGap) / 2,
  doorOverlay = doorSpan - doorGap - dividerInner;

export const bajoMesada: DesignSpec = {
  id: 'bajo-mesada',
  name: 'Bajo mesada de mármol',
  eyebrow: 'BAÑO / BAJO MESADA',
  goal: 'Mueble para todo el hueco bajo la mesada de mármol existente: nichos abiertos a los costados, dos puertas al centro que tapan el sifón, sin fondo y sobre patas, elevado para que pase la aspiradora robot.',
  headline: {
    assembled: 'Todo el hueco, y el robot pasa abajo.',
    exploded: 'Una caja sin fondo, pieza por pieza.',
  },
  subhead: {
    assembled: 'Mesada y sifón existentes · nichos de 28 cm · 15 cm libres al piso',
    exploded: 'Despiece de referencia · medidas terminadas',
  },
  opening,
  materials: [
    {
      id: 'melamina18',
      label: 'Melamínico blanco mate de 18 mm',
      short: 'Melamínico 18 mm',
      thickness: panel,
      color: '#f4f2ee',
      roughness: 0.95,
      edgeColor: '#7c868d',
      edgeOpacity: 0.5,
    },
  ],
  modules: [
    {
      kind: 'board',
      idPrefix: 'L',
      name: 'Lateral',
      group: 'Caja',
      material: 'melamina18',
      mirrored: true,
      size: [panel, top - bottomFace, depth],
      position: [outer - panel / 2, (bottomFace + top) / 2, midZ],
      explode: [180, 0, 0],
      edging: { L1: 'Delantero' },
      note: `Desde ${bottomFace} hasta ${top} mm del piso. Queda a ${sideClearance} mm de la pared, sin tornillos: se calza arriba con cuñas. El canto trasero va contra el azulejo: sellarlo aunque no se vea.`,
    },
    {
      kind: 'board',
      idPrefix: 'B',
      name: 'Piso',
      group: 'Caja',
      material: 'melamina18',
      size: [2 * sideInner, panel, depth],
      position: [0, bottomFace + panel / 2, midZ],
      explode: [0, -90, 0],
      edging: { L1: 'Delantero' },
      note: `Entre los dos laterales. Su cara inferior queda a ${bottomFace} mm del piso: el robot mide 120 mm. Lleva las patas atornilladas por debajo.`,
    },
    {
      kind: 'board',
      idPrefix: 'D',
      name: 'Divisor',
      group: 'Caja',
      material: 'melamina18',
      mirrored: true,
      size: [panel, top - interiorBottom, depth],
      position: [dividerInner + panel / 2, (interiorBottom + top) / 2, midZ],
      explode: [90, 0, 0],
      edging: { L1: 'Delantero' },
      note: `Separa el nicho del centro: deja ${nicheClear} mm libres hasta el lateral. Apoya sobre el piso y llega arriba como los laterales. Del lado del centro recibe las bases de las bisagras.`,
    },
    {
      kind: 'board',
      idPrefix: 'F',
      name: 'Travesaño delantero',
      group: 'Caja',
      material: 'melamina18',
      size: [2 * dividerInner, railHeight, panel],
      position: [0, top - railHeight / 2, carcassFront - panel / 2],
      explode: [0, 90, 60],
      edging: { L1: 'Inferior' },
      note: `Parado, arriba, entre los dos divisores y justo detrás de las puertas, que lo tapan. Ata la caja por arriba, que no tiene tapa: la tapa es el mármol. Parado ocupa sólo los últimos ${panel} mm de fondo, así que el sifón puede llegar hasta ${carcassFront - panel - backZ} mm de la pared sin tocarlo.`,
    },
    {
      kind: 'board',
      idPrefix: 'F',
      name: 'Travesaño trasero',
      group: 'Caja',
      material: 'melamina18',
      mirrored: true,
      size: [nicheClear, nicheRailHeight, panel],
      position: [nicheX, top - nicheRailHeight / 2, carcassBack + panel / 2],
      explode: [120, 90, -60],
      edging: { L1: 'Inferior' },
      note: 'Parado contra la pared del fondo, arriba del nicho, entre el lateral y el divisor. Sólo en los nichos: en el centro pasa el caño del sifón.',
    },
    {
      kind: 'board',
      idPrefix: 'F',
      name: 'Travesaño trasero bajo',
      group: 'Caja',
      material: 'melamina18',
      size: [2 * dividerInner, nicheRailHeight, panel],
      position: [0, interiorBottom + nicheRailHeight / 2, carcassBack + panel / 2],
      explode: [0, -60, -90],
      edging: { L1: 'Superior' },
      note: `Parado sobre el piso, contra la pared del fondo, entre los dos divisores. Cierra el centro como un marco junto con el travesaño delantero, que es lo que lo mantiene a escuadra al trasladarlo. Queda a ${trapLowest - interiorBottom - nicheRailHeight} mm por debajo del sifón.`,
    },
    {
      kind: 'board',
      idPrefix: 'E',
      name: 'Estante de nicho',
      group: 'Caja',
      material: 'melamina18',
      mirrored: true,
      size: [nicheClear, panel, depth],
      position: [nicheX, nicheShelfUnderside + panel / 2, midZ],
      explode: [150, 0, 40],
      edging: { A1: 'Delantero' },
      note: `A media altura del nicho, cara inferior a ${nicheShelfUnderside} mm. Fijo, atornillado desde el lateral y el divisor: sin fondo, estos estantes son los que mantienen la caja a escuadra.`,
    },
    {
      kind: 'board',
      idPrefix: 'E',
      name: 'Estante central',
      group: 'Estante central',
      material: 'melamina18',
      size: [2 * dividerInner - 2, panel, centreShelfDepth],
      position: [
        0,
        centreShelfUnderside + panel / 2,
        carcassBack + centreShelfDepth / 2,
      ],
      explode: [0, 60, 90],
      edging: { L1: 'Delantero' },
      note: `Suelto, sobre cuatro soportes, para poder sacarlo y llegar al sifón. A la misma altura que los estantes de nicho: cara superior a ${centreShelfUnderside + panel} mm, ${trapLowest - centreShelfUnderside - panel} mm por debajo del punto más bajo del sifón. 10 mm más corto que la caja para que cierren las puertas.`,
    },
    {
      kind: 'doors',
      idPrefix: 'P',
      count: 2,
      gap: doorGap,
      setback: 0,
      span: [-doorSpan, doorSpan],
      cupBoring: 'workshop', // confirmed: the leaves arrive bored
      bottomHeight: doorBottom,
      topHeight: doorTop,
      material: 'melamina18',
      handles: true,
      edging: {
        L1: 'Lateral de bisagras',
        L2: 'Lateral de cierre',
        A1: 'Superior',
        A2: 'Inferior',
      },
      note: `Al ras de la cara de afuera del frentín, de ${doorBottom} a ${doorTop} mm: tapan el canto del piso y del travesaño. Cada puerta cubre ${doorOverlay} mm del divisor de ${panel} mm y abre hacia su nicho, lejos del marco y de la columna: no hacen falta rellenos. Junta central de ${doorGap} mm. Elegir la bisagra antes de perforar: el recubrimiento depende del modelo y de la base.`,
    },
  ],
  fixtures: [
    {
      // The six feet of H01, drawn so the piece is seen standing. Hardware,
      // not boards: they never reach the cut list.
      kind: 'feet',
      height: bottomFace,
      diameter: footDiameter,
      positions: [-1, 0, 1].flatMap((side) =>
        [carcassFront - footSetback, carcassBack + footSetback].map(
          (z): [number, number] => [side * (outer - footSetback), z],
        ),
      ),
    },
    {
      kind: 'existing-top',
      undersideHeight: slabUnderside,
      thickness: slabThickness,
      apron: { bottomHeight: apronBottom, thickness: apronThickness },
      trap: {
        x: trapFromLeft - opening.width / 2,
        frontZ: backZ + trapFront,
        lowestHeight: trapLowest,
        radius: trapDiameter / 2,
      },
      // Drawn against the back wall and over the trap. It is deeper than the
      // slab, so it overhangs the front, as the user described.
      vessel: {
        x: trapFromLeft - opening.width / 2,
        z: backZ + basin.width / 2,
        ...basin,
      },
    },
  ],
  // Nothing here is confirmed: son propuestas para revisar en la ferretería.
  // Explicit references so the assembly steps can name them.
  hardware: [
    {
      id: 'H01',
      name: 'Pata regulable',
      spec: 'Plástica, con rango que incluya 150 mm',
      quantity: 6,
      group: 'Herrajes',
      status: 'proposed',
      note: `Cuatro en las esquinas y dos al centro: el piso mide ${2 * sideInner} mm y sin apoyo al medio se comba. Retiradas unos 50 mm del frente, para que el robot entre derecho y para librar el taco del marco (110 × 30 × 20 mm). Absorben la pendiente del piso.`,
    },
    {
      id: 'H02',
      name: 'Soporte de estante',
      spec: 'Pin de 5 mm',
      quantity: 4,
      group: 'Herrajes',
      status: 'proposed',
      note: 'Para el estante central, que queda suelto para poder llegar al sifón.',
    },
    {
      id: 'H04',
      name: 'Manija',
      spec: 'De barra, negra',
      quantity: 2,
      group: 'Herrajes',
      status: 'proposed',
      covers: 'door-handles',
      note: 'Tipo y color elegidos por el usuario: barra negra. Una por puerta, junto al canto de cierre. Falta el modelo, el largo y la distancia entre agujeros, que hay que pasarle al taller si perfora las puertas.',
    },
    {
      id: 'H05',
      name: 'Tornillo confirmat',
      spec: '7 × 50 mm',
      quantity: 30,
      group: 'Ensamble',
      status: 'proposed',
      note: 'Laterales contra piso y travesaños, divisores, travesaños traseros y estantes de nicho. Cantidad estimada. En el canto del melamínico agarra mucho más que un tornillo común, y en una caja sin fondo eso importa. Averiguar si el taller entrega las piezas perforadas; si no, hace falta una mecha escalonada para confirmat, o volver al tornillo de 4 × 50 con pretaladro.',
    },
    {
      id: 'H06',
      name: 'Cuña de ajuste',
      spec: 'Plástica, fina',
      quantity: 4,
      group: 'Ensamble',
      status: 'proposed',
      note: `El mueble no se atornilla a la pared (decisión del usuario). Dos por lateral, arriba, en la luz de ${sideClearance} mm contra la cerámica, para que no baile. Si queda flojo, dos puntos de silicona por lateral lo afirman sin perforar y se sacan con un cúter.`,
    },
  ],
  assembly: [
    {
      covers: 'board:Caja',
      title: 'Armar la caja en el piso',
      body: `Armala acostada sobre una manta, con el frente hacia vos. Primero los laterales L01 y L02 con el piso B01 entre ellos. Después los divisores D01 y D02, parados sobre el piso a ${nicheClear} mm libres de cada lateral, el travesaño delantero F01 parado arriba entre los divisores, los traseros F02 y F03 contra el fondo de cada nicho, y el trasero bajo F04 sobre el piso, entre los divisores. Por último los estantes de nicho E01 y E02, atornillados desde el lateral y el divisor. Medí las dos diagonales del frente antes del apriete final. Con la caja dada vuelta, atornillá las seis patas al piso.`,
      caution:
        'Sin fondo, la caja se descuadra con nada mientras la armás. Los estantes de nicho y los travesaños son lo que la mantiene a escuadra: no los dejes para después.',
      parts: ['L01', 'L02', 'B01', 'D01', 'D02', 'F01', 'F02', 'F03', 'F04', 'E01', 'E02'],
      hardware: ['H01', 'H05'],
      status: 'proposed',
    },
    {
      covers: 'board:Estante central',
      title: 'Entrar el mueble, nivelar y calzar',
      body: `Dejá las patas con la cara inferior de la caja a ${bottomFace} mm del piso y entrala derecho, de frente. El marco de la puerta se mete unos ${frameIntrusion} mm por delante del mármol: entre el marco y la columna quedan unos ${opening.width - frameIntrusion} mm y la caja mide ${2 * outer}, así que pasa con ${opening.width - frameIntrusion - 2 * outer} mm. Arrimala a la columna al pasar el marco. Pasa ${bottomFace - frameBlockHeight} mm por encima del taco del marco y ${topClearance} mm por debajo del frentín. Adentro, nivelá con las patas de lado a lado y de adelante hacia atrás, y calzá cada lateral arriba con dos cuñas contra la cerámica. Después apoyá el estante central E03 sobre sus cuatro soportes, por debajo del sifón.`,
      caution: `No bajes las patas para entrarla: con la cara inferior por debajo de ${frameBlockHeight} mm, el lateral izquierdo pega en el taco del marco. Y por encima de ${apronBottom - (top - bottomFace)} mm no pasa bajo el frentín.`,
      parts: ['E03'],
      hardware: ['H01', 'H02', 'H06'],
      status: 'proposed',
    },
    {
      // Same text as the derived step; declared only so it names the hinges
      // and handles and not every line under "Herrajes" (legs, shelf pins).
      covers: 'doors',
      title: 'Colgar las puertas',
      body: `P01 y P02 vienen del taller con las cazoletas perforadas. Atornillá las bisagras a la hoja, después las bases a la cara de cada divisor que da al centro, y colgá. Cada hoja cubre ${doorOverlay} mm del divisor. Dejá la regulación fina para el último paso.`,
      caution:
        'Antes de fijar las bases, presentá la bisagra en la cazoleta: si el taller perforó para otro modelo, no calza. Pedí las bisagras con las que perforaron.',
      parts: ['P01', 'P02'],
      hardware: ['H03', 'H04'],
      status: 'proposed',
    },
  ],
  // Nothing is drilled into the walls, so no percussion drill, tile bit or detector.
  tools: [
    {
      name: 'Mecha de 5 mm con tope',
      reason: 'Los agujeros de los soportes del estante central, sin atravesar el divisor.',
      group: 'Perforar y atornillar',
      status: 'proposed',
    },
  ],
  dimensions: [
    {
      from: [outer + 40, 0, opening.depth / 2 + 20],
      to: [outer + 40, bottomFace, opening.depth / 2 + 20],
      text: `Libre ${bottomFace} mm`,
      offset: [95, 0, 0],
    },
    {
      from: [nicheX, 0, opening.depth / 2 + 20],
      to: [nicheX, nicheShelfUnderside + panel, opening.depth / 2 + 20],
      text: `Estantes ${nicheShelfUnderside + panel} mm`,
      offset: [0, 0, 0],
    },
    {
      from: [nicheX, nicheShelfUnderside + panel, opening.depth / 2 + 20],
      to: [nicheX, apronBottom, opening.depth / 2 + 20],
      text: `Hasta el frentín ${apronBottom - nicheShelfUnderside - panel} mm`,
      offset: [0, 0, 0],
    },
    {
      from: [-sideInner, top + 30, opening.depth / 2 + 20],
      to: [-dividerOuter, top + 30, opening.depth / 2 + 20],
      text: `Nicho ${nicheClear} mm`,
      offset: [0, 40, 0],
    },
  ],
  highlights: [
    { value: '126 cm', label: 'Hueco de referencia' },
    { value: '15 cm', label: 'Libre bajo el mueble' },
    { value: '28 cm', label: 'Nichos, luz libre' },
    { value: '34 cm', label: 'Fondo hasta el frentín' },
  ],
  printSubtitle:
    'Hueco: 1260 × 340 mm bajo la mesada de mármol existente · cara inferior a 150 mm · nichos de 280 mm libres · medidas terminadas.',
  pending: [
    'Definir el espesor del tapacanto: la lista expresa medidas terminadas.',
    'Preguntar al taller si entrega las piezas perforadas para tornillo confirmat, además de las cazoletas de las puertas.',
    'Preguntar en la barraca por placa hidrófuga en blanco; el lado derecho linda con la ducha.',
    'Manijas de barra negras: elegir modelo, largo y distancia entre agujeros.',
    'Las puertas vienen perforadas del taller: pedirles también las bisagras con las que perforan, para 17 mm de recubrimiento sobre el divisor de 18 mm.',
    'Sin tornillos a la pared: se calza con cuñas. Si queda flojo, silicona en dos puntos por lateral.',
    'Comprobar que las patas regulen hasta 150 mm, y que la caja pase bajo el frentín con 10 mm de luz.',
  ],
  decisionsDoc: 'docs/designs/bajo-mesada.md',
};
