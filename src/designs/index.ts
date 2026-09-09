import type { DesignSpec } from '../lib/spec.ts';
import { mesaBonsai } from './mesa-bonsai.ts';
import { muebleBano } from './mueble-bano.ts';
import { placardEjemplo } from './placard-ejemplo.ts';

/**
 * Every design the site can show. Add a new file next to this one, import it
 * here, and it appears in the picker with its own 3D model, cut list and manual.
 */
export const designs: DesignSpec[] = [muebleBano, mesaBonsai, placardEjemplo];

export const defaultDesign = designs[0];

export const designById = (id: string | null | undefined) =>
  designs.find((d) => d.id === id) ?? defaultDesign;
