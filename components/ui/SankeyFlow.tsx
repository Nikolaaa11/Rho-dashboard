"use client";

import { useMemo } from "react";
import { fmtCLP, isOperativo, movimientosHistoricos, projectMeta } from "@/lib/data";

/**
 * Sankey diagram custom: flujo de capital
 *   [Aporte FIP CEHTA] → [Proyectos] → [Categorías de gasto]
 *
 * Implementación SVG simple (sin lib externa) usando curvas Bézier.
 */

interface SankeyNode {
  id: string;
  label: string;
  value: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  color: string;
  column: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color: string;
}

const PROJECT_COLORS: Record<string, string> = {
  "Panimávida(BESS RHO)": "#f59e0b",
  "La Ligua (San Expedito) ": "#06b6d4",
  "PMGD Quebrada Escobar": "#8b5cf6",
  RUIL: "#a855f7",
  "Codegua (Explícito)": "#94a3b8",
  Oficina: "#64748b",
};

const CAT_COLORS: Record<string, string> = {
  Desarrollo_Proyecto: "#10b981",
  RRHH: "#0891b2",
  Administración: "#8b5cf6",
  Operación: "#94a3b8",
  Ventas: "#f59e0b",
};

const CAT_LABELS: Record<string, string> = {
  Desarrollo_Proyecto: "Desarrollo",
  RRHH: "RRHH",
  Administración: "Administración",
  Operación: "Operación bancaria",
};

export default function SankeyFlow({ height = 480 }: { height?: number }) {
  const { nodes, links, totalFlow } = useMemo(() => buildSankey(), []);

  const W = 1100;
  const H = height;
  const PAD_X = 12;
  const PAD_Y = 24;
  const NODE_W = 16;

  if (nodes.length === 0) {
    return <p className="text-sm text-ink-tertiary p-6">Sin datos para construir el flujo.</p>;
  }

  // Group nodes per column
  const columns = [0, 1, 2];
  const cols = columns.map((c) => nodes.filter((n) => n.column === c));

  // Sort each column by value desc
  cols.forEach((col) => col.sort((a, b) => b.value - a.value));

  // Available vertical space per column
  const COL_TOTAL_VALUE = (col: SankeyNode[]) => col.reduce((a, n) => a + n.value, 0);
  const NODE_GAP = 6;

  // Assign x positions
  const xs = [PAD_X, W / 2 - NODE_W / 2, W - PAD_X - NODE_W];

  // Layout y positions per column proportional to value
  cols.forEach((col, ci) => {
    const totalValCol = COL_TOTAL_VALUE(col);
    const totalGap = NODE_GAP * (col.length - 1);
    const availableH = H - 2 * PAD_Y - totalGap;
    let cursor = PAD_Y;
    for (const n of col) {
      const h = (n.value / totalValCol) * availableH;
      n.x0 = xs[ci];
      n.x1 = xs[ci] + NODE_W;
      n.y0 = cursor;
      n.y1 = cursor + h;
      cursor += h + NODE_GAP;
    }
  });

  // For each link, find sub-y positions on source & target proportional to link value vs node value
  type ResolvedLink = SankeyLink & {
    sourceNode: SankeyNode;
    targetNode: SankeyNode;
    sy0: number;
    sy1: number;
    ty0: number;
    ty1: number;
  };

  // Track cumulative offsets in each node
  const sourceOffset: Record<string, number> = {};
  const targetOffset: Record<string, number> = {};
  for (const n of nodes) {
    sourceOffset[n.id] = 0;
    targetOffset[n.id] = 0;
  }

  // Sort links so largest get drawn first per pair (better visual)
  const sortedLinks = [...links].sort((a, b) => b.value - a.value);

  const resolved: ResolvedLink[] = sortedLinks
    .map((l) => {
      const s = nodes.find((n) => n.id === l.source);
      const t = nodes.find((n) => n.id === l.target);
      if (!s || !t) return null;
      const sH = s.y1 - s.y0;
      const tH = t.y1 - t.y0;
      const sFrac = l.value / s.value;
      const tFrac = l.value / t.value;
      const sy0 = s.y0 + sourceOffset[s.id];
      const sy1 = sy0 + sH * sFrac;
      const ty0 = t.y0 + targetOffset[t.id];
      const ty1 = ty0 + tH * tFrac;
      sourceOffset[s.id] += sH * sFrac;
      targetOffset[t.id] += tH * tFrac;
      return { ...l, sourceNode: s, targetNode: t, sy0, sy1, ty0, ty1 };
    })
    .filter((x): x is ResolvedLink => x !== null);

  const linkPath = (l: ResolvedLink): string => {
    const x0 = l.sourceNode.x1;
    const x1 = l.targetNode.x0;
    const cx = (x0 + x1) / 2;
    return `
      M ${x0} ${l.sy0}
      C ${cx} ${l.sy0}, ${cx} ${l.ty0}, ${x1} ${l.ty0}
      L ${x1} ${l.ty1}
      C ${cx} ${l.ty1}, ${cx} ${l.sy1}, ${x0} ${l.sy1}
      Z
    `;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H + 24}`}
        className="w-full"
        style={{ minWidth: 700, maxHeight: H + 24 }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Column labels */}
        {[
          { x: xs[0] + NODE_W / 2, label: "ORIGEN" },
          { x: xs[1] + NODE_W / 2, label: "PROYECTO" },
          { x: xs[2] + NODE_W / 2, label: "CATEGORÍA DE GASTO" },
        ].map((c) => (
          <text
            key={c.label}
            x={c.x}
            y={12}
            textAnchor="middle"
            fontSize={9}
            fill="#86868b"
            fontWeight={600}
            style={{ letterSpacing: "0.12em" }}
          >
            {c.label}
          </text>
        ))}

        {/* Links */}
        <g>
          {resolved.map((l, i) => (
            <path
              key={i}
              d={linkPath(l)}
              fill={l.color}
              opacity={0.32}
              style={{ transition: "opacity 0.2s" }}
              onMouseEnter={(e) => {
                (e.currentTarget as SVGPathElement).style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as SVGPathElement).style.opacity = "0.32";
              }}
            >
              <title>
                {l.sourceNode.label} → {l.targetNode.label} · {fmtCLP(l.value)}
              </title>
            </path>
          ))}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((n) => (
            <g key={n.id}>
              <rect
                x={n.x0}
                y={n.y0}
                width={n.x1 - n.x0}
                height={n.y1 - n.y0}
                fill={n.color}
                rx={3}
              >
                <title>
                  {n.label} · {fmtCLP(n.value)}
                </title>
              </rect>
              {/* Label */}
              <text
                x={n.column === 0 ? n.x1 + 8 : n.column === 2 ? n.x0 - 8 : n.x1 + 8}
                y={(n.y0 + n.y1) / 2}
                fontSize={11}
                fill="#1d1d1f"
                textAnchor={n.column === 2 ? "end" : "start"}
                dominantBaseline="middle"
                fontWeight={500}
              >
                {n.label}
              </text>
              <text
                x={n.column === 0 ? n.x1 + 8 : n.column === 2 ? n.x0 - 8 : n.x1 + 8}
                y={(n.y0 + n.y1) / 2 + 13}
                fontSize={9.5}
                fill="#86868b"
                textAnchor={n.column === 2 ? "end" : "start"}
                dominantBaseline="middle"
                style={{ fontFamily: "SF Mono, monospace" }}
              >
                {fmtCLP(n.value, { compact: true })}
                {totalFlow > 0 && ` · ${((n.value / totalFlow) * 100).toFixed(0)}%`}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ============================================================================
// BUILD SANKEY DATA
// ============================================================================

function buildSankey(): { nodes: SankeyNode[]; links: SankeyLink[]; totalFlow: number } {
  const movs = movimientosHistoricos().filter(isOperativo);

  // Source = "FIP CEHTA" único nodo
  // Targets nivel 1 = Proyectos (Centro_Negocios)
  // Targets nivel 2 = Categorías (General)

  const proyByCat: Record<string, Record<string, number>> = {};
  const proyTotals: Record<string, number> = {};
  const catTotals: Record<string, number> = {};
  let totalFlow = 0;

  for (const m of movs) {
    const p = m.Centro_Negocios;
    const c = m.General;
    if (!p || p === "Reversa" || !c) continue;
    const v = m.EGRESO;
    if (!proyByCat[p]) proyByCat[p] = {};
    proyByCat[p][c] = (proyByCat[p][c] || 0) + v;
    proyTotals[p] = (proyTotals[p] || 0) + v;
    catTotals[c] = (catTotals[c] || 0) + v;
    totalFlow += v;
  }

  // Top 6 proyectos + agrupar el resto en "Otros"
  const proyArr = Object.entries(proyTotals)
    .map(([p, v]) => ({ p, v }))
    .sort((a, b) => b.v - a.v);
  const topProy = proyArr.slice(0, 6);
  const otherProy = proyArr.slice(6);

  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  // Node 0: FIP
  nodes.push({
    id: "fip",
    label: "FIP CEHTA",
    value: totalFlow,
    x0: 0, x1: 0, y0: 0, y1: 0,
    color: "#1A4A1A",
    column: 0,
  });

  // Project nodes
  for (const { p, v } of topProy) {
    const meta = projectMeta(p);
    nodes.push({
      id: `proy-${p}`,
      label: meta.nombre,
      value: v,
      x0: 0, x1: 0, y0: 0, y1: 0,
      color: PROJECT_COLORS[p] || "#3C8B3C",
      column: 1,
    });
    links.push({ source: "fip", target: `proy-${p}`, value: v, color: PROJECT_COLORS[p] || "#3C8B3C" });
  }
  if (otherProy.length > 0) {
    const otherTotal = otherProy.reduce((a, b) => a + b.v, 0);
    nodes.push({
      id: "proy-otros",
      label: `Otros (${otherProy.length})`,
      value: otherTotal,
      x0: 0, x1: 0, y0: 0, y1: 0,
      color: "#94a3b8",
      column: 1,
    });
    links.push({ source: "fip", target: "proy-otros", value: otherTotal, color: "#94a3b8" });
  }

  // Category nodes — usar las categorías más relevantes
  const topCats = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  for (const [c, v] of topCats) {
    nodes.push({
      id: `cat-${c}`,
      label: CAT_LABELS[c] || c,
      value: v,
      x0: 0, x1: 0, y0: 0, y1: 0,
      color: CAT_COLORS[c] || "#64748b",
      column: 2,
    });
  }

  // Project → Category links
  for (const { p } of topProy) {
    const cats = proyByCat[p] || {};
    for (const [c, v] of Object.entries(cats)) {
      const catNode = nodes.find((n) => n.id === `cat-${c}`);
      if (!catNode) continue;
      links.push({
        source: `proy-${p}`,
        target: `cat-${c}`,
        value: v,
        color: PROJECT_COLORS[p] || "#3C8B3C",
      });
    }
  }
  if (otherProy.length > 0) {
    const otherCats: Record<string, number> = {};
    for (const { p } of otherProy) {
      const cats = proyByCat[p] || {};
      for (const [c, v] of Object.entries(cats)) {
        otherCats[c] = (otherCats[c] || 0) + v;
      }
    }
    for (const [c, v] of Object.entries(otherCats)) {
      const catNode = nodes.find((n) => n.id === `cat-${c}`);
      if (!catNode) continue;
      links.push({
        source: "proy-otros",
        target: `cat-${c}`,
        value: v,
        color: "#94a3b8",
      });
    }
  }

  return { nodes, links, totalFlow };
}
