"use client";

import { useMemo } from "react";
import { fmtCLP, fmtMM } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import {
  AlertTriangle,
  Wallet,
  TrendingUp,
  Building2,
  Calendar,
  Zap,
  Users,
  Banknote,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Target,
  Clock,
  HandCoins,
  CircleDollarSign,
  Factory,
  Repeat,
  Network,
  FileText,
  HelpCircle,
} from "lucide-react";

// ============================================================================
// HARD DATA — provista por el usuario
// ============================================================================

const SITUACION_1 = {
  cajaActual: 67_000_000,
  deadlineCaja: "2026-07-30",
  responsable: "Victoria",
  ventanaMeses: 2,
};

const SITUACION_2 = {
  autorizado: 1_800_000_000,
  gastadoDesarrollo: 800_000_000,
  cuartaSolicitud: 430_000_000,
  panimavidaExtra: 135_000_000,
  // 1.800 - 800 - 430 - 135 = 435
  porSolicitar: 435_000_000,
  // (800 + 430 + 135) / 2 = 682.5
  devolucionInversionistas: (800_000_000 + 430_000_000 + 135_000_000) / 2,
  sueldosAnualUSD: 317_000_000,
};

const VENTAS = {
  sanExpeditoTarget: 2_500_000_000,
  sanExpeditoNetoEstimado: 2_000_000_000,
  panimavidaTIR: 10,
  panimavidaPayback: 6,
  quebradaTIR: 14,
  quebradaPayback: 6,
};

const PANIMAVIDA_PLAN = {
  inversionistasTarget: 750_000_000,
  corfoMatch: 750_000_000, // CORFO dobla
  bancoTarget: 1_500_000_000,
  totalNecesario: 3_000_000_000,
};

const SAN_EXPEDITO_FLUJO = {
  venta: 2_500_000_000,
  netoPostComision: 2_000_000_000,
  devolucionInversionistas: (800_000_000 + 430_000_000 + 135_000_000) / 2, // 682.5M
  sueldosUnAno: 317_000_000,
  disponibleRepartir: 1_000_000_000,
};

// ============================================================================
// VIEW
// ============================================================================

export default function EstrategiaView() {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Estrategia de capital · Mayo 2026"
          title="Dos situaciones, una decisión crítica."
          subtitle="Reporte para directorio e inversionistas sobre estado de caja, composición del capital autorizado y opciones estratégicas para construir Panimávida + cierre San Expedito + nuevos proyectos. Todos los montos en pesos chilenos."
        />

        {/* === HERO RESUMEN === */}
        <ResumenEjecutivo />

        {/* === SITUACIÓN 1 === */}
        <SituacionUno />

        {/* === SITUACIÓN 2 === */}
        <SituacionDos />

        {/* === ESTRATEGIA PANIMÁVIDA === */}
        <EstrategiaPanimavida />

        {/* === ESTRATEGIA SAN EXPEDITO === */}
        <EstrategiaSanExpedito />

        {/* === QUEBRADA ESCOBAR + OPORTUNIDADES === */}
        <NuevosProyectos />

        {/* === ESCENARIOS / DECISIÓN === */}
        <DecisionFinal />

        {/* === CLOSING === */}
        <ClosingNote />
      </div>
    </section>
  );
}

// ============================================================================
// RESUMEN EJECUTIVO
// ============================================================================
function ResumenEjecutivo() {
  return (
    <div className="card-elevated p-7 md:p-10 mb-10 relative overflow-hidden bg-gradient-to-br from-white via-white to-rho-ultralight/40">
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl" />
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 mb-4">
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">
              Para presentación en reunión
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tightest mb-4">
            ¿Sacamos los <span className="brand-gradient">$435M</span> restantes para Panimávida,
            o esperamos?
          </h2>
          <p className="text-base text-ink-secondary leading-relaxed max-w-2xl">
            Tenemos <strong>$67M en caja</strong> que dan vida hasta el 30 de julio (Situación 1, en
            manos de Victoria). Pero la pregunta de fondo es estratégica: con <strong>$435M
            restantes del capital autorizado</strong> de $1.800M, ¿los empujamos a Panimávida y
            asumimos el riesgo de quedarnos sin caja si San Expedito se atrasa? ¿O esperamos un
            inversionista + CORFO que duplique?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ResumenStat
            label="Caja hoy"
            value="$67M"
            sub="hasta 30 jul"
            color="#dc2626"
            Icon={Wallet}
          />
          <ResumenStat
            label="Por solicitar FIP"
            value="$435M"
            sub="lo que queda del 1.8B"
            color="#0891b2"
            Icon={CircleDollarSign}
          />
          <ResumenStat
            label="Necesario Panimávida"
            value="$3.000M"
            sub="costo construcción"
            color="#8b5cf6"
            Icon={Factory}
          />
          <ResumenStat
            label="Venta San Expedito"
            value="$2.500M"
            sub="target este año"
            color="#10b981"
            Icon={TrendingUp}
          />
        </div>
      </div>
    </div>
  );
}

function ResumenStat({
  label,
  value,
  sub,
  color,
  Icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-white/60 shadow-sm">
      <Icon className="w-4 h-4 mb-2" style={{ color }} />
      <p className="mono-num text-2xl font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
      <p className="text-[11px] text-ink-primary font-medium mt-0.5">{label}</p>
      <p className="text-[10px] text-ink-tertiary mt-0.5">{sub}</p>
    </div>
  );
}

// ============================================================================
// SITUACIÓN 1 — Cash runway
// ============================================================================

function SituacionUno() {
  const today = new Date();
  const deadline = new Date(SITUACION_1.deadlineCaja);
  const daysLeft = Math.max(0, Math.floor((deadline.getTime() - today.getTime()) / 86400000));
  const burnDays = 60; // ~2 meses
  const runwayPct = Math.min(100, (daysLeft / burnDays) * 100);
  const burnRate = SITUACION_1.cajaActual / Math.max(1, daysLeft);

  return (
    <div className="card-elevated p-7 md:p-9 mb-8 border-l-4 border-amber-400">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-amber-700 mb-1">
            Situación 1 · Caja operativa
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest">
            Tenemos $67M en caja — vida hasta el 30 de julio.
          </h3>
          <p className="text-ink-secondary mt-2 max-w-3xl">
            Solicitud de fondos para tener caja el 31 de julio en manos de Victoria. Ventana de
            decisión: 2 meses. Esta es la urgencia operativa de corto plazo.
          </p>
        </div>
      </div>

      {/* Visual: runway + burn */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 bg-surface-secondary/50 rounded-2xl p-5">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-ink-tertiary font-semibold">
              Cash runway
            </span>
            <span className="mono-num text-xs text-ink-secondary">
              {daysLeft}d hasta {deadline.toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
            </span>
          </div>
          <div className="relative h-10 bg-ink-quaternary/30 rounded-xl overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-xl transition-all duration-1000"
              style={{
                width: `${runwayPct}%`,
                background: "linear-gradient(90deg, #f59e0b, #f97316)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="mono-num text-sm font-bold text-white mix-blend-difference">
                {fmtCLP(SITUACION_1.cajaActual, { compact: true })} disponibles · ~{daysLeft} días
              </span>
            </div>
            {/* Deadline marker */}
            <div className="absolute top-0 bottom-0 w-px bg-red-600" style={{ right: 0 }}>
              <div className="absolute -bottom-5 right-0 translate-x-1/2 text-[10px] font-bold text-red-600 whitespace-nowrap">
                ▲ deadline
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-ink-tertiary">Caja</p>
              <p className="mono-num text-xl font-semibold text-amber-700">
                {fmtCLP(SITUACION_1.cajaActual, { compact: true })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-ink-tertiary">Burn diario est.</p>
              <p className="mono-num text-xl font-semibold text-ink-secondary">
                {fmtCLP(burnRate, { compact: true })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-ink-tertiary">Días restantes</p>
              <p className="mono-num text-xl font-semibold text-red-600">{daysLeft}</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-amber-700" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">
              Responsable
            </span>
          </div>
          <p className="text-xl font-semibold text-amber-900">{SITUACION_1.responsable}</p>
          <p className="text-sm text-amber-800 mt-1">
            Maneja solicitud de fondos para caja del 31 jul.
          </p>
          <p className="text-xs text-amber-700 mt-3 pt-3 border-t border-amber-200">
            <strong>Ventana:</strong> {SITUACION_1.ventanaMeses} meses para gestionar el call.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SITUACIÓN 2 — Capital authorized breakdown (WATERFALL)
// ============================================================================

function SituacionDos() {
  const items = [
    { label: "Autorizado", value: SITUACION_2.autorizado, type: "start", color: "#3C8B3C" },
    { label: "Gastado desarrollo", value: -SITUACION_2.gastadoDesarrollo, type: "out", color: "#dc2626" },
    { label: "4ª solicitud", value: -SITUACION_2.cuartaSolicitud, type: "out", color: "#f59e0b" },
    { label: "Extra Panimávida", value: -SITUACION_2.panimavidaExtra, type: "out", color: "#f97316" },
    { label: "Por solicitar", value: SITUACION_2.porSolicitar, type: "end", color: "#0891b2" },
  ];

  // Build cumulative for waterfall positions
  let running = 0;
  const bars = items.map((it, i) => {
    let start = 0;
    let end = 0;
    if (it.type === "start" || it.type === "end") {
      start = 0;
      end = it.type === "start" ? it.value : it.value;
    } else {
      start = running + it.value;
      end = running;
    }
    if (it.type === "start") running = it.value;
    else if (it.type === "out") running += it.value;
    return { ...it, start: Math.min(start, end), end: Math.max(start, end), absStart: start, absEnd: end };
  });
  const maxVal = SITUACION_2.autorizado;

  return (
    <div className="card-elevated p-7 md:p-9 mb-8 border-l-4 border-red-400">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-700 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-red-700 mb-1">
            Situación 2 · Capital autorizado · LA MÁS DELICADA
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest">
            $1.800M autorizados, $435M por solicitar. ¿Para qué los usamos?
          </h3>
          <p className="text-ink-secondary mt-2 max-w-3xl">
            La decisión estratégica clave. Los movimientos que podríamos hacer son delicados y no
            estoy 100% convencido de ellos. Necesito su opinión.
          </p>
        </div>
      </div>

      {/* Waterfall chart */}
      <div className="bg-surface-secondary/40 rounded-2xl p-6 mt-6">
        <p className="text-xs uppercase tracking-wider text-ink-tertiary font-semibold mb-4">
          Composición del plan contractual · waterfall
        </p>
        <div className="relative h-72 flex items-end justify-around gap-3">
          {bars.map((b, i) => {
            const heightPct = ((b.end - b.start) / maxVal) * 100;
            const offsetPct = (b.start / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center relative h-full">
                <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end h-full">
                  <div
                    className="rounded-t-lg transition-all duration-1000 relative group hover:brightness-110"
                    style={{
                      height: `${heightPct}%`,
                      marginBottom: `${offsetPct}%`,
                      background: `linear-gradient(180deg, ${b.color}, ${b.color}cc)`,
                    }}
                  >
                    {/* Value label */}
                    <div
                      className="absolute -top-7 left-1/2 -translate-x-1/2 mono-num text-xs font-semibold whitespace-nowrap"
                      style={{ color: b.color }}
                    >
                      {b.type === "out" ? "−" : ""}
                      {fmtCLP(Math.abs(b.value), { compact: true })}
                    </div>
                  </div>
                </div>

                {/* Connecting dashed line */}
                {i < bars.length - 1 && (
                  <div
                    className="absolute top-0 right-0 translate-x-1/2 w-px border-r border-dashed border-ink-quaternary z-0"
                    style={{ height: "100%", bottom: 0 }}
                  />
                )}

                {/* Label */}
                <div className="absolute -bottom-12 inset-x-0 text-center">
                  <p className="text-[11px] font-medium text-ink-primary leading-tight">{b.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-16">
        <DetailBox
          label="Autorizado"
          value={SITUACION_2.autorizado}
          color="#3C8B3C"
          note="Plan contractual"
        />
        <DetailBox
          label="Gastado desarrollo"
          value={SITUACION_2.gastadoDesarrollo}
          color="#dc2626"
          note="Hasta hoy"
          isOut
        />
        <DetailBox
          label="4ª solicitud (proyectada)"
          value={SITUACION_2.cuartaSolicitud}
          color="#f59e0b"
          note="1 año sueldos + 1 proyecto (San Expedito 2 · 150 MW)"
          isOut
        />
        <DetailBox
          label="Extra Panimávida"
          value={SITUACION_2.panimavidaExtra}
          color="#f97316"
          note="Mov tierra · cerco · fosa · faena · sueldo Francisco · estadía"
          isOut
        />
        <DetailBox
          label="POR SOLICITAR"
          value={SITUACION_2.porSolicitar}
          color="#0891b2"
          note="Lo que queda en el FIP"
          highlight
        />
      </div>
    </div>
  );
}

function DetailBox({
  label,
  value,
  color,
  note,
  isOut,
  highlight,
}: {
  label: string;
  value: number;
  color: string;
  note: string;
  isOut?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 border ${highlight ? "ring-2 ring-cyan-400" : ""}`}
      style={{
        background: highlight ? "rgba(6,182,212,0.08)" : isOut ? "rgba(239,68,68,0.05)" : "white",
        borderColor: highlight ? "#06b6d4" : "rgba(212,212,216,0.6)",
      }}
    >
      <p className="text-[10px] uppercase tracking-wider font-semibold leading-tight" style={{ color }}>
        {label}
      </p>
      <p className="mono-num text-lg font-semibold tabular-nums mt-1" style={{ color }}>
        {isOut ? "−" : ""}
        {fmtCLP(value, { compact: true })}
      </p>
      <p className="text-[10px] text-ink-tertiary mt-1 leading-tight">{note}</p>
    </div>
  );
}

// ============================================================================
// ESTRATEGIA PANIMÁVIDA
// ============================================================================

function EstrategiaPanimavida() {
  const segments = [
    {
      label: "Inversionista(s)",
      value: PANIMAVIDA_PLAN.inversionistasTarget,
      color: "#8b5cf6",
      desc: "1-2 LPs aportan",
    },
    {
      label: "CORFO (match)",
      value: PANIMAVIDA_PLAN.corfoMatch,
      color: "#10b981",
      desc: "CORFO dobla el aporte",
    },
    {
      label: "Banco",
      value: PANIMAVIDA_PLAN.bancoTarget,
      color: "#06b6d4",
      desc: "Project finance bancario",
    },
  ];
  const total = segments.reduce((a, s) => a + s.value, 0);

  return (
    <div className="card-elevated p-7 md:p-9 mb-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 shrink-0">
          <Factory className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-violet-700 mb-1">
            Opinión personal · Panimávida
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest">
            $750M inversionista + $750M CORFO + $1.500M banco = $3.000M
          </h3>
          <p className="text-ink-secondary mt-2 max-w-3xl">
            Es muy difícil que el banco preste $3.000M de la nada. La lógica de banca: si quieres
            100 tienes que tener 100. Por eso necesitamos inversionista que active CORFO y luego el
            banco entra a match.
          </p>
        </div>
      </div>

      {/* Stacked bar of funding sources */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-ink-tertiary font-semibold">
            Estructura financiera propuesta
          </p>
          <p className="mono-num text-sm font-semibold">
            Total: {fmtCLP(total, { compact: true })}
          </p>
        </div>
        <div className="flex h-14 rounded-2xl overflow-hidden shadow-sm border border-ink-quaternary/40">
          {segments.map((s, i) => {
            const pct = (s.value / total) * 100;
            return (
              <div
                key={i}
                className="flex items-center justify-center text-white text-sm font-semibold transition-all hover:brightness-110"
                style={{ width: `${pct}%`, background: s.color }}
                title={`${s.label}: ${fmtCLP(s.value)} (${pct.toFixed(1)}%)`}
              >
                {fmtCLP(s.value, { compact: true })}
              </div>
            );
          })}
        </div>

        {/* Step diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {segments.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5"
                style={{ background: s.color }}
              >
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: s.color }}>
                  {s.label}
                </p>
                <p className="mono-num text-xl font-semibold tabular-nums">
                  {fmtCLP(s.value, { compact: true })}
                </p>
                <p className="text-xs text-ink-tertiary mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Flow arrows */}
        <div className="hidden md:flex items-center justify-center gap-3 mt-4 text-violet-600">
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" /> Inversionista
          </div>
          <ArrowRight className="w-4 h-4" />
          <div className="flex items-center gap-1.5 text-xs">
            <HandCoins className="w-3.5 h-3.5" /> CORFO match
          </div>
          <ArrowRight className="w-4 h-4" />
          <div className="flex items-center gap-1.5 text-xs">
            <Banknote className="w-3.5 h-3.5" /> Banco entra
          </div>
          <ArrowRight className="w-4 h-4" />
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Factory className="w-3.5 h-3.5" /> Panimávida construido
          </div>
        </div>
      </div>

      {/* Riesgo del enfoque alternativo */}
      <div className="mt-6 p-4 rounded-xl bg-red-50/60 border border-red-200">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              ¿Por qué NO usar los $435M directos para Panimávida?
            </p>
            <p className="text-sm text-red-700 mt-1 leading-relaxed">
              Aún saliéndolos, seguirían faltando <strong>$2.565M</strong> para construirlo. Los
              bancos con suerte prestan $1.000M cuando se necesitan $3.000M. ¿Qué seguridad hay que
              ya construido nos financien $2.000M? Sin garantías sólidas, ninguna.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ESTRATEGIA SAN EXPEDITO
// ============================================================================

function EstrategiaSanExpedito() {
  const flujos = [
    {
      label: "Venta SE",
      value: SAN_EXPEDITO_FLUJO.venta,
      type: "in",
      color: "#10b981",
      desc: "Target venta este año",
    },
    {
      label: "− Comisiones, asesor PPA, impuestos",
      value: SAN_EXPEDITO_FLUJO.venta - SAN_EXPEDITO_FLUJO.netoPostComision,
      type: "out",
      color: "#dc2626",
      desc: "Costos transacción",
    },
    {
      label: "Neto post-comisión",
      value: SAN_EXPEDITO_FLUJO.netoPostComision,
      type: "subtotal",
      color: "#0891b2",
      desc: "$2.500M − $500M",
    },
    {
      label: "− Devolución inversionistas",
      value: SAN_EXPEDITO_FLUJO.devolucionInversionistas,
      type: "out",
      color: "#f59e0b",
      desc: "(800 + 430 + 135) / 2",
    },
    {
      label: "− 1 año sueldos",
      value: SAN_EXPEDITO_FLUJO.sueldosUnAno,
      type: "out",
      color: "#f97316",
      desc: "Operación continua",
    },
    {
      label: "Disponible repartir / reinvertir",
      value: SAN_EXPEDITO_FLUJO.disponibleRepartir,
      type: "result",
      color: "#3C8B3C",
      desc: "Decisión directorio",
    },
  ];

  return (
    <div className="card-elevated p-7 md:p-9 mb-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-emerald-700 mb-1">
            San Expedito · venta y distribución
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest">
            Vender SE en $2.500M deja $1.000M disponibles para repartir o reinvertir.
          </h3>
          <p className="text-ink-secondary mt-2 max-w-3xl">
            Tenemos TODO activado en virtud de los 2 PPAs. Asesores al pie del cañón. Es la pieza
            crítica del año.
          </p>
        </div>
      </div>

      {/* Flujo vertical */}
      <div className="bg-surface-secondary/40 rounded-2xl p-5 mt-6">
        <div className="space-y-2">
          {flujos.map((f, i) => {
            const isFinal = f.type === "result";
            const isSubtotal = f.type === "subtotal";
            return (
              <div key={i}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isFinal
                      ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300/40"
                      : isSubtotal
                      ? "bg-cyan-50 border-cyan-200"
                      : "bg-white border-ink-quaternary/40"
                  }`}
                >
                  <div
                    className="w-1 h-10 rounded-full"
                    style={{ background: f.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-primary">{f.label}</p>
                    <p className="text-[11px] text-ink-tertiary">{f.desc}</p>
                  </div>
                  <p
                    className={`mono-num text-xl font-semibold tabular-nums whitespace-nowrap ${
                      f.type === "out" ? "text-red-600" : f.type === "in" ? "text-emerald-700" : ""
                    }`}
                    style={!["out", "in"].includes(f.type) ? { color: f.color } : {}}
                  >
                    {f.type === "out" ? "−" : f.type === "in" ? "+" : ""}
                    {fmtCLP(f.value, { compact: true })}
                  </p>
                </div>
                {i < flujos.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="w-3 h-3 text-ink-tertiary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <OpcionCard
          numero="1"
          label="Repartir utilidades"
          desc="Distribuir los $1.000M completos a los aportantes del FIP CEHTA. Retorno cristalizado del primer proyecto vendido."
          color="#10b981"
          Icon={HandCoins}
        />
        <OpcionCard
          numero="2"
          label="Re-invertir un % menor + repartir resto"
          desc="Mantener capital de trabajo para nuevos proyectos (Panimávida, Quebrada Escobar 2) y repartir la mayoría."
          color="#06b6d4"
          Icon={Repeat}
        />
      </div>
    </div>
  );
}

function OpcionCard({
  numero,
  label,
  desc,
  color,
  Icon,
}: {
  numero: string;
  label: string;
  desc: string;
  color: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="rounded-2xl p-5 border-2" style={{ borderColor: color + "40", background: color + "08" }}>
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
          style={{ background: color }}
        >
          {numero}
        </div>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <p className="text-base font-semibold" style={{ color }}>
            {label}
          </p>
        </div>
      </div>
      <p className="text-sm text-ink-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

// ============================================================================
// NUEVOS PROYECTOS
// ============================================================================

function NuevosProyectos() {
  const proyectos = [
    {
      nombre: "Panimávida",
      ingreso: "Energía + potencia",
      tir: "10%",
      payback: "Año 6",
      color: "#f59e0b",
      desc: "TIR pura 10% por ajuste reciente. En construcción.",
      etapa: "Construcción",
    },
    {
      nombre: "Quebrada Escobar",
      ingreso: "Solo potencia",
      tir: "14%",
      payback: "Año 6",
      color: "#8b5cf6",
      desc: "PMGD solar. Crédito de grupo ya disponible.",
      etapa: "Pipeline",
    },
    {
      nombre: "Quebrada Escobar 2",
      ingreso: "Operativo",
      tir: "TBD",
      payback: "—",
      color: "#06b6d4",
      desc: "OPORTUNIDAD nueva. Proyecto ya construido y operando. Carpeta tributaria en camino para presentar al banco.",
      etapa: "Oportunidad",
    },
    {
      nombre: "San Expedito 2 (150 MW)",
      ingreso: "Desarrollo",
      tir: "TBD",
      payback: "—",
      color: "#10b981",
      desc: "Trabajando en desarrollo. Cabría dentro de la 4ª solicitud ($430M).",
      etapa: "Desarrollo",
    },
  ];

  return (
    <div className="card-elevated p-7 md:p-9 mb-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-cyan-700 mb-1">
            Pipeline de ingresos · Quebrada Escobar + más
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest">
            4 frentes activos de generación de retorno.
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {proyectos.map((p, i) => (
          <div
            key={i}
            className="rounded-2xl border p-5 transition-transform hover:scale-[1.02]"
            style={{ borderColor: p.color + "40", background: p.color + "06" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ background: p.color + "20", color: p.color }}
              >
                {p.etapa}
              </span>
            </div>
            <p className="text-lg font-semibold text-ink-primary">{p.nombre}</p>
            <p className="text-xs text-ink-tertiary mt-0.5">{p.ingreso}</p>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-ink-quaternary/40">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-ink-tertiary">TIR pura</p>
                <p className="mono-num text-lg font-semibold" style={{ color: p.color }}>
                  {p.tir}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-ink-tertiary">Payback</p>
                <p className="mono-num text-lg font-semibold text-ink-primary">{p.payback}</p>
              </div>
            </div>

            <p className="text-[11px] text-ink-secondary mt-3 leading-snug">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DECISIÓN FINAL — Escenarios
// ============================================================================

function DecisionFinal() {
  return (
    <div className="card-elevated p-7 md:p-9 mb-8 bg-gradient-to-br from-white via-rho-ultralight/30 to-white">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-rho-dark text-white flex items-center justify-center shrink-0">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-rho-dark mb-1">
            Decisión a tomar
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest">
            ¿Sacamos $435M para Panimávida? Comparación de escenarios.
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <Escenario
          letter="A"
          color="#dc2626"
          title="Sacar $435M para Panimávida YA"
          pros={[
            "Avance inmediato en construcción",
            "Señal positiva a banco y CATL",
          ]}
          cons={[
            "Quedamos sin reserva FIP",
            "Si SE se atrasa → sin caja",
            "Aún faltan $2.565M para terminar Panimávida",
            "Sin garantía de financiamiento bancario posterior",
          ]}
          veredicto="Alto riesgo. NO RECOMENDADO sin contraparte."
        />
        <Escenario
          letter="B"
          color="#f59e0b"
          title="Esperar venta SE primero"
          pros={[
            "Caja segura post-venta",
            "Devolución inversionistas (cristaliza retorno)",
            "Pool $1.000M disponible para reinversión / dividendos",
          ]}
          cons={[
            "Ventana de timing depende de SE (incertidumbre)",
            "Pierdes momentum en Panimávida",
            "Inversionista CORFO puede demorarse",
          ]}
          veredicto="Conservador pero realista. RAZONABLE."
        />
        <Escenario
          letter="C"
          color="#10b981"
          title="Levantar inversionista + CORFO (recomendado)"
          pros={[
            "$750M LP + $750M CORFO = $1.500M equity",
            "Banco entra con $1.500M match → $3.000M total",
            "Panimávida construido completo",
            "Reservas FIP intactas",
          ]}
          cons={[
            "Tiempo de levantamiento (3-6 meses)",
            "Requiere pitch a LPs nuevos",
            "Diluir levemente ownership según términos",
          ]}
          veredicto="ESTRATEGIA PROPUESTA. Apila equity → CORFO → banco."
          highlight
        />
      </div>
    </div>
  );
}

function Escenario({
  letter,
  color,
  title,
  pros,
  cons,
  veredicto,
  highlight,
}: {
  letter: string;
  color: string;
  title: string;
  pros: string[];
  cons: string[];
  veredicto: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border-2 flex flex-col ${highlight ? "shadow-lg ring-2 ring-emerald-300/50" : ""}`}
      style={{ borderColor: color + "50", background: color + "06" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
          style={{ background: color }}
        >
          {letter}
        </div>
        <p className="text-sm font-semibold text-ink-primary leading-tight">{title}</p>
      </div>

      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold mb-1">
          ✓ Pros
        </p>
        <ul className="space-y-1">
          {pros.map((p, i) => (
            <li key={i} className="text-xs text-ink-secondary flex items-start gap-1.5">
              <span className="text-emerald-600 mt-0.5">·</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-wider text-red-700 font-bold mb-1">✗ Cons</p>
        <ul className="space-y-1">
          {cons.map((c, i) => (
            <li key={i} className="text-xs text-ink-secondary flex items-start gap-1.5">
              <span className="text-red-500 mt-0.5">·</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="mt-auto pt-3 border-t text-[11px] font-semibold leading-snug"
        style={{ borderColor: color + "30", color }}
      >
        ▸ {veredicto}
      </div>
    </div>
  );
}

// ============================================================================
// CLOSING NOTE
// ============================================================================

function ClosingNote() {
  return (
    <div className="card-elevated p-7 md:p-8 bg-gradient-to-br from-rho-ultralight/40 via-white to-white border-l-4 border-rho-medium">
      <div className="flex items-start gap-3">
        <Network className="w-6 h-6 text-rho-dark mt-1 shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-ink-primary mb-2">
            Conclusión personal
          </h3>
          <p className="text-base text-ink-secondary leading-relaxed mb-3">
            Sí, tenemos $435M en caja FIP por enterar para construir Panimávida y una eventual venta
            rápida de San Expedito. Pero la pregunta de fondo es: aún sacando todo, faltan{" "}
            <strong>$2.565M</strong>. Si SE se atrasa, llegamos a un punto donde nos quedamos sin
            caja.
          </p>
          <p className="text-base text-ink-secondary leading-relaxed">
            Mi posición:{" "}
            <strong className="text-rho-dark">
              activar inversionista + CORFO para Panimávida en paralelo a la venta SE
            </strong>
            . Levantar $750M de un LP, doblamos con CORFO ($1.500M), y eso destraba el banco para
            otro $1.500M. Para Quebrada Escobar / nuevos proyectos diesel ya tengo crédito de grupos y
            otro proyecto operando con carpeta tributaria entrando.
          </p>
          <div className="flex flex-wrap gap-3 mt-5 text-xs">
            <span className="pill pill-positive">
              <Building2 className="w-3 h-3" /> Panimávida vía inversionista + CORFO + banco
            </span>
            <span className="pill pill-info">
              <TrendingUp className="w-3 h-3" /> San Expedito target $2.500M
            </span>
            <span className="pill pill-violet">
              <Sparkles className="w-3 h-3" /> Quebrada Escobar 2 con crédito de grupos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
