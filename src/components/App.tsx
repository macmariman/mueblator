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
import { buildDesign, type Model } from '@/lib/build';
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
const designParam = () =>
  new URLSearchParams(window.location.search).get('d');

function CutTable({
  model,
  interactive = false,
  onSelect,
}: {
  model: Model;
  interactive?: boolean;
  onSelect?: (id: string) => void;
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
          return (
          <TableRow key={p.id}>
            <TableCell>
              <span className="table-id">{ids.join(' / ')}</span>
            </TableCell>
            <TableCell>
              {interactive ? (
                <button className="table-link" onClick={() => onSelect?.(p.id)}>
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

export default function App() {
  const [designId, setDesignId] = useState(
    () => designById(designParam()).id,
  );
  const model = useMemo(
    () => buildDesign(designById(designId)),
    [designId],
  );
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
    printImage = useRef<HTMLImageElement>(null);
  const selected = model.parts.find((p) => p.id === options.selected);
  const hasFixtures = model.fixtures.length > 0;
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
              <button onClick={() => view.current?.view('front')}>Frente</button>
              <button onClick={() => view.current?.view('side')}>Lateral</button>
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
                Bacha y cañería
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
                    onClick={() => setOptions((v) => ({ ...v, selected: null }))}
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
              <span className="eyebrow">01 / DESPIECE</span>
              <h2>Lista de maderas</h2>
            </div>
            <span className="unit-badge">Todas las medidas en mm</span>
          </div>
          <p className="section-intro">
            Las medidas salen del mismo modelo 3D. Tocá el nombre de una pieza
            para identificarla en el mueble.
          </p>
          <div className="table-card">
            <CutTable model={model} interactive onSelect={focusPart} />
          </div>
        </section>
        <footer className="site-footer">
          <span>{spec.goal}</span>
          <span>
            Modelo en milímetros · hueco {fmt(frame.width)} × {fmt(frame.depth)}{' '}
            mm · medidas de referencia
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
