"use client";

import { useMemo } from "react";
import {
  fmtCLP,
  fmtMM,
  TOTAL_APORTE_FIP_CLP,
  analizarCuotasAdenda,
  ADENDA_N2_METADATA,
} from "@/lib/data";
import {
  headlineKPIs,
  mesesAgregados,
  inversionPorProyecto,
  ocSummary,
  velocityChange,
  getESGSnapshot,
  saldosPorCuenta,
  listarDevoluciones,
} from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import AnimatedNumber from "./ui/AnimatedNumber";
import Sparkline from "./ui/Sparkline";
import DevolucionesCard from "./ui/DevolucionesCard";
import NextCallsCountdown from "./ui/NextCallsCountdown";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  Cell,
} from "recharts";
import {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  FileText,
  Activity,
  Layers,
  Target,
  Gauge,
  CircleDot,
  Shield,
  Zap,
  Sparkles,
} from "lucide-react";

export default function BancaView() {
  const k = headlineKPIs();
  const meses = mesesAgregados();
  const cuotas = analizarCuotasAdenda();
  const inv = inversionPorProyecto();
  const oc = ocSummary();
  const vel = velocityChange();
  const esg = getESGSnapshot();

  // Cumulative net cashflow (J-Curve style)
  const jCurve = useMemo(() => {
    return meses.map((m) => ({
      mes: m.mes,
      aportado: m.acumAbono,
      ejecutado: m.acumEgreso,
      // Net = aportado - ejecutado (capital aún disponible en el FIP)
      neto: m.acumAbono - m.acumEgreso,
    }));
  }, [meses]);

  // NAV Waterfall stages
  const navWaterfall = useMemo(() => {
    const aportado = k.pagado;
    const ejec = k.ejecutado;
    const vencido = k.vencido;
    const saldoTeorico = aportado - ejec;
    return [
      { name: "Plan", value: k.planContractual, accumulated: k.planContractual, type: "start" },
      { name: "Aportado", value: aportado, accumulated: aportado, type: "deposit" },
      { name: "Ejecutado", value: -ejec, accumulated: saldoTeorico, type: "withdraw" },
      { name: "Saldo CC", value: 0, accumulated: k.saldoCC, type: "balance" },
      { name: "Vencido", value: vencido, accumulated: vencido, type: "pending" },
    ];
  }, [k]);

  // Concentration
  const totalInv = inv.reduce((a, b) => a + b.valor, 0);
  const top1Pct = totalInv > 0 ? (inv[0]?.valor / totalInv) * 100 : 0;
  const top3Pct = totalInv > 0 ? (inv.slice(0, 3).reduce((a, b) => a + b.valor, 0) / totalInv) * 100 : 0;

  return (
    <section className="py-12 md:py-20 relative overflow-hidden bg-[var(--bg-app)]">
      <div className="absolute inset-0 -z-10 dot-grid opacity-30" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Banca · Directorio · LPs"
          title="Vista institucional para presentar a inversionistas, directorio y bancos."
          subtitle="Reporte tipo ILPA Reporting Template v2.0 con J-Curve, NAV Waterfall, Capital Stack, Concentration y Performance Schedule auditable peso por peso."
          actions={
            <>
              <a
                href="/docs/Adenda_N2_RHO_FIP_CEHTA.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <FileText className="w-4 h-4" />
                Adenda N°2
              </a>
              <button onClick={() => window.print()} className="btn-primary">
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </>
          }
        />

        {/* === KPI ROW ILPA (8 tiles) === */}
        <KpiRowILPA k={k} oc={oc} vel={vel} meses={meses} />

        {/* === ROW 1 — J-Curve + NAV Waterfall === */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-6 mt-8">
          <JCurveChart data={jCurve} planLimit={k.planContractual} />
          <NavWaterfall data={navWaterfall} k={k} />
        </div>

        {/* === NEXT CALLS COUNTDOWN === */}
        <div className="mb-6">
          <NextCallsCountdown limit={3} />
        </div>

        {/* === ROW 2 — Capital Stack + Concentration === */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mb-6">
          <CapitalStack k={k} />
          <ConcentrationGauge top1={top1Pct} top3={top3Pct} top1Name={inv[0]?.nombre || "—"} />
        </div>

        {/* === SALDOS POR CUENTA === */}
        <SaldosCuentasRow />

        {/* === DEVOLUCIONES === */}
        {listarDevoluciones().length > 0 && (
          <div className="mb-6">
            <DevolucionesCard />
          </div>
        )}

        {/* === ROW 3 — Performance Schedule === */}
        <div className="mb-6">
          <PerformanceSchedule k={k} oc={oc} esg={esg} />
        </div>

        {/* === ROW 4 — Cuotas timeline === */}
        <CuotasTimelineInstitucional cuotas={cuotas} />

        {/* === Footer institutional === */}
        <FooterCallout />
      </div>
    </section>
  );
}

// ============================================================================
// KPI ROW ILPA
// ============================================================================

function KpiRowILPA({
  k,
  oc,
  vel,
  meses,
}: {
  k: ReturnType<typeof headlineKPIs>;
  oc: ReturnType<typeof ocSummary>;
  vel: ReturnType<typeof velocityChange>;
  meses: ReturnType<typeof mesesAgregados>;
}) {
  const abonoSeries = meses.map((m) => m.acumAbono);
  const ejecSeries = meses.map((m) => m.acumEgreso);
  const saldoSeries = meses.map((m) => m.saldoFinal);
  const txSeries = meses.map((m) => m.numTx);

  // TVPI proxy: (ejecutado + saldoCC) / pagado — interpretable como "valor recuperable" / "lo aportado"
  const tvpi = k.pagado > 0 ? (k.ejecutado + k.saldoCC) / k.pagado : 0;
  const dpi = 0; // No hay distribuciones en este momento
  const rvpi = k.pagado > 0 ? (k.ejecutado + k.saldoCC) / k.pagado : 0;

  return (
    <div className="card-elevated overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
        <BigInstTile
          label="Plan"
          value={k.planContractual}
          format={fmtMM}
          sub={`${ADENDA_N2_METADATA.accionesTotales.toLocaleString("es-CL")} acciones`}
        />
        <BigInstTile
          label="Paid-in"
          value={k.pagado}
          format={fmtMM}
          sub={`${k.pctPagado.toFixed(1)}% del plan`}
          tone="positive"
          series={abonoSeries}
          seriesColor="var(--positive)"
        />
        <BigInstTile
          label="Ejecutado"
          value={k.ejecutado}
          format={fmtMM}
          sub={`${k.pctEjecutado.toFixed(0)}% del aportado`}
          series={ejecSeries}
          seriesColor="var(--brand-dark)"
          delta={vel.delta}
          deltaLabel="MoM"
        />
        <BigInstTile
          label="Saldo CC"
          value={k.saldoCC}
          format={fmtMM}
          sub="Liquidez ST+BICE"
          series={saldoSeries}
          seriesColor="var(--acc-cyan)"
        />
        <BigInstTile
          label="Vencido"
          value={k.vencido}
          format={fmtMM}
          sub={`${k.cuotasVencidas} cuotas`}
          tone={k.cuotasVencidas > 0 ? "negative" : "default"}
        />
        <BigInstTile
          label="TVPI proxy"
          value={tvpi}
          format={(n) => `${n.toFixed(2)}x`}
          sub="(Ejec+Saldo)/Paid-in"
          tone={tvpi >= 0.95 ? "positive" : "default"}
        />
        <BigInstTile
          label="DPI"
          value={dpi}
          format={(n) => `${n.toFixed(2)}x`}
          sub="Pre-COD"
        />
        <BigInstTile
          label="OC pagadas"
          value={oc.pctPagado}
          format={(n) => `${n.toFixed(1)}%`}
          sub={`${oc.ocPagadas} / ${oc.total} OC`}
        />
      </div>
    </div>
  );
}

function BigInstTile({
  label,
  value,
  format,
  sub,
  tone = "default",
  series,
  seriesColor,
  delta,
  deltaLabel,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  sub?: string;
  tone?: "default" | "positive" | "negative";
  series?: number[];
  seriesColor?: string;
  delta?: number;
  deltaLabel?: string;
}) {
  const colorMap = {
    default: "text-[var(--text-primary)]",
    positive: "text-[var(--positive)]",
    negative: "text-[var(--negative)]",
  };
  return (
    <div className="p-4 md:p-5 flex flex-col gap-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] transition-colors">
      <div className="flex items-center justify-between gap-1.5 min-h-[14px]">
        <span className="text-[10px] uppercase tracking-[0.06em] font-semibold text-[var(--text-tertiary)] leading-tight">
          {label}
        </span>
        {series && series.length > 1 && (
          <Sparkline
            data={series}
            stroke={seriesColor || "var(--text-tertiary)"}
            width={38}
            height={14}
            strokeWidth={1.5}
            showDot={false}
          />
        )}
      </div>
      <AnimatedNumber
        value={value}
        format={format}
        className={`mono-num text-xl md:text-2xl font-semibold whitespace-nowrap ${colorMap[tone]}`}
      />
      <div className="flex items-center gap-1.5">
        {sub && <span className="text-[11px] text-[var(--text-tertiary)]">{sub}</span>}
        {delta != null && Number.isFinite(delta) && Math.abs(delta) > 0.1 && (
          <span className={delta >= 0 ? "badge-delta-up" : "badge-delta-down"}>
            {delta >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {Math.abs(delta).toFixed(1)}% {deltaLabel || ""}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// J-CURVE — Capital cumulativo aportado vs ejecutado (estilo Blackstone)
// ============================================================================

function JCurveChart({ data, planLimit }: { data: any[]; planLimit: number }) {
  if (data.length === 0)
    return (
      <div className="card-elevated p-6">
        <p className="text-sm text-[var(--text-tertiary)]">Sin datos</p>
      </div>
    );

  // Find break-even (where neto crosses 0 or significant deployment)
  const breakEvenIdx = data.findIndex((d, i) => i > 0 && d.ejecutado >= d.aportado * 0.5);
  const breakEven = breakEvenIdx >= 0 ? data[breakEvenIdx] : null;

  return (
    <div className="card-elevated p-6 md:p-7 relative">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-emerald-700">
              Cumulative cash deployment
            </p>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
            J-Curve · aportes vs. ejecución
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-1 max-w-xl">
            Capital cumulado del FIP CEHTA vs. capital efectivamente desplegado en proyectos. El gap
            entre líneas es la liquidez disponible para invertir.
          </p>
        </div>
        <span className="hidden md:flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] mono-num">
          inception · {data[0]?.mes} → corte · {data[data.length - 1]?.mes}
        </span>
      </div>

      <div className="mt-5">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="jcAp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--positive)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--positive)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="jcEj" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--acc-cyan)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--acc-cyan)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
              tickFormatter={(v) => fmtCLP(v, { compact: true })}
            />
            <Tooltip
              cursor={{ stroke: "var(--border-strong)", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={<RichTooltip />}
            />
            <ReferenceLine
              y={planLimit}
              stroke="var(--text-quaternary)"
              strokeDasharray="6 6"
              strokeWidth={1.5}
              label={{
                value: `Plan ${fmtCLP(planLimit, { compact: true })}`,
                position: "right",
                fill: "var(--text-tertiary)",
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="aportado"
              name="Aportado"
              stroke="var(--positive)"
              strokeWidth={2.5}
              fill="url(#jcAp)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="ejecutado"
              name="Ejecutado"
              stroke="var(--acc-cyan)"
              strokeWidth={2.5}
              fill="url(#jcEj)"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="neto"
              name="Liquidez (Apor−Ejec)"
              stroke="var(--brand-dark)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            {breakEven && (
              <ReferenceDot
                x={breakEven.mes}
                y={breakEven.ejecutado}
                r={6}
                fill="var(--acc-violet)"
                stroke="white"
                strokeWidth={2}
                label={{
                  value: "50% deployment",
                  position: "top",
                  fill: "var(--acc-violet)",
                  fontSize: 10,
                  fontWeight: 600,
                  offset: 12,
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-xs">
        <LegendInst color="var(--positive)" label="Aportado cumulado" />
        <LegendInst color="var(--acc-cyan)" label="Ejecutado cumulado" />
        <LegendInst color="var(--brand-dark)" label="Liquidez disponible" dashed />
        <LegendInst color="var(--text-quaternary)" label="Plan contractual" dashed />
      </div>
    </div>
  );
}

// ============================================================================
// NAV WATERFALL
// ============================================================================

function NavWaterfall({ data, k }: { data: any[]; k: ReturnType<typeof headlineKPIs> }) {
  // Construct visual: plan -> aportado -> -ejecutado -> saldo CC
  const items = [
    { label: "Plan contractual", value: k.planContractual, type: "start" },
    { label: "+ Aportado al banco", value: k.pagado, type: "deposit" },
    { label: "− Ejecutado", value: -k.ejecutado, type: "withdraw" },
    { label: "= Saldo CC", value: k.saldoCC, type: "end" },
    { label: "Vencido pendiente", value: k.vencido, type: "pending" },
  ];

  // Build positions for visual bars
  const maxAbs = Math.max(
    k.planContractual,
    k.pagado,
    k.ejecutado,
    k.saldoCC + k.ejecutado, // total height for ref
    k.vencido
  );

  return (
    <div className="card-elevated p-6 md:p-7">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-violet-700">
          Capital bridge
        </p>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight">NAV waterfall</h3>
      <p className="text-sm text-[var(--text-tertiary)] mt-1">
        Camino del capital desde el plan hasta el saldo actual.
      </p>

      <div className="space-y-3 mt-6">
        {items.map((it, i) => {
          const pct = (Math.abs(it.value) / maxAbs) * 100;
          const tone =
            it.type === "deposit"
              ? { color: "var(--positive)", bg: "var(--positive-bg)", sign: "+" }
              : it.type === "withdraw"
              ? { color: "var(--negative)", bg: "var(--negative-bg)", sign: "" }
              : it.type === "pending"
              ? { color: "var(--warning)", bg: "var(--warning-bg)", sign: "!" }
              : it.type === "end"
              ? { color: "var(--acc-cyan)", bg: "rgba(6,182,212,0.12)", sign: "=" }
              : { color: "var(--text-secondary)", bg: "var(--bg-tertiary)", sign: "" };
          return (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-baseline justify-between mb-1.5 text-sm">
                <span className="font-medium text-[var(--text-primary)]">{it.label}</span>
                <span className="mono-num font-semibold tabular-nums" style={{ color: tone.color }}>
                  {tone.sign} {fmtCLP(Math.abs(it.value), { compact: true })}
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${tone.color}, ${tone.color}cc)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="mt-6 pt-5 border-t border-[var(--border)] text-xs grid grid-cols-3 gap-2">
        <div>
          <p className="text-[var(--text-tertiary)] uppercase tracking-wider">Plan</p>
          <p className="mono-num text-base font-semibold">{fmtCLP(k.planContractual, { compact: true })}</p>
        </div>
        <div>
          <p className="text-[var(--text-tertiary)] uppercase tracking-wider">Available</p>
          <p className="mono-num text-base font-semibold text-[var(--positive)]">
            {fmtCLP(k.pagado - k.ejecutado, { compact: true })}
          </p>
        </div>
        <div>
          <p className="text-[var(--text-tertiary)] uppercase tracking-wider">Gap</p>
          <p className="mono-num text-base font-semibold text-[var(--warning)]">
            {fmtCLP(k.planContractual - k.pagado, { compact: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CAPITAL STACK — stacked bar horizontal segmentada
// ============================================================================

function CapitalStack({ k }: { k: ReturnType<typeof headlineKPIs> }) {
  const totalCommitted = k.planContractual;
  const calledInvested = k.ejecutado; // called & invested
  const calledReserved = Math.max(0, k.pagado - k.ejecutado); // called & in CC
  const overdue = k.vencido;
  const unfunded = Math.max(0, totalCommitted - k.pagado - overdue);

  const segments = [
    {
      label: "Invertido en proyectos",
      sub: "Called & invested",
      value: calledInvested,
      pct: (calledInvested / totalCommitted) * 100,
      color: "var(--brand-dark)",
    },
    {
      label: "Reservado en CC",
      sub: "Called & reserved",
      value: calledReserved,
      pct: (calledReserved / totalCommitted) * 100,
      color: "var(--brand-mid)",
    },
    {
      label: "Vencido sin pagar",
      sub: "Overdue",
      value: overdue,
      pct: (overdue / totalCommitted) * 100,
      color: "var(--negative)",
    },
    {
      label: "Plan futuro",
      sub: "Unfunded",
      value: unfunded,
      pct: (unfunded / totalCommitted) * 100,
      color: "var(--bg-tertiary)",
    },
  ];

  return (
    <div className="card-elevated p-6 md:p-7">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white">
          <Target className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-emerald-700">
          Capital stack
        </p>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Composición del compromiso</h3>
      <p className="text-sm text-[var(--text-tertiary)] mt-1">
        Cómo se descompone el plan contractual: invertido, reservado, vencido, no llamado.
      </p>

      {/* Stacked horizontal bar */}
      <div className="mt-6">
        <div className="flex h-10 rounded-lg overflow-hidden shadow-sm">
          {segments.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-[11px] font-medium text-white transition-all hover:brightness-110 group relative"
              style={{
                width: `${s.pct}%`,
                background: s.color,
                color: s.color === "var(--bg-tertiary)" ? "var(--text-secondary)" : "white",
              }}
              title={`${s.label}: ${fmtCLP(s.value)} (${s.pct.toFixed(1)}%)`}
            >
              {s.pct > 12 ? `${s.pct.toFixed(0)}%` : ""}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {segments.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className="w-3 h-3 rounded-md mt-1 shrink-0"
                style={{ background: s.color }}
              />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium leading-tight">
                  {s.label}
                </p>
                <p className="mono-num text-base font-semibold mt-0.5">
                  {fmtCLP(s.value, { compact: true })}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mono-num">
                  {s.pct.toFixed(1)}% · {s.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONCENTRATION GAUGE — % NAV en top-1, top-3
// ============================================================================

function ConcentrationGauge({
  top1,
  top3,
  top1Name,
}: {
  top1: number;
  top3: number;
  top1Name: string;
}) {
  // Build SVG gauge for top-1 concentration
  const size = 220;
  const cx = size / 2;
  const cy = size / 2 + 12;
  const r = 80;
  const sw = 14;
  const start = -180;
  const end = 0;
  const value1 = Math.min(100, top1);
  const value3 = Math.min(100, top3);

  const polar = (a: number, rad: number) => ({
    x: cx + rad * Math.cos((a * Math.PI) / 180),
    y: cy + rad * Math.sin((a * Math.PI) / 180),
  });
  const arcPath = (a1: number, a2: number) => {
    const s = polar(a1, r);
    const e = polar(a2, r);
    const largeArc = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  return (
    <div className="card-elevated p-6 md:p-7">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
          <Gauge className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-amber-700">
          Riesgo de concentración
        </p>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Top-1 / Top-3 portfolio</h3>
      <p className="text-sm text-[var(--text-tertiary)] mt-1">
        Concentración del capital ejecutado por proyecto.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 mt-5 items-center">
        <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
          <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
            <path d={arcPath(start, end)} stroke="var(--bg-tertiary)" strokeWidth={sw} fill="none" strokeLinecap="round" />
            <path
              d={arcPath(start, start + (value3 / 100) * 180)}
              stroke="var(--acc-amber)"
              strokeWidth={sw}
              fill="none"
              strokeLinecap="round"
              opacity={0.35}
            />
            <path
              d={arcPath(start, start + (value1 / 100) * 180)}
              stroke="var(--acc-amber)"
              strokeWidth={sw}
              fill="none"
              strokeLinecap="round"
            />
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              fontSize="32"
              fontWeight={600}
              fill="var(--text-primary)"
              className="mono-num"
            >
              {top1.toFixed(0)}%
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-tertiary)"
              letterSpacing="0.08em"
            >
              TOP-1 SHARE
            </text>
          </svg>
        </div>
        <div className="space-y-3">
          <ConcentrationRow label="Top-1" pct={top1} sub={top1Name} />
          <ConcentrationRow label="Top-3 acumulado" pct={top3} sub="Concentración explicada" muted />
          <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--text-tertiary)] leading-snug">
            {top1 > 50 ? (
              <span className="text-[var(--warning)]">⚠ Concentración elevada en top-1. Esperado en etapa early.</span>
            ) : (
              <span className="text-[var(--positive)]">✓ Concentración dentro de rangos esperados.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConcentrationRow({
  label,
  pct,
  sub,
  muted,
}: {
  label: string;
  pct: number;
  sub: string;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="mono-num font-semibold">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mt-1.5">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(100, pct)}%`,
            background: muted ? "var(--acc-amber)" : "var(--negative)",
            opacity: muted ? 0.6 : 1,
          }}
        />
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{sub}</p>
    </div>
  );
}

// ============================================================================
// PERFORMANCE SCHEDULE — tabular institucional
// ============================================================================

function PerformanceSchedule({
  k,
  oc,
  esg,
}: {
  k: ReturnType<typeof headlineKPIs>;
  oc: ReturnType<typeof ocSummary>;
  esg: ReturnType<typeof getESGSnapshot>;
}) {
  const rows = [
    {
      cat: "Capital",
      metric: "Total commitment",
      value: fmtCLP(k.planContractual),
      pct: "100.00%",
      framework: "Adenda N°2",
    },
    {
      cat: "Capital",
      metric: "Paid-in capital",
      value: fmtCLP(k.pagado),
      pct: `${k.pctPagado.toFixed(2)}%`,
      framework: "Banco Santander",
    },
    {
      cat: "Capital",
      metric: "Unfunded commitment",
      value: fmtCLP(k.planContractual - k.pagado),
      pct: `${(100 - k.pctPagado).toFixed(2)}%`,
      framework: "—",
    },
    {
      cat: "Capital",
      metric: "Overdue commitment",
      value: fmtCLP(k.vencido),
      pct: `${((k.vencido / k.planContractual) * 100).toFixed(2)}%`,
      framework: "Renegociación pendiente",
      tone: k.cuotasVencidas > 0 ? "warn" : undefined,
    },
    {
      cat: "Deployment",
      metric: "Capital deployed",
      value: fmtCLP(k.ejecutado),
      pct: `${k.pctEjecutado.toFixed(2)}%`,
      framework: "Egresos operativos",
    },
    {
      cat: "Deployment",
      metric: "Cash on hand (CC Santander)",
      value: fmtCLP(k.saldoCC),
      pct: "—",
      framework: "Liquidez operativa",
    },
    {
      cat: "Deployment",
      metric: "Velocidad mensual (último mes)",
      value: fmtCLP((velocityChange().last) || 0),
      pct: `${velocityChange().delta.toFixed(1)}% MoM`,
      framework: "Run-rate operativo",
    },
    {
      cat: "Suppliers",
      metric: "OC comprometidas",
      value: fmtCLP(oc.comprometido),
      pct: "—",
      framework: `${oc.total} OC · ${oc.proveedoresUnicos} proveedores`,
    },
    {
      cat: "Suppliers",
      metric: "OC pagadas",
      value: fmtCLP(oc.pagado),
      pct: `${oc.pctPagado.toFixed(2)}%`,
      framework: `${oc.ocPagadas} / ${oc.total} OC`,
    },
    {
      cat: "Portfolio",
      metric: "Capacidad portafolio",
      value: `${esg.mwTotal} MW`,
      pct: `${esg.pvMW} MW PV + ${esg.bessMW} MW BESS`,
      framework: "Portafolio activo + pipeline",
    },
    {
      cat: "Portfolio",
      metric: "Almacenamiento BESS",
      value: `${esg.mwhBESS} MWh`,
      pct: "—",
      framework: "Panimávida + La Ligua",
    },
    {
      cat: "Impact",
      metric: "Generación renovable estimada (anual)",
      value: `${(esg.generacionAnualMWh / 1000).toFixed(0)} GWh`,
      pct: "—",
      framework: "IRIS+ PI5842 · cap factor 27%",
    },
    {
      cat: "Impact",
      metric: "CO₂ evitado estimado (anual)",
      value: `${(esg.co2EvitadoTonAnual / 1000).toFixed(1)}k tCO₂e`,
      pct: "—",
      framework: "IRIS+ PI2764 · grid CL 0.39 t/MWh",
    },
  ];

  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-6 md:p-7 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-[var(--text-secondary)]">
            Performance schedule · ILPA-style
          </p>
        </div>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
          Métricas auditables para due diligence
        </h3>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Tabla institucional con todas las métricas críticas. Cada fila incluye su categoría, valor,
          porcentaje y fuente / framework.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-[10px] uppercase tracking-wider">Cat.</th>
              <th className="px-5 py-3 text-left font-medium text-[10px] uppercase tracking-wider">Métrica</th>
              <th className="px-5 py-3 text-right font-medium text-[10px] uppercase tracking-wider">Valor</th>
              <th className="px-5 py-3 text-right font-medium text-[10px] uppercase tracking-wider">% / Detalle</th>
              <th className="px-5 py-3 text-left font-medium text-[10px] uppercase tracking-wider">Framework / Fuente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="px-5 py-3">
                  <span className="pill pill-neutral text-[10px]">{r.cat}</span>
                </td>
                <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{r.metric}</td>
                <td className="px-5 py-3 text-right mono-num tabular-nums font-semibold">
                  {r.value}
                </td>
                <td
                  className={`px-5 py-3 text-right mono-num tabular-nums ${
                    r.tone === "warn" ? "text-[var(--warning)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {r.pct}
                </td>
                <td className="px-5 py-3 text-xs text-[var(--text-tertiary)]">{r.framework}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// CUOTAS TIMELINE INSTITUCIONAL
// ============================================================================

function CuotasTimelineInstitucional({
  cuotas,
}: {
  cuotas: ReturnType<typeof analizarCuotasAdenda>;
}) {
  return (
    <div className="card-elevated p-6 md:p-7 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white">
          <CircleDot className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-cyan-700">
          Cronograma de aportes · Adenda N°2
        </p>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
        6 cuotas. Estado actual cuota por cuota.
      </h3>
      <p className="text-sm text-[var(--text-tertiary)] mt-1">
        Plan contractual desglosado con pagos efectivos al banco.
      </p>

      <div className="grid grid-cols-6 gap-3 mt-6">
        {cuotas.map((c, i) => {
          const color =
            c.estado === "Pagada"
              ? "var(--positive)"
              : c.estado === "Pagada parcial"
              ? "var(--warning)"
              : c.estado === "Vencida"
              ? "var(--negative)"
              : "var(--text-tertiary)";
          const pctClamped = Math.min(100, c.pctPago);
          return (
            <div
              key={c.id}
              className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--bg-subtle)] animate-fade-in flex flex-col gap-1.5"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-medium">
                <span style={{ color }}>{c.letra}</span>
                <span className="text-[var(--text-tertiary)]">{c.plazo}</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">{c.label}</p>
              <p className="mono-num text-base font-semibold mt-1">
                {fmtCLP(c.monto, { compact: true })}
              </p>
              <div className="h-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${pctClamped}%`, background: color }}
                />
              </div>
              <span
                className="text-[9px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-md self-start mt-1"
                style={{ background: `${color}1f`, color }}
              >
                {c.estado}
              </span>
              {c.pagado > 0 && (
                <p className="text-[10px] mono-num text-[var(--text-tertiary)]">
                  pagado {fmtCLP(c.pagado, { compact: true })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// FOOTER CALLOUT
// ============================================================================

function FooterCallout() {
  return (
    <div className="card p-6 md:p-7 mt-6 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-subtle)]">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[var(--brand-mid)] mt-0.5" />
        <div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Reporte institucional.</strong>{" "}
            Datos derivados directamente del extracto bancario Santander y el set de OC emitidas.
            Métricas TVPI/DPI tratadas como proxy pre-COD (no hay distribuciones aún).
            Para due diligence formal, consultar la Adenda N°2 firmada el 27 oct 2025 ante notario y los
            EE.FF. auditados por MCG.
          </p>
          <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-[var(--text-tertiary)] mono-num">
            <span>ILPA Reporting Template v2.0</span>
            <span>·</span>
            <span>IRIS+ v5.3</span>
            <span>·</span>
            <span>CMF NCG 532</span>
            <span>·</span>
            <span>OPIM Principles</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SHARED — Rich tooltip + legend chip
// ============================================================================

function RichTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-[var(--border)] shadow-elev p-3.5 min-w-[180px]"
      style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
    >
      <p className="text-[10px] uppercase tracking-wider font-medium text-[var(--text-tertiary)] mb-2">
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 mb-1 last:mb-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: p.color || p.stroke || p.fill }}
            />
            <span className="text-xs">{p.name}</span>
          </div>
          <span className="text-sm mono-num font-semibold tabular-nums">
            {typeof p.value === "number" ? fmtCLP(p.value, { compact: true }) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SALDOS POR CUENTA — Santander + BICE
// ============================================================================
function SaldosCuentasRow() {
  const saldos = saldosPorCuenta();
  if (saldos.length === 0) return null;
  const total = saldos.reduce((a, s) => a + s.saldoActual, 0);
  return (
    <div className="card-elevated p-6 md:p-7 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
          <span className="text-[10px] font-bold">$</span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-cyan-700">
          Liquidez operativa · cuentas corrientes
        </p>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-ink-primary">
        Saldo combinado: {fmtCLP(total, { compact: true })}
      </h3>
      <p className="text-sm text-ink-tertiary mt-1">
        Distribución del cash disponible en cuentas bancarias activas del FIP.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {saldos.map((s) => {
          const pct = total > 0 ? (s.saldoActual / total) * 100 : 0;
          return (
            <div
              key={s.cuenta}
              className="rounded-2xl border border-ink-quaternary/40 p-5 bg-surface-secondary/40"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium">
                  Banco {s.cuenta}
                </span>
                <span className="text-[10px] mono-num text-ink-secondary">{s.movimientos} mov.</span>
              </div>
              <p className="mono-num text-2xl font-semibold text-ink-primary">
                {fmtCLP(s.saldoActual, { compact: true })}
              </p>
              <p className="text-xs text-ink-tertiary mt-0.5">{pct.toFixed(1)}% del saldo total</p>
              <div className="h-1 bg-surface-tertiary rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    background:
                      s.cuenta === "Santander"
                        ? "linear-gradient(90deg, #d52b1e, #8b1816)"
                        : "linear-gradient(90deg, #003c71, #001f3f)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LegendInst({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
      <span
        className="inline-block"
        style={{
          width: 16,
          height: 2.5,
          background: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)`
            : color,
          borderRadius: 2,
        }}
      />
      {label}
    </span>
  );
}
