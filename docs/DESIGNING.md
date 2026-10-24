# Designing a new piece

A design is a single TypeScript file in `src/designs/`. It declares the opening,
the materials and a list of modules; `buildDesign()` turns that into placed
boards, the cut list, the walls, the dimension lines and the camera. Nothing
else needs editing — the 3D view, the inspector, the table and the printed
manual all read the generated model.

## Workflow

1. Copy the closest design in `src/designs/` (`mesa-bonsai.ts` is the simplest
   one, built out of plain `board` modules; `mueble-bano.ts` is the real
   bathroom cabinet and uses the whole module catalogue).
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
  fixtures: [ /* optional basin, bonsai */ ],
  hardware: [ /* screws, hinges, plugs; see below */ ],
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
| `doors` | a row of hinged fronts, split evenly across the opening, or across `span` | `count`, `gap`, `setback`, `bottomHeight`, `topHeight`, `handles`, `span`, `cupBoring` |
| `side-uprights` | the two strips fixed to the side walls that the doors hinge on | `bottomHeight`, `topHeight`, `depth` |
| `front-rail` | horizontal rail behind the fronts | `topHeight`, `height`, `betweenUprights` |
| `plinth` | front skirt hung under the base | `floorGap`, `height` |
| `panel` | horizontal board: base, shelf, divider | `undersideHeight`, `depth` (a number or `'to-structure'`), `backGap`, `widthInset` |
| `wall-cleats` | the pair of battens carrying a panel | `supports` (a board reference), `height`, `depth`, `inset` |
| `board` | escape hatch: a board placed by hand, optionally mirrored | `size`, `position`, `mirrored` |

`depth: 'to-structure'` stops a panel right behind the fronts, so it never
collides with the doors whatever the setback is. `span: [left, right]` gives
the doors a stretch narrower than the opening — the X of its two edges, joints
included — for fronts flanked by open niches. `cupBoring: 'workshop'` says the
leaves arrive with the hinge cups bored: the tool list drops the 35 mm bit and
the assembly step says the leaves come bored. `inset` moves the cleats away
from the side walls, so they can sit on the face of an upright instead.

A shape none of these covers is either a `board` with explicit coordinates, or a
new builder in `src/lib/modules/` — add the type to `spec.ts`, the builder to the
folder, and one line to the registry in `modules/index.ts`.

## Fixtures

Everything drawn that is not a board: the basin of a bathroom cabinet, the tree
on a display table. A fixture never reaches the cut list and no measurement
depends on it — it is there to show what the piece is for.

| Kind | Geometry | Key parameters |
| --- | --- | --- |
| `basin-with-faucet` | `fixtures/basin-geometry.ts` | `profile`, `lift`, `scaleX`, `clearance`, `faucet`, `trap` |
| `bonsai` | `fixtures/bonsai-geometry.ts` | `pot`, `height`, `spread`, `seed` |
| `existing-top` | boxes, a lathe and a tube in `CabinetView.tsx` | `undersideHeight`, `thickness`, `apron`, `trap`, `vessel` |
| `feet` | cylinders in `CabinetView.tsx` | `height`, `diameter`, `positions` |

A fixture rests on the top of the piece and the camera frames whatever it stands
above, so a tall one is not cropped. `existing-top` is the exception: a slab
that is already there and stays, drawn at its own height across the whole
opening, with its apron and the drain trap under it, so the piece can be
judged against what it has to clear. The toggle that hides them takes its name
from the fixtures the design declares.

A basin is the one fixture that changes a board: the countertop `cutout`. That
opening is illustrative too — the real one comes from the user's cardboard
template.

## Hardware

Everything that is not a board — hinges, handles, screws, wall plugs, brackets,
sealant — is a line of `hardware`:

```ts
hardware: [
  {
    name: 'Bisagra de cazoleta',
    spec: 'Cazoleta 35 mm, codo 0',
    quantity: 8,
    unit: 'u',              // 'u' | 'par' | 'juego' | 'm' | 'caja'
    group: 'Herrajes',      // Herrajes · Fijación a pared · Ensamble · Consumibles
    status: 'proposed',     // 'confirmed' only for what the user actually decided
    sourcing: 'Marca y casa donde se consigue, cuando se sepa',
    covers: 'door-hinges',  // replaces the proposal the doors module would make
    note: 'Por qué esa cantidad y qué falta decidir.',
  },
],
```

`status` is required, and it follows the same rule as every measurement: a count
worked out from the model is `'proposed'`, never `'confirmed'`. Proposed lines
print with an "A confirmar" badge on screen and in the manual.

Modules propose what they obviously need, so a design that declares nothing
still gets a usable list:

| Role | Proposed by | How the count is worked out |
| --- | --- | --- |
| `door-hinges` | `doors` | `hingesPerLeaf`, or the trade rule by leaf height: 2 up to 900 mm, 3 up to 1600 mm, 4 above |
| `door-handles` | `doors` with handles | one per leaf |
| `wall-fixings` | `wall-cleats`, `side-uprights` | one fixing every 400 mm of board, minimum two, as a screw line and a plug line |

A declared item naming that role in `covers` replaces the proposal entirely, so
a decision the user has taken always wins over the rule of thumb. The plug and
screw lines stay generic on purpose: the plug depends on the wall, which is a
question for the user, not something to guess.

The list lives in `src/lib/hardware.ts` and is rebuilt with the model, so it
follows the piece: change the door count and the hinges follow.

## Assembly order and tools

`src/lib/assembly.ts` works out the order the piece goes together in, and the
tools it asks for, from the modules themselves. Nothing is written by hand
unless the design chooses to.

The order is the module kinds in `kindOrder` — what is fixed to a wall first,
what rests on it next, the fronts last — with two steps that belong to no
module around them: `'prep'` (count and check the boards, check the recess) and
`'finish'` (adjust, regulate, finish). Inside one rank, the lower board goes
first. Modules of the same kind each get their own step; hand-placed `board`
modules collapse into one step per `group`, so six identical slats read as one
step instead of six.

Every derived step is `'proposed'` and says so on screen and on paper. A design
overrides one by declaring a step with the matching `covers`:

```ts
assembly: [
  {
    covers: 'board:Patas',      // a module kind, `board:<group>`, 'prep' or 'finish'
    title: 'Armar los dos laterales, en el piso',
    body: '…',
    caution: 'La trampa fácil de este paso.',
    parts: ['P01', 'P02'],       // references, checked by the tests
    hardware: ['H03'],
    status: 'proposed',
  },
]
```

A declared step keeps the place of the one it covers. Without `covers` it is an
extra step, added after the modules and before `'finish'`. The tests check that
every reference a step names exists, and that every board is placed by some
step — a new module that no step reaches will fail the suite.

Nothing in the tool list cuts wood. The cut list is finished sizes and the
boards arrive cut from the workshop, so the headings run measure, present,
drill, finish — there is no sawing heading, and a countertop cutout is the
workshop's job, off the template the user takes there.

Tools follow the same rule in `buildTools`: the ones any assembly needs, plus
the ones this design brings with it (a cup hinge asks for a 35 mm bit, a board
screwed to a wall asks for a percussion drill and for the wall type to be
settled). A design adds its own with `tools`, and a declared tool with the same
name replaces the derived one.

## Drilling plans

`src/lib/drilling.ts` works out where every hole goes, board by board, when the
design declares `drilling` (without it, the manual has no drilling section):

```ts
drilling: {
  joints: { by: 'pending' },                  // a confirmat at every edge-to-face joint
  shelfPins: { parts: ['E03'], by: 'home' },  // four pins under each loose shelf
  hingePlates: { by: 'home' },                // pilots for each hinge mounting plate
},
```

Hinge cups come with any `doors` module and take `cupBoring` as their answer.
`by` says who drills: `'workshop'`, `'home'`, or `'pending'` while the user has
not asked. It changes the manual. An assembly step names the plans it relies on
("perforá antes", "vienen perforadas", "si no vienen perforadas"), and the
bits for home drilling join the tool list — the step drill for confirmat, the
5 mm bit with a stop for pins.

The rules are trade rules of thumb, so every position is a proposal:

| Hole | Where | Rule |
| --- | --- | --- |
| Confirmat | through the face board, into the middle of the other board's edge | 50 mm from each end, at most 250 mm apart, one in the middle of a joint shorter than 100 mm |
| Hinge cup | on the inner face of the leaf | Ø35 × 13, centre 22.5 mm from the hinge edge, 100 mm from the ends |
| Hinge plate | on the face of the board the leaf hangs from, towards the leaf | two Ø3 pilots 32 mm apart, 37 mm back from the front edge |
| Shelf pin | on the board facing each end of the shelf | Ø5 × 10, 40 mm in from front and back, 6 mm under the shelf |

Contacts that are face to face or edge to edge are not joints it knows how to
screw; `joints.exclude` leaves out boards that are loose or glued. Boards drilled
alike share a plan: distances are measured from named edges ("canto
delantero", "canto hacia afuera", "canto de bisagras"), never from a corner of
the drawing, so a left and a right board come out the same. A hole is drilled
with the board it sits on, so the step that places a divider carries its pin and
plate holes, not the step of the shelf or the door that uses them.

Handle holes are not drawn yet: they need the distance between the handle's
holes, which no design knows so far.

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

`tests/hardware.test.mjs` checks the hardware list: unique references, whole
positive quantities, everything the model works out on its own marked
`'proposed'` and carrying the reasoning in its note, declared items kept as
written, hinges for every leaf, and fixings for every board screwed to a wall.

`tests/mueble-bano.test.mjs` pins the measurements confirmed for the bathroom
cabinet, and `tests/basin.test.mjs` checks that the countertop opening clears the
basin body while keeping material under the rim.

When a check fails it is usually the design, not the engine: a panel too deep for
its doors, cleats that miss the board they carry, a shelf running into an
upright. Adjust the numbers until the piece is buildable.
