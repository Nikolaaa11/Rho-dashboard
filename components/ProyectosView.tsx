"use client";

import { useMemo, useState } from "react";
import {
  fmtCLP,
  fmtMM,
  sum,
  isOperativo,
  analyzeProject,
  PROYECTOS,
  ProjectAnalytics,
  movimientosHistoricos,
  dataset,
} from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  MapPin,
  Zap,
  Calendar,
  Building2,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const CAT_COLORS: Record<string, string> = {
  Desarrollo_Proyecto: "#1A4A1A",
  RRHH: "#3C8B3C",
  Administración: "#6DBE6D",
  Operación: "#A8DBA8",
  Préstamos: "#86868B",
  Fondos_Mutuos: "#C8C8CD",
  Reversa: "#E5E5EA",
  Capital: "#5B8C5A",
  Ventas: "#2E5D2E",
};

const ETAPA_COLORS: Record<string, string> = {
  Construcción: "bg-amber-100 text-amber-800",
  "Pre-construcción": "bg-blue-100 text-blue-800",
  Pipeline: "bg-rho-ultralight text-rho-dark",
  Discontinuado: "bg-gray-100 text-gray-500",
  Estructura: "bg-purple-100 text-purple-800",
};

export default function ProyectosView() {
  const movs = movimientosHistoricos();
  const ocs = dataset.oc;

  // Analytics por proyecto
  const proyectos = useMemo(() => {
    const centros = Array.from(new Set(movs.map((m) => m.Centro_Negocios).filter(Boolean)));
    return centros
      .filter((c) => c !== "Reversa")
      .map((c) => analyzeProject(c, movs, ocs))
      .sort((a, b) => b.totalEjecutado - a.totalEjecutado);
  }, [movs, ocs]);

  const totalGeneral = proyectos.reduce((a, b) => a + b.totalEjecutado, 0);
  const totalOcComp = proyectos.reduce((a, b) => a + b.ocComprometido, 0);
  const totalOcPag = proyectos.reduce((a, b) => a + b.ocPagado, 0);

  // Distribución por etapa
  const porEtapa = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of proyectos) {
      map[p.meta.etapa] = (map[p.meta.etapa] || 0) + p.totalEjecutado;
    }
    return Object.entries(map).map(([etapa, valor]) => ({ etapa, valor }));
  }, [proyectos]);

  const [selected, setSelected] = useState<string>(proyectos[0]?.centro ?? "");
  const sel = proyectos.find((p) => p.centro === selected) ?? proyectos[0];

  return (
    <section className="py-16 md:py-24 bg-surface-secondary/60">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="El portafolio"
          title="Cada proyecto. Cada peso. Trazable."
          subtitle="Selecciona un proyecto para ver su ficha completa: capital ejecutado, categorías de gasto, evolución mensual, proveedores y órdenes de compra."
        />

        {/* Resumen del portafolio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <PortfolioKpi
            label="Ejecutado en proyectos"
            value={fmtMM(totalGeneral)}
            sub={`${proyectos.length} centros de negocio activos`}
          />
          <PortfolioKpi
            label="Comprometido vía OC"
            value={fmtMM(totalOcComp)}
            sub={`${ocs.length} órdenes de compra emitidas`}
          />
          <PortfolioKpi
            label="Pagado a proveedores"
            value={fmtMM(totalOcPag)}
            sub={`${((totalOcPag / totalOcComp) * 100).toFixed(1)}% del comprometido`}
            accent
          />
        </div>

        {/* Grid de tarjetas resumen — 1 por proyecto */}
        <h3 className="text-2xl font-semibold tracking-tight mb-5">Proyectos del portafolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {proyectos.map((p, i) => (
            <ProjectCard
              key={p.centro}
              p={p}
              total={totalGeneral}
              isSelected={sel?.centro === p.centro}
              onClick={() => setSelected(p.centro)}
              idx={i}
            />
          ))}
        </div>

        {/* Ficha detallada del proyecto seleccionado */}
        {sel && (
          <div className="space-y-8" key={sel.centro}>
            <div className="divider" />
            <div className="animate-fade-in">
              <p className="text-sm font-medium text-rho-medium uppercase tracking-[0.12em] mb-3">
                Ficha de proyecto
              </p>
              <h3 className="h-section mb-2">{sel.meta.nombre}</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`pill ${ETAPA_COLORS[sel.meta.etapa] || "pill-neutral"}`}>
                  {sel.meta.etapa}
                </span>
                <span className="pill pill-neutral">{sel.meta.codigo}</span>
                {sel.meta.tecnologia !== "—" && (
                  <span className="pill pill-neutral">{sel.meta.tecnologia}</span>
                )}
              </div>
              <p className="mt-4 text-lg text-ink-secondary max-w-3xl leading-snug">
                {sel.meta.descripcion}
              </p>
            </div>

            {/* Datos clave del proyecto */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ProjectInfoStat
                icon={<Zap className="w-4 h-4" />}
                label="Capacidad"
                value={sel.meta.capacidad}
              />
              <ProjectInfoStat
                icon={<MapPin className="w-4 h-4" />}
                label="Ubicación"
                value={sel.meta.ubicacion}
              />
              <ProjectInfoStat
                icon={<Calendar className="w-4 h-4" />}
                label="COD esperado"
                value={sel.meta.cod}
              />
              <ProjectInfoStat
                icon={<Building2 className="w-4 h-4" />}
                label="Órdenes de compra"
                value={`${sel.ocs.length}`}
              />
            </div>

            {/* KPIs financieros del proyecto */}
            <div className="card-elevated p-8">
              <h4 className="text-lg font-semibold mb-6">Capital ejecutado en este proyecto</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <FinKpi label="Total ejecutado" value={fmtCLP(sel.totalEjecutado)} accent />
                <FinKpi label="% del portafolio" value={`${((sel.totalEjecutado / totalGeneral) * 100).toFixed(1)}%`} />
                <FinKpi label="Comprometido OC" value={fmtCLP(sel.ocComprometido)} />
                <FinKpi label="Pagado vía OC" value={fmtCLP(sel.ocPagado)} />
              </div>
              <div className="mt-6 pt-6 border-t border-ink-quaternary/40 grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-ink-tertiary uppercase text-xs tracking-wide mb-1">Movimientos</p>
                  <p className="font-medium">{sel.movs.length} transacciones</p>
                </div>
                <div>
                  <p className="text-ink-tertiary uppercase text-xs tracking-wide mb-1">Primer gasto</p>
                  <p className="font-medium">{formatDate(sel.primerGasto)}</p>
                </div>
                <div>
                  <p className="text-ink-tertiary uppercase text-xs tracking-wide mb-1">Último gasto</p>
                  <p className="font-medium">{formatDate(sel.ultimoGasto)}</p>
                </div>
              </div>
            </div>

            {/* Highlights del proyecto */}
            {sel.meta.highlights.length > 0 && (
              <div className="card-elevated p-8">
                <h4 className="text-lg font-semibold mb-5">Hitos del proyecto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sel.meta.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-rho-medium shrink-0 mt-0.5" />
                      <span className="text-ink-primary">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Breakdown por categoría + evolución mensual lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-elevated p-8">
                <h4 className="text-lg font-semibold mb-1">¿En qué se gastó?</h4>
                <p className="text-sm text-ink-tertiary mb-6">
                  Distribución del gasto por tipo de actividad.
                </p>
                {sel.porCategoria.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.min(400, sel.porCategoria.length * 36 + 50)}>
                    <BarChart
                      data={sel.porCategoria.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid stroke="#F5F5F7" horizontal={false} />
                      <XAxis
                        type="number"
                        stroke="#86868B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => fmtCLP(v, { compact: true })}
                      />
                      <YAxis
                        type="category"
                        dataKey="subcat"
                        stroke="#86868B"
                        fontSize={12}
                        width={160}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: string) => (v || "—").replace(/_/g, " ")}
                      />
                      <Tooltip
                        formatter={(v: number) => fmtCLP(v)}
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                      />
                      <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
                        {sel.porCategoria.slice(0, 10).map((c, i) => (
                          <Cell key={i} fill={CAT_COLORS[c.categoria] || "#3C8B3C"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-ink-tertiary py-8 text-center">Sin gastos registrados.</p>
                )}
              </div>

              <div className="card-elevated p-8">
                <h4 className="text-lg font-semibold mb-1">Evolución mensual del gasto</h4>
                <p className="text-sm text-ink-tertiary mb-6">
                  Cuándo se invirtió. Identifica picos y meses de actividad.
                </p>
                {sel.mensual.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={sel.mensual} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id={`grad-${sel.centro}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3C8B3C" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#3C8B3C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#F5F5F7" vertical={false} />
                      <XAxis
                        dataKey="mes"
                        stroke="#86868B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#86868B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => fmtCLP(v, { compact: true })}
                      />
                      <Tooltip formatter={(v: number) => fmtCLP(v)} />
                      <Area
                        type="monotone"
                        dataKey="valor"
                        stroke="#1A4A1A"
                        strokeWidth={2.5}
                        fill={`url(#grad-${sel.centro})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-ink-tertiary py-8 text-center">Sin movimientos mensuales.</p>
                )}
              </div>
            </div>

            {/* Top proveedores */}
            {sel.proveedores.length > 0 && (
              <div className="card-elevated p-8">
                <h4 className="text-lg font-semibold mb-1">Top proveedores</h4>
                <p className="text-sm text-ink-tertiary mb-6">
                  A quién se le pagó dentro de este proyecto (por monto facturado).
                </p>
                <div className="space-y-3">
                  {sel.proveedores.slice(0, 8).map((p, i) => {
                    const max = sel.proveedores[0].valor;
                    const pct = max > 0 ? (p.valor / max) * 100 : 0;
                    return (
                      <div key={i}>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-sm font-medium text-ink-primary">{p.proveedor}</span>
                          <span className="text-sm tabular-nums text-ink-secondary">
                            {fmtCLP(p.valor)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rho-medium to-rho-dark"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tabla de OC del proyecto */}
            {sel.ocs.length > 0 && (
              <div className="card-elevated p-8">
                <h4 className="text-lg font-semibold mb-1">Órdenes de compra del proyecto</h4>
                <p className="text-sm text-ink-tertiary mb-6">
                  Detalle de cada OC con su estado de pago.
                </p>
                <div className="overflow-x-auto rounded-2xl border border-ink-quaternary/40">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-tertiary">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-medium text-ink-secondary">OC</th>
                        <th className="px-4 py-3 font-medium text-ink-secondary">Proveedor</th>
                        <th className="px-4 py-3 font-medium text-ink-secondary">Descripción</th>
                        <th className="px-4 py-3 font-medium text-ink-secondary text-right">Monto</th>
                        <th className="px-4 py-3 font-medium text-ink-secondary text-right">Pagado</th>
                        <th className="px-4 py-3 font-medium text-ink-secondary">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-quaternary/40">
                      {sel.ocs.map((o, i) => {
                        const fullPaid = o.Pagado >= o.PorPagar;
                        const noPaid = o.Pagado === 0;
                        return (
                          <tr key={i} className="hover:bg-surface-tertiary/40">
                            <td className="px-4 py-3 font-medium text-ink-primary">{o.NumOC}</td>
                            <td className="px-4 py-3 text-ink-secondary">{o.Proveedor}</td>
                            <td className="px-4 py-3 text-ink-secondary">{o.Descripcion}</td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {fmtCLP(o.PorPagar)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-rho-dark font-medium">
                              {fmtCLP(o.Pagado)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`pill ${
                                  fullPaid
                                    ? "pill-green"
                                    : noPaid
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {fullPaid ? "Pagada" : noPaid ? "Pendiente" : "Parcial"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({
  p,
  total,
  isSelected,
  onClick,
  idx,
}: {
  p: ProjectAnalytics;
  total: number;
  isSelected: boolean;
  onClick: () => void;
  idx: number;
}) {
  const pct = total > 0 ? (p.totalEjecutado / total) * 100 : 0;
  return (
    <button
      onClick={onClick}
      className={`text-left card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        isSelected ? "ring-2 ring-rho-medium" : ""
      }`}
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-primary truncate text-lg">{p.meta.nombre}</p>
          <p className="text-xs text-ink-tertiary">{p.meta.codigo}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-ink-quaternary shrink-0" />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className={`pill ${ETAPA_COLORS[p.meta.etapa] || "pill-neutral"}`}>
          {p.meta.etapa}
        </span>
        {p.meta.capacidad !== "—" && (
          <span className="pill pill-neutral">{p.meta.capacidad}</span>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-ink-tertiary uppercase tracking-wide mb-0.5">Ejecutado</p>
          <p className="text-2xl font-semibold tabular-nums">{fmtCLP(p.totalEjecutado, { compact: true })}</p>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-ink-tertiary">% del portafolio</span>
            <span className="tabular-nums font-medium">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rho-medium to-rho-dark transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-ink-tertiary">
          <span>{p.movs.length} movs · {p.ocs.length} OC</span>
          <span>{p.meta.cod}</span>
        </div>
      </div>
    </button>
  );
}

function PortfolioKpi({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className={`card p-6 ${accent ? "bg-rho-ultralight/40" : ""}`}>
      <p className="stat-label mb-2">{label}</p>
      <p className={`text-3xl font-semibold tabular-nums mb-1 ${accent ? "text-rho-dark" : ""}`}>
        {value}
      </p>
      <p className="text-sm text-ink-tertiary">{sub}</p>
    </div>
  );
}

function ProjectInfoStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-rho-ultralight flex items-center justify-center text-rho-dark shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-tertiary uppercase tracking-wide font-medium">{label}</p>
        <p className="font-medium text-ink-primary text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

function FinKpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="stat-label mb-1.5">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${accent ? "text-rho-dark" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function formatDate(s: string) {
  if (!s) return "—";
  try {
    return new Date(s + "T12:00:00").toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
}
