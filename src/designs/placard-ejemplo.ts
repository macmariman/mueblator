import type { DesignSpec } from '../lib/spec.ts';

/**
 * Worked example, not a real commission: a full-height wardrobe between three
 * walls. Copy this file as the starting point for a new piece of furniture, or
 * delete it and drop its entry from designs/index.ts.
 */
const opening = { width: 1200, depth: 600, height: 2400 };
const panel = 18,
  doorGap = 3,
  baseUnderside = 80,
  backGap = 10;
const baseTop = baseUnderside + panel,
  doorTop = opening.height - 20,
  doorBottom = baseUnderside + doorGap;
const shelfHeights = [700, 1150, 1600];

export const placardEjemplo: DesignSpec = {
  id: 'placard-ejemplo',
  name: 'Placard (ejemplo)',
  eyebrow: 'EJEMPLO / PLANTILLA',
  goal: 'Ejemplo de placard entre tres paredes: base elevada, dos puertas de piso a techo y tres estantes sobre listones. Sirve como plantilla para un mueble nuevo.',
  headline: {
    assembled: 'Mismo motor, otro mueble.',
    exploded: 'Cada pieza, en su lugar.',
  },
  subhead: {
    assembled: 'Ejemplo generado desde su archivo de medidas',
    exploded: 'Despiece de referencia · cotas del conjunto armado',
  },
  opening,
  materials: [
    {
      id: 'melamina18',
      label: 'Melamínico blanco de 18 mm',
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
      kind: 'panel',
      id: 'B01',
      name: 'Base elevada',
      material: 'melamina18',
      undersideHeight: baseUnderside,
      depth: 'to-structure',
      backGap,
      edging: { L1: 'Delantero' },
      note: 'Apoya sobre los listones de pared. Presentar y ajustar contra las paredes antes de fijar.',
    },
    {
      kind: 'wall-cleats',
      idPrefix: 'A',
      name: 'Apoyo de base',
      material: 'melamina18',
      supports: 'B01',
      height: 50,
      note: 'Fijar a la pared con la cara superior a 80 mm del piso.',
    },
    {
      kind: 'side-uprights',
      idPrefix: 'L',
      name: 'Soporte de bisagras',
      material: 'melamina18',
      bottomHeight: baseTop,
      topHeight: doorTop,
      depth: 100,
      edging: { L1: 'Delantero' },
      note: 'Tira lateral anclada a la pared, desde la base hasta el travesaño superior.',
    },
    {
      kind: 'front-rail',
      id: 'F01',
      name: 'Travesaño superior',
      material: 'melamina18',
      topHeight: doorTop,
      height: 80,
      betweenUprights: true,
      edging: { L1: 'Inferior' },
      note: 'Entre los soportes laterales; recibe los topes de cierre.',
    },
    {
      kind: 'plinth',
      id: 'Z01',
      name: 'Zócalo frontal',
      material: 'melamina18',
      floorGap: 0,
      height: baseUnderside,
      edging: { L1: 'Superior' },
      note: 'Tapa el hueco bajo la base; se fija con escuadras.',
    },
    {
      kind: 'doors',
      idPrefix: 'P',
      count: 2,
      gap: doorGap,
      setback: 20,
      bottomHeight: doorBottom,
      topHeight: doorTop,
      material: 'melamina18',
      edging: {
        L1: 'Lateral de bisagras',
        L2: 'Lateral de cierre',
        A1: 'Superior',
        A2: 'Inferior',
      },
      note: 'Puertas de piso a techo con juntas de 3 mm. Definir cantidad de bisagras según la altura.',
    },
    // The shelves clear the uprights, and their cleats sit on the upright faces.
    ...shelfHeights.map((height) => ({
      kind: 'panel' as const,
      idPrefix: 'E',
      name: 'Estante',
      material: 'melamina18',
      undersideHeight: height,
      depth: 500,
      backGap,
      widthInset: panel,
      edging: { L1: 'Delantero' },
      note: 'Estante entre soportes laterales, apoyado sobre listones.',
    })),
    ...shelfHeights.map((_, i) => ({
      kind: 'wall-cleats' as const,
      idPrefix: 'A',
      name: 'Apoyo de estante',
      material: 'melamina18',
      supports: `E0${i + 1}`,
      height: 40,
      inset: panel,
      note: 'Listón atornillado al soporte lateral, no a la pared.',
    })),
  ],
  pending: [
    'Relevar el hueco a distintas alturas antes de cortar.',
    'Definir herrajes: bisagras, tiradores y tornillería.',
  ],
};
