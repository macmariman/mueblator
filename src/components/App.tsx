import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Printer,
  Ruler,
  MousePointer2,
  RotateCcw,
  Plus,
  Minus,
  Layers3,
  DoorOpen,
  PanelTop,
  ArrowDown,
  SquareDashed,
  TriangleAlert,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import CabinetView, {
  type ViewHandle,
  type ViewOptions,
} from '@/components/CabinetView';
import DrillPlans from '@/components/DrillPlans';
import { buildDesign, openingLabel, type Model } from '@/lib/build';
import { designById, designs } from '@/designs';
import { cutLabel, fmt } from '@/lib/units';
import {
  edgingLocation,
  edgingNote,
  edgingSummary,
  machiningLabel,
} from '@/lib/edging';
import type { Part } from '@/lib/spec';

const groupName = (p: Part) =>
  p.name.replace(/ (izquierda|derecha|izquierdo|derecho)$/, '');

/** Design chosen in the URL, so a link always opens the same piece of furniture. */
const designParam = () => new URLSearchParams(window.location.search).get('d');

function CutTable({
  model,
  interactive = false,
  onSelect,
  selectedId = null,
  selectedRow,
}: {
  model: Model;
  interactive?: boolean;
  onSelect?: (id: string) => void;
  /** Reference of the board selected in the 3D view, highlighted in its row. */
  selectedId?: string | null;
  selectedRow?: React.Ref<HTMLTableRowElement>;
}) {
  return (
    <Table className="cut-table">
      <colgroup>
        <col className="col-ref" />
        <col className="col-piece" />
        <col className="col-quantity" />
        <col className="col-size" />
        <col className="col-note" />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead>Ref.</TableHead>
          <TableHead>Pieza</TableHead>
          <TableHead>Cant.</TableHead>
          <TableHead>Largo × ancho</TableHead>
          <TableHead>Notas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {model.groups.map(({ part: p, ids, quantity }) => {
          const banded =
            model.spec.materials.find((m) => m.id === p.materialId)?.banding !==
            false;
          const active = selectedId !== null && ids.includes(selectedId);
          return (
            <TableRow
              key={p.id}
              className={active ? 'is-selected' : undefined}
              ref={active ? selectedRow : undefined}
            >
              <TableCell>
                <span className="table-id">
                  {interactive
                    ? ids.map((id, i) => (
                        <span key={id}>
                          {i > 0 && ' / '}
                          <button
                            className={`id-link ${id === selectedId ? 'is-current' : ''}`}
                            aria-pressed={id === selectedId}
                            onClick={() => onSelect?.(id)}
                          >
                            {id}
                          </button>
                        </span>
                      ))
                    : ids.join(' / ')}
                </span>
              </TableCell>
              <TableCell>
                {interactive ? (
                  <button
                    className={`table-link ${active ? 'is-current' : ''}`}
                    onClick={() =>
                      onSelect?.(active ? (selectedId as string) : p.id)
                    }
                  >
                    {groupName(p)}
                  </button>
                ) : (
                  groupName(p)
                )}
              </TableCell>
              <TableCell>{quantity}</TableCell>
              <TableCell className="numeric">{cutLabel(p)} mm</TableCell>
              <TableCell className="cut-note">
                {banded && (
                  <strong className="edge-summary">{edgingNote(p)}</strong>
                )}
                <span className="edge-location">{p.materialShort}</span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/** Everything that is not a board: hinges, handles, screws, wall plugs. */
function HardwareTable({ model }: { model: Model }) {
  return (
    <Table className="cut-table hardware-table">
      <colgroup>
        <col className="col-ref" />
        <col className="col-piece" />
        <col className="col-quantity" />
        <col className="col-size" />
        <col className="col-note" />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead>Ref.</TableHead>
          <TableHead>Elemento</TableHead>
          <TableHead>Cant.</TableHead>
          <TableHead>Medida o tipo</TableHead>
          <TableHead>Notas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {model.hardware.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <span className="table-id">{item.id}</span>
            </TableCell>
            <TableCell>
              <strong className="hardware-name">{item.name}</strong>
              <span className="hardware-group">{item.group}</span>
            </TableCell>
            <TableCell className="numeric">
              {item.quantity}
              {item.unit === 'u' ? '' : ` ${item.unit}`}
            </TableCell>
            <TableCell>
              {item.spec ?? '—'}
              {item.status === 'proposed' && (
                <span className="hardware-status">A confirmar</span>
              )}
            </TableCell>
            <TableCell className="cut-note">
              <span className="edge-location">{item.note}</span>
              {item.sourcing && (
                <span className="hardware-sourcing">{item.sourcing}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * The assembly order. Everything here is worked out from the modules, so the
 * heading of every step says whether it was reviewed or is still a proposal.
 */
function AssemblySteps({ model }: { model: Model }) {
  return (
    <ol className="assembly-steps">
      {model.assembly.map((step) => (
        <li key={step.id} className="assembly-step">
          <div className="step-mark">
            <span className="step-ordinal">Paso {step.order}</span>
            {step.status === 'proposed' && (
              <span className="step-status">A confirmar</span>
            )}
          </div>
          <div className="step-body">
            <h3>{step.title}</h3>
            {step.parts.length > 0 && (
              <p className="step-refs">
                <strong>Piezas:</strong> {step.parts.join(' · ')}
                {step.hardware.length > 0 && (
                  <>
                    {' '}
                    <strong>Ferretería:</strong> {step.hardware.join(' · ')}
                  </>
                )}
              </p>
            )}
            {step.drilling.map(({ by, boards }) => (
              <p key={by} className={`step-drill by-${by}`}>
                <strong>
                  {by === 'home'
                    ? 'Perforá antes, con el plano de'
                    : by === 'pending'
                      ? 'Si no vienen perforadas, seguí el plano de'
                      : 'Vienen perforadas del taller:'}
                </strong>{' '}
                {boards.join(' · ')}
              </p>
            ))}
            <p>{step.body}</p>
            {step.caution && (
              <p className="step-caution">
                <TriangleAlert size={15} aria-hidden />
                <span>
                  <strong>Cuidado: </strong>
                  {step.caution}
                </span>
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** The tools the piece asks for, under the heading of the moment they are used. */
function ToolList({ model }: { model: Model }) {
  const groups = model.tools.reduce<Record<string, typeof model.tools>>(
    (acc, tool) => {
      (acc[tool.group] ??= []).push(tool);
      return acc;
    },
    {},
  );
  return (
    <div className="tool-groups">
      {Object.entries(groups).map(([group, tools]) => (
        <section key={group} className="tool-group">
          <h3>{group}</h3>
          <ul>
            {tools.map((tool) => (
              <li key={tool.name}>
                <strong>
                  {tool.name}
                  {tool.spec && <span className="tool-spec"> · {tool.spec}</span>}
                </strong>
                <span>{tool.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function App() {
  const [designId, setDesignId] = useState(() => designById(designParam()).id);
  const model = useMemo(() => buildDesign(designById(designId)), [designId]);
  const { spec, frame } = model;
  const [options, setOptions] = useState<ViewOptions>({
    dimensions: true,
    walls: false,
    fixtures: true,
    open: false,
    exploded: false,
    selected: null,
  });
  const [ready, setReady] = useState(false),
    [printing, setPrinting] = useState(false),
    [printError, setPrintError] = useState('');
  const view = useRef<ViewHandle>(null),
    printImage = useRef<HTMLImageElement>(null),
    selectedRow = useRef<HTMLTableRowElement>(null);
  const selected = model.parts.find((p) => p.id === options.selected);
  const selectedHoles = model.drilling.holes.filter(
    (h) => h.board === options.selected,
  ).length;
  const hasFixtures = model.fixtures.length > 0;
  const hasDrilling = model.drilling.plans.length > 0,
    hasHardware = model.hardware.length > 0;
  // Sections are numbered in the order they appear, whichever ones there are.
  const sectionNumbers = (() => {
    let n = 0;
    const next = () => String(++n).padStart(2, '0');
    return {
      pieces: next(),
      drilling: hasDrilling ? next() : '',
      hardware: hasHardware ? next() : '',
      assembly: next(),
    };
  })();
  const handlesPending = model.parts.some((p) => p.handle);
  const select = useCallback(
    (id: string) => setOptions((v) => ({ ...v, selected: id })),
    [],
  );
  const onReady = useCallback(() => setReady(true), []);
  function toggle(key: keyof ViewOptions, value: boolean) {
    setOptions((v) => ({ ...v, [key]: value }));
  }
  function chooseDesign(id: string) {
    setDesignId(id);
    setReady(false);
    setOptions((v) => ({ ...v, selected: null }));
    const url = new URL(window.location.href);
    url.searchParams.set('d', id);
    window.history.replaceState(null, '', url);
  }
  useEffect(() => {
    document.title = `${spec.name} · Mueblator`;
  }, [spec.name]);
  const capture = useCallback(() => {
    const url = view.current?.snapshot();
    if (url && printImage.current) printImage.current.src = url;
    return !!url;
  }, []);
  useEffect(() => {
    const before = () => {
      capture();
    };
    window.addEventListener('beforeprint', before);
    return () => window.removeEventListener('beforeprint', before);
  }, [capture]);
  async function print() {
    setPrinting(true);
    setPrintError('');
    try {
      if (!capture())
        throw new Error('El modelo todavía no está listo para imprimir.');
      await printImage.current?.decode();
      window.print();
    } catch {
      setPrintError(
        'No pudimos preparar la imagen. Esperá a que cargue el modelo y volvé a intentar.',
      );
    } finally {
      setPrinting(false);
    }
  }
  function focusPart(id: string) {
    select(id);
    document
      .getElementById('modelo')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  /** Jump from the inspector to the drilling plan of the selected board. */
  function showPlan(id: string) {
    document
      .getElementById(`plano-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  /** Jump from the inspector to the row of the board selected in the 3D view. */
  function showInList() {
    selectedRow.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
  return (
    <>
      <main className="screen-app">
        <header className="masthead">
          <div className="brand">
            <Box />
            <div>
              <span className="eyebrow">{spec.eyebrow}</span>
              <h1>{spec.name}</h1>
            </div>
          </div>
          {designs.length > 1 && (
            <label className="design-picker">
              <span className="eyebrow">DISEÑO</span>
              <select
                value={designId}
                onChange={(e) => chooseDesign(e.target.value)}
              >
                {designs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            className="primary"
            disabled={!ready || printing}
            onClick={print}
          >
            <Printer size={17} />
            {printing ? 'Preparando…' : 'Imprimir / PDF'}
          </button>
        </header>
        <section className="workspace" id="modelo">
          <div className="viewport">
            <div className="view-heading">
              <span className="eyebrow">
                TALLER 3D <span className="version-tag">{spec.id}</span>
              </span>
              <h2>
                {options.exploded
                  ? (spec.headline?.exploded ?? 'Cada pieza, en su lugar.')
                  : (spec.headline?.assembled ?? spec.name)}
              </h2>
              <p>
                {options.exploded
                  ? (spec.subhead?.exploded ??
                    'Despiece de referencia · cotas del conjunto armado')
                  : (spec.subhead?.assembled ?? spec.goal)}
              </p>
            </div>
            <CabinetView
              key={spec.id}
              ref={view}
              model={model}
              options={options}
              onSelect={select}
              onReady={onReady}
            />
            <div className="camera-controls" aria-label="Controles de cámara">
              <button
                title="Vista inicial"
                aria-label="Restablecer vista"
                onClick={() => view.current?.view('perspective')}
              >
                <RotateCcw size={18} />
              </button>
              <button
                title="Acercar"
                aria-label="Acercar"
                onClick={() => view.current?.zoom(0.85)}
              >
                <Plus size={18} />
              </button>
              <button
                title="Alejar"
                aria-label="Alejar"
                onClick={() => view.current?.zoom(1.18)}
              >
                <Minus size={18} />
              </button>
            </div>
            <div className="view-presets">
              <button onClick={() => view.current?.view('front')}>
                Frente
              </button>
              <button onClick={() => view.current?.view('side')}>
                Lateral
              </button>
              <button onClick={() => view.current?.view('top')}>
                Desde arriba
              </button>
            </div>
            <div className="viewport-footer">
              <MousePointer2 size={15} />
              <span>
                Arrastrá para girar · Pellizcá o usá la rueda para acercar ·
                Tocá una pieza
              </span>
            </div>
          </div>
          <aside>
            <div className="aside-label">
              <span className="eyebrow">EXPLORAR</span>
              <span className="part-count">{model.parts.length} piezas</span>
            </div>
            <div className="view-toggles">
              <label className="toggle" htmlFor="dimensions">
                <Ruler size={17} />
                Mostrar medidas
                <Switch
                  id="dimensions"
                  checked={options.dimensions}
                  onCheckedChange={(v) => toggle('dimensions', v)}
                />
              </label>
              <label className="toggle" htmlFor="doors">
                <DoorOpen size={17} />
                Abrir puertas
                <Switch
                  id="doors"
                  checked={options.open}
                  onCheckedChange={(v) => toggle('open', v)}
                  disabled={options.exploded}
                />
              </label>
              <label className="toggle" htmlFor="exploded">
                <Layers3 size={17} />
                Separar piezas
                <Switch
                  id="exploded"
                  checked={options.exploded}
                  onCheckedChange={(v) => toggle('exploded', v)}
                />
              </label>
              <label className="toggle" htmlFor="walls">
                <SquareDashed size={17} />
                Mostrar paredes
                <Switch
                  id="walls"
                  checked={options.walls}
                  onCheckedChange={(v) => toggle('walls', v)}
                />
              </label>
              <label className="toggle" htmlFor="fixtures">
                <PanelTop size={17} />
                {model.fixturesLabel}
                <Switch
                  id="fixtures"
                  checked={options.fixtures && hasFixtures}
                  onCheckedChange={(v) => toggle('fixtures', v)}
                  disabled={options.exploded || !hasFixtures}
                />
              </label>
            </div>
            <section
              className={`selected-card ${selected ? 'has-selection' : ''}`}
              aria-live="polite"
            >
              <div className="selection-title">
                <span className="eyebrow">
                  {selected ? 'PIEZA SELECCIONADA' : 'INSPECTOR DE PIEZAS'}
                </span>
                {selected && (
                  <button
                    className="clear"
                    aria-label="Quitar selección"
                    onClick={() =>
                      setOptions((v) => ({ ...v, selected: null }))
                    }
                  >
                    ×
                  </button>
                )}
              </div>
              {selected ? (
                <>
                  <div className="selected-heading">
                    <span className="part-id">{selected.id}</span>
                    <h3>{selected.name}</h3>
                  </div>
                  <strong className="selected-size">
                    {cutLabel(selected)} <small>mm</small>
                  </strong>
                  <span className="dimension-order">Largo × ancho</span>
                  <p>{selected.material}</p>
                  <p className="inspector-edging">
                    <strong>Tapacantos: {edgingSummary(selected)}</strong>
                    <br />
                    {edgingLocation(selected)}
                  </p>
                  {selected.machining && (
                    <p className="machining-note">{machiningLabel(selected)}</p>
                  )}
                  {selectedHoles > 0 && (
                    <p className="inspector-drilling">
                      <strong>
                        {selectedHoles} {selectedHoles === 1 ? 'agujero' : 'agujeros'}
                      </strong>
                      , marcados en el dibujo.
                    </p>
                  )}
                  <button className="quiet-link" onClick={showInList}>
                    Verla en la lista de corte <ArrowDown size={16} />
                  </button>
                  {selectedHoles > 0 && (
                    <button
                      className="quiet-link"
                      onClick={() => showPlan(selected.id)}
                    >
                      Ver su plano de perforación <ArrowDown size={16} />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <MousePointer2 size={27} />
                  <h3>Tocá una madera</h3>
                  <p>
                    Vas a ver su medida, material y cómo se coloca. También
                    podés elegirla en la lista de abajo.
                  </p>
                </>
              )}
            </section>
            <div className="measure-summary">
              {model.highlights.map((h) => (
                <div key={h.label}>
                  <b>{h.value}</b>
                  <span>{h.label}</span>
                </div>
              ))}
            </div>
            <a href="#piezas" className="quiet-link">
              Ver lista de corte <ArrowDown size={16} />
            </a>
          </aside>
        </section>
        {printError && (
          <p className="print-error" role="alert">
            {printError}
          </p>
        )}
        <section className="content-section" id="piezas">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{sectionNumbers.pieces} / DESPIECE</span>
              <h2>Lista de maderas</h2>
            </div>
            <span className="unit-badge">Todas las medidas en mm</span>
          </div>
          <p className="section-intro">
            Las medidas salen del mismo modelo 3D. Tocá el nombre de una pieza
            —o una referencia, para elegir izquierda o derecha— y se ilumina en
            el mueble. La pieza que tocás en el dibujo queda marcada acá.
          </p>
          <div className="table-card">
            <CutTable
              model={model}
              interactive
              onSelect={focusPart}
              selectedId={options.selected}
              selectedRow={selectedRow}
            />
          </div>
        </section>
        {hasDrilling && (
          <section className="content-section" id="perforaciones">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  {sectionNumbers.drilling} / PERFORACIONES
                </span>
                <h2>Planos de perforación</h2>
              </div>
              <span className="unit-badge">Propuesta · medidas en mm</span>
            </div>
            <p className="section-intro">
              Dónde va cada agujero, pieza por pieza. Las distancias se miden
              desde el canto que dice la tabla, no desde el dibujo. Todo es
              propuesta: la bisagra y la manija que elijas pueden correr las
              posiciones. Los confirmat se perforan con la unión presentada y
              prensada: la mecha escalonada hace el pasante, el avellanado y el
              agujero en el canto de la otra pieza en una sola pasada.
              «Pasante» es un agujero que atraviesa la pieza de lado a lado;
              «avellanado», la boca del agujero rebajada en forma de cono, para
              que la cabeza del tornillo quede al ras y no sobresalga.
              {handlesPending &&
                ' Las manijas todavía no están: falta la distancia entre agujeros.'}
            </p>
            <DrillPlans model={model} />
          </section>
        )}
        {hasHardware && (
          <section className="content-section" id="ferreteria">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{sectionNumbers.hardware} / FERRETERÍA</span>
                <h2>Herrajes y fijaciones</h2>
              </div>
              <span className="unit-badge">Cantidades de referencia</span>
            </div>
            <p className="section-intro">
              Todo lo que no es madera. Lo que dice «a confirmar» es una
              propuesta calculada a partir del mueble, no una decisión tomada:
              revisala antes de comprar.
            </p>
            <div className="table-card">
              <HardwareTable model={model} />
            </div>
          </section>
        )}
        <section className="content-section" id="armado">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{sectionNumbers.assembly} / ARMADO</span>
              <h2>Orden de armado</h2>
            </div>
            <span className="unit-badge">Propuesta, no instructivo</span>
          </div>
          <p className="section-intro">
            El orden sale del propio mueble: primero lo que se fija, después lo
            que apoya encima y al final los frentes. Es una propuesta razonable
            para arrancar, no una secuencia probada: leela entera antes de
            perforar la primera pieza, y si tu carpintero dice otra cosa,
            hacele caso a él.
          </p>
          <AssemblySteps model={model} />
          <div className="section-heading tool-heading">
            <div>
              <h2>Herramienta</h2>
            </div>
            <span className="unit-badge">Lo que pide esta pieza</span>
          </div>
          <p className="section-intro">
            Las maderas llegan cortadas a medida del taller, así que acá no hay
            nada para cortar: esto es lo que hace falta para armar. Sale de lo
            que el mueble tiene —una bisagra de cazoleta pide una mecha de
            35 mm, una pieza atornillada a la pared pide percutor— y lo que no
            está definido, como el taco y por lo tanto la mecha, depende de cómo
            sea tu pared.
          </p>
          <ToolList model={model} />
        </section>
        <footer className="site-footer">
          <span>{spec.goal}</span>
          <span>
            Modelo en milímetros · {openingLabel(spec).toLowerCase()}{' '}
            {fmt(frame.width)} × {fmt(frame.depth)} mm · medidas de referencia
          </span>
        </footer>
      </main>
      <section className="print-document">
        <header className="print-header">
          <div>
            <span className="eyebrow">
              {spec.eyebrow} · MANUAL DE CONSTRUCCIÓN
            </span>
            <h1>{spec.name}</h1>
          </div>
        </header>
        <p className="print-subtitle">{model.printSubtitle}</p>
        <img
          ref={printImage}
          className="print-model"
          alt="Vista completa del mueble con sus medidas generales"
        />
        <h2>Lista de maderas a cortar</h2>
        <p>
          Dimensiones terminadas en milímetros. Los pares se agrupan por medida.{' '}
          {model.parts.length} piezas en total.
        </p>
        <CutTable model={model} />
        {hasDrilling && (
          <>
            <h2>Planos de perforación</h2>
            <p>
              Propuesta. Distancias desde el canto que indica cada tabla; los
              agujeros punteados van en la cara de atrás del dibujo.
              {handlesPending &&
                ' Faltan las manijas: la distancia entre agujeros está por definir.'}
            </p>
            <DrillPlans model={model} />
          </>
        )}
        {hasHardware && (
          <>
            <h2>Herrajes y fijaciones</h2>
            <p>
              Cantidades de referencia. Las marcadas «a confirmar» salen del
              propio mueble y hay que definirlas antes de comprar.
            </p>
            <HardwareTable model={model} />
          </>
        )}
        <h2>Orden de armado</h2>
        <p>
          Propuesta derivada del propio mueble, no un instructivo probado.
          Cada paso nombra las piezas y la ferretería de las tablas de arriba.
        </p>
        <AssemblySteps model={model} />
        <h2>Herramienta</h2>
        <p>
          Para armar, no para fabricar: las maderas llegan cortadas a medida del
          taller. Todo lo de abajo es propuesta.
        </p>
        <ToolList model={model} />
        {spec.pending && spec.pending.length > 0 && (
          <>
            <h2>Antes de fabricar</h2>
            <ul className="print-pending">
              {spec.pending.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
