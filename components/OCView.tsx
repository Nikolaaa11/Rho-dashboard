"use client";

import { useMemo, useState } from "react";
import { dataset, fmtCLP, sum } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import { Search, Download } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function OCView() {
  const ocs = dataset.oc;
  const [q, setQ] = useState("");
  const [proyecto, setProyecto] = useState("Todos");

  const proyectos = useMemo(
    () => ["Todos", ...Array.from(new Set(ocs.map((o) => o.Proyecto).filter(Boolean))).sort()],
    [ocs]
  );

  const filtered = useMemo(() => {
    return ocs.filter((o) => {
      if (proyecto !== "Todos" && o.Proyecto !== proyecto) return false;
      if (q) {
        const text = `${o.NumOC} ${o.Proveedor} ${o.Descripcion}`.toLowerCase();
        if (!text.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [ocs, q, proyecto]);

  const totalPorPagar = sum(filtered, (o) => o.PorPagar);
  const totalPagado = sum(filtered, (o) => o.Pagado);
  const totalPend = sum(filtered, (o) => o.PendPago);

  const porProveedor = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of filtered) {
      map[o.Proveedor] = (map[o.Proveedor] || 0) + o.Pagado;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  const downloadCSV = () => {
    const headers = ["N° OC", "Proyecto", "Proveedor", "Descripción", "Por Pagar", "Pagado", "Pendiente"];
    const rows = filtered.map((o) => [
      o.NumOC,
      o.Proyecto,
      o.Proveedor,
      o.Descripcion.replace(/[\n\r,]/g, " "),
      o.PorPagar,
      o.Pagado,
      o.PendPago,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oc_rho_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ["#1A4A1A", "#3C8B3C", "#6DBE6D", "#A8DBA8", "#5B8C5A", "#86C586", "#2E5D2E", "#C8E6C9"];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Compras y Proveedores"
          title="Órdenes de compra ejecutadas."
          subtitle="Cada OC emitida, su proveedor y el estado de pago. Trazabilidad completa para auditoría."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <KpiCard label="Total comprometido" value={fmtCLP(totalPorPagar)} sub={`${filtered.length} órdenes`} />
          <KpiCard label="Pagado" value={fmtCLP(totalPagado)} sub={`${((totalPagado / totalPorPagar) * 100).toFixed(1)}% del comprometido`} accent />
          <KpiCard label="Pendiente / Diferencia" value={fmtCLP(Math.abs(totalPend))} sub={totalPend < 0 ? "Sobrepago" : "Por pagar"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.5fr] gap-8 mb-10">
          <div className="card-elevated p-8">
            <h3 className="text-lg font-semibold mb-1">Top proveedores</h3>
            <p className="text-sm text-ink-tertiary mb-6">Por monto pagado</p>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={porProveedor}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {porProveedor.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmtCLP(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-4">
              {porProveedor.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="tabular-nums text-ink-secondary">{fmtCLP(p.value, { compact: true })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                <input
                  type="text"
                  placeholder="OC, proveedor, descripción..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-tertiary text-sm border-none focus:outline-none"
                />
              </div>
              <select
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value)}
                className="px-3 py-2.5 rounded-full bg-surface-tertiary text-sm font-medium border-none focus:outline-none"
              >
                {proyectos.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button onClick={downloadCSV} className="btn-ghost shrink-0">
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-tertiary sticky top-0">
                  <tr className="text-left">
                    <th className="px-3 py-3 font-medium text-ink-secondary">OC</th>
                    <th className="px-3 py-3 font-medium text-ink-secondary">Proyecto</th>
                    <th className="px-3 py-3 font-medium text-ink-secondary">Proveedor</th>
                    <th className="px-3 py-3 font-medium text-ink-secondary text-right">Por Pagar</th>
                    <th className="px-3 py-3 font-medium text-ink-secondary text-right">Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-quaternary/40">
                  {filtered.map((o, i) => (
                    <tr key={i} className="hover:bg-surface-tertiary/50">
                      <td className="px-3 py-3 font-medium">{o.NumOC}</td>
                      <td className="px-3 py-3 text-ink-secondary">
                        <span className="pill pill-neutral">{o.Proyecto}</span>
                      </td>
                      <td className="px-3 py-3 text-ink-secondary truncate max-w-[180px]" title={o.Proveedor}>
                        {o.Proveedor}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtCLP(o.PorPagar)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-rho-dark font-medium">
                        {fmtCLP(o.Pagado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`card p-6 ${accent ? "bg-rho-ultralight/40" : ""}`}>
      <p className="stat-label mb-2">{label}</p>
      <p className={`text-3xl font-semibold tabular-nums mb-1 ${accent ? "text-rho-dark" : ""}`}>{value}</p>
      <p className="text-sm text-ink-tertiary">{sub}</p>
    </div>
  );
}
