"use client";

import { useMemo, useState } from "react";
import { fmtCLP } from "@/lib/data";
import {
  PROYECTOS_GEO,
  CHILE_BBOX,
  PROYECTOS_GANTT,
  PHASE_COLORS,
  monthToFloat,
  inversionPorProyecto,
} from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import ChartCard from "./ui/ChartCard";
import { Map as MapIcon, Calendar, Zap, MapPin } from "lucide-react";

const STAGE_COLOR: Record<string, string> = {
  Construcción: "#f59e0b",
  "Pre-construcción": "#06b6d4",
  Pipeline: "#8b5cf6",
  Discontinuado: "#94a3b8",
  Estructura: "#64748b",
};

const STAGE_BG: Record<string, string> = {
  Construcción: "bg-amber-100 text-amber-800",
  "Pre-construcción": "bg-cyan-100 text-cyan-800",
  Pipeline: "bg-violet-100 text-violet-800",
};

export default function PortafolioMapView() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const inv = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of inversionPorProyecto()) map[p.centro] = p.valor;
    return map;
  }, []);

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Portafolio físico"
          title="Dónde están los activos. Cuándo entran a operar."
          subtitle="Vista geográfica de cada proyecto en Chile junto al cronograma de ejecución por fase. Cada pin es un proyecto, cada barra es una fase."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 mb-10">
          {/* === MAPA DE CHILE === */}
          <ChartCard
            icon={<MapIcon className="w-4 h-4" />}
            eyebrow="Mapa Chile"
            title="Distribución geográfica"
            subtitle="Tamaño del pin proporcional a capacidad (MW). Color por etapa."
            accent="emerald"
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
              <ChileMap
                items={PROYECTOS_GEO}
                hoverIdx={hoverIdx}
                onHover={setHoverIdx}
                inv={inv}
              />
              <div className="space-y-2">
                {PROYECTOS_GEO.map((p, i) => {
                  const valor = inv[p.centro] || 0;
                  return (
                    <button
                      key={p.centro}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                      className={`text-left w-full p-2.5 rounded-xl border transition-all ${
                        hoverIdx === i
                          ? "border-rho-medium bg-rho-ultralight/40"
                          : "border-ink-quaternary/40 hover:border-ink-quaternary"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: STAGE_COLOR[p.etapa] }}
                          />
                          <span className="text-sm font-medium truncate">{p.nombre}</span>
                        </div>
                        <span className="text-[10px] tabular-nums text-ink-tertiary shrink-0">
                          {p.mw} MW
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-ink-tertiary">
                        <span className="truncate">
                          <MapPin className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />
                          {p.comuna}
                        </span>
                        <span className="tabular-nums shrink-0">
                          {valor > 0 ? fmtCLP(valor, { compact: true }) : "—"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <Legend />
          </ChartCard>

          {/* === KPI grandes a la derecha === */}
          <ChartCard
            icon={<Zap className="w-4 h-4" />}
            eyebrow="Portafolio agregado"
            title="Composición del portafolio"
            subtitle="Capacidad instalada por tecnología y por etapa de avance."
            accent="violet"
          >
            <PortfolioBreakdown />
          </ChartCard>
        </div>

        {/* === GANTT === */}
        <ChartCard
          icon={<Calendar className="w-4 h-4" />}
          eyebrow="Cronograma de ejecución"
          title="Roadmap del portafolio 2024 → 2030"
          subtitle="Cada barra es una fase de un proyecto. Verde = en operación comercial."
          accent="emerald"
        >
          <GanttChart items={PROYECTOS_GANTT} />
        </ChartCard>
      </div>
    </section>
  );
}

// ============================================================================
// CHILE MAP — SVG simplificado de Chile (bounding box + costa estilizada)
// ============================================================================

function ChileMap({
  items,
  hoverIdx,
  onHover,
  inv,
}: {
  items: typeof PROYECTOS_GEO;
  hoverIdx: number | null;
  onHover: (i: number | null) => void;
  inv: Record<string, number>;
}) {
  // Mapa: dibujamos un Chile aproximado con un path simplificado.
  // viewBox: 0..200 width, 0..600 height
  // Convertimos lat/lon → x/y dentro del viewBox.
  const W = 200;
  const H = 600;
  const bb = CHILE_BBOX;
  const project = (lat: number, lon: number) => {
    // Lat: -17.5 (norte, top) -> 0; -56 (sur, bottom) -> H
    const y = ((bb.latMax - lat) / (bb.latMax - bb.latMin)) * H;
    // Lon: -75.7 (oeste) -> 0; -66.4 (este) -> W
    // Pero Chile es muy delgado; usamos centro como referencia para no distorsionar tanto
    const lonRange = bb.lonMax - bb.lonMin;
    const x = ((lon - bb.lonMin) / lonRange) * W;
    return { x, y };
  };

  const maxMW = Math.max(...items.map((i) => i.mw));

  return (
    <div className="relative bg-gradient-to-b from-sky-50/40 via-emerald-50/30 to-sky-50/40 rounded-2xl border border-ink-quaternary/40 p-4">
      <svg viewBox={`-20 -10 ${W + 40} ${H + 20}`} className="w-full h-[520px]">
        {/* Chile outline — simplified silhouette */}
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="100%" stopColor="#dcfce7" />
          </linearGradient>
        </defs>
        <ChileSilhouette W={W} H={H} />

        {/* Lat labels — referencias geográficas */}
        {[
          { lat: -18, label: "Arica" },
          { lat: -23, label: "Antofagasta" },
          { lat: -27, label: "Copiapó" },
          { lat: -33, label: "Santiago" },
          { lat: -36.8, label: "Concepción" },
          { lat: -41.5, label: "Puerto Montt" },
          { lat: -53, label: "Punta Arenas" },
        ].map((r) => {
          const { y } = project(r.lat, bb.lonMin);
          return (
            <g key={r.label}>
              <line x1={-8} y1={y} x2={0} y2={y} stroke="#cbd5e1" strokeWidth={0.6} />
              <text
                x={-10}
                y={y + 3}
                fontSize={8}
                fill="#94a3b8"
                textAnchor="end"
                className="font-mono"
              >
                {r.label}
              </text>
            </g>
          );
        })}

        {/* Project pins */}
        {items.map((p, i) => {
          const { x, y } = project(p.lat, p.lon);
          const r = 5 + (p.mw / maxMW) * 12;
          const isHover = hoverIdx === i;
          return (
            <g key={p.centro} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)}>
              <circle
                cx={x}
                cy={y}
                r={r * 2.5}
                fill={STAGE_COLOR[p.etapa]}
                opacity={isHover ? 0.18 : 0.08}
                className="transition-all duration-200"
              />
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={STAGE_COLOR[p.etapa]}
                stroke="white"
                strokeWidth={isHover ? 2.5 : 1.5}
                className={`cursor-pointer transition-all duration-200 ${isHover ? "drop-shadow-md" : ""}`}
              />
              {isHover && (
                <g>
                  <rect
                    x={x + r + 8}
                    y={y - 28}
                    rx={6}
                    ry={6}
                    width={120}
                    height={56}
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth={0.5}
                  />
                  <text x={x + r + 14} y={y - 14} fontSize={8} fontWeight={600} fill="#1d1d1f">
                    {p.nombre}
                  </text>
                  <text x={x + r + 14} y={y - 4} fontSize={7} fill="#86868B">
                    {p.comuna}, {p.region}
                  </text>
                  <text x={x + r + 14} y={y + 6} fontSize={7} fill="#1A4A1A" fontWeight={600}>
                    {p.mw} MW {p.mwh > 0 ? `· ${p.mwh} MWh` : ""}
                  </text>
                  <text x={x + r + 14} y={y + 16} fontSize={6.5} fill={STAGE_COLOR[p.etapa]}>
                    {p.etapa} · {p.cod}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ChileSilhouette({ W, H }: { W: number; H: number }) {
  // Aproximación libre de la silueta de Chile mainland.
  // Coordenadas en el espacio del viewBox del mapa (0..W, 0..H).
  // No es geográficamente perfecto pero sí reconocible.
  const path = `
    M 130 5 L 145 5 L 150 25 L 152 55 L 148 85 L 152 110 L 145 140 L 148 165 L 152 195
    L 150 220 L 152 250 L 148 280 L 150 310 L 145 340 L 142 370 L 140 400 L 142 430
    L 130 455 L 125 480 L 115 505 L 100 525 L 88 540 L 75 552 L 65 560 L 55 565
    L 50 568 L 55 562 L 70 552 L 80 542 L 92 528 L 100 510 L 105 490 L 110 470
    L 112 445 L 115 420 L 118 395 L 120 365 L 122 335 L 120 305 L 122 275 L 118 245
    L 120 215 L 122 185 L 118 155 L 120 125 L 118 95 L 122 65 L 125 35 L 130 5 Z
  `;
  return (
    <path
      d={path}
      fill="url(#land)"
      stroke="#86c586"
      strokeWidth={0.8}
      strokeLinejoin="round"
    />
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs">
      {Object.entries(STAGE_COLOR)
        .filter(([k]) => k !== "Discontinuado" && k !== "Estructura")
        .map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            <span className="text-ink-secondary">{k}</span>
          </span>
        ))}
    </div>
  );
}

// ============================================================================
// PORTFOLIO BREAKDOWN — bars y donuts
// ============================================================================

function PortfolioBreakdown() {
  const totalMW = PROYECTOS_GEO.reduce((a, p) => a + p.mw, 0);
  const totalMWh = PROYECTOS_GEO.reduce((a, p) => a + p.mwh, 0);
  const bessMW = PROYECTOS_GEO.filter((p) => p.mwh > 0).reduce((a, p) => a + p.mw, 0);
  const pvMW = totalMW - bessMW + 3; // +3 Panimávida tiene PV
  const adjBess = totalMW - 3; // approx
  // Simpler: cuenta cap por tipo según definición:
  // Total: 161 MW total (3 PV + 9 BESS para Panimavida + 90 BESS La Ligua + 15 PV Santa V + ...
  // Para visual usamos los buckets actuales

  const porEtapa = ["Construcción", "Pre-construcción", "Pipeline"].map((etapa) => {
    const items = PROYECTOS_GEO.filter((p) => p.etapa === etapa);
    return {
      etapa,
      mw: items.reduce((a, p) => a + p.mw, 0),
      count: items.length,
      color: STAGE_COLOR[etapa],
    };
  });

  const totalEtapa = porEtapa.reduce((a, b) => a + b.mw, 0);

  return (
    <div className="space-y-6">
      {/* Donut por etapa */}
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-tertiary font-medium mb-3">
          Capacidad por etapa
        </p>
        <div className="flex gap-3">
          {porEtapa.map((e) => {
            const pct = (e.mw / totalEtapa) * 100;
            return (
              <div key={e.etapa} className="flex-1">
                <p className="text-2xl font-semibold tabular-nums" style={{ color: e.color }}>
                  {e.mw} <span className="text-xs font-normal text-ink-tertiary">MW</span>
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: e.color }}>
                  {e.etapa}
                </p>
                <div className="h-1.5 bg-surface-tertiary rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: e.color }}
                  />
                </div>
                <p className="text-[10px] text-ink-tertiary mt-1">
                  {e.count} proyecto{e.count === 1 ? "" : "s"} · {pct.toFixed(0)}% del total
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="divider" />

      {/* Tecnología */}
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-tertiary font-medium mb-3">
          Por tecnología
        </p>
        <TechRow label="Solar PV" mw={pvMW} mwh={null} color="#f59e0b" max={totalMW} />
        <TechRow label="BESS (almacenamiento)" mw={bessMW} mwh={totalMWh} color="#8b5cf6" max={totalMW} />
      </div>

      <div className="divider" />

      {/* Ranking por capacidad */}
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-tertiary font-medium mb-3">
          Top proyectos por capacidad
        </p>
        <div className="space-y-2">
          {[...PROYECTOS_GEO]
            .sort((a, b) => b.mw - a.mw)
            .slice(0, 5)
            .map((p) => {
              const max = Math.max(...PROYECTOS_GEO.map((x) => x.mw));
              return (
                <div key={p.centro} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm font-medium truncate">{p.nombre}</span>
                  <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(p.mw / max) * 100}%`,
                        background: STAGE_COLOR[p.etapa],
                      }}
                    />
                  </div>
                  <span className="w-20 text-right text-sm font-medium tabular-nums shrink-0">
                    {p.mw} MW
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function TechRow({
  label,
  mw,
  mwh,
  color,
  max,
}: {
  label: string;
  mw: number;
  mwh: number | null;
  color: string;
  max: number;
}) {
  const pct = (mw / max) * 100;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color }}>
          {label}
        </span>
        <span className="text-sm tabular-nums text-ink-secondary">
          {mw} MW{mwh ? ` · ${mwh} MWh` : ""}
        </span>
      </div>
      <div className="h-2.5 bg-surface-tertiary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// GANTT CHART
// ============================================================================

function GanttChart({ items }: { items: typeof PROYECTOS_GANTT }) {
  // Calculate horizontal scale from all phases
  const allStart = items.flatMap((it) => it.fases.map((f) => monthToFloat(f.start)));
  const allEnd = items.flatMap((it) => it.fases.map((f) => monthToFloat(f.end)));
  const min = Math.floor(Math.min(...allStart));
  const max = Math.ceil(Math.max(...allEnd));
  const totalYears = max - min;
  const now = new Date();
  const nowFloat = now.getFullYear() + now.getMonth() / 12;

  const years = [];
  for (let y = min; y <= max; y++) years.push(y);

  const ROW_H = 56;
  const LEFT = 220;
  const RIGHT = 30;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 900 }}>
        {/* Year header */}
        <div className="flex items-end relative" style={{ paddingLeft: LEFT, paddingRight: RIGHT }}>
          {years.map((y, i) => (
            <div
              key={y}
              className="flex-1 text-center text-xs font-medium text-ink-secondary border-l border-ink-quaternary/40 py-2"
            >
              {y}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="relative">
          {/* Vertical year grid */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: LEFT, right: RIGHT }}
          >
            {years.map((y, i) => (
              <div
                key={y}
                className="absolute top-0 bottom-0 border-l border-dashed border-ink-quaternary/30"
                style={{ left: `${(i / totalYears) * 100}%` }}
              />
            ))}
            {/* TODAY marker */}
            {nowFloat >= min && nowFloat <= max && (
              <div
                className="absolute top-0 bottom-0 w-px bg-rho-medium z-10"
                style={{ left: `${((nowFloat - min) / totalYears) * 100}%` }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-rho-medium text-white text-[9px] font-medium whitespace-nowrap">
                  hoy
                </div>
              </div>
            )}
          </div>

          {items.map((it, i) => (
            <div
              key={it.centro}
              className="relative flex items-center border-b border-ink-quaternary/30 hover:bg-surface-tertiary/40"
              style={{ height: ROW_H }}
            >
              <div className="shrink-0 pr-3" style={{ width: LEFT }}>
                <p className="text-sm font-medium text-ink-primary truncate">{it.nombre}</p>
                <p className="text-[11px] text-ink-tertiary">
                  {it.mw} MW · COD {it.cod}
                </p>
              </div>

              <div className="relative flex-1 h-full" style={{ marginRight: RIGHT - 30 }}>
                {it.fases.map((f, j) => {
                  const startF = monthToFloat(f.start);
                  const endF = monthToFloat(f.end);
                  const leftPct = ((startF - min) / totalYears) * 100;
                  const widthPct = ((endF - startF) / totalYears) * 100;
                  return (
                    <div
                      key={j}
                      className="absolute top-1/2 -translate-y-1/2 rounded-md h-6 flex items-center px-2 text-[10px] font-medium text-white overflow-hidden cursor-pointer transition-all hover:h-7"
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.max(0.5, widthPct)}%`,
                        background: f.color,
                        opacity: 0.92,
                      }}
                      title={`${f.fase}: ${f.start} → ${f.end}`}
                    >
                      <span className="truncate">{widthPct > 5 ? f.fase : ""}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Phase legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs">
          {Object.entries(PHASE_COLORS).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ background: c }} />
              <span className="text-ink-secondary">{k}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
