# Mueblator

Parametric workshop for built-in furniture. You describe a piece in one file —
opening, materials and modules — and the app generates the interactive 3D model,
the cut list, the edge-banding schedule and the printable manual from it.

Adapted from [PabloManzoni/mueble-bano-3d](https://github.com/PabloManzoni/mueble-bano-3d)
(public, no licence file). The original hard-coded a single bathroom cabinet;
here every board is derived from a design specification, and several designs can
live side by side. The bathroom cabinet is reproduced board for board, to the
millimetre — `tests/mueble-bano.test.mjs` pins those numbers.

## Use

```bash
npm install
npm run dev        # local site, address printed by the terminal
npm run test       # geometry and cut-list checks for every design
npm run typecheck  # TypeScript, no emit
npm run build      # production site in dist/ (relative paths, any static host)
```

The site keeps the features of the original: drag to rotate, wheel or pinch to
zoom, camera buttons and presets, tap a board to inspect it, switches for
dimensions, walls, fixtures, open doors and exploded view, interactive cut list,
and **Imprimir / PDF**, which captures a fixed picture of the assembled piece and
prints it with the grouped cut list and the pending decisions.

A picker in the header switches between designs; the choice is kept in the URL
(`?d=mueble-bano`), so a link always opens the same piece.

## Designing a new piece

Every design is one file in `src/designs/`. Copy the closest one, change the
numbers, register it in `src/designs/index.ts`, and run the tests.
`docs/DESIGNING.md` documents the specification, the available modules and the
invariants the tests enforce.

## Layout

- `src/lib/spec.ts` — the shape of a design: opening, materials, modules, fixtures.
- `src/lib/build.ts` — turns a specification into the model: placed boards, cut
  groups, walls, dimension lines and camera. Pure function, no side effects.
- `src/lib/modules/` — one builder per module kind (countertop, doors, uprights,
  rail, plinth, panel, wall cleats, free board). New shapes are added here.
- `src/lib/fixtures/basin-geometry.ts` — basin profile and the matching cutout in
  the countertop, shared by the view and the tests.
- `src/components/CabinetView.tsx` — Three.js scene, camera, selection and the
  snapshot used for printing.
- `src/components/App.tsx` — controls, inspector, cut list and printed manual.
- `src/styles/globals.css` — responsive layout and the A4 print composition.
- `src/designs/` — one file per piece of furniture.
- `docs/designs/` — decisions, confirmed measurements and open questions per piece.

All lengths are millimetres. X is the width of the opening measured from its
centre, Y is height from the floor, and Z is depth: negative towards the back
wall, positive towards the open front.

The dimensions describe a design, not a certified survey. The cut list states
finished sizes; the workshop works out the board sizes once the edge banding is
settled.
