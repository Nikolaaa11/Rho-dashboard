"use client";

import { useMemo } from "react";
import {
  fmtCLP,
  fmtMM,
  analizarCuotasAdenda,
  ADENDA_N2_METADATA,
  TOTAL_APORTE_FIP_CLP,
  PLAN_USO_CUOTAS_PENDIENTES,
  projectMeta,
  CuotaConEstado,
  EstadoCuota,
} from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  Shield,
  TrendingDown,
} from "lucide-react";

export default function DesembolsosView() {
  const cuotas = useMemo(() => analizarCuotasAdenda(), []);

  const totalPagado = cuotas.reduce((a, b) => a + b.pagado, 0);
  const totalPlan = cuotas.reduce((a, b) => a + b.monto, 0);
  const totalEjecutado = cuotas.reduce((a, b) => a + b.ejecutado, 0);
  const cuotasVencidas = cuotas.filter((c) => c.estado === "Vencida");
  const cuotasPagadas = cuotas.filter((c) => c.estado === "Pagada");
  const montoVencido = cuotasVencidas.reduce((a, b) => a + b.monto, 0);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Plan de capital · Adenda N°2"
          title="El calendario contractual de pagos."
          subtitle="Plan de seis cuotas establecido en la Adenda N°2 al Contrato de Suscripción de Acciones, firmada ante notario el 27 de octubre de 2025."
        />

        {/* Resumen contractual */}
        <div className="card-elevated p-8 md:p-10 mb-10 relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rho-medium/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="relative">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rho-ultralight flex items-center justify-center text-rho-dark shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="stat-label mb-1">Documento contractual</p>
                <h3 className="text-2xl font-semibold">Adenda N°2 — Contrato de Suscripción de Acciones</h3>
                <p className="text-sm text-ink-tertiary mt-1">
                  Firmada el 27 de octubre de 2025 ante el Notario Público Sr. Juan Ricardo San Martín
                  Urrejola · Código de verificación {ADENDA_N2_METADATA.codigoVerificacion}
                </p>
                <a
                  href="/docs/Adenda_N2_RHO_FIP_CEHTA.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-rho-dark hover:text-rho-medium font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Ver documento original (PDF)
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <DesembolsoKpi
                label="Plan total contractual"
                value={fmtCLP(TOTAL_APORTE_FIP_CLP)}
                sub={`${ADENDA_N2_METADATA.accionesTotales.toLocaleString("es-CL")} acciones · 85% sociedad`}
              />
              <DesembolsoKpi
                label="Pagado al banco"
                value={fmtCLP(totalPagado)}
                sub={`${((totalPagado / TOTAL_APORTE_FIP_CLP) * 100).toFixed(1)}% del plan · ${cuotasPagadas.length} cuotas`}
                accent
              />
              <DesembolsoKpi
                label="Pendiente con plazo vencido"
                value={fmtCLP(montoVencido)}
                sub={`${cuotasVencidas.length} cuotas vencidas`}
                warning
              />
              <DesembolsoKpi
                label="Capital ya ejecutado"
                value={fmtCLP(totalEjecutado)}
                sub={`${((totalEjecutado / totalPagado) * 100).toFixed(1)}% del aportado`}
              />
            </div>

            {/* Barra visual */}
            <div className="mt-8 space-y-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink-tertiary">Avance del plan contractual</span>
                <span className="font-medium tabular-nums">
                  {((totalPagado / TOTAL_APORTE_FIP_CLP) * 100).toFixed(1)}% pagado
                </span>
              </div>
              <div className="h-4 bg-surface-tertiary rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-rho-medium to-rho-dark transition-all duration-1000"
                  style={{ width: `${(totalPagado / TOTAL_APORTE_FIP_CLP) * 100}%` }}
                />
                <div
                  className="bg-red-400/60 transition-all duration-1000"
                  style={{ width: `${(montoVencido / TOTAL_APORTE_FIP_CLP) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-ink-tertiary">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rho-dark" /> Pagado al banco
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> Vencido sin pagar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Las 6 cuotas */}
        <h3 className="text-2xl font-semibold tracking-tight mb-2">Calendario de las seis cuotas</h3>
        <p className="text-ink-secondary mb-6 max-w-3xl">
          Cada cuota tiene su plazo contractual establecido en la cláusula Tercero modificada por la Adenda N°2.
        </p>
        <div className="space-y-3 mb-12">
          {cuotas.map((c, i) => (
            <CuotaCard key={c.id} cuota={c} idx={i} isLast={i === cuotas.length - 1} />
          ))}
        </div>

        {/* Gráfico comparativo */}
        <div className="card-elevated p-8 mb-12">
          <h3 className="text-xl font-semibold mb-1">Pagos al banco vs. monto contractual</h3>
          <p className="text-sm text-ink-tertiary mb-6">
            Comparación entre lo que el FIP CEHTA debe aportar según la Adenda y lo efectivamente pagado.
          </p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={cuotas.map((c) => ({
                label: `${c.letra} ${c.plazo}`,
                "Plan contractual": c.monto,
                "Pagado al banco": c.pagado,
                estado: c.estado,
              }))}
              margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
              barGap={4}
            >
              <CartesianGrid stroke="#F5F5F7" vertical={false} />
              <XAxis dataKey="label" stroke="#86868B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#86868B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmtCLP(v, { compact: true })}
              />
              <Tooltip formatter={(v: number) => fmtCLP(v)} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="Plan contractual" fill="#D2D2D7" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Pagado al banco" radius={[6, 6, 0, 0]}>
                {cuotas.map((c, i) => (
                  <Cell
                    key={i}
                    fill={
                      c.estado === "Pagada"
                        ? "#3C8B3C"
                        : c.estado === "Pagada parcial"
                        ? "#FBBF24"
                        : c.estado === "Vencida"
                        ? "#EF4444"
                        : "#A8DBA8"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan de uso para las cuotas vencidas */}
        {cuotasVencidas.length > 0 && (
          <div className="card-elevated p-8 md:p-10 bg-gradient-to-br from-white via-rho-ultralight/20 to-white mb-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rho-dark text-white flex items-center justify-center shrink-0">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="stat-label mb-1">Acción requerida</p>
                <h3 className="text-3xl md:text-4xl font-semibold tracking-tightest">
                  {fmtCLP(montoVencido)} en {cuotasVencidas.length} cuotas vencidas
                </h3>
                <p className="text-ink-secondary mt-2 max-w-3xl">
                  Las cuotas{" "}
                  {cuotasVencidas.map((c, i) => (
                    <span key={c.id}>
                      <strong>{c.letra}</strong> ({c.plazo})
                      {i < cuotasVencidas.length - 1
                        ? cuotasVencidas.length > 2 && i === cuotasVencidas.length - 2
                          ? " y "
                          : ", "
                        : ""}
                    </span>
                  ))}{" "}
                  ya tienen plazo cumplido según el calendario notarial pero aún no han sido efectuadas.
                  Al regularizarse, el capital se asignará a los siguientes usos:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <div>
                <h4 className="font-semibold mb-4">Distribución propuesta del uso de fondos</h4>
                <div className="space-y-3">
                  {PLAN_USO_CUOTAS_PENDIENTES.map((u, i) => {
                    const monto = (montoVencido * u.porcentaje) / 100;
                    const nombreProyecto =
                      u.proyecto === "Pipeline desarrollo"
                        ? "Pipeline de desarrollo"
                        : u.proyecto === "Estructura"
                        ? "Estructura corporativa"
                        : projectMeta(u.proyecto).nombre;
                    return (
                      <div key={i} className="bg-white rounded-2xl p-4 border border-ink-quaternary/40">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="font-medium text-ink-primary">{nombreProyecto}</span>
                          <div className="text-right">
                            <span className="font-semibold tabular-nums">{fmtCLP(monto, { compact: true })}</span>
                            <span className="text-xs text-ink-tertiary ml-2">{u.porcentaje}%</span>
                          </div>
                        </div>
                        <p className="text-sm text-ink-secondary mb-2.5">{u.descripcion}</p>
                        <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rho-medium to-rho-dark"
                            style={{ width: `${u.porcentaje}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={PLAN_USO_CUOTAS_PENDIENTES.map((u) => ({
                        name:
                          u.proyecto === "Pipeline desarrollo"
                            ? "Pipeline"
                            : u.proyecto === "Estructura"
                            ? "Estructura"
                            : projectMeta(u.proyecto).nombre,
                        value: (montoVencido * u.porcentaje) / 100,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={3}
                    >
                      {["#1A4A1A", "#3C8B3C", "#6DBE6D", "#A8DBA8"].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtCLP(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
                  {PLAN_USO_CUOTAS_PENDIENTES.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: ["#1A4A1A", "#3C8B3C", "#6DBE6D", "#A8DBA8"][i] }}
                      />
                      <span className="text-ink-secondary">
                        {u.proyecto === "Pipeline desarrollo"
                          ? "Pipeline"
                          : u.proyecto === "Estructura"
                          ? "Estructura"
                          : projectMeta(u.proyecto).nombre}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bloqueo / justificación */}
        <div className="card-elevated p-8 border-l-4 border-amber-400">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-3">¿Por qué importan estas cuotas pendientes?</h3>
              <p className="text-ink-secondary leading-relaxed mb-4">
                El capital comprometido debe figurar como{" "}
                <span className="font-semibold text-ink-primary">efectivamente pagado</span> en el
                balance de Rho Generación SpA —no solo comprometido mediante cartas de respaldo— antes
                de que <span className="font-medium">Sinosure, Jinko y los bancos (Santander, BCI)</span>{" "}
                confirmen las líneas de crédito y garantías que destrabarán los proyectos en
                construcción.
              </p>
              <p className="text-ink-secondary leading-relaxed">
                Sin las cuotas pendientes, no hay equity para Panimávida (construcción Q2 2026) ni para
                la estructura de San Expedito (BESS 90 MW). Su ejecución es el último paso financiero
                antes de pasar a la fase de obras.
              </p>
            </div>
          </div>
        </div>

        {/* Pie con info legal */}
        <p className="text-xs text-ink-tertiary mt-8 text-center max-w-2xl mx-auto">
          Fuente: Adenda N°2 al Contrato de Suscripción de Acciones entre RHO GENERACIÓN SpA (RUT 77.931.386-7)
          y FONDO DE INVERSIÓN PRIVADO CEHTA ESG (RUT 77.751.766-K), suscrita el 27 de octubre de 2025.
        </p>
      </div>
    </section>
  );
}

function CuotaCard({ cuota, idx, isLast }: { cuota: CuotaConEstado; idx: number; isLast: boolean }) {
  const ringClass = estadoRingClass(cuota.estado);
  return (
    <div className="relative animate-fade-in" style={{ animationDelay: `${idx * 0.06}s` }}>
      <div className={`card-elevated p-6 md:p-7 ${ringClass}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Letra + estado */}
          <div className="flex items-center gap-4 md:w-52 shrink-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                cuota.estado === "Pagada"
                  ? "bg-rho-ultralight text-rho-dark"
                  : cuota.estado === "Vencida"
                  ? "bg-red-100 text-red-600"
                  : cuota.estado === "Pagada parcial"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {cuota.estado === "Pagada" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : cuota.estado === "Vencida" ? (
                <AlertCircle className="w-6 h-6" />
              ) : cuota.estado === "Pagada parcial" ? (
                <Clock className="w-6 h-6" />
              ) : (
                <Calendar className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-xs text-rho-medium font-medium uppercase tracking-wide">Cuota {cuota.letra}</p>
              <p className="text-lg font-semibold leading-tight">{cuota.label}</p>
              <p className="text-xs text-ink-tertiary">Plazo: {cuota.plazo}</p>
            </div>
          </div>

          {/* Pill estado */}
          <div className="md:w-36 shrink-0">
            <EstadoPill estado={cuota.estado} />
          </div>

          {/* Montos */}
          <div className="grid grid-cols-3 gap-6 flex-1">
            <div>
              <p className="stat-label mb-1">Plan</p>
              <p className="text-lg font-semibold tabular-nums">{fmtCLP(cuota.monto)}</p>
              <p className="text-xs text-ink-tertiary">{cuota.acciones.toLocaleString("es-CL")} acc.</p>
            </div>
            <div>
              <p className="stat-label mb-1">Pagado</p>
              <p
                className={`text-lg font-semibold tabular-nums ${
                  cuota.pagado >= cuota.monto * 0.98
                    ? "text-rho-dark"
                    : cuota.pagado > 0
                    ? "text-amber-700"
                    : "text-ink-tertiary"
                }`}
              >
                {cuota.pagado > 0 ? fmtCLP(cuota.pagado) : "—"}
              </p>
              {cuota.fechaPagoUltima && (
                <p className="text-xs text-ink-tertiary">Último: {formatShortDate(cuota.fechaPagoUltima)}</p>
              )}
            </div>
            <div>
              <p className="stat-label mb-1">Ejecutado</p>
              <p className="text-lg font-semibold tabular-nums">
                {cuota.ejecutado > 0 ? fmtCLP(cuota.ejecutado) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de avance del pago */}
        {cuota.pagado > 0 && (
          <div className="mt-5 pt-5 border-t border-ink-quaternary/40">
            <div className="flex items-baseline justify-between text-xs mb-1.5">
              <span className="text-ink-tertiary">Pago vs. monto contractual</span>
              <span className="tabular-nums font-medium">{cuota.pctPago.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rho-medium to-rho-dark"
                style={{ width: `${Math.min(100, cuota.pctPago)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="w-px h-4 bg-ink-quaternary" />
        </div>
      )}
    </div>
  );
}

function EstadoPill({ estado }: { estado: EstadoCuota }) {
  const map: Record<EstadoCuota, string> = {
    Pagada: "pill-green",
    "Pagada parcial": "bg-amber-100 text-amber-800",
    Vencida: "bg-red-100 text-red-700",
    Próxima: "pill-neutral",
  };
  return <span className={`pill ${map[estado]}`}>{estado}</span>;
}

function estadoRingClass(estado: EstadoCuota): string {
  if (estado === "Vencida") return "ring-2 ring-red-300/60 bg-red-50/30";
  if (estado === "Pagada parcial") return "ring-2 ring-amber-300/60";
  return "";
}

function DesembolsoKpi({
  label,
  value,
  sub,
  accent,
  warning,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div>
      <p className="stat-label mb-2">{label}</p>
      <p
        className={`text-2xl md:text-3xl font-semibold tabular-nums ${
          accent ? "text-rho-dark" : warning ? "text-red-600" : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-sm text-ink-tertiary mt-1">{sub}</p>}
    </div>
  );
}

function formatShortDate(s: string) {
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
