import { edgeKeys, type EdgeBanding, type EdgingInput, type Part } from './spec.ts';

/** Normalise the shorthand accepted in a design file into a full record. */
export function resolveEdging(input: EdgingInput | undefined): EdgeBanding | null {
  if (input === 'pending') return null;
  const given = input ?? {};
  return Object.fromEntries(
    edgeKeys.map((key) => [key, given[key] ?? null]),
  ) as EdgeBanding;
}

export const bandedEdges = (p: Part) => edgeKeys.filter((key) => p.edging?.[key]);

export function edgingSummary(p: Part) {
  if (p.edging === null) return 'Por definir';
  const count = bandedEdges(p).length;
  return count === 0
    ? 'Sin tapacantos'
    : count === 1
      ? '1 canto'
      : `${count} cantos`;
}

/** Which sides the banding reaches: L1/L2 are long sides, A1/A2 short ones. */
function edgedSides(p: Part) {
  const banded = bandedEdges(p),
    long = banded.filter((key) => key.startsWith('L')).length,
    wide = banded.length - long;
  if (long === 2 && wide === 2) return 'todos los lados';
  if (banded.length === 1) return long ? 'lado largo' : 'lado ancho';
  if (!wide) return 'lados largos';
  if (!long) return 'lados anchos';
  const count = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;
  return `${count(long, 'lado largo', 'lados largos')} y ${count(wide, 'lado ancho', 'lados anchos')}`;
}

/** Banding note for the cut list: how many edges and on which sides. */
export function edgingNote(p: Part) {
  if (p.edging === null) return 'Cantos por definir';
  return bandedEdges(p).length === 0
    ? 'Sin tapacantos'
    : `${edgingSummary(p)} (${edgedSides(p)})`;
}

export function edgingLocation(p: Part) {
  if (p.edging === null) return 'Según material de la pieza';
  return (
    bandedEdges(p)
      .map((key) => `${key}: ${p.edging![key]}`)
      .join(' · ') || 'Ningún borde'
  );
}

export function machiningLabel(p: Part) {
  if (!p.machining) return '';
  const status = p.machining.status === 'proposed' ? ' (propuesto)' : '';
  return `Canto delantero fresado redondo · R${p.machining.radius} mm${status}`;
}
