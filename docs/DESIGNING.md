# Designing a new piece

A design is a single TypeScript file in `src/designs/`. It declares the opening,
the materials and a list of modules; `buildDesign()` turns that into placed
boards, the cut list, the walls, the dimension lines and the camera. Nothing
else needs editing — the 3D view, the inspector, the table and the printed
manual all read the generated model.

## Workflow

1. Copy the closest design in `src/designs/` (`placard-ejemplo.ts` is a plain
   template; `mueble-bano.ts` is the real bathroom cabinet).
2. Change the id, the name and the numbers.
3. Register it in `src/designs/index.ts`.
4. `npm run test` — the geometry checks run against every registered design.
5. `npm run dev` and look at it.
6. Record the confirmed measurements and the open questions in
   `docs/designs/<id>.md`.

## Coordinates and units

Millimetres everywhere. X is the width of the opening measured from its centre,
Y is height from the floor, Z is depth — negative towards the back wall,
positive towards the open front.

`buildDesign` derives the reference planes every module places itself against:

| Plane | Meaning |
| --- | --- |
| `backZ` / `frontZ` | back wall face and front edge of the piece |
| `undersideHeight` | what the countertop rests on |
| `topHeight` | top surface of the assembled piece |
| `facadeZ` | visible plane of the fronts (front edge minus the setback) |
| `structureZ` | plane just behind the fronts, where the structure lives |

## The specification

```ts
export const myDesign: DesignSpec = {
  id: 'slug-for-the-url',
  name: 'Name in the picker',
  eyebrow: 'SMALL CAPS LINE',
  goal: 'One line describing what this piece is for.',
  opening: { width: 1200, depth: 600, height: 2400 },
  materials: [ /* id, label, short, thickness, colour, roughness, edge colour */ ],
  modules: [ /* see below */ ],
  fixtures: [ /* optional basin */ ],
  highlights: [ /* optional tiles; derived from the opening when omitted */ ],
  pending: [ /* printed under "Antes de fabricar" */ ],
};
```

Materials carry both the full label shown in the inspector and the short one used
in the notes column. Set `banding: false` on a material that takes no edge tape
(solid wood, for instance) and the cut list drops that column for its boards.

Edge banding is declared per board with the L1/L2/A1/A2 convention: L are the
long sides of the board as listed, A the short ones, and each value names the
physical edge ("Delantero", "Lateral de bisagras"). `'pending'` prints "Cantos
por definir"; omitting it means no banding.

## Modules

Every module takes `material`, plus `id` or `idPrefix` (references are numbered
per prefix: `A01`, `A02`, …), and optionally `name`, `group`, `note`, `edging`
and `explode`.

| Kind | What it produces | Key parameters |
| --- | --- | --- |
| `countertop` | the slab, with an optional fixture cutout and a milled front edge | `undersideHeight`, `depth`, `clearance`, `frontRadius`, `cutout` |
| `doors` | a row of hinged fronts, split evenly across the opening | `count`, `gap`, `setback`, `bottomHeight`, `topHeight`, `handles` |
| `side-uprights` | the two strips fixed to the side walls that the doors hinge on | `bottomHeight`, `topHeight`, `depth` |
| `front-rail` | horizontal rail behind the fronts | `topHeight`, `height`, `betweenUprights` |
| `plinth` | front skirt hung under the base | `floorGap`, `height` |
| `panel` | horizontal board: base, shelf, divider | `undersideHeight`, `depth` (a number or `'to-structure'`), `backGap`, `widthInset` |
| `wall-cleats` | the pair of battens carrying a panel | `supports` (a board reference), `height`, `depth`, `inset` |
| `board` | escape hatch: a board placed by hand, optionally mirrored | `size`, `position`, `mirrored` |

`depth: 'to-structure'` stops a panel right behind the fronts, so it never
collides with the doors whatever the setback is. `inset` moves the cleats away
from the side walls, so they can sit on the face of an upright instead.

A shape none of these covers is either a `board` with explicit coordinates, or a
new builder in `src/lib/modules/` — add the type to `spec.ts`, the builder to the
folder, and one line to the registry in `modules/index.ts`.

## What the tests guarantee

`tests/designs.test.mjs` runs against every registered design:

- unique references, positive dimensions, and a cut list that matches the model
  board for board, always long × wide × thickness;
- no two boards intersect in the assembled model;
- nothing sticks out of the opening or sinks into the floor;
- every panel actually rests on the cleats that carry it, overlapping them in
  both width and depth;
- the doors fill the opening with the declared joints and keep their setback;
- the banding schedule names physical edges.

`tests/mueble-bano.test.mjs` pins the measurements confirmed for the bathroom
cabinet, and `tests/basin.test.mjs` checks that the countertop opening clears the
basin body while keeping material under the rim.

When a check fails it is usually the design, not the engine: a panel too deep for
its doors, cleats that miss the board they carry, a shelf running into an
upright. Adjust the numbers until the piece is buildable.
