"use client";

import { fmtCLP } from "@/lib/data";
import { getCallStatuses, plazoToDate, URGENCY_CONFIG } from "@/lib/calendar";
import { CheckCircle2, AlertCircle, Clock, Calendar } from "lucide-react";

/**
 * Timeline temporal real con eje cronológico:
 * - Eje horizontal: del primer plazo (feb 2025) al último (abr 2026)
 * - Marker "hoy" en vivo
 * - Cada cuota posicionada en su plazo contractual
 * - Color por urgencia/estado
 * - Tooltip rico
 */
export default function CuotasTimelineTemporal() {
  const calls = getCallStatuses();
  const allDates = calls
    .map((c) => c.plazoDate)
    .filter((d): d is string => !!d)
    .sort();
  if (allDates.length === 0) return null;

  const start = new Date(allDates[0] + "T12:00:00");
  const end = new Date(allDates[allDates.length - 1] + "T12:00:00");
  // Padding mensual a cada lado
  const totalMs = end.getTime() - start.getTime();
  const padMs = totalMs * 0.08;
  const tStart = new Date(start.getTime() - padMs);
  const tEnd = new Date(end.getTime() + padMs);
  const today = new Date();
  const todayPct = ((today.getTime() - tStart.getTime()) / (tEnd.getTime() - tStart.getTime())) * 100;

  const posFor = (date: string): number => {
    const d = new Date(date + "T12:00:00");
    return ((d.getTime() - tStart.getTime()) / (tEnd.getTime() - tStart.getTime())) * 100;
  };

  // Build months for x-axis ticks
  const months: { date: Date; label: string; isYear: boolean }[] = [];
  const cur = new Date(tStart.getFullYear(), tStart.getMonth(), 1);
  while (cur <= tEnd) {
    months.push({
      date: new Date(cur),
      label: cur.toLocaleDateString("es-CL", { month: "short" }),
      isYear: cur.getMonth() === 0 || months.length === 0,
    });
    cur.setMonth(cur.getMonth() + 1);
  }

  return (
    <div className="card-elevated p-6 md:p-7 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center text-white">
          <Calendar className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-emerald-700">
          Calendario contractual · línea temporal
        </p>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
        Adenda N°2 · timeline real de las 6 cuotas
      </h3>
      <p className="text-sm text-ink-tertiary mt-1">
        Eje cronológico desde feb 2025 a abr 2026. Marker rojo = hoy. Cada bullet es una cuota
        posicionada en su plazo notarial.
      </p>

      <div className="mt-10 relative pb-24">
        {/* X axis line */}
        <div className="absolute top-8 left-0 right-0 h-px bg-ink-quaternary/60" />

        {/* Month/Year ticks */}
        {months.map((m, i) => {
          const pct =
            ((m.date.getTime() - tStart.getTime()) / (tEnd.getTime() - tStart.getTime())) * 100;
          return (
            <div
              key={i}
              className="absolute"
              style={{ left: `${pct}%`, top: 0, transform: "translateX(-50%)" }}
            >
              <div className="text-[9px] uppercase tracking-wider text-ink-tertiary mb-1 text-center">
                {m.label}
              </div>
              <div
                className={`w-px ${m.isYear ? "h-3 bg-ink-tertiary" : "h-2 bg-ink-quaternary"}`}
              />
              {m.isYear && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-ink-secondary mono-num whitespace-nowrap">
                  {m.date.getFullYear()}
                </div>
              )}
            </div>
          );
        })}

        {/* TODAY marker */}
        {todayPct >= 0 && todayPct <= 100 && (
          <div
            className="absolute z-20"
            style={{ left: `${todayPct}%`, top: 0, transform: "translateX(-50%)" }}
          >
            <div className="w-px h-16 bg-red-500" />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
              hoy
            </div>
          </div>
        )}

        {/* Cuota markers */}
        {calls.map((call, i) => {
          if (!call.plazoDate) return null;
          const pct = posFor(call.plazoDate);
          const cfg = URGENCY_CONFIG[call.urgency];
          const Icon =
            call.urgency === "paid"
              ? CheckCircle2
              : call.urgency === "overdue"
              ? AlertCircle
              : Clock;
          const isTop = i % 2 === 0;

          return (
            <div
              key={call.cuota.id}
              className="absolute"
              style={{
                left: `${pct}%`,
                top: 32,
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              {/* Vertical connector */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-px"
                style={{
                  background: cfg.color,
                  height: isTop ? 32 : 12,
                  top: isTop ? -32 : 0,
                  opacity: 0.6,
                }}
              />
              {/* Dot */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white relative"
                style={{ background: cfg.color }}
                title={`Cuota ${call.cuota.letra} · ${call.cuota.label} · ${call.cuota.plazo} · ${call.label}`}
              >
                <Icon className="w-2.5 h-2.5 text-white" />
              </div>
              {/* Label below */}
              <div
                className="absolute left-1/2 -translate-x-1/2 mt-2 text-center min-w-[80px]"
                style={{ top: 24 }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wider mono-num"
                  style={{ color: cfg.color }}
                >
                  {call.cuota.letra}
                </p>
                <p className="mono-num text-[11px] font-semibold tabular-nums leading-tight">
                  {fmtCLP(call.cuota.monto, { compact: true })}
                </p>
                <p className="text-[9px] text-ink-tertiary leading-tight">{call.cuota.plazo}</p>
                <span
                  className="inline-block text-[8px] font-bold uppercase tracking-wider mt-0.5 px-1.5 py-0.5 rounded"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="mt-12 pt-5 border-t border-ink-quaternary/40 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <SummaryStat
          label="Pagadas"
          count={calls.filter((c) => c.urgency === "paid").length}
          total={calls.reduce((a, c) => (c.urgency === "paid" ? a + c.cuota.monto : a), 0)}
          color="#059669"
        />
        <SummaryStat
          label="Vencidas"
          count={calls.filter((c) => c.urgency === "overdue").length}
          total={calls.reduce((a, c) => (c.urgency === "overdue" ? a + c.cuota.monto : a), 0)}
          color="#dc2626"
        />
        <SummaryStat
          label="Urgentes (≤30d)"
          count={calls.filter((c) => c.urgency === "urgent").length}
          total={calls.reduce((a, c) => (c.urgency === "urgent" ? a + c.cuota.monto : a), 0)}
          color="#d97706"
        />
        <SummaryStat
          label="Futuras"
          count={calls.filter((c) => c.urgency === "soon" || c.urgency === "future").length}
          total={calls.reduce(
            (a, c) => (c.urgency === "soon" || c.urgency === "future" ? a + c.cuota.monto : a),
            0
          )}
          color="#475569"
        />
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium mb-1">
        {label}
      </p>
      <p className="mono-num text-2xl font-semibold tabular-nums" style={{ color }}>
        {count}
      </p>
      <p className="text-xs text-ink-tertiary mono-num">
        {total > 0 ? fmtCLP(total, { compact: true }) : "—"}
      </p>
    </div>
  );
}
