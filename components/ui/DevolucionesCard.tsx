"use client";

import { fmtCLP } from "@/lib/data";
import { listarDevoluciones, devolucionesAgregadas } from "@/lib/derived";
import { RotateCcw, ArrowDownLeft } from "lucide-react";

/**
 * Card con resumen de devoluciones (abonos que volvieron desde proyectos).
 * Útil en CartaView, BancaView, ProyectosView.
 */
export default function DevolucionesCard({ compact = false }: { compact?: boolean }) {
  const devs = listarDevoluciones();
  const agg = devolucionesAgregadas();
  const total = devs.reduce((a, d) => a + d.monto, 0);

  if (devs.length === 0) return null;

  return (
    <div className="card-elevated p-6 md:p-7">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.12em] font-medium text-emerald-700">
              Devoluciones recibidas
            </p>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-ink-primary">
            Capital que volvió desde proyectos
          </h3>
          <p className="text-sm text-ink-tertiary mt-1">
            Boletas de garantía liberadas, reembolsos y excedentes recuperados del portafolio. Reduce la
            inversión neta del proyecto correspondiente.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium">Total</p>
          <p className="mono-num text-2xl font-semibold text-emerald-700">
            {fmtCLP(total, { compact: true })}
          </p>
          <p className="text-[11px] text-ink-tertiary">{devs.length} devoluciones</p>
        </div>
      </div>

      {/* Por proyecto */}
      <div className="space-y-2 mb-5">
        {agg.map((a, i) => {
          const max = agg[0]?.total || 1;
          const pct = (a.total / max) * 100;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-sm font-medium text-ink-primary truncate">
                {a.proyectoNombre}
              </span>
              <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-32 text-right mono-num text-sm font-semibold text-emerald-700 shrink-0">
                {fmtCLP(a.total, { compact: true })}
              </span>
              <span className="w-10 text-right text-[10px] text-ink-tertiary tabular-nums shrink-0">
                {a.count}×
              </span>
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="pt-5 border-t border-ink-quaternary/40">
          <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium mb-2.5">
            Detalle cronológico
          </p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {devs.map((d, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-tertiary transition"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-primary truncate">{d.descripcion}</p>
                  <p className="text-[11px] text-ink-tertiary">
                    {formatShortDate(d.fecha)} · {d.proyectoNombre} · CC {d.cuenta}
                  </p>
                </div>
                <span className="mono-num text-sm font-semibold text-emerald-700 shrink-0">
                  +{fmtCLP(d.monto, { compact: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatShortDate(s: string): string {
  if (!s) return "—";
  try {
    return new Date(s + "T12:00:00").toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  } catch {
    return s;
  }
}
