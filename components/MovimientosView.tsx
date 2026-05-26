"use client";

import { useMemo, useState } from "react";
import { dataset, fmtCLP, fmtDate } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import { Search, ExternalLink, Download } from "lucide-react";

export default function MovimientosView() {
  const movs = dataset.movimientos;
  const [q, setQ] = useState("");
  const [general, setGeneral] = useState("Todos");
  const [centro, setCentro] = useState("Todos");
  const [hito, setHito] = useState("Todos");
  const [cuenta, setCuenta] = useState("Todos");
  const [soloDev, setSoloDev] = useState(false);
  const [page, setPage] = useState(0);
  const perPage = 50;

  const generales = useMemo(
    () => ["Todos", ...Array.from(new Set(movs.map((m) => m.General).filter(Boolean))).sort()],
    [movs]
  );
  const centros = useMemo(
    () => ["Todos", ...Array.from(new Set(movs.map((m) => m.Centro_Negocios).filter(Boolean))).sort()],
    [movs]
  );
  const hitos = useMemo(
    () => ["Todos", ...Array.from(new Set(movs.map((m) => m.Aporte_K).filter(Boolean))).sort()],
    [movs]
  );
  const cuentas = useMemo(
    () => ["Todos", ...Array.from(new Set(movs.map((m) => m.Cuenta).filter(Boolean) as string[])).sort()],
    [movs]
  );

  const filtered = useMemo(() => {
    return movs.filter((m) => {
      if (general !== "Todos" && m.General !== general) return false;
      if (centro !== "Todos" && m.Centro_Negocios !== centro) return false;
      if (hito !== "Todos" && m.Aporte_K !== hito) return false;
      if (cuenta !== "Todos" && (m.Cuenta || "Santander") !== cuenta) return false;
      if (soloDev && !m.esDevolucion) return false;
      if (q) {
        const text = `${m.DESCRIPCION} ${m.Nombre} ${m.Especifico}`.toLowerCase();
        if (!text.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [movs, q, general, centro, hito, cuenta, soloDev]);

  const slice = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const downloadCSV = () => {
    const headers = ["Fecha", "Banco", "Nombre", "Descripción", "Abonos", "Egreso", "Saldo", "General", "Detallado", "Específico", "Centro", "Hito", "EsDevolucion"];
    const rows = filtered.map((m) => [
      m.FECHA_STR,
      m.Cuenta || "Santander",
      m.Nombre,
      m.DESCRIPCION.replace(/[\n\r,]/g, " "),
      m.ABONOS,
      m.EGRESO,
      m.SALDO,
      m.General,
      m.Detallado,
      m.Especifico,
      m.Centro_Negocios,
      m.Aporte_K,
      m.esDevolucion ? "SI" : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movimientos_rho_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-16 md:py-24 bg-surface-secondary/60">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Trazabilidad"
          title="Cada movimiento, auditado."
          subtitle="Registro completo de la cuenta corriente Santander con clasificación contable y enlaces a documentación de respaldo."
        />

        <div className="card-elevated p-6 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
              <input
                type="text"
                placeholder="Buscar por descripción, proveedor o detalle..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-tertiary text-sm border-none focus:outline-none focus:ring-2 focus:ring-rho-medium/40"
              />
            </div>
            <Select label="Categoría" value={general} onChange={(v) => { setGeneral(v); setPage(0); }} options={generales} />
            <Select label="Centro" value={centro} onChange={(v) => { setCentro(v); setPage(0); }} options={centros} />
            <Select label="Hito" value={hito} onChange={(v) => { setHito(v); setPage(0); }} options={hitos} />
            <Select label="Banco" value={cuenta} onChange={(v) => { setCuenta(v); setPage(0); }} options={cuentas} />
            <label className="flex items-center gap-2 text-xs text-ink-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={soloDev}
                onChange={(e) => { setSoloDev(e.target.checked); setPage(0); }}
                className="rounded"
              />
              Solo devoluciones
            </label>
            <button onClick={downloadCSV} className="btn-ghost shrink-0">
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
          <p className="text-xs text-ink-tertiary">
            Mostrando {slice.length} de {filtered.length} movimientos · Total egreso filtrado:{" "}
            <span className="font-semibold text-ink-primary tabular-nums">
              {fmtCLP(filtered.reduce((a, b) => a + (b.EGRESO || 0), 0))}
            </span>
          </p>
        </div>

        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-tertiary sticky top-0 z-10">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-ink-secondary">Fecha</th>
                  <th className="px-4 py-3 font-medium text-ink-secondary">Banco</th>
                  <th className="px-4 py-3 font-medium text-ink-secondary">Descripción</th>
                  <th className="px-4 py-3 font-medium text-ink-secondary">Centro</th>
                  <th className="px-4 py-3 font-medium text-ink-secondary">Categoría</th>
                  <th className="px-4 py-3 font-medium text-ink-secondary text-right">Abono</th>
                  <th className="px-4 py-3 font-medium text-ink-secondary text-right">Egreso</th>
                  <th className="px-4 py-3 font-medium text-ink-secondary text-right">Saldo</th>
                  <th className="px-4 py-3 font-medium text-ink-secondary">Doc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-quaternary/40">
                {slice.map((m, i) => {
                  const banco = m.Cuenta || "Santander";
                  const bancoColor = banco === "BICE"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800";
                  return (
                  <tr key={i} className={`hover:bg-surface-tertiary/50 ${m.esDevolucion ? "bg-emerald-50/30" : ""}`}>
                    <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{fmtDate(m.FECHA_STR)}</td>
                    <td className="px-4 py-3">
                      <span className={`pill text-[10px] ${bancoColor}`}>{banco}</span>
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <div className="truncate flex items-center gap-2" title={m.DESCRIPCION}>
                        {m.esDevolucion && (
                          <span className="pill pill-positive text-[10px] shrink-0">↩ Devol.</span>
                        )}
                        <span className="truncate">{m.DESCRIPCION || m.Nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {m.Centro_Negocios && (
                        <span className="pill pill-neutral">{m.Centro_Negocios}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-secondary whitespace-nowrap">
                      {m.General && (
                        <span className="text-ink-primary font-medium">
                          {m.General.replace(/_/g, " ")}
                        </span>
                      )}
                      {m.Detallado && (
                        <span className="text-ink-tertiary"> · {m.Detallado.replace(/_/g, " ")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-rho-dark">
                      {m.ABONOS > 0 ? fmtCLP(m.ABONOS) : ""}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {m.EGRESO > 0 ? fmtCLP(m.EGRESO) : ""}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-tertiary">
                      {fmtCLP(m.SALDO)}
                    </td>
                    <td className="px-4 py-3">
                      {m.LINK && m.LINK.startsWith("http") && (
                        <a
                          href={m.LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rho-medium hover:text-rho-dark"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-ink-quaternary/40">
              <p className="text-xs text-ink-tertiary">
                Página {page + 1} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-ghost disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-ghost disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-tertiary uppercase tracking-wide">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-full bg-surface-tertiary text-sm font-medium border-none focus:outline-none focus:ring-2 focus:ring-rho-medium/40 max-w-[180px]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || "—"}
          </option>
        ))}
      </select>
    </div>
  );
}
