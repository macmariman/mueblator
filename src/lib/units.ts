import type { Part } from './spec.ts';

/** Millimetres with at most one decimal, in the local number format. */
export const fmt = (n: number) =>
  n.toLocaleString('es-UY', { maximumFractionDigits: 1 });

/** Centimetres, for the summary tiles. */
export const cm = (mm: number) => `${fmt(mm / 10)} cm`;

/** Long × wide: the thickness travels in the notes column, next to the material. */
export const cutLabel = (p: Part) => p.cut.slice(0, 2).map(fmt).join(' × ');

/**
 * Workshop cut order for a placed board: the axis matching the material
 * thickness becomes the third figure, the other two go long × wide.
 */
export function cutOrder(size: [number, number, number], thickness: number) {
  const axes = size.map((value, axis) => ({ value, axis }));
  const thicknessAxis = axes.reduce((best, candidate) =>
    Math.abs(candidate.value - thickness) < Math.abs(best.value - thickness)
      ? candidate
      : best,
  );
  const rest = axes
    .filter((a) => a.axis !== thicknessAxis.axis)
    .map((a) => a.value)
    .sort((a, b) => b - a);
  return [rest[0], rest[1], thicknessAxis.value] as [number, number, number];
}
