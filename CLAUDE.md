# Working on Mueblator

Mueblator turns a written specification into a buildable piece of furniture: the
3D model, the cut list, the edge-banding schedule and the printed manual are all
generated from one file per design in `src/designs/`. Nothing is drawn by hand.

## Commands

```bash
npm install
npm run dev        # local site (add -- --port 5199 --strictPort to pin the port)
npm run test       # geometry + cut-list checks across every registered design
npm run typecheck  # tsc --noEmit
npm run build      # dist/, relative paths, any static host
```

Run `npm run test` and `npm run typecheck` after every change to a design or to
`src/lib/`. A design change is not done until the tests pass and the piece has
been looked at in the running site.

## The rule that matters

**Measurements come from the user. Never invent one, never silently round one,
never quietly change a confirmed number.** If a dimension the design needs is
missing, ask for it before writing the file. Values the user has not confirmed
belong in `note` / `pending` as proposals, and — where the type allows it, as
with `machiningStatus` — marked `'proposed'`.

The numbers already confirmed for `mueble-bano` are pinned by
`tests/mueble-bano.test.mjs`. Do not touch them unless the user asks; if a test
there fails, the change is wrong until proven otherwise.

## Workflow for a new piece or a change

1. Read `docs/DESIGNING.md` — the specification, the module catalogue and the
   invariants live there. Read the tools section of `docs/INVENTARIO.md` too: a
   fitting that needs a tool the user does not own is not worth proposing.
2. Ask about whatever is undefined (see the checklist below).
3. Copy the closest file in `src/designs/` (`placard-ejemplo.ts` is the neutral
   template, `mueble-bano.ts` the real commission), change the numbers, and
   register it in `src/designs/index.ts`.
4. `npm run test` — the geometry invariants run against every registered design.
5. `npm run dev`, then look at the piece: assembled, exploded, doors open, and
   the print snapshot.
6. Write the confirmed measurements, the open questions and the reasoning into
   `docs/designs/<id>.md`. That file is the project record; the spec file is only
   the current state of it.
7. Contrast the hardware and tool lists against `docs/INVENTARIO.md`: what the
   user has, what has to be bought, and what is close but not the same — say
   the difference out loud and let the user decide, never substitute silently.
   The result of the contrast goes in `docs/designs/<id>.md`, because it is
   dated: once it is bought it stops being true. Nothing in the inventory
   confirms a measurement; it records what exists, not what this piece needs.
   Whatever the piece taught you about tools, words or what the local shops
   stock goes back into `docs/INVENTARIO.md`, one line at a time.

For a change to an existing piece, edit the named constants at the top of its
design file rather than the numbers scattered through the modules.

## Architecture

- `src/lib/spec.ts` — types: opening, materials, modules, fixtures. Add a module
  kind here first.
- `src/lib/build.ts` — pure `buildDesign(spec) -> Model`: placed boards, cut
  groups, walls, dimension lines, camera. No side effects, no rendering.
- `src/lib/modules/` — one builder per module kind, plus `context.ts` with the
  shared reference planes (`backZ`, `structureZ`, `facadeZ`, `topHeight`…).
  Register a new builder in `modules/index.ts`.
- `src/lib/hardware.ts` — the hardware list: what the design declares plus what
  each module proposes (hinges, wall fixings). Proposals are always `'proposed'`.
- `src/lib/fixtures/basin-geometry.ts` — basin profile and the matching cutout.
- `src/components/CabinetView.tsx` — Three.js scene; reads only the built model.
- `src/components/App.tsx` — controls, inspector, cut list, printed manual.
- `src/styles/globals.css` — screen layout and the A4 print composition.

Screws, hinges, plugs and consumables go in `hardware` on the design, with a
`status`. Never write `'confirmed'` on a count the user has not given.

A board that no module produces is either a `board` module with explicit
coordinates, or a new builder. Prefer the new builder when the shape will come
back; prefer `board` for a genuine one-off.

## Conventions

- Millimetres everywhere. X is width from the centre of the opening, Y is height
  from the floor, Z is depth: negative to the back wall, positive to the front.
- The cut list is always **long × wide × thickness**; the thickness travels in
  the notes column with the material. `cutOrder()` derives it — do not hand-write
  a `cut` array.
- Edge banding uses L1/L2/A1/A2: L are the long sides of the board as listed, A
  the short ones, and each value names the physical edge ("Delantero", "Lateral
  de bisagras"). `'pending'` prints "Cantos por definir".
- References are numbered per prefix (`idPrefix: 'A'` → `A01`, `A02`, …) across
  modules, so a second pair of cleats continues the series.
- Sizes in the cut list are **finished** sizes. Say so when handing numbers to a
  workshop; they work out board sizes from the banding.
- Set `banding: false` on a material that takes no edge tape (solid wood).

## Language

Code, comments, documentation and commit messages in English. Everything the
user or the carpenter reads on screen — design names, part names, notes,
headlines, the printed manual — in rioplatense Spanish, voseo, matching the copy
already in `App.tsx` and the design files.

## Assets

- The app draws everything procedurally with Three.js. There are no textures, no
  images and no icon files beyond `public/favicon.svg`.
- Icons come from `lucide-react`; UI primitives from the two local components in
  `src/components/ui/` (`@base-ui/react` underneath). Do not add a UI kit.
- Type is the system Arial stack from `globals.css`. No web fonts, no CDN: the
  build must stay self-contained and work offline.
- New static assets go in `public/` and are referenced relatively (`./file.svg`),
  because the build uses `base: './'` and may be served from a subfolder.
- Upstream reference, if the original behaviour ever needs checking:
  `https://github.com/PabloManzoni/mueble-bano-3d` (public, **no licence file**),
  deployed at `https://pablomanzoni.github.io/mueble-bano-3d/`. Attribution is in
  the README. Do not publish this project without talking to the author first.
- The basin geometry is illustrative. The real cutout comes from the cardboard
  template the user takes to the carpenter — never present the model as a
  cutting pattern.

## Ask before assuming

When a request leaves any of these open, ask rather than pick a value:

- Is the width the same at every height? Are the walls square and plumb?
- Is a stated dimension the opening, or the finished board?
- What rests on what: which panels are fixed, which must come out?
- Materials and thicknesses, and whether the edge banding thickness is settled.
- Hardware: hinge type and count, runners, handles, wall fixings.
- Plumbing, electrics or ducts crossing the piece.
- What the piece must hold — it changes shelf spans and fixings.

One or two questions that change the design are worth asking. Details that only
affect a note can be written down as pending instead.

## Recommend, but mark it as a proposal

Flag buildability problems as they come up — an unsupported shelf span, a door
that will foul a frame, a panel too deep for its doors, moisture exposure on a
cut edge, a fixing that will not hold in that wall. Say what you would do, keep
it in `note` or `pending`, and leave the decision to the user.

## Decisions already taken — do not undo

- Measurements are entered by editing a design file. There is deliberately **no
  parameter form in the web UI**.
- Several designs coexist; the header picker switches them and the choice is kept
  in the URL (`?d=<id>`).
- The inspector does not show per-piece notes, and the printed manual carries no
  assembly order. Both were removed at the user's request.
- The printed picture is always the assembled piece with dimensions, doors closed
  and fixtures visible, whatever is on screen at the time.
