"use client";

import { fmtCLP, fmtMM, analizarCuotasAdenda, ADENDA_N2_METADATA } from "@/lib/data";
import {
  headlineKPIs,
  getESGSnapshot,
  getRiskSurface,
  inversionPorProyecto,
  ocSummary,
  listarDevoluciones,
  devolucionesAgregadas,
  saldosPorCuenta,
} from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import DevolucionesCard from "./ui/DevolucionesCard";
import {
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  Quote,
  Calendar,
  Zap,
  Building2,
  Sparkles,
} from "lucide-react";

export default function CartaView() {
  const k = headlineKPIs();
  const cuotas = analizarCuotasAdenda();
  const cuotasPagadas = cuotas.filter((c) => c.estado === "Pagada");
  const cuotasVencidas = cuotas.filter((c) => c.estado === "Vencida");
  const esg = getESGSnapshot();
  const risks = getRiskSurface();
  const inv = inversionPorProyecto();
  const oc = ocSummary();
  const devs = listarDevoluciones();
  const totalDev = devs.reduce((a, d) => a + d.monto, 0);
  const saldos = saldosPorCuenta();

  const topRisks = risks.filter((r) => r.severity === "high").slice(0, 3);

  return (
    <section className="py-12 md:py-20 bg-surface-secondary/40 print:bg-white print:py-0">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 print:px-0">
        <SectionHeader
          eyebrow="Carta al inversionista"
          title="Una página. Toda la historia."
          subtitle="Resumen ejecutivo con todo lo que un inversionista necesita saber sobre la operación, el capital y los próximos hitos. Optimizado para imprimir en A4."
          actions={
            <button
              onClick={() => window.print()}
              className="btn-primary"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar PDF
            </button>
          }
        />

        {/* === LETTER === */}
        <article className="card-elevated p-8 md:p-14 print:shadow-none print:border-0 print:p-0">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 pb-8 border-b border-ink-quaternary/40">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rho-medium mb-2">
                FIP CEHTA ESG · Rho Generación SpA
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tightest">
                Reporte ejecutivo Q{currentQuarter()} {new Date().getFullYear()}
              </h2>
              <p className="text-sm text-ink-tertiary mt-2">
                Datos al {formatFullDate(k.fechaCorte)} · Adenda N°2 firmada {formatFullDate(ADENDA_N2_METADATA.fechaFirma)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-ink-tertiary">Documento contractual base</p>
              <a
                href="/docs/Adenda_N2_RHO_FIP_CEHTA.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-rho-dark hover:text-rho-medium font-medium mt-1"
              >
                <FileText className="w-4 h-4" />
                Adenda N°2 al Contrato de Suscripción
              </a>
              <p className="text-[11px] text-ink-tertiary mt-0.5">
                Notario {ADENDA_N2_METADATA.notario.split(" ").slice(-2).join(" ")} · Cód. {ADENDA_N2_METADATA.codigoVerificacion}
              </p>
            </div>
          </header>

          {/* Lede — un párrafo que cuenta la historia */}
          <div className="mb-10">
            <Quote className="w-8 h-8 text-rho-medium/60 mb-3" />
            <p className="text-xl md:text-2xl text-ink-primary leading-snug max-w-4xl tracking-snug">
              Rho Generación es un IPP chileno con <strong>{esg.mwTotal} MW</strong> de capacidad
              entre solar PV y BESS, articulado en torno al primer proyecto agrivoltaico del país
              (Panimávida) y un BESS de gran escala en La Ligua co-ubicado con la planta solar
              METLEN. A la fecha el FIP CEHTA ha aportado <strong>{fmtMM(k.pagado)}</strong> ({k.pctPagado.toFixed(0)}%)
              de los <strong>{fmtMM(k.planContractual)}</strong> comprometidos en la Adenda N°2 —{" "}
              <strong>{k.cuotasPagadas} de {k.cuotasTotal} cuotas cumplidas</strong> — y{" "}
              <strong>{fmtMM(k.ejecutado)}</strong> están desplegados en gastos operativos auditables{totalDev > 0 ? (
                <>
                  , con <strong className="text-emerald-700">{fmtMM(totalDev)}</strong> recuperados
                  vía boletas de garantía
                </>
              ) : null}.
            </p>
          </div>

          {/* === Métricas clave en grid === */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-quaternary/40 rounded-2xl overflow-hidden mb-10">
            <LetterStat
              label="Plan contractual"
              value={fmtMM(k.planContractual)}
              detail="6 cuotas · Adenda N°2"
            />
            <LetterStat
              label="Pagado al banco"
              value={fmtMM(k.pagado)}
              detail={`${k.pctPagado.toFixed(1)}% del plan`}
              tone="accent"
            />
            <LetterStat
              label="Capital ejecutado"
              value={fmtMM(k.ejecutado)}
              detail={`${k.pctEjecutado.toFixed(0)}% del aportado`}
            />
            <LetterStat
              label="Saldo CC (ST + BICE)"
              value={fmtMM(saldos.reduce((a, s) => a + s.saldoActual, 0))}
              detail={saldos.map((s) => `${s.cuenta} ${fmtCLP(s.saldoActual, { compact: true })}`).join(" · ")}
            />
          </div>

          {/* === Dos columnas: Logros · Próximos hitos === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-rho-medium" />
                Lo que se hizo
              </h3>
              <ul className="space-y-3">
                <Bullet>
                  <strong>{cuotasPagadas.length} de 6 cuotas pagadas</strong> por un total de{" "}
                  {fmtMM(cuotasPagadas.reduce((a, b) => a + b.pagado, 0))}, alimentando capital de trabajo y obra civil.
                </Bullet>
                {saldos.length > 1 && (
                  <Bullet>
                    Liquidez disponible <strong>{fmtMM(saldos.reduce((a, s) => a + s.saldoActual, 0))}</strong> distribuida en{" "}
                    {saldos.map((s) => `CC ${s.cuenta}`).join(" + ")} — diversificación bancaria operativa.
                  </Bullet>
                )}
                <Bullet>
                  <strong>{oc.total} órdenes de compra</strong> emitidas a{" "}
                  {oc.proveedoresUnicos} proveedores, con {fmtMM(oc.pagado)} pagado ({oc.pctPagado.toFixed(0)}%).
                </Bullet>
                {totalDev > 0 && (
                  <Bullet>
                    <strong>{fmtMM(totalDev)} recuperados</strong> vía boletas de garantía liberadas
                    (Santa Victoria + Codegua / Explícito).
                  </Bullet>
                )}
                <Bullet>
                  <strong>Panimávida</strong> con SEA aprobado, PPA en negociación e inicio de
                  construcción agendado para mayo 2026 — primer agrivoltaico de Chile.
                </Bullet>
                <Bullet>
                  <strong>La Ligua / San Expedito</strong> (BESS 90 MW / 360 MWh) estructurado con
                  80% supplier finance (CATL en negociación) y 20% equity FIP.
                </Bullet>
                <Bullet>
                  Pipeline en pre-evaluación: <strong>PMGD Quebrada Escobar (9 MW) + Ruil (5 MW)</strong>.
                </Bullet>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rho-medium" />
                Lo que viene
              </h3>
              <ul className="space-y-3">
                <Bullet>
                  Cierre PPA La Ligua (target ≥ USD 42/MWh) — precondición de project finance.
                </Bullet>
                <Bullet>
                  Activación línea Sinosure + JINKO para suministro PV Panimávida, condicionada al
                  cierre del aporte de equity completo.
                </Bullet>
                <Bullet>
                  Cierre comercial CATL para BESS La Ligua tras visita técnica Q3 2026.
                </Bullet>
                <Bullet>
                  Estudios de conexión PMGD Quebrada Escobar (9 MW) en esquema regulatorio estabilizado.
                </Bullet>
                <Bullet>
                  Reporting trimestral SFDR / PAI para acceso a fondos institucionales europeos.
                </Bullet>
              </ul>
            </div>
          </div>

          {/* === Top inversiones del trimestre === */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rho-medium" />
              Dónde se invirtió el capital
            </h3>
            <div className="space-y-2.5">
              {inv.slice(0, 6).map((p, i) => {
                const max = inv[0].valor;
                const pct = max > 0 ? (p.valor / max) * 100 : 0;
                const totalShare = (p.valor / inv.reduce((a, b) => a + b.valor, 0)) * 100;
                return (
                  <div key={i} className="flex items-baseline gap-4">
                    <span className="w-44 shrink-0 text-sm font-medium truncate">{p.nombre}</span>
                    <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rho-medium to-rho-dark"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-28 text-right text-sm font-medium tabular-nums shrink-0">
                      {fmtCLP(p.valor, { compact: true })}
                    </span>
                    <span className="w-12 text-right text-xs text-ink-tertiary tabular-nums shrink-0">
                      {totalShare.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* === Devoluciones (si aplican) === */}
          {devs.length > 0 && (
            <div className="mb-12">
              <DevolucionesCard compact />
            </div>
          )}

          {/* === Impacto ESG === */}
          <div className="mb-12 bg-rho-ultralight/30 rounded-3xl p-6 md:p-8">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-rho-dark mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold">Huella ESG estimada (cuando portafolio entre en operación)</h3>
                <p className="text-sm text-ink-secondary">
                  Cálculos basados en capacidad portafolio · factor de planta PV 27% · factor emisión grid Chile 0,39 tCO₂/MWh.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <MiniStat label="Generación anual estimada" value={`${(esg.generacionAnualMWh / 1000).toFixed(0)} GWh`} />
              <MiniStat label="CO₂ evitado / año" value={`${(esg.co2EvitadoTonAnual / 1000).toFixed(1)} k tCO₂`} />
              <MiniStat label="Comunas impactadas" value={`${esg.comunasImpactadas}`} />
              <MiniStat label="Empleos construcción" value={`~${esg.empleosConstruccion}`} />
            </div>
          </div>

          {/* === Riesgos críticos === */}
          {topRisks.length > 0 && (
            <div className="mb-10 border-l-4 border-amber-400 bg-amber-50/40 pl-6 py-5 rounded-r-2xl">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Riesgos críticos que requieren atención
              </h3>
              <ul className="space-y-2.5">
                {topRisks.map((r) => (
                  <li key={r.id} className="flex items-baseline gap-3">
                    <span className="text-amber-600 mt-1">▸</span>
                    <div>
                      <p className="font-medium text-ink-primary">{r.title}</p>
                      <p className="text-sm text-ink-secondary">{r.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* === Cierre === */}
          <footer className="pt-8 border-t border-ink-quaternary/40 text-sm text-ink-secondary leading-relaxed">
            <p className="mb-4">
              El capital comprometido del FIP CEHTA es la pieza que conecta la tesis de
              originación (proyectos solares + BESS en Chile) con la entrada de financiamiento
              estructural (Sinosure, project finance bancario, supplier finance CATL). Las cuotas
              pendientes de la Adenda N°2 son hoy el principal cuello de botella para activar la
              fase de construcción.
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-8">
              <div>
                <p className="font-semibold text-ink-primary">Rho Generación SpA</p>
                <p>RUT 77.931.386-7 · IPP y comercializador de energía</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-ink-tertiary">Reporte preparado por</p>
                <p className="font-medium text-ink-primary">Equipo COO Rho · FIP CEHTA ESG</p>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </section>
  );
}

function LetterStat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "accent";
}) {
  return (
    <div className={`p-5 ${tone === "accent" ? "bg-rho-ultralight/30" : "bg-white"}`}>
      <p className="text-[11px] uppercase tracking-wider text-ink-tertiary font-medium">{label}</p>
      <p
        className={`text-2xl font-semibold tabular-nums tracking-tightest mt-1 ${
          tone === "accent" ? "text-rho-dark" : "text-ink-primary"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-ink-tertiary mt-0.5">{detail}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-baseline gap-2.5 text-sm text-ink-secondary leading-snug">
      <span className="text-rho-medium mt-1.5 w-1.5 h-1.5 rounded-full bg-rho-medium shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold tabular-nums text-rho-dark">{value}</p>
      <p className="text-xs text-ink-tertiary mt-0.5">{label}</p>
    </div>
  );
}

function currentQuarter(): number {
  const m = new Date().getMonth();
  return Math.floor(m / 3) + 1;
}

function formatFullDate(s: string): string {
  if (!s) return "—";
  try {
    return new Date(s + (s.length === 10 ? "T12:00:00" : "")).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return s;
  }
}
