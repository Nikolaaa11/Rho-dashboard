"use client";

import { useState, useMemo } from "react";
import { fmtCLP, fmtMM } from "@/lib/data";
import { TrendingUp, ArrowDown, AlertTriangle, CheckCircle2, Sliders, Sparkles } from "lucide-react";

/**
 * Simulador interactivo: "¿Si vendemos San Expedito en $X, qué pasa con el flujo?"
 * El usuario mueve el slider y todo se recalcula en vivo:
 * - Neto post comisión (estimado 80% de venta)
 * - Devolución a inversionistas (fijo)
 * - Sueldos 1 año (fijo)
 * - Disponible para repartir/reinvertir
 * - Veredicto: rentable / break-even / pérdida vs aportes
 */

const DEVOLUCION_INVERSIONISTAS = (800_000_000 + 430_000_000 + 135_000_000) / 2; // 682.5M
const SUELDOS_UN_ANO = 317_000_000;
const COMISION_PCT = 0.20; // 20% comisiones/PPA/impuestos
const APORTES_TOTALES = 800_000_000 + 430_000_000 + 135_000_000; // 1.365M

const MIN_VENTA = 1_500_000_000;
const MAX_VENTA = 4_000_000_000;
const STEP = 100_000_000;

export default function SimuladorSE() {
  const [ventaSE, setVentaSE] = useState(2_500_000_000);

  const calc = useMemo(() => {
    const comision = ventaSE * COMISION_PCT;
    const neto = ventaSE - comision;
    const postDevolucion = neto - DEVOLUCION_INVERSIONISTAS;
    const disponibleParaRepartir = postDevolucion - SUELDOS_UN_ANO;
    // ROI desde aportes totales (681M devuelto x2 = devolución total = 1.365M)
    const devolucionCompleta = DEVOLUCION_INVERSIONISTAS * 2;
    const utilidad = neto - devolucionCompleta;
    const multiplo = devolucionCompleta > 0 ? neto / devolucionCompleta : 0;

    return {
      comision,
      neto,
      postDevolucion,
      disponibleParaRepartir,
      utilidad,
      multiplo,
      esCubrePagos: disponibleParaRepartir >= 0,
      esRentable: utilidad > 0,
    };
  }, [ventaSE]);

  const veredicto = !calc.esCubrePagos
    ? { label: "NO ALCANZA", color: "#dc2626", bg: "bg-red-50", desc: "No cubre devolución + sueldos." }
    : calc.utilidad < 200_000_000
    ? { label: "BREAK-EVEN", color: "#f59e0b", bg: "bg-amber-50", desc: "Recupera lo aportado pero margen muy delgado." }
    : calc.utilidad < 700_000_000
    ? { label: "RENTABLE", color: "#0891b2", bg: "bg-cyan-50", desc: "Buen retorno para inversionistas." }
    : { label: "EXCELENTE", color: "#059669", bg: "bg-emerald-50", desc: "Retorno superior — caso ideal." };

  // Target visual marker
  const ventaPct = ((ventaSE - MIN_VENTA) / (MAX_VENTA - MIN_VENTA)) * 100;
  const targetPct = ((2_500_000_000 - MIN_VENTA) / (MAX_VENTA - MIN_VENTA)) * 100;
  const breakevenVenta = (DEVOLUCION_INVERSIONISTAS + SUELDOS_UN_ANO) / (1 - COMISION_PCT);
  const breakevenPct = ((breakevenVenta - MIN_VENTA) / (MAX_VENTA - MIN_VENTA)) * 100;

  return (
    <div className="card-elevated p-6 md:p-8 mb-8 relative overflow-hidden bg-gradient-to-br from-white via-cyan-50/20 to-white">
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-cyan-700 mb-1">
              Simulador interactivo · what-if
            </p>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest">
              ¿En cuánto vendemos San Expedito?
            </h3>
            <p className="text-ink-secondary mt-2 max-w-2xl">
              Movéte el slider para ver cómo cambia el flujo en vivo: neto post-comisión, devolución
              a inversionistas, sueldos del año y disponible para repartir.
            </p>
          </div>
        </div>

        {/* Slider area */}
        <div className="bg-surface-secondary/40 rounded-2xl p-5 md:p-7 mb-5">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-ink-tertiary font-bold">
              Precio venta SE
            </span>
            <span className="mono-num text-4xl md:text-5xl font-semibold tabular-nums text-cyan-700">
              {fmtMM(ventaSE)}
            </span>
          </div>

          <div className="relative pt-6 pb-8">
            {/* Custom slider markers */}
            <div className="relative h-3 bg-ink-quaternary/30 rounded-full">
              {/* Breakeven marker */}
              {breakevenPct > 0 && breakevenPct < 100 && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                  style={{ left: `${breakevenPct}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-600 whitespace-nowrap">
                    break-even
                  </div>
                </div>
              )}
              {/* Target marker */}
              <div
                className="absolute top-0 bottom-0 w-px bg-emerald-500 z-10"
                style={{ left: `${targetPct}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-600 whitespace-nowrap">
                  ▾ target
                </div>
              </div>
              {/* Progress fill */}
              <div
                className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-200"
                style={{
                  width: `${ventaPct}%`,
                  background: `linear-gradient(90deg, ${veredicto.color}66, ${veredicto.color})`,
                }}
              />
            </div>
            <input
              type="range"
              min={MIN_VENTA}
              max={MAX_VENTA}
              step={STEP}
              value={ventaSE}
              onChange={(e) => setVentaSE(Number(e.target.value))}
              className="absolute inset-x-0 top-6 h-3 opacity-0 cursor-pointer"
              style={{ width: "100%" }}
            />
            {/* Bottom labels */}
            <div className="flex justify-between text-[10px] text-ink-tertiary mono-num mt-2">
              <span>{fmtMM(MIN_VENTA)}</span>
              <span>{fmtMM((MIN_VENTA + MAX_VENTA) / 2)}</span>
              <span>{fmtMM(MAX_VENTA)}</span>
            </div>
          </div>

          {/* Veredicto */}
          <div
            className={`mt-2 p-4 rounded-xl border-2 flex items-center gap-3 transition-colors ${veredicto.bg}`}
            style={{ borderColor: veredicto.color + "50" }}
          >
            {calc.esRentable ? (
              <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: veredicto.color }} />
            ) : (
              <AlertTriangle className="w-6 h-6 shrink-0" style={{ color: veredicto.color }} />
            )}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: veredicto.color }}>
                Resultado · {veredicto.label}
              </p>
              <p className="text-sm font-medium text-ink-primary leading-tight">{veredicto.desc}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] uppercase tracking-wider text-ink-tertiary">Múltiplo</p>
              <p className="mono-num text-xl font-semibold tabular-nums" style={{ color: veredicto.color }}>
                {calc.multiplo.toFixed(2)}x
              </p>
            </div>
          </div>
        </div>

        {/* Flujo cascada en vivo */}
        <div className="space-y-2">
          <FlujoStep
            label="Venta bruta SE"
            value={ventaSE}
            sign="+"
            color="#10b981"
            note="Precio negociado"
          />
          <FlujoStep
            label="− Comisiones + asesor PPA + impuestos"
            value={calc.comision}
            sign="−"
            color="#dc2626"
            note="~20% del bruto"
          />
          <FlujoStep
            label="Neto post-comisión"
            value={calc.neto}
            sign="="
            color="#0891b2"
            note="Lo que entra al FIP"
            isSubtotal
          />
          <FlujoStep
            label="− Devolución inversionistas"
            value={DEVOLUCION_INVERSIONISTAS}
            sign="−"
            color="#f59e0b"
            note="(800 + 430 + 135) / 2 — devuelve aportes proporcionales"
          />
          <FlujoStep
            label="− Sueldos 1 año"
            value={SUELDOS_UN_ANO}
            sign="−"
            color="#f97316"
            note="Operación continua"
          />
          <FlujoStep
            label="Disponible para repartir / reinvertir"
            value={calc.disponibleParaRepartir}
            sign="="
            color={calc.disponibleParaRepartir >= 0 ? "#059669" : "#dc2626"}
            note={
              calc.disponibleParaRepartir >= 0
                ? "Decisión directorio: dividendo o reinvertir"
                : "⚠ NO ALCANZA — pérdida de capital"
            }
            isFinal
          />
        </div>

        {/* Comparison shortcuts */}
        <div className="mt-5 pt-5 border-t border-ink-quaternary/40">
          <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-bold mb-2">
            Saltos rápidos a escenarios típicos
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Mínimo aceptable", value: Math.round(breakevenVenta / 1e8) * 1e8 },
              { label: "Target", value: 2_500_000_000 },
              { label: "Optimista", value: 3_200_000_000 },
              { label: "Best case", value: 4_000_000_000 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setVentaSE(s.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  ventaSE === s.value
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "bg-white text-ink-secondary border-ink-quaternary hover:border-cyan-400 hover:text-cyan-700"
                }`}
              >
                {s.label} · <span className="mono-num">{fmtMM(s.value)}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-ink-tertiary mt-4 italic flex items-start gap-1.5">
          <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
          Tip: probá moverlo a $2.000M y observá cómo el disponible baja a casi nada. Esa es la
          línea roja que no podemos cruzar.
        </p>
      </div>
    </div>
  );
}

function FlujoStep({
  label,
  value,
  sign,
  color,
  note,
  isSubtotal,
  isFinal,
}: {
  label: string;
  value: number;
  sign: string;
  color: string;
  note: string;
  isSubtotal?: boolean;
  isFinal?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
        isFinal
          ? "border-2 shadow-sm"
          : isSubtotal
          ? "bg-cyan-50/40 border-cyan-200"
          : "bg-white border-ink-quaternary/40"
      }`}
      style={isFinal ? { borderColor: color, background: color + "10" } : {}}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0"
        style={{ background: color }}
      >
        {sign}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-primary leading-tight">{label}</p>
        <p className="text-[11px] text-ink-tertiary leading-tight">{note}</p>
      </div>
      <p
        className={`mono-num text-xl md:text-2xl font-semibold tabular-nums whitespace-nowrap transition-all`}
        style={{ color }}
      >
        {fmtCLP(Math.abs(value), { compact: true })}
      </p>
    </div>
  );
}
