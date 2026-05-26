"use client";

import { useMemo, useState } from "react";
import {
  fmtCLP,
  fmtMM,
  sum,
  isOperativo,
  movimientosHistoricos,
  analizarCuotasAdenda,
  PROYECTOS,
  TOTAL_APORTE_FIP_CLP,
  projectMeta,
  dataset,
} from "@/lib/data";
import {
  mesesAgregados,
  inversionPorProyecto,
  headlineKPIs,
  ocSummary,
} from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import ChartCard from "./ui/ChartCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PolarRadiusAxis,
  PolarGrid,
  Radar,
  RadarChart,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Zap,
  BarChart3,
  Grid3x3,
  Network,
  Target,
  GitBranch,
  CircleDot,
  Calendar,
  Gauge,
  Filter,
} from "lucide-react";

export default function AnaliticaView() {
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-emerald-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-violet-50/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Analítica avanzada"
          title="Los datos. En forma."
          subtitle="Galería de visualizaciones interactivas: flujos, calendarios, distribuciones, radares y rankings. Cada gráfico revela un ángulo distinto del portafolio."
        />

        {/* ROW 1 — Anillos + Cuotas */}
        <ActivityRings />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CashflowChart />
          <CuotasRadial />
        </div>

        {/* ROW 2 — Heatmap proyecto×mes */}
        <HeatmapProyectoMes />

        {/* ROW 3 — Pareto + Bubble */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ParetoCategorias />
          <ProjectsBubble />
        </div>

        {/* ROW 4 — Capital flow Sankey-like */}
        <CapitalFlow />

        {/* ROW 5 — Velocity + Category evolution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MonthlyVelocity />
          <CategoryEvolution />
        </div>

        {/* ROW 6 — Radar de proyectos + Funnel OC */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RadarProyectos />
          <FunnelOC />
        </div>

        {/* ROW 7 — Calendar heatmap */}
        <CalendarHeatmap />

        {/* ROW 8 — Top proveedores */}
        <ProveedoresRanking />

        {/* ROW 9 — Footprint hero */}
        <FootprintCard />
      </div>
    </section>
  );
}

// ============================================================================
// 1. ACTIVITY RINGS (Apple watch style)
// ============================================================================

function ActivityRings() {
  const k = headlineKPIs();
  const ocs = ocSummary();
  const rings = [
    {
      label: "Plan ejecutado",
      pct: k.pctPagado,
      value: fmtMM(k.pagado),
      sub: `de ${fmtMM(TOTAL_APORTE_FIP_CLP)}`,
      color: "#10b981",
      track: "#d1fae5",
    },
    {
      label: "Capital utilizado",
      pct: k.pctEjecutado,
      value: fmtMM(k.ejecutado),
      sub: `${k.pctEjecutado.toFixed(0)}% del aportado`,
      color: "#06b6d4",
      track: "#cffafe",
    },
    {
      label: "OC pagadas",
      pct: ocs.pctPagado,
      value: fmtMM(ocs.pagado),
      sub: `de ${fmtMM(ocs.comprometido)} comprometido`,
      color: "#8b5cf6",
      track: "#ede9fe",
    },
  ];
  return (
    <div className="card-elevated p-8 md:p-10 mb-6 relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/30">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white">
          <Activity className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-emerald-700 uppercase tracking-[0.12em]">
          Indicadores de avance
        </p>
      </div>
      <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest mb-8">
        Tres anillos, un solo objetivo.
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {rings.map((r, i) => (
          <ActivityRing key={i} {...r} delay={i * 0.15} />
        ))}
      </div>
    </div>
  );
}

function ActivityRing({
  label,
  pct,
  value,
  sub,
  color,
  track,
  delay,
}: {
  label: string;
  pct: number;
  value: string;
  sub: string;
  color: string;
  track: string;
  delay: number;
}) {
  const pctClamped = Math.min(100, pct);
  const data = [{ name: label, value: pctClamped }];
  return (
    <div
      className="flex flex-col items-center text-center animate-scale-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative w-56 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="75%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: track }}
              dataKey="value"
              cornerRadius={20}
              fill={color}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-3xl font-semibold tabular-nums" style={{ color }}>
            {pct.toFixed(0)}%
          </p>
          <p className="text-xs text-ink-tertiary mt-1 uppercase tracking-wide">{label}</p>
        </div>
      </div>
      <p className="text-2xl font-semibold tabular-nums mt-4">{value}</p>
      <p className="text-sm text-ink-tertiary">{sub}</p>
    </div>
  );
}

// ============================================================================
// 2. CASHFLOW CHART
// ============================================================================

function CashflowChart() {
  const data = mesesAgregados();
  return (
    <ChartCard
      icon={<TrendingUp className="w-4 h-4" />}
      eyebrow="Acumulado mensual"
      title="Curva de capital"
      subtitle="Cómo entra el capital del FIP y a qué ritmo se ejecuta en proyectos."
      accent="emerald"
    >
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="gAp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gEj" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F5F5F7" vertical={false} />
          <XAxis dataKey="mes" stroke="#86868B" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#86868B"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtCLP(v, { compact: true })}
          />
          <Tooltip formatter={(v: number) => fmtCLP(v)} />
          <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} iconType="circle" />
          <Area
            type="monotone"
            dataKey="acumAbono"
            name="Aportes acumulados"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#gAp)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="acumEgreso"
            name="Ejecución acumulada"
            stroke="#06b6d4"
            strokeWidth={3}
            fill="url(#gEj)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ============================================================================
// 3. CUOTAS RADIAL
// ============================================================================

function CuotasRadial() {
  const cuotas = useMemo(() => analizarCuotasAdenda(), []);
  const estadoColor: Record<string, string> = {
    Pagada: "#10b981",
    "Pagada parcial": "#f59e0b",
    Vencida: "#ef4444",
    Próxima: "#94a3b8",
  };
  return (
    <ChartCard
      icon={<Target className="w-4 h-4" />}
      eyebrow="Adenda N°2"
      title="Las seis cuotas, en una vista"
      subtitle="Cada anillo es una cuota — verde pagada, ámbar parcial, rojo vencida, gris próxima."
      accent="cyan"
    >
      <div className="grid grid-cols-3 gap-3 mt-1">
        {cuotas.map((c, i) => (
          <MiniRing
            key={c.id}
            letra={c.letra}
            label={c.label}
            plazo={c.plazo}
            pct={Math.min(100, c.pctPago)}
            color={estadoColor[c.estado]}
            estado={c.estado}
            monto={c.monto}
            delay={i * 0.08}
          />
        ))}
      </div>
    </ChartCard>
  );
}

function MiniRing({
  letra,
  label,
  plazo,
  pct,
  color,
  estado,
  monto,
  delay,
}: any) {
  const displayPct = pct === 0 ? 100 : pct;
  const isEmpty = pct === 0;
  return (
    <div
      className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-ink-quaternary/30 animate-scale-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="65%"
            outerRadius="100%"
            data={[{ value: displayPct }]}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: isEmpty ? `${color}33` : "#F5F5F7" }}
              dataKey="value"
              cornerRadius={20}
              fill={isEmpty ? `${color}55` : color}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-semibold tabular-nums" style={{ color }}>
            {pct.toFixed(0)}%
          </p>
          <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color }}>
            {letra}
          </p>
        </div>
      </div>
      <p className="text-xs font-medium text-ink-primary mt-2">{label}</p>
      <p className="text-[10px] text-ink-tertiary">{plazo}</p>
      <p className="text-[10px] tabular-nums text-ink-secondary mt-1">
        {fmtCLP(monto, { compact: true })}
      </p>
      <span
        className="text-[9px] font-medium uppercase tracking-wide mt-1 px-2 py-0.5 rounded-full"
        style={{ background: `${color}22`, color }}
      >
        {estado}
      </span>
    </div>
  );
}

// ============================================================================
// 4. HEATMAP PROYECTO x MES
// ============================================================================

function HeatmapProyectoMes() {
  const movs = movimientosHistoricos();
  const { matriz, proyectos, meses, maxVal } = useMemo(() => {
    const proyectos = Array.from(
      new Set(
        movs
          .filter(isOperativo)
          .map((m) => m.Centro_Negocios)
          .filter((c) => c && c !== "Reversa")
      )
    );
    const meses = Array.from(new Set(movs.map((m) => m.FECHA_STR.slice(0, 7)))).sort();
    const matriz: Record<string, Record<string, number>> = {};
    for (const p of proyectos) matriz[p] = {};
    for (const m of movs.filter(isOperativo)) {
      if (!m.Centro_Negocios || m.Centro_Negocios === "Reversa") continue;
      const mes = m.FECHA_STR.slice(0, 7);
      matriz[m.Centro_Negocios][mes] = (matriz[m.Centro_Negocios][mes] || 0) + m.EGRESO;
    }
    let maxVal = 0;
    for (const p of proyectos)
      for (const mes of meses) if ((matriz[p][mes] || 0) > maxVal) maxVal = matriz[p][mes];
    proyectos.sort((a, b) => {
      const ta = Object.values(matriz[a]).reduce((x, y) => x + y, 0);
      const tb = Object.values(matriz[b]).reduce((x, y) => x + y, 0);
      return tb - ta;
    });
    return { matriz, proyectos, meses, maxVal };
  }, [movs]);

  const intensity = (v: number) => (v ? Math.max(0.08, Math.pow(v / maxVal, 0.4)) : 0);

  return (
    <ChartCard
      icon={<Grid3x3 className="w-4 h-4" />}
      eyebrow="Matriz de ejecución"
      title="Mapa de calor proyecto × mes"
      subtitle="Cada celda muestra el gasto operativo de un proyecto en un mes. Más intenso = más gasto."
      accent="emerald"
      className="mb-6"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex">
            <div className="w-44 shrink-0" />
            <div
              className="flex-1 grid"
              style={{ gridTemplateColumns: `repeat(${meses.length}, minmax(0, 1fr))` }}
            >
              {meses.map((m, i) => (
                <div
                  key={m}
                  className="text-[9px] text-ink-tertiary text-center px-0.5 py-1 font-mono"
                  style={{ transform: "rotate(-45deg)", transformOrigin: "center", height: 30 }}
                >
                  {i % 2 === 0 ? m.slice(2) : ""}
                </div>
              ))}
            </div>
          </div>
          {proyectos.map((p, pi) => {
            const meta = projectMeta(p);
            const total = Object.values(matriz[p]).reduce((x, y) => x + y, 0);
            return (
              <div
                key={p}
                className="flex items-center mb-0.5 animate-fade-in"
                style={{ animationDelay: `${pi * 0.05}s` }}
              >
                <div className="w-44 shrink-0 pr-3">
                  <p className="text-xs font-medium text-ink-primary truncate">{meta.nombre}</p>
                  <p className="text-[10px] text-ink-tertiary tabular-nums">
                    {fmtCLP(total, { compact: true })}
                  </p>
                </div>
                <div
                  className="flex-1 grid gap-px"
                  style={{ gridTemplateColumns: `repeat(${meses.length}, minmax(0, 1fr))` }}
                >
                  {meses.map((m) => {
                    const v = matriz[p][m] || 0;
                    const a = intensity(v);
                    return (
                      <div
                        key={m}
                        className="aspect-square rounded transition-transform hover:scale-125 hover:z-10 relative cursor-pointer"
                        style={{
                          background:
                            v > 0
                              ? `linear-gradient(135deg, rgba(16, 185, 129, ${a}), rgba(6, 182, 212, ${a * 0.8}))`
                              : "#F5F5F7",
                        }}
                        title={`${meta.nombre} · ${m}: ${fmtCLP(v)}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-end gap-3 text-xs text-ink-tertiary">
        <span>Menor</span>
        <div className="flex gap-px">
          {[0.1, 0.25, 0.45, 0.7, 1.0].map((a, i) => (
            <div
              key={i}
              className="w-5 h-3 rounded-sm"
              style={{
                background: `linear-gradient(135deg, rgba(16, 185, 129, ${a}), rgba(6, 182, 212, ${a * 0.8}))`,
              }}
            />
          ))}
        </div>
        <span>Mayor</span>
      </div>
    </ChartCard>
  );
}

// ============================================================================
// 5. PARETO
// ============================================================================

function ParetoCategorias() {
  const data = useMemo(() => {
    const movs = movimientosHistoricos().filter(isOperativo);
    const map: Record<string, number> = {};
    for (const m of movs) {
      if (!m.Especifico) continue;
      map[m.Especifico] = (map[m.Especifico] || 0) + m.EGRESO;
    }
    const sorted = Object.entries(map)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 12);
    const total = sorted.reduce((a, b) => a + b.valor, 0);
    let acc = 0;
    return sorted.map((d) => {
      acc += d.valor;
      return { ...d, acumPct: (acc / total) * 100 };
    });
  }, []);
  return (
    <ChartCard
      icon={<BarChart3 className="w-4 h-4" />}
      eyebrow="Análisis Pareto 80/20"
      title="¿Dónde está el grueso del gasto?"
      subtitle="Las 12 subcategorías con más gasto. La línea violeta acumula el % del total."
      accent="violet"
    >
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 5, bottom: 50 }}>
          <defs>
            <linearGradient id="parBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F5F5F7" vertical={false} />
          <XAxis
            dataKey="nombre"
            stroke="#86868B"
            fontSize={10}
            angle={-35}
            textAnchor="end"
            tickLine={false}
            axisLine={false}
            height={50}
          />
          <YAxis
            yAxisId="left"
            stroke="#86868B"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtCLP(v, { compact: true })}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#8b5cf6"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(v: number, name) =>
              name === "acumPct" ? `${v.toFixed(1)}%` : fmtCLP(v)
            }
          />
          <Bar yAxisId="left" dataKey="valor" fill="url(#parBar)" radius={[6, 6, 0, 0]} name="Gasto" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="acumPct"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#8b5cf6" }}
            name="acumPct"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ============================================================================
// 6. PROJECTS BUBBLE
// ============================================================================

function ProjectsBubble() {
  const movs = movimientosHistoricos();
  const data = useMemo(() => {
    const byCenter: Record<string, number> = {};
    for (const m of movs.filter(isOperativo)) {
      if (!m.Centro_Negocios || m.Centro_Negocios === "Reversa") continue;
      byCenter[m.Centro_Negocios] = (byCenter[m.Centro_Negocios] || 0) + m.EGRESO;
    }
    const mwByCenter: Record<string, number> = {
      "Panimávida(BESS RHO)": 3,
      "La Ligua (San Expedito) ": 90,
      "PMGD Quebrada Escobar": 9,
    };
    return Object.entries(byCenter)
      .filter(([c]) => mwByCenter[c])
      .map(([centro, valor]) => {
        const meta = projectMeta(centro);
        return {
          name: meta.nombre,
          mw: mwByCenter[centro] || 1,
          inv: valor,
          etapa: meta.etapa,
          z: Math.max(20, valor / 5_000_000),
        };
      });
  }, [movs]);

  const colorByEtapa: Record<string, string> = {
    Construcción: "#10b981",
    "Pre-construcción": "#06b6d4",
    Pipeline: "#8b5cf6",
    Discontinuado: "#94a3b8",
  };

  return (
    <ChartCard
      icon={<CircleDot className="w-4 h-4" />}
      eyebrow="Portafolio físico"
      title="Capacidad × inversión"
      subtitle="Cada burbuja: un proyecto. Tamaño = capital ejecutado. Eje X = MW de capacidad."
      accent="emerald"
    >
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid stroke="#F5F5F7" />
          <XAxis
            type="number"
            dataKey="mw"
            name="MW"
            stroke="#86868B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Capacidad (MW)",
              position: "insideBottom",
              offset: -5,
              fontSize: 11,
              fill: "#86868B",
            }}
            domain={[0, 100]}
          />
          <YAxis
            type="number"
            dataKey="inv"
            name="Inversión"
            stroke="#86868B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtCLP(v, { compact: true })}
          />
          <ZAxis type="number" dataKey="z" range={[200, 1800]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as any;
              return (
                <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-ink-quaternary/40 p-3 text-sm">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-ink-tertiary text-xs">{d.etapa}</p>
                  <p className="tabular-nums mt-1">
                    {d.mw} MW · {fmtCLP(d.inv)}
                  </p>
                </div>
              );
            }}
          />
          <Scatter data={data}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={colorByEtapa[d.etapa] || "#3C8B3C"}
                fillOpacity={0.75}
                stroke={colorByEtapa[d.etapa]}
                strokeWidth={2}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-4 justify-center text-xs">
        {Object.entries(colorByEtapa).map(([etapa, c]) => (
          <span key={etapa} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            <span className="text-ink-secondary">{etapa}</span>
          </span>
        ))}
      </div>
    </ChartCard>
  );
}

// ============================================================================
// 7. CAPITAL FLOW
// ============================================================================

function CapitalFlow() {
  const movs = movimientosHistoricos();
  const flow = useMemo(() => {
    const proyMap: Record<string, Record<string, number>> = {};
    for (const m of movs.filter(isOperativo)) {
      if (!m.Centro_Negocios || m.Centro_Negocios === "Reversa") continue;
      const p = m.Centro_Negocios;
      const c = m.General || "Otros";
      if (!proyMap[p]) proyMap[p] = {};
      proyMap[p][c] = (proyMap[p][c] || 0) + m.EGRESO;
    }
    const proyectos = Object.entries(proyMap)
      .map(([p, cats]) => ({
        nombre: projectMeta(p).nombre,
        total: Object.values(cats).reduce((a, b) => a + b, 0),
        cats,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
    const grandTotal = proyectos.reduce((a, b) => a + b.total, 0);
    return { proyectos, grandTotal };
  }, [movs]);

  const catLabels: Record<string, string> = {
    Desarrollo_Proyecto: "Desarrollo",
    RRHH: "RRHH",
    Administración: "Admin.",
    Operación: "Op. bancaria",
  };
  const catColors: Record<string, string> = {
    Desarrollo_Proyecto: "#10b981",
    RRHH: "#06b6d4",
    Administración: "#8b5cf6",
    Operación: "#94a3b8",
  };

  return (
    <ChartCard
      icon={<Network className="w-4 h-4" />}
      eyebrow="Flujo de capital"
      title="De dónde vino, dónde fue"
      subtitle="Visualización del flujo del capital ejecutado por proyecto y categoría."
      accent="emerald"
      className="mb-6"
    >
      <div className="space-y-3">
        {flow.proyectos.map((p, i) => {
          const pct = (p.total / flow.grandTotal) * 100;
          return (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-medium text-ink-primary">{p.nombre}</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-sm tabular-nums text-ink-secondary">{fmtCLP(p.total)}</span>
                  <span className="text-xs text-ink-tertiary tabular-nums w-12 text-right">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div
                className="flex h-8 rounded-xl overflow-hidden shadow-sm"
                style={{ width: `${pct * 1.5}%`, minWidth: "10%", maxWidth: "100%" }}
              >
                {Object.entries(p.cats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, val], j) => {
                    const catPct = (val / p.total) * 100;
                    return (
                      <div
                        key={j}
                        className="flex items-center justify-center text-[10px] font-medium text-white transition-all hover:brightness-110"
                        style={{
                          width: `${catPct}%`,
                          background: catColors[cat] || "#94a3b8",
                          minWidth: catPct > 5 ? "auto" : 0,
                        }}
                        title={`${catLabels[cat] || cat}: ${fmtCLP(val)} (${catPct.toFixed(1)}%)`}
                      >
                        {catPct > 12 ? catLabels[cat] || cat : ""}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-6 pt-5 border-t border-ink-quaternary/40 text-xs">
        {Object.entries(catColors).map(([cat, c]) => (
          <span key={cat} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md" style={{ background: c }} />
            <span className="text-ink-secondary">{catLabels[cat] || cat}</span>
          </span>
        ))}
      </div>
    </ChartCard>
  );
}

// ============================================================================
// 8. MONTHLY VELOCITY
// ============================================================================

function MonthlyVelocity() {
  const data = useMemo(() => {
    const movs = movimientosHistoricos().filter(isOperativo);
    const map: Record<string, number> = {};
    for (const m of movs) {
      const mes = m.FECHA_STR.slice(0, 7);
      map[mes] = (map[mes] || 0) + m.EGRESO;
    }
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, valor]) => ({ mes, valor }));
  }, []);
  const promedio = data.length > 0 ? data.reduce((a, b) => a + b.valor, 0) / data.length : 0;
  return (
    <ChartCard
      icon={<Zap className="w-4 h-4" />}
      eyebrow="Velocidad de ejecución"
      title="Gasto mensual"
      subtitle="Picos, valles y línea base de actividad operativa."
      accent="cyan"
    >
      <ResponsiveContainer width="100%" height={310}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="velBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F5F5F7" vertical={false} />
          <XAxis dataKey="mes" stroke="#86868B" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#86868B"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtCLP(v, { compact: true })}
          />
          <Tooltip formatter={(v: number) => fmtCLP(v)} />
          <Bar dataKey="valor" fill="url(#velBar)" radius={[6, 6, 0, 0]} />
          <Line
            type="monotone"
            dataKey={() => promedio}
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            name={`Promedio ${fmtCLP(promedio, { compact: true })}`}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ============================================================================
// 9. CATEGORY EVOLUTION
// ============================================================================

function CategoryEvolution() {
  const data = useMemo(() => {
    const movs = movimientosHistoricos().filter(isOperativo);
    const map: Record<string, any> = {};
    for (const m of movs) {
      const mes = m.FECHA_STR.slice(0, 7);
      if (!map[mes]) map[mes] = { mes };
      const cat = m.General || "Otros";
      map[mes][cat] = (map[mes][cat] || 0) + m.EGRESO;
    }
    return Object.values(map).sort((a: any, b: any) => a.mes.localeCompare(b.mes));
  }, []);
  return (
    <ChartCard
      icon={<Layers className="w-4 h-4" />}
      eyebrow="Composición temporal"
      title="Evolución por categoría"
      subtitle="Cómo cambia la mezcla del gasto operativo mes a mes."
      accent="violet"
    >
      <ResponsiveContainer width="100%" height={310}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="cat-dev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="cat-rrhh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="cat-adm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F5F5F7" vertical={false} />
          <XAxis dataKey="mes" stroke="#86868B" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#86868B"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtCLP(v, { compact: true })}
          />
          <Tooltip formatter={(v: number) => fmtCLP(v)} />
          <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} iconType="circle" />
          <Area
            type="monotone"
            dataKey="Desarrollo_Proyecto"
            stackId="1"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#cat-dev)"
            name="Desarrollo"
          />
          <Area
            type="monotone"
            dataKey="RRHH"
            stackId="1"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#cat-rrhh)"
            name="RRHH"
          />
          <Area
            type="monotone"
            dataKey="Administración"
            stackId="1"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#cat-adm)"
            name="Administración"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ============================================================================
// 10. RADAR DE PROYECTOS
// ============================================================================

function RadarProyectos() {
  const data = useMemo(() => {
    const inv = inversionPorProyecto().slice(0, 6);
    const max = inv.length > 0 ? inv[0].valor : 1;
    return inv.map((p) => ({
      proyecto: p.nombre,
      valor: (p.valor / max) * 100,
      raw: p.valor,
    }));
  }, []);
  return (
    <ChartCard
      icon={<Activity className="w-4 h-4" />}
      eyebrow="Comparativa multidimensional"
      title="Inversión relativa por proyecto"
      subtitle="Cada eje del radar es un proyecto del portafolio. Más lejos del centro = más capital ejecutado."
      accent="violet"
    >
      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={data}>
          <PolarGrid stroke="#F5F5F7" />
          <PolarAngleAxis dataKey="proyecto" tick={{ fontSize: 11, fill: "#86868B" }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar
            name="Inversión relativa"
            dataKey="valor"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(v: number, _n, item: any) => fmtCLP(item.payload.raw)}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ============================================================================
// 11. FUNNEL OC
// ============================================================================

function FunnelOC() {
  const oc = useMemo(() => ocSummary(), []);
  const steps = [
    { label: "Emitidas", valor: oc.total, pct: 100, color: "#10b981" },
    {
      label: "Con pago iniciado",
      valor: oc.total - oc.ocPendientes,
      pct: ((oc.total - oc.ocPendientes) / oc.total) * 100,
      color: "#06b6d4",
    },
    {
      label: "Parciales",
      valor: oc.ocParciales,
      pct: (oc.ocParciales / oc.total) * 100,
      color: "#f59e0b",
    },
    {
      label: "Pagadas 100%",
      valor: oc.ocPagadas,
      pct: (oc.ocPagadas / oc.total) * 100,
      color: "#8b5cf6",
    },
  ];
  return (
    <ChartCard
      icon={<Filter className="w-4 h-4" />}
      eyebrow="Embudo de pago"
      title="Ciclo de vida de una OC"
      subtitle="Cuántas órdenes pasan por cada etapa del proceso de pago."
      accent="amber"
    >
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="w-32 shrink-0 text-sm font-medium text-ink-primary">{s.label}</div>
            <div className="flex-1 h-10 rounded-xl bg-surface-tertiary overflow-hidden relative">
              <div
                className="h-full rounded-xl transition-all duration-1000 flex items-center px-3 text-sm font-medium text-white"
                style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)` }}
              >
                {s.pct > 18 ? `${s.valor} OC · ${s.pct.toFixed(1)}%` : ""}
              </div>
            </div>
            <div className="w-28 text-right text-sm tabular-nums shrink-0">
              {s.pct <= 18 ? `${s.valor} · ${s.pct.toFixed(1)}%` : ""}
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

// ============================================================================
// 12. CALENDAR HEATMAP — actividad diaria
// ============================================================================

function CalendarHeatmap() {
  const movs = movimientosHistoricos();
  const byDay = useMemo(() => {
    const m: Record<string, number> = {};
    for (const mv of movs.filter(isOperativo)) {
      m[mv.FECHA_STR] = (m[mv.FECHA_STR] || 0) + mv.EGRESO;
    }
    return m;
  }, [movs]);

  const months = useMemo(() => {
    const fechas = Object.keys(byDay).sort();
    if (fechas.length === 0) return [];
    const start = new Date(fechas[0] + "T12:00:00");
    const end = new Date(fechas[fechas.length - 1] + "T12:00:00");
    const out: Date[] = [];
    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= end) {
      out.push(new Date(d));
      d.setMonth(d.getMonth() + 1);
    }
    return out;
  }, [byDay]);

  const maxDay = Math.max(...Object.values(byDay), 1);

  return (
    <ChartCard
      icon={<Calendar className="w-4 h-4" />}
      eyebrow="Calendario operativo"
      title="Actividad diaria"
      subtitle="Cada cuadrado = un día. Intensidad = monto egresado ese día. Patrón GitHub-style."
      accent="emerald"
      className="mb-6"
    >
      <div className="overflow-x-auto">
        <div className="flex gap-3" style={{ minWidth: 760 }}>
          {months.map((m, mi) => {
            const year = m.getFullYear();
            const month = m.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
            const cells: { date: string | null; v: number }[] = [];
            // Padding before
            for (let i = 0; i < firstDay; i++) cells.push({ date: null, v: 0 });
            for (let d = 1; d <= daysInMonth; d++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              cells.push({ date: dateStr, v: byDay[dateStr] || 0 });
            }
            return (
              <div key={mi} className="shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-ink-tertiary text-center mb-1.5 font-medium">
                  {m.toLocaleDateString("es-CL", { month: "short", year: "2-digit" })}
                </p>
                <div className="grid grid-cols-7 gap-0.5">
                  {cells.map((c, ci) => {
                    if (!c.date) return <div key={ci} className="w-3.5 h-3.5" />;
                    const intensity = c.v > 0 ? Math.max(0.18, Math.pow(c.v / maxDay, 0.4)) : 0;
                    return (
                      <div
                        key={ci}
                        className="w-3.5 h-3.5 rounded-[3px] hover:ring-2 hover:ring-rho-medium cursor-pointer transition-all"
                        style={{
                          background:
                            c.v > 0
                              ? `rgba(16, 185, 129, ${intensity})`
                              : "#F5F5F7",
                        }}
                        title={c.v > 0 ? `${c.date}: ${fmtCLP(c.v)}` : c.date}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-ink-tertiary">
        <span>Menor</span>
        {[0.18, 0.35, 0.55, 0.8, 1].map((a, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-[3px]"
            style={{ background: `rgba(16, 185, 129, ${a})` }}
          />
        ))}
        <span>Mayor</span>
      </div>
    </ChartCard>
  );
}

// ============================================================================
// 13. PROVEEDORES RANKING
// ============================================================================

function ProveedoresRanking() {
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of dataset.oc) {
      if (!o.Proveedor) continue;
      map[o.Proveedor] = (map[o.Proveedor] || 0) + o.Pagado;
    }
    return Object.entries(map)
      .map(([proveedor, valor]) => ({ proveedor, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 15);
  }, []);
  const max = data[0]?.valor || 1;
  return (
    <ChartCard
      icon={<GitBranch className="w-4 h-4" />}
      eyebrow="Capital humano y servicios"
      title="Top 15 proveedores por monto pagado"
      subtitle="Quiénes están construyendo Rho. Cada barra es un proveedor con su monto facturado."
      accent="emerald"
      className="mb-6"
    >
      <div className="space-y-2.5">
        {data.map((d, i) => {
          const pct = (d.valor / max) * 100;
          const isHigh = pct > 60;
          return (
            <div
              key={i}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="w-6 text-xs text-ink-tertiary tabular-nums font-mono shrink-0">
                #{i + 1}
              </div>
              <div className="w-40 shrink-0 text-sm font-medium truncate">{d.proveedor}</div>
              <div className="flex-1 h-7 bg-surface-tertiary rounded-lg overflow-hidden relative">
                <div
                  className="h-full rounded-lg transition-all duration-1000 relative overflow-hidden"
                  style={{
                    width: `${pct}%`,
                    background: isHigh
                      ? "linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)"
                      : "linear-gradient(90deg, #10b981, #06b6d4)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>
              <div className="w-28 text-right text-sm font-medium tabular-nums shrink-0">
                {fmtCLP(d.valor, { compact: true })}
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

// ============================================================================
// 14. FOOTPRINT — Mega stats
// ============================================================================

function FootprintCard() {
  const movs = movimientosHistoricos();
  const totalProyectos = Object.values(PROYECTOS).filter(
    (p) => p.etapa !== "Estructura" && p.etapa !== "Discontinuado"
  ).length;
  const totalProv = new Set(dataset.oc.map((o) => o.Proveedor)).size;
  const totalOps = movs.length;
  const mesesActivos = new Set(movs.map((m) => m.FECHA_STR.slice(0, 7))).size;

  return (
    <div className="relative card-elevated p-10 md:p-12 mb-6 overflow-hidden bg-gradient-to-br from-emerald-50/40 via-white to-cyan-50/40">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
            Huella operativa
          </p>
        </div>
        <h3 className="text-3xl md:text-4xl font-semibold tracking-tightest mb-2">
          Lo que se ha construido.
        </h3>
        <p className="text-ink-secondary mb-10 max-w-2xl">
          Más allá del capital invertido: una organización en operación con proveedores, proyectos
          y procesos auditables.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MegaStat
            value={`${totalProyectos}`}
            label="Proyectos activos"
            sub="2 en construcción · 5 en pipeline"
            color="emerald"
          />
          <MegaStat
            value={`${totalProv}`}
            label="Proveedores únicos"
            sub="Pagados vía OC formales"
            color="cyan"
          />
          <MegaStat
            value={`${totalOps.toLocaleString("es-CL")}`}
            label="Transacciones bancarias"
            sub="Todas trazables y auditables"
            color="violet"
          />
          <MegaStat value={`${mesesActivos}`} label="Meses de operación" sub="Desde sept 2024" color="emerald" />
        </div>
      </div>
    </div>
  );
}

function MegaStat({
  value,
  label,
  sub,
  color,
}: {
  value: string;
  label: string;
  sub: string;
  color: "emerald" | "cyan" | "violet";
}) {
  const colorMap = {
    emerald: "from-emerald-500 to-emerald-700",
    cyan: "from-cyan-500 to-cyan-700",
    violet: "from-violet-500 to-violet-700",
  };
  return (
    <div className="animate-scale-in">
      <p
        className={`text-5xl md:text-6xl font-semibold tracking-tightest tabular-nums bg-gradient-to-br ${colorMap[color]} bg-clip-text text-transparent leading-none`}
      >
        {value}
      </p>
      <p className="text-sm font-medium text-ink-primary mt-3">{label}</p>
      <p className="text-xs text-ink-tertiary mt-0.5">{sub}</p>
    </div>
  );
}
