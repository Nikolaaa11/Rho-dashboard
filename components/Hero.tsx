"use client";

import {
  fmtMM,
  fmtCLP,
  TOTAL_APORTE_FIP_CLP,
  analizarCuotasAdenda,
} from "@/lib/data";
import {
  headlineKPIs,
  mesesAgregados,
  getESGSnapshot,
  velocityChange,
  saldosPorCuenta,
} from "@/lib/derived";
import Image from "next/image";
import {
  Zap,
  Building2,
  Calendar,
  AlertCircle,
  TrendingUp,
  Wallet,
  CheckCircle2,
  PiggyBank,
} from "lucide-react";
import AnimatedNumber from "./ui/AnimatedNumber";
import Sparkline from "./ui/Sparkline";

export default function Hero() {
  const k = headlineKPIs();
  const cuotas = analizarCuotasAdenda();
  const esg = getESGSnapshot();
  const meses = mesesAgregados();
  const vel = velocityChange();
  const saldos = saldosPorCuenta();
  const saldoTotal = saldos.reduce((a, s) => a + s.saldoActual, 0);

  const abonoSeries = meses.map((m) => m.acumAbono);
  const egresoSeries = meses.map((m) => m.acumEgreso);
  const saldoSeries = meses.map((m) => m.saldoFinal);

  const fechaCorte = new Date(k.fechaCorte + "T12:00:00").toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative pt-12 md:pt-20 pb-10 overflow-hidden">
      {/* Background — soft brand glow + dot grid */}
      <div className="absolute inset-0 -z-10 dot-grid opacity-40" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/4 w-[760px] h-[760px] bg-rho-light/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-1/4 w-[540px] h-[540px] bg-emerald-200/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Top brand row */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-12 animate-fade-in">
          <div className="mb-6">
            <Image
              src="/logos/rho-full.png"
              alt="Rho Generación"
              width={200}
              height={120}
              priority
              className="w-32 md:w-40 h-auto"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-rho-medium/30 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rho-medium animate-pulse-soft" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rho-dark">
              Reporte para inversionistas · datos al {fechaCorte}
            </span>
          </div>
          <h1 className="h-display max-w-4xl">
            Energía renovable en Chile,
            <br className="hidden md:block" />
            <span className="brand-gradient">con capital trazable.</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-ink-secondary max-w-3xl leading-snug">
            Independent Power Producer chileno especializado en agrivoltaica y almacenamiento (BESS).
            Reporte ejecutivo del FIP CEHTA: capital ejecutado, avance del portafolio y cronograma
            contractual de pagos — auditable peso por peso.
          </p>
        </div>

        {/* === HEADLINE KPI STRIPE — 5 tarjetas grandes con sparkline === */}
        <div className="card-elevated overflow-hidden mb-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-ink-quaternary/40">
            <BigKpi
              label="Plan contractual"
              value={k.planContractual}
              format={(n) => fmtMM(n)}
              sub="Adenda N°2 · 5.665 acciones"
              icon={<Wallet className="w-4 h-4" />}
              tone="default"
            />
            <BigKpi
              label="Pagado al banco"
              value={k.pagado}
              format={(n) => fmtMM(n)}
              sub={`${k.cuotasPagadas}/${k.cuotasTotal} cuotas · ${k.pctPagado.toFixed(1)}%`}
              icon={<CheckCircle2 className="w-4 h-4" />}
              tone="accent"
              series={abonoSeries}
              seriesColor="#3C8B3C"
            />
            <BigKpi
              label="Capital ejecutado"
              value={k.ejecutado}
              format={(n) => fmtMM(n)}
              sub={`${k.pctEjecutado.toFixed(0)}% del aportado · ${k.diasUltimo}d sin gasto`}
              icon={<TrendingUp className="w-4 h-4" />}
              tone="default"
              series={egresoSeries}
              seriesColor="#1A4A1A"
              delta={vel.delta}
              deltaLabel="MoM"
            />
            <BigKpi
              label="Liquidez disponible"
              value={saldoTotal}
              format={(n) => fmtMM(n)}
              sub={saldos.map((s) => `CC ${s.cuenta} ${fmtCLP(s.saldoActual, { compact: true })}`).join(" + ")}
              icon={<PiggyBank className="w-4 h-4" />}
              tone="accent"
              series={saldoSeries}
              seriesColor="#06b6d4"
            />
            <BigKpi
              label="Vencido sin pagar"
              value={k.vencido}
              format={(n) => fmtMM(n)}
              sub={
                k.cuotasVencidas === 0
                  ? "Sin cuotas vencidas"
                  : `${k.cuotasVencidas} ${k.cuotasVencidas === 1 ? "cuota" : "cuotas"} con plazo cumplido`
              }
              icon={<AlertCircle className="w-4 h-4" />}
              tone={k.cuotasVencidas > 0 ? "danger" : "default"}
            />
          </div>

          {/* Progress strip — plan vs pagado vs ejecutado */}
          <div className="bg-surface-secondary border-t border-ink-quaternary/40 px-6 md:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-secondary">
                Avance contractual del plan de capital
              </p>
              <p className="text-xs text-ink-tertiary tabular-nums">
                {fmtCLP(k.pagado, { compact: true })} pagado · {fmtCLP(k.ejecutado, { compact: true })} ejecutado · meta {fmtCLP(k.planContractual, { compact: true })}
              </p>
            </div>
            <PlanProgressBar
              plan={k.planContractual}
              pagado={k.pagado}
              ejecutado={k.ejecutado}
              vencido={k.vencido}
            />
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-[11px]">
              <LegendDot color="#1A4A1A" label="Ejecutado en proyectos" />
              <LegendDot color="#3C8B3C" label="Aportado pendiente de ejecutar" />
              <LegendDot color="#fca5a5" label="Vencido sin pagar" />
              <LegendDot color="#E5E5EA" label="Plan futuro" />
            </div>
          </div>
        </div>

        {/* === PORTAFOLIO FÍSICO === */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up"
          style={{ animationDelay: "0.08s" }}
        >
          <PortfolioStat
            icon={<Building2 className="w-5 h-5" />}
            value={`${esg.proyectosActivos}`}
            label="Proyectos activos"
            sub={`+${esg.proyectosPipeline} en pipeline`}
          />
          <PortfolioStat
            icon={<Zap className="w-5 h-5" />}
            value={`${esg.mwTotal} MW`}
            label="Capacidad portafolio"
            sub={`${esg.pvMW} MW PV + ${esg.bessMW} MW BESS`}
          />
          <PortfolioStat
            icon={<Zap className="w-5 h-5" />}
            value={`${esg.mwhBESS} MWh`}
            label="Almacenamiento BESS"
            sub="Panimávida + La Ligua"
          />
          <PortfolioStat
            icon={<Calendar className="w-5 h-5" />}
            value="2027"
            label="Primer COD esperado"
            sub="Panimávida Q1 · La Ligua Q4"
          />
        </div>
      </div>
    </section>
  );
}

function BigKpi({
  label,
  value,
  format,
  sub,
  tone,
  icon,
  series,
  seriesColor,
  delta,
  deltaLabel,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  sub?: string;
  tone?: "default" | "accent" | "danger";
  icon?: React.ReactNode;
  series?: number[];
  seriesColor?: string;
  delta?: number;
  deltaLabel?: string;
}) {
  const toneCls =
    tone === "accent"
      ? "bg-rho-ultralight/30"
      : tone === "danger"
      ? "bg-red-50/40"
      : "bg-white";
  const valCls =
    tone === "accent" ? "text-rho-dark" : tone === "danger" ? "text-red-600" : "text-ink-primary";

  return (
    <div className={`p-6 md:p-7 flex flex-col gap-2 ${toneCls}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-ink-tertiary">
          {icon}
          <span className="text-[11px] uppercase tracking-[0.08em] font-medium">{label}</span>
        </div>
        {series && series.length > 2 && (
          <Sparkline
            data={series}
            stroke={seriesColor || "#86868B"}
            fill={seriesColor || "#86868B"}
            width={68}
            height={22}
          />
        )}
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <AnimatedNumber
          value={value}
          format={format}
          className={`text-3xl md:text-[2.1rem] font-semibold tabular-nums tracking-tightest whitespace-nowrap ${valCls}`}
        />
        {delta != null && Number.isFinite(delta) && Math.abs(delta) > 0.1 && (
          <span
            className={`text-[11px] font-medium tabular-nums px-1.5 py-0.5 rounded-md ${
              delta >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
            title={deltaLabel}
          >
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
      </div>
      {sub && <span className="text-xs text-ink-tertiary">{sub}</span>}
    </div>
  );
}

function PlanProgressBar({
  plan,
  pagado,
  ejecutado,
  vencido,
}: {
  plan: number;
  pagado: number;
  ejecutado: number;
  vencido: number;
}) {
  const ejecPct = (ejecutado / plan) * 100;
  const aportadoNoEjecutadoPct = Math.max(0, ((pagado - ejecutado) / plan) * 100);
  const vencidoPct = (vencido / plan) * 100;
  return (
    <div className="relative h-3.5 w-full bg-ink-quinary rounded-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full bg-rho-dark transition-all duration-1000"
        style={{ width: `${Math.min(100, ejecPct)}%` }}
      />
      <div
        className="absolute top-0 h-full bg-rho-medium transition-all duration-1000"
        style={{
          left: `${Math.min(100, ejecPct)}%`,
          width: `${Math.min(100 - ejecPct, aportadoNoEjecutadoPct)}%`,
        }}
      />
      <div
        className="absolute top-0 h-full bg-red-300 transition-all duration-1000"
        style={{
          left: `${Math.min(100, ejecPct + aportadoNoEjecutadoPct)}%`,
          width: `${Math.min(100 - ejecPct - aportadoNoEjecutadoPct, vencidoPct)}%`,
        }}
      />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-secondary">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function PortfolioStat({
  icon,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-2xl bg-rho-ultralight flex items-center justify-center text-rho-dark shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        <p className="text-xs text-ink-tertiary uppercase tracking-wide font-medium mt-0.5">{label}</p>
        <p className="text-xs text-ink-secondary mt-1 truncate">{sub}</p>
      </div>
    </div>
  );
}
