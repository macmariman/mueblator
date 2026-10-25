/**
 * Write the cut list of a design as a Cortecloud import file.
 *
 *   node --experimental-strip-types scripts/export-cortecloud.mjs bajo-mesada \
 *     --board melamina18=FMBM18 --tape melamina18="ABS Blanco" --out pedido.json
 *
 * The board and tape names are the store's catalogue strings, not the design's:
 * pass the ones the service shows, and Cortecloud links them to its stock when
 * the file loads. Without them the file carries the design's own labels, which
 * still import — they just have to be mapped by hand on the way in.
 */

import { writeFileSync } from 'node:fs';
import { buildDesign } from '../src/lib/build.ts';
import { toCortecloud, tapeMetres } from '../src/lib/export/cortecloud.ts';
import { designs } from '../src/designs/index.ts';

const args = process.argv.slice(2),
  id = args.find((a) => !a.startsWith('--')),
  flag = (name) => {
    const at = args.indexOf(`--${name}`);
    return at === -1 ? undefined : args[at + 1];
  },
  pairs = (name) =>
    Object.fromEntries(
      args
        .flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []))
        .map((value) => {
          const at = value.indexOf('=');
          if (at === -1) throw new Error(`--${name} takes materialId=nombre`);
          return [value.slice(0, at), value.slice(at + 1)];
        }),
    );

const spec = designs.find((d) => d.id === id);
if (!spec) {
  console.error(`Unknown design "${id}". Known: ${designs.map((d) => d.id).join(', ')}`);
  process.exit(1);
}

const file = toCortecloud(buildDesign(spec), {
    boards: pairs('board'),
    tapes: pairs('tape'),
  }),
  out = flag('out') ?? `${spec.id}-cortecloud.json`,
  pieces = file.parts.reduce((n, p) => n + p.quantity, 0);

writeFileSync(out, `${JSON.stringify(file, null, 2)}\n`);
console.log(
  `${out}: ${file.parts.length} líneas, ${pieces} piezas, ${tapeMetres(file).toFixed(2)} m de tapacanto`,
);
for (const part of file.parts) {
  const edges = [part.c1, part.c2, part.l1, part.l2].filter(Boolean).length;
  console.log(
    `  ${part.complement.padEnd(8)} ${String(part.quantity).padStart(2)} × ${part.c}×${part.l}  ${edges} canto(s)  ${part.material}`,
  );
}
