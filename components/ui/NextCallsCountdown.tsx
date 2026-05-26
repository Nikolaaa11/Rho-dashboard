"use client";

import { fmtCLP, fmtMM } from "@/lib/data";
import { getCallStatuses, URGENCY_CONFIG } from "@/lib/calendar";
import { Clock, AlertTriangle, CheckCircle2, Calendar, Bell } from "lucide-react";

/**
 * Card de "próximos capital calls" — countdown visual con urgencia.
 * Muestra cuotas no pagadas ordenadas por proximidad de vencimiento.
 */
export default function NextCallsCountdown({ limit = 4 }: { limit?: number }) {
  const calls = getCallStatuses().filter((c) => c.urgency !== "paid").slice(0, limit);
  const overdue = calls.filter((c) => c.urgency === "overdue");
  const totalOverdue = overdue.reduce((a, c) => a + c.cuota.monto, 0);
  const totalPending = calls.reduce((a, c) => a + c.cuota.monto, 0);

  if (calls.length === 0) {
    return (
      <div className="card-elevated p-7 md:p-8 bg-emerald-50/40 border border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">
              Todas las cuotas pagadas
            </h3>
            <p className="text-sm text-emerald-700">
              No hay capital calls pendientes en el calendario contractual.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 md:p-7 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-amber-700">
                Próximos capital calls
              </p>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
              {calls.length} cuota{calls.length === 1 ? "" : "s"} por desembolsar
            </h3>
            <p className="text-sm text-ink-tertiary mt-1">
              Total pendiente: <strong className="text-ink-primary mono-num">{fmtMM(totalPending)}</strong>
              {overdue.length > 0 && (
                <>
                  {" "}· <span className="text-red-600">
                    {fmtMM(totalOverdue)} vencido en {overdue.length} cuota{overdue.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {calls.map((call, i) => {
            const cfg = URGENCY_CONFIG[call.urgency];
            const Icon = call.urgency === "overdue" ? AlertTriangle : Clock;
            const pctRing = Math.min(100, Math.max(0, ((90 - (call.daysToDeadline ?? 0)) / 90) * 100));

            return (
              <div
                key={call.cuota.id}
                className="flex items-stretch gap-4 p-4 rounded-2xl border transition-all animate-fade-in hover:shadow-sm"
                style={{
                  background: cfg.bg + "66",
                  borderColor: cfg.ring,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                {/* Countdown circle */}
                <div className="shrink-0 flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16">
                    <svg width={64} height={64} viewBox="0 0 64 64" className="-rotate-90">
                      <circle
                        cx={32}
                        cy={32}
                        r={28}
                        fill="none"
                        stroke={cfg.ring}
                        strokeWidth={3}
                        opacity={0.5}
                      />
                      <circle
                        cx={32}
                        cy={32}
                        r={28}
                        fill="none"
                        stroke={cfg.color}
                        strokeWidth={3}
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - pctRing / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Icon className="w-3.5 h-3.5 mb-0.5" style={{ color: cfg.color }} />
                      <span
                        className="mono-num text-[10px] font-bold uppercase tracking-wide leading-none"
                        style={{ color: cfg.color }}
                      >
                        {call.cuota.letra}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detail */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <h4 className="text-base font-semibold text-ink-primary">{call.cuota.label}</h4>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{ background: cfg.color + "20", color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-ink-tertiary flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Plazo {call.cuota.plazo} · <span className="font-medium" style={{ color: cfg.color }}>
                      {call.label}
                    </span>
                  </p>
                </div>

                {/* Monto */}
                <div className="text-right shrink-0">
                  <p className="mono-num text-lg font-semibold tabular-nums text-ink-primary">
                    {fmtCLP(call.cuota.monto, { compact: true })}
                  </p>
                  <p className="text-[10px] text-ink-tertiary tabular-nums">
                    {call.cuota.acciones.toLocaleString("es-CL")} acc.
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action hint */}
        {overdue.length > 0 && (
          <div className="mt-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 leading-snug">
              <strong>Acción requerida:</strong> regularizar las {overdue.length} cuota
              {overdue.length === 1 ? "" : "s"} vencida{overdue.length === 1 ? "" : "s"} para destrabar
              líneas de financiamiento Sinosure / CATL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
