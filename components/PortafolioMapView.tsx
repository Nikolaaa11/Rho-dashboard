"use client";

import { useMemo, useState } from "react";
import { fmtCLP } from "@/lib/data";
import {
  PROYECTOS_GEO,
  PROYECTOS_GANTT,
  PHASE_COLORS,
  monthToFloat,
  inversionPorProyecto,
} from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import ChartCard from "./ui/ChartCard";
import ChileMap, { type ChileMapPin } from "./ui/ChileMap";
import { Map as MapIcon, Calendar, Zap, MapPin } from "lucide-react";

const STAGE_COLOR: Record<string, string> = {
  Construcción: "#f59e0b",
  "Pre-construcción": "#06b6d4",
  Pipeline: "#8b5cf6",
  Discontinuado: "#94a3b8",
  Estructura: "#64748b",
};

export default function PortafolioMapView() {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const inv = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of inversionPorProyecto()) map[p.centro] = p.valor;
    return map;
  }, []);

  const pins: ChileMapPin[] = useMemo(
    () =>
      PROYECTOS_GEO.map((p) => ({
        id: p.centro,
        name: p.nombre,
        lat: p.lat,
        lon: p.lon,
        color: STAGE_COLOR[p.etapa] || "#3C8B3C",
        size: p.mw,
        meta: `${p.mw} MW · ${p.etapa}`,
      })),
    []
  );

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Portafolio físico"
          title="Dónde están los activos. Cuándo entran a operar."
          subtitle="Vista geográfica de cada proyecto en Chile junto al cronograma de ejecución por fase. Cada pin es un proyecto, cada barra es una fase."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 mb-10 items-start">
          {/* === MAPA DE CHILE === */}
          <ChartCard
            icon={<MapIcon className="w-4 h-4" />}
            eyebrow="Mapa Chile"
            title="Distribución geográfica"
            subtitle="Tamaño del pin proporcional a capacidad (MW). Color por etapa."
            accent="emerald"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-5">
              <div>
                <ChileMap pins={pins} hoverId={hoverId} onHover={setHoverId} height={560} />
                <Legend />
              </div>
              <div className="space-y-2">
                {PROYECTOS_GEO.map((p) => {
                  const valor = inv[p.centro] || 0;
                  const isActive = hoverId === p.centro;
                  return (
                    <button
                      key={p.centro}
                      onMouseEnter={() => setHoverId(p.centro)}
                      onMouseLeave={() => setHoverId(null)}
                      className={`text-left w-full p-3 rounded-xl border transition-all ${
                        isActive
                          ? "border-rho-medium bg-rho-ultralight/40 shadow-sm"
                          : "border-ink-quaternary/40 hover:border-ink-quaternary"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: STAGE_COLOR[p.etapa] }}
                          />
                          <span className="text-sm font-semibold text-ink-primary truncate">
                            {p.nombre}
                          </span>
                        </div>
                        <span className="text-xs tabular-nums text-ink-tertiary shrink-0 font-medium">
                          {p.mw} MW
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-xs text-ink-tertiary">
                        <span className="truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {p.comuna} · {p.region}
                        </span>
                        <span className="tabular-nums shrink-0 font-medium">
                          {valor > 0 ? fmtCLP(valor, { compact: true }) : "—"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
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
// PORTFOLIO BREAKDOWN
// ============================================================================

function PortfolioBreakdown() {
  const totalMW = PROYECTOS_GEO.reduce((a, p) => a + p.mw, 0);
  const bessMW = PROYECTOS_GEO.filter((p) => p.mwh > 0).reduce((a, p) => a + p.mw, 0);
  const pvMW = totalMW - bessMW + 3;
  const totalMWh = PROYECTOS_GEO.reduce((a, p) => a + p.mwh, 0);

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
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-tertiary font-medium mb-3">
          Capacidad por etapa
        </p>
        <div className="grid grid-cols-3 gap-3">
          {porEtapa.map((e) => {
            const pct = totalEtapa > 0 ? (e.mw / totalEtapa) * 100 : 0;
            return (
              <div key={e.etapa}>
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
                  {e.count} proyecto{e.count === 1 ? "" : "s"} · {pct.toFixed(0)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="divider" />

      <div>
        <p className="text-xs uppercase tracking-wide text-ink-tertiary font-medium mb-3">
          Por tecnología
        </p>
        <TechRow label="Solar fotovoltaico" mw={pvMW} mwh={null} color="#f59e0b" max={totalMW} />
        <TechRow
          label="BESS (almacenamiento)"
          mw={bessMW}
          mwh={totalMWh}
          color="#8b5cf6"
          max={totalMW}
        />
      </div>

      <div className="divider" />

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
  const pct = max > 0 ? (mw / max) * 100 : 0;
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
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// GANTT CHART
// ============================================================================

function GanttChart({ items }: { items: typeof PROYECTOS_GANTT }) {
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
        <div className="flex items-end relative" style={{ paddingLeft: LEFT, paddingRight: RIGHT }}>
          {years.map((y) => (
            <div
              key={y}
              className="flex-1 text-center text-xs font-medium text-ink-secondary border-l border-ink-quaternary/40 py-2"
            >
              {y}
            </div>
          ))}
        </div>

        <div className="relative">
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
