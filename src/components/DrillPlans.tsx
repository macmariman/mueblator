import type { Model } from '@/lib/build';
import {
  drillByLabels,
  holeLabels,
  holeSize,
  type DrillPlan,
} from '@/lib/drilling';
import { fmt } from '@/lib/units';

/**
 * One board seen from the face it is drilled from, with every hole numbered.
 * The numbers point at the table: positions are read there, from named edges.
 */
function PlanDrawing({ plan, scale }: { plan: DrillPlan; scale: number }) {
  // Lengths in board millimetres; text and margins in screen pixels, so every
  // plan reads alike whatever the shape of the board.
  const px = (n: number) => n / scale,
    pad = px(30),
    font = px(11),
    width = plan.width + 2 * pad,
    height = plan.height + 2 * pad;
  const radius = (d: number) => Math.max(d / 2, px(3.5));
  return (
    <svg
      className="plan-drawing"
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Plano de perforación de ${plan.ids.join(' y ')}, visto desde la ${plan.view}`}
    >
      <rect
        className="plan-board"
        x={pad}
        y={pad}
        width={plan.width}
        height={plan.height}
        vectorEffect="non-scaling-stroke"
      />
      <text x={width / 2} y={pad - font * 1.3} fontSize={font} textAnchor="middle">
        Canto {plan.edges.top}
      </text>
      <text
        x={width / 2}
        y={pad + plan.height + font * 2}
        fontSize={font}
        textAnchor="middle"
      >
        Canto {plan.edges.bottom}
      </text>
      <text
        fontSize={font}
        textAnchor="middle"
        transform={`translate(${pad - font * 1.3} ${height / 2}) rotate(-90)`}
      >
        Canto {plan.edges.left}
      </text>
      <text
        fontSize={font}
        textAnchor="middle"
        transform={`translate(${pad + plan.width + font * 1.3} ${height / 2}) rotate(90)`}
      >
        Canto {plan.edges.right}
      </text>
      {plan.marks.map((m) => {
        const r = radius(m.diameter);
        return (
          <g key={m.index}>
            <circle
              className={m.hidden ? 'plan-hole is-hidden' : 'plan-hole'}
              cx={pad + m.x}
              cy={pad + m.y}
              r={r}
              vectorEffect="non-scaling-stroke"
            />
            <text
              className="plan-number"
              x={pad + m.x + r + font * 0.2}
              y={pad + m.y - r}
              fontSize={font * 0.9}
            >
              {m.index}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PlanTable({ plan }: { plan: DrillPlan }) {
  return (
    <table className="plan-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Agujero</th>
          <th>Medida</th>
          <th>Posición</th>
          <th>Cara</th>
          <th>Quién</th>
        </tr>
      </thead>
      <tbody>
        {plan.marks.map((m) => (
          <tr key={m.index}>
            <td className="numeric">{m.index}</td>
            <td>{holeLabels[m.kind]}</td>
            <td>{holeSize(m)}</td>
            <td>
              {m.distances.map((d) => (
                <span key={d.edge} className="plan-distance">
                  {fmt(d.mm)} mm del {d.edge}
                </span>
              ))}
            </td>
            <td>{m.face}</td>
            <td>
              <span className={`drill-by by-${m.by}`}>{drillByLabels[m.by]}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Every drilling plan of the piece, one card per group of boards drilled alike. */
/** Each board as large as its card allows: a narrow one is not drawn tiny. */
const planScale = (plan: DrillPlan) =>
  Math.min(420 / plan.width, 280 / plan.height);

export default function DrillPlans({ model }: { model: Model }) {
  return (
    <div className="plan-grid">
      {model.drilling.plans.map((plan) => (
        <article key={plan.ids.join()} className="plan-card">
          {plan.ids.map((id) => (
            <span key={id} id={`plano-${id}`} className="plan-anchor" />
          ))}
          <header>
            <span className="table-id">{plan.ids.join(' / ')}</span>
            <h3>{plan.name}</h3>
            <p>
              Vista desde la {plan.view}
              {plan.ids.length > 1 && ' de cada una'}. Los agujeros punteados
              van en la cara de atrás del dibujo.
            </p>
          </header>
          <PlanDrawing plan={plan} scale={planScale(plan)} />
          <PlanTable plan={plan} />
        </article>
      ))}
    </div>
  );
}
