/**
 * Design specification: the only thing you write to describe a new piece of furniture.
 *
 * Every length is expressed in millimetres and measured from the floor (Y),
 * the horizontal centre of the opening (X) and its depth centre (Z), where
 * negative Z is the back wall and positive Z the open front.
 */

export type Vec3 = [number, number, number];

export type MaterialSpec = {
  id: string;
  /** Full label shown in the inspector, e.g. "Melamínico blanco mate de 18 mm". */
  label: string;
  /** Short label for the notes column of the cut list. */
  short: string;
  thickness: number;
  /** Set false for materials that take no edge banding, such as solid wood. */
  banding?: boolean;
  /** Rendering hints for the 3D view. */
  color: string;
  roughness: number;
  edgeColor: string;
  edgeOpacity: number;
};

export const edgeKeys = ['L1', 'L2', 'A1', 'A2'] as const;
export type EdgeKey = (typeof edgeKeys)[number];
/** L1/L2 are the long sides of the board, A1/A2 the short ones. */
export type EdgeBanding = Record<EdgeKey, string | null>;
/** `'pending'` renders as "Cantos por definir"; an empty object means no banding. */
export type EdgingInput = Partial<EdgeBanding> | 'pending';

export type Machining = {
  kind: 'semicircular-front';
  radius: number;
  status: 'proposed' | 'confirmed';
};

/** A physical board, fully placed. Produced by the module builders, never written by hand. */
export type Part = {
  id: string;
  name: string;
  /** Bounding box on the model axes X/Y/Z. */
  size: Vec3;
  /** Centre of the board in model coordinates. */
  position: Vec3;
  /** Workshop order: long × wide × thickness. */
  cut: Vec3;
  materialId: string;
  material: string;
  materialShort: string;
  machining?: Machining;
  edging: EdgeBanding | null;
  note: string;
  group: string;
  /** Offset applied when the exploded view is on. */
  explode: Vec3;
  /** Hints for the 3D view: doors swing, the countertop may carry a cutout. */
  role: 'board' | 'door' | 'countertop';
  /** Door leaves only: -1 hinges on the left, 1 on the right. */
  side?: -1 | 1;
  /** Door leaves only: draw a pull handle. */
  handle?: boolean;
};

/** Fields every module accepts. */
type ModuleBase = {
  /** Explicit reference, e.g. "T01". Use `idPrefix` for modules that emit several boards. */
  id?: string;
  idPrefix?: string;
  name?: string;
  group?: string;
  /** Material id declared in `materials`. */
  material: string;
  note?: string;
  edging?: EdgingInput;
  /** Override of the automatic exploded-view offset. */
  explode?: Vec3;
};

export type CountertopModule = ModuleBase & {
  kind: 'countertop';
  /** Height of the underside: what the top rests on. */
  undersideHeight: number;
  /** Total width clearance against the opening (1 mm per side by default). */
  clearance?: number;
  depth: number;
  /** Radius of the rounded front edge; must equal half the thickness. */
  frontRadius?: number;
  /** Cut the fixture opening out of the slab. */
  cutout?: 'basin' | null;
  machiningStatus?: 'proposed' | 'confirmed';
};

export type DoorsModule = ModuleBase & {
  kind: 'doors';
  count: number;
  /** Joint between leaves and against the sides. */
  gap: number;
  /** How far the front sits behind the front edge of the top. */
  setback: number;
  bottomHeight: number;
  topHeight: number;
  handles?: boolean;
  /** Hinges per leaf, only used to propose a count in the hardware list. */
  hingesPerLeaf?: number;
};

export type SideUprightsModule = ModuleBase & {
  kind: 'side-uprights';
  bottomHeight: number;
  topHeight: number;
  /** Front-to-back width of the strip. */
  depth: number;
};

export type FrontRailModule = ModuleBase & {
  kind: 'front-rail';
  topHeight: number;
  height: number;
  /** Fit between the side uprights instead of spanning the whole opening. */
  betweenUprights?: boolean;
};

export type PlinthModule = ModuleBase & {
  kind: 'plinth';
  /** Gap left under the plinth. */
  floorGap: number;
  height: number;
};

export type PanelModule = ModuleBase & {
  kind: 'panel';
  /** Height of the underside of the board. */
  undersideHeight: number;
  /** A number, or 'to-structure' to reach the plane just behind the fronts. */
  depth: number | 'to-structure';
  /** Gap left against the back wall. */
  backGap?: number;
  /** Width taken off each side, for walls that are out of square. */
  widthInset?: number;
};

export type WallCleatsModule = ModuleBase & {
  kind: 'wall-cleats';
  /** Reference of the panel these cleats hold up. */
  supports: string;
  height: number;
  /** Defaults to the supported panel depth minus one board thickness. */
  depth?: number;
  /** Distance from each side wall, to clear an upright fixed to it. */
  inset?: number;
};

/** Escape hatch: a board placed by hand, for shapes no module covers yet. */
export type BoardModule = ModuleBase & {
  kind: 'board';
  size: Vec3;
  position: Vec3;
  /** Mirror the board on both sides of the centre line. */
  mirrored?: boolean;
};

export type ModuleSpec =
  | CountertopModule
  | DoorsModule
  | SideUprightsModule
  | FrontRailModule
  | PlinthModule
  | PanelModule
  | WallCleatsModule
  | BoardModule;

export type BasinFixture = {
  kind: 'basin-with-faucet';
  x: number;
  z: number;
  /** How far the rim sits above the countertop surface. */
  lift: number;
  /** Ellipse ratio applied on X. */
  scaleX: number;
  /** Mounting clearance added to the cutout. */
  clearance: number;
  /** Lathe profile: [radius, height] pairs relative to the rim. */
  profile: [number, number][];
  faucet?: boolean;
  trap?: boolean;
};

/**
 * The tree itself. Illustrative like every fixture: it is not a board, it never
 * reaches the cut list, and no measurement of the piece depends on it.
 */
export type BonsaiFixture = {
  kind: 'bonsai';
  /** Centre of the pot on the surface it rests on. */
  x: number;
  z: number;
  /** Outside size of the rectangular pot. */
  pot: { width: number; depth: number; height: number };
  /** Height of the canopy above the rim of the pot. */
  height: number;
  /** Sideways reach of the canopy. The tree leans this way. */
  spread: number;
  /** Same seed, same tree: the drawing never changes between reloads. */
  seed?: number;
};

export type FixtureSpec = BasinFixture | BonsaiFixture;

/** How a hardware line is counted. */
export type HardwareUnit = 'u' | 'par' | 'juego' | 'm' | 'caja';

/**
 * Hardware a module can propose on its own. A declared item naming the same
 * role replaces the proposal, so a decision the user has taken always wins.
 */
export type HardwareRole = 'door-hinges' | 'door-handles' | 'wall-fixings';

/**
 * One line of the hardware list: everything that is not a board and is needed
 * to put the piece together. Quantities follow the same rule as measurements —
 * `'confirmed'` is only for what the user has actually decided or bought.
 */
export type HardwareItem = {
  /** Explicit reference, e.g. "H01". Numbered automatically when omitted. */
  id?: string;
  name: string;
  /** Size, gauge or model: "35 mm codo 0", "6 × 60 mm", "S8". */
  spec?: string;
  quantity: number;
  /** Defaults to `'u'`. */
  unit?: HardwareUnit;
  /** Heading it is listed under. Defaults to "Herrajes". */
  group?: string;
  note?: string;
  status: 'confirmed' | 'proposed';
  /** Where it is found locally: brand, local name, shop. */
  sourcing?: string;
  /** Module proposal this item replaces. */
  covers?: HardwareRole;
};

/**
 * The assembly group a declared step stands in for: a module kind, a board
 * group written as `board:<group>`, or one of the two steps that belong to no
 * module — `'prep'` before the first board goes up, `'finish'` after the last.
 */
export type AssemblyTarget =
  | ModuleSpec['kind']
  | `board:${string}`
  | 'prep'
  | 'finish';

/**
 * One step of the assembly order, as the design file writes it. Everything the
 * model works out on its own is a proposal, so a declared step says its own
 * `status` — `'confirmed'` only once the piece has actually been built this way.
 */
export type AssemblyStepSpec = {
  title: string;
  body: string;
  /** The mistake that is easy to make here. Printed under the step. */
  caution?: string;
  /** Board references the step puts in place, e.g. `['P01', 'P02']`. */
  parts?: string[];
  /** Hardware references it uses, e.g. `['H02']`. */
  hardware?: string[];
  status: 'confirmed' | 'proposed';
  /**
   * Derived step this one replaces, keeping its place in the order. Without it
   * the step is an extra one, added after the modules and before `'finish'`.
   */
  covers?: AssemblyTarget;
};

/**
 * Headings the tool list is grouped under. There is no cutting heading on
 * purpose: the cut list is finished sizes and the boards arrive cut from the
 * workshop, so nothing in this list saws anything.
 */
export type ToolGroup =
  | 'Medir y marcar'
  | 'Presentar y sujetar'
  | 'Perforar y atornillar'
  | 'Terminación';

/**
 * A tool the piece asks for. Not hardware: it is not bought into the furniture
 * and never reaches the cut list. Derived from what the design actually
 * contains — a cup hinge asks for a 35 mm bit — and therefore always proposed.
 */
export type ToolItem = {
  name: string;
  /** Size or type: "35 mm", "60 cm o más". */
  spec?: string;
  /** What it is for in this piece, in one line. */
  reason: string;
  /** Defaults to "Perforar y atornillar". */
  group?: ToolGroup;
  status: 'confirmed' | 'proposed';
};

export type DimensionLine = {
  from: Vec3;
  to: Vec3;
  text: string;
  offset: Vec3;
};

export type Annotation = { text: string; at: Vec3 };

export type Opening = {
  /** Reference width between the side walls. */
  width: number;
  /** Depth from the back wall to the front edge. */
  depth: number;
  /** Free height, only used to draw the walls. */
  height: number;
  /**
   * How the reference footprint is named on screen and in the manual.
   * Defaults to "Hueco", which only reads right for a piece built into a
   * recess; a freestanding piece names its own outline ("Tablero", "Mesa").
   */
  label?: string;
  walls?: { left?: boolean; right?: boolean; back?: boolean };
};

export type DesignSpec = {
  /** Slug used in the URL and the design picker. */
  id: string;
  name: string;
  /** Small caps line above the title. */
  eyebrow: string;
  /** One line describing the goal of this piece of furniture. */
  goal: string;
  /** Headline shown over the 3D view, assembled and exploded. */
  headline?: { assembled: string; exploded: string };
  /** Sub-headline shown under it. */
  subhead?: { assembled: string; exploded: string };
  opening: Opening;
  materials: MaterialSpec[];
  modules: ModuleSpec[];
  fixtures?: FixtureSpec[];
  /** Screws, hinges, plugs: everything that is not a board. */
  hardware?: HardwareItem[];
  /** Steps that replace or extend the assembly order worked out from the modules. */
  assembly?: AssemblyStepSpec[];
  /** Tools declared by hand, on top of the ones the piece asks for. */
  tools?: ToolItem[];
  /** Extra floating labels in the 3D view. */
  annotations?: Annotation[];
  /** Extra dimension lines beyond the automatic width/height/depth. */
  dimensions?: DimensionLine[];
  /** Tiles in the side panel. Auto-generated when omitted. */
  highlights?: { value: string; label: string }[];
  /** Line under the title of the printed manual. Auto-generated when omitted. */
  printSubtitle?: string;
  /** Notes printed after the cut list. */
  pending?: string[];
  /** Path of the decisions document, for the footer link. */
  decisionsDoc?: string;
};
