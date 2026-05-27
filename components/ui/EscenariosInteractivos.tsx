"use client";

import { useState } from "react";
import { fmtMM } from "@/lib/data";
import {
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Building2,
  HandCoins,
  Users,
  Banknote,
  Clock,
} from "lucide-react";

/**
 * Escenarios A/B/C interactivos:
 * - Click en cada uno para ver detalle expandido
 * - Animación de transición entre escenarios
 * - Comparación de outcome de cada uno
 * - Cada escenario muestra: pros, cons, monto en juego, timeline, recomendación
 */

type EscId = "A" | "B" | "C";

interface Escenario {
  id: EscId;
  letter: string;
  title: string;
  shortTitle: string;
  badge: string;
  color: string;
  bgLight: string;
  borderLight: string;
  // Métricas clave
  panimavidaFundedM: number; // % cubierto
  liquidezFIPRestante: number; // CLP
  tiempoEjecucion: string;
  riesgo: "alto" | "medio" | "bajo";
  pros: string[];
  cons: string[];
  flujoVisual: { etapa: string; valor: string; color: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[];
  veredicto: string;
  recomendado: boolean;
}

const ESCENARIOS: Escenario[] = [
  {
    id: "A",
    letter: "A",
    title: "Sacar $435M ya para Panimávida",
    shortTitle: "Sacar $435M",
    badge: "AGRESIVO",
    color: "#dc2626",
    bgLight: "#fee2e2",
    borderLight: "#fca5a5",
    panimavidaFundedM: 14, // 435/3000
    liquidezFIPRestante: 0,
    tiempoEjecucion: "Inmediato (~7 días)",
    riesgo: "alto",
    pros: [
      "Avance inmediato en obra",
      "Señal positiva a banco y CATL",
      "Sin dilución de ownership",
    ],
    cons: [
      "Quedamos sin reserva FIP",
      "Si SE se atrasa → sin caja",
      "Aún faltan $2.565M para terminar Panimávida",
      "Sin garantía de financiamiento bancario posterior",
    ],
    flujoVisual: [
      { etapa: "FIP", valor: "$435M", color: "#0891b2", Icon: HandCoins },
      { etapa: "Panimávida", valor: "Solo 14%", color: "#dc2626", Icon: Building2 },
    ],
    veredicto: "ALTO RIESGO — no recomendado sin contraparte. Aún faltarían $2.565M.",
    recomendado: false,
  },
  {
    id: "B",
    letter: "B",
    title: "Esperar venta SE primero",
    shortTitle: "Esperar SE",
    badge: "CONSERVADOR",
    color: "#f59e0b",
    bgLight: "#fef3c7",
    borderLight: "#fcd34d",
    panimavidaFundedM: 0,
    liquidezFIPRestante: 435_000_000,
    tiempoEjecucion: "3-9 meses (depende SE)",
    riesgo: "medio",
    pros: [
      "Caja segura post-venta",
      "Devolución inversionistas (cristaliza retorno)",
      "Pool $1.000M para reinversión/dividendos",
      "Reservas FIP intactas",
    ],
    cons: [
      "Pierde momentum en Panimávida",
      "Timing depende 100% de SE (incertidumbre)",
      "Si CORFO se demora, equity tarda más",
      "Banco puede pedir más mientras esperamos",
    ],
    flujoVisual: [
      { etapa: "Venta SE", valor: "$2.500M", color: "#10b981", Icon: Banknote },
      { etapa: "Devolución LP", valor: "$682M", color: "#f59e0b", Icon: HandCoins },
      { etapa: "Disponible", valor: "$1.000M", color: "#0891b2", Icon: Sparkles },
    ],
    veredicto: "RAZONABLE — conservador y realista. Buena opción si SE cierra rápido.",
    recomendado: false,
  },
  {
    id: "C",
    letter: "C",
    title: "Levantar inversionista + activar CORFO",
    shortTitle: "Inv + CORFO + Banco",
    badge: "RECOMENDADO",
    color: "#059669",
    bgLight: "#d1fae5",
    borderLight: "#6ee7b7",
    panimavidaFundedM: 100,
    liquidezFIPRestante: 435_000_000,
    tiempoEjecucion: "3-6 meses (paralelo a SE)",
    riesgo: "bajo",
    pros: [
      "$750M LP + $750M CORFO = $1.500M equity",
      "Banco entra con $1.500M match → $3.000M total",
      "Panimávida construido COMPLETO",
      "Reservas FIP intactas ($435M)",
      "Diversifica base de inversionistas",
    ],
    cons: [
      "Tiempo levantamiento (3-6 meses)",
      "Requiere pitch a LPs nuevos",
      "Diluir levemente ownership según términos",
    ],
    flujoVisual: [
      { etapa: "Inversionista", valor: "$750M", color: "#8b5cf6", Icon: Users },
      { etapa: "CORFO match", valor: "$750M", color: "#10b981", Icon: HandCoins },
      { etapa: "Banco", valor: "$1.500M", color: "#06b6d4", Icon: Banknote },
      { etapa: "Panimávida 100%", valor: "$3.000M", color: "#059669", Icon: Building2 },
    ],
    veredicto: "ESTRATEGIA PROPUESTA — apila equity → CORFO → banco. Maximiza outcome.",
    recomendado: true,
  },
];

export default function EscenariosInteractivos() {
  const [selected, setSelected] = useState<EscId>("C");
  const esc = ESCENARIOS.find((e) => e.id === selected)!;
  const riesgoConfig = {
    alto: { label: "RIESGO ALTO", color: "#dc2626", bg: "bg-red-100" },
    medio: { label: "RIESGO MEDIO", color: "#d97706", bg: "bg-amber-100" },
    bajo: { label: "RIESGO BAJO", color: "#059669", bg: "bg-emerald-100" },
  }[esc.riesgo];

  return (
    <div className="card-elevated p-6 md:p-8 mb-8 bg-gradient-to-br from-white via-rho-ultralight/20 to-white">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-rho-dark text-white flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-rho-dark mb-1">
            Decisión interactiva · comparador de escenarios
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest">
            Tres caminos posibles — clic para explorar cada uno.
          </h3>
          <p className="text-ink-secondary mt-2 max-w-3xl">
            Cada escenario tiene su flujo, riesgo y outcome. La visualización abajo se actualiza
            según cuál seleccionás.
          </p>
        </div>
      </div>

      {/* Selector visual tipo tabs grandes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {ESCENARIOS.map((e) => {
          const isActive = e.id === selected;
          return (
            <button
              key={e.id}
              onClick={() => setSelected(e.id)}
              className={`relative p-5 rounded-2xl border-2 text-left transition-all overflow-hidden group ${
                isActive
                  ? "shadow-lg scale-[1.02]"
                  : "hover:scale-[1.01] hover:shadow-md opacity-70 hover:opacity-100"
              }`}
              style={{
                borderColor: isActive ? e.color : "transparent",
                background: isActive ? e.bgLight + "60" : "white",
              }}
            >
              {e.recomendado && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                  ★ Recomendado
                </span>
              )}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: e.color }}
                >
                  {e.letter}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: e.color }}>
                    Escenario {e.letter} · {e.badge}
                  </p>
                  <p className="text-sm font-semibold text-ink-primary leading-tight">
                    {e.shortTitle}
                  </p>
                </div>
              </div>
              <p className="text-xs text-ink-secondary leading-snug mt-2">{e.title}</p>
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ background: e.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Detalle del escenario seleccionado — actualización dinámica */}
      <div
        key={esc.id}
        className="rounded-2xl border-2 p-5 md:p-6 animate-fade-in"
        style={{ borderColor: esc.color + "30", background: esc.bgLight + "20" }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
            style={{ background: esc.color }}
          >
            {esc.letter}
          </div>
          <h4 className="text-xl font-semibold tracking-tight text-ink-primary">{esc.title}</h4>
          <span
            className={`pill ${riesgoConfig.bg}`}
            style={{ color: riesgoConfig.color }}
          >
            {riesgoConfig.label}
          </span>
          <span className="pill pill-neutral text-[10px]">
            <Clock className="w-3 h-3 inline mr-1" />
            {esc.tiempoEjecucion}
          </span>
        </div>

        {/* Stats clave */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatBox
            label="Panimávida financiada"
            value={`${esc.panimavidaFundedM}%`}
            color={esc.panimavidaFundedM >= 100 ? "#059669" : esc.panimavidaFundedM >= 50 ? "#f59e0b" : "#dc2626"}
            barPct={esc.panimavidaFundedM}
          />
          <StatBox
            label="Reservas FIP restantes"
            value={fmtMM(esc.liquidezFIPRestante)}
            color={esc.liquidezFIPRestante > 0 ? "#059669" : "#dc2626"}
            barPct={esc.liquidezFIPRestante > 0 ? 100 : 0}
          />
          <StatBox
            label="Riesgo del plan"
            value={riesgoConfig.label.replace("RIESGO ", "")}
            color={riesgoConfig.color}
            barPct={esc.riesgo === "bajo" ? 25 : esc.riesgo === "medio" ? 60 : 95}
          />
          <StatBox
            label="Tiempo"
            value={esc.tiempoEjecucion.split("(")[0].trim()}
            color={esc.color}
            barPct={50}
          />
        </div>

        {/* Flujo visual de capital — dinámico */}
        <div className="bg-white/70 rounded-xl p-4 md:p-5 mb-5 border border-ink-quaternary/40">
          <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-bold mb-3">
            Flujo del capital en este escenario
          </p>
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2">
            {esc.flujoVisual.map((step, i) => {
              const StepIcon = step.Icon;
              return (
                <div key={i} className="flex items-center gap-2 md:gap-3 shrink-0">
                  <div
                    className="px-4 py-3 rounded-xl text-center min-w-[120px] transition-transform hover:scale-105"
                    style={{ background: step.color + "15", borderLeft: `4px solid ${step.color}` }}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <StepIcon className="w-3.5 h-3.5" style={{ color: step.color }} />
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: step.color }}>
                        {step.etapa}
                      </p>
                    </div>
                    <p className="mono-num text-base font-semibold tabular-nums" style={{ color: step.color }}>
                      {step.valor}
                    </p>
                  </div>
                  {i < esc.flujoVisual.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-ink-tertiary shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pros / Cons lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
            <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pros ({esc.pros.length})
            </p>
            <ul className="space-y-1.5">
              {esc.pros.map((p, i) => (
                <li key={i} className="text-sm text-ink-primary flex items-start gap-2 leading-snug">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50/60 rounded-xl p-4 border border-red-200">
            <p className="text-[10px] uppercase tracking-wider text-red-700 font-bold mb-2 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              Cons ({esc.cons.length})
            </p>
            <ul className="space-y-1.5">
              {esc.cons.map((c, i) => (
                <li key={i} className="text-sm text-ink-primary flex items-start gap-2 leading-snug">
                  <span className="text-red-500 mt-0.5">×</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Veredicto banner */}
        <div
          className="p-4 rounded-xl flex items-start gap-3 border-2"
          style={{ background: esc.color + "10", borderColor: esc.color + "40" }}
        >
          {esc.recomendado ? (
            <Sparkles className="w-5 h-5 mt-0.5 shrink-0" style={{ color: esc.color }} />
          ) : (
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: esc.color }} />
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: esc.color }}>
              Veredicto
            </p>
            <p className="text-sm font-semibold text-ink-primary leading-snug">{esc.veredicto}</p>
          </div>
        </div>
      </div>

      {/* Comparison strip — todos lado a lado */}
      <div className="mt-6 pt-5 border-t border-ink-quaternary/40">
        <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-bold mb-3">
          Comparación rápida de los 3 escenarios
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {ESCENARIOS.map((e) => (
            <div
              key={e.id}
              className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                e.id === selected ? "border-2" : "border opacity-60"
              }`}
              style={{ borderColor: e.color + "60", background: e.bgLight + "30" }}
              onClick={() => setSelected(e.id)}
            >
              <p className="font-bold mb-1" style={{ color: e.color }}>
                {e.letter} · {e.shortTitle}
              </p>
              <p className="text-ink-secondary leading-tight">
                Panimávida {e.panimavidaFundedM}% · Reserva FIP {fmtMM(e.liquidezFIPRestante)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
  barPct,
}: {
  label: string;
  value: string;
  color: string;
  barPct: number;
}) {
  return (
    <div className="bg-white rounded-xl p-3 border border-ink-quaternary/40">
      <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium mb-1 leading-tight">
        {label}
      </p>
      <p className="mono-num text-xl font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
      <div className="h-1 bg-surface-tertiary rounded-full mt-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, barPct)}%`, background: color }}
        />
      </div>
    </div>
  );
}
