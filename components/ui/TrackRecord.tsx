"use client";

import { fmtCLP, analizarCuotasAdenda } from "@/lib/data";
import { ocSummary, headlineKPIs, dataQuality } from "@/lib/derived";
import {
  CheckCircle2,
  Award,
  Shield,
  TrendingUp,
  FileCheck,
  Calendar,
  Target,
  Sparkles,
} from "lucide-react";

/**
 * Track Record / Cumplimiento histórico — pieza clave para conseguir el visto bueno
 * de CORFO, banca y nuevos LPs. Demuestra confiabilidad con métricas duras.
 */
export default function TrackRecord() {
  const cuotas = analizarCuotasAdenda();
  const cuotasPagadas = cuotas.filter((c) => c.estado === "Pagada");
  const cuotasOnTime = cuotasPagadas.length;
  const oc = ocSummary();
  const k = headlineKPIs();
  const dq = dataQuality();

  // Track record scores
  const cumplimientoCapital = (k.pctPagado / 100) * 100;
  const cumplimientoOC = oc.pctPagado;
  const dataQualityScore = dq.pctClasificados;

  const hitosLogrados = [
    { hito: "SEA Panimávida aprobado", fecha: "Q1 2025", estado: "✓" },
    { hito: "Adenda N°2 firmada ante notario", fecha: "Oct 2025", estado: "✓" },
    { hito: "PPA Panimávida en negociación final", fecha: "Q2 2026", estado: "▸" },
    { hito: "LOI CATL activo (BESS La Ligua)", fecha: "Q2 2026", estado: "▸" },
    { hito: "Crédito de grupo Quebrada Escobar 2", fecha: "Q2 2026", estado: "▸" },
    { hito: "117 OC emitidas a 47 proveedores", fecha: "2024–2026", estado: "✓" },
    { hito: "CC BICE habilitada como segunda cuenta", fecha: "Q2 2026", estado: "✓" },
    { hito: "Boletas garantía Santa Victoria recuperadas", fecha: "Jul 2025", estado: "✓" },
  ];

  const stats = [
    {
      label: "Cuotas Adenda N°2 pagadas",
      value: `${cuotasOnTime} de 6`,
      pct: (cuotasOnTime / 6) * 100,
      detail: `${fmtCLP(cuotasPagadas.reduce((a, b) => a + b.pagado, 0), { compact: true })} aportados sin retrasos materiales`,
      color: "#059669",
      Icon: CheckCircle2,
    },
    {
      label: "OC pagadas vs comprometido",
      value: `${oc.pctPagado.toFixed(1)}%`,
      pct: oc.pctPagado,
      detail: `${oc.ocPagadas} de ${oc.total} órdenes liquidadas`,
      color: "#0891b2",
      Icon: FileCheck,
    },
    {
      label: "Capital ejecutado / aportado",
      value: `${k.pctEjecutado.toFixed(0)}%`,
      pct: Math.min(100, k.pctEjecutado),
      detail: "Eficiencia de capital — no acumulamos caja muerta",
      color: "#3C8B3C",
      Icon: TrendingUp,
    },
    {
      label: "Trazabilidad transaccional",
      value: `${dataQualityScore.toFixed(1)}%`,
      pct: dataQualityScore,
      detail: `${dq.totalMovs} movimientos clasificados peso por peso`,
      color: "#8b5cf6",
      Icon: Shield,
    },
  ];

  return (
    <div className="card-elevated p-6 md:p-8 mb-8 bg-gradient-to-br from-white via-emerald-50/20 to-white border-l-4 border-emerald-500">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-emerald-700 mb-1">
            Track record · evidencia de cumplimiento
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tightest">
            Lo que hemos cumplido hasta hoy.
          </h3>
          <p className="text-ink-secondary mt-2 max-w-3xl">
            Métricas auditables para CORFO, banca y nuevos LPs. Cada número se sustenta en
            documentos notariales, extractos bancarios y órdenes de compra archivadas.
          </p>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map((s, i) => (
          <ScoreBox key={i} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* Trust signals */}
      <div className="bg-white rounded-2xl p-5 border border-ink-quaternary/40 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <p className="text-[11px] uppercase tracking-wider font-bold text-ink-secondary">
            Hitos materiales logrados + en ejecución
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
          {hitosLogrados.map((h, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                  h.estado === "✓"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {h.estado}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-primary font-medium leading-tight">{h.hito}</p>
                <p className="text-[10px] text-ink-tertiary mono-num">{h.fecha}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sello de auditoría */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Auditoría externa: MCG Auditores
            </p>
            <p className="text-xs text-emerald-800 leading-snug">
              Toda la información financiera está disponible para revisión formal. Adenda N°2 firmada
              ante Notario Sr. Juan Ricardo San Martín Urrejola. Código verificación{" "}
              <span className="mono-num font-medium">20251027170542JRZ</span>.
            </p>
          </div>
        </div>
        <a
          href="/docs/Adenda_N2_RHO_FIP_CEHTA.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline shrink-0 text-xs"
        >
          <FileCheck className="w-3.5 h-3.5" />
          Ver Adenda N°2
        </a>
      </div>
    </div>
  );
}

function ScoreBox({
  label,
  value,
  pct,
  detail,
  color,
  Icon,
  delay,
}: {
  label: string;
  value: string;
  pct: number;
  detail: string;
  color: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  delay: number;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 border-2 transition-transform hover:scale-[1.02] animate-fade-in"
      style={{ borderColor: color + "30", animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: color + "20" }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="mono-num text-xl font-semibold tabular-nums" style={{ color }}>
          {value}
        </span>
      </div>
      <p className="text-sm font-semibold text-ink-primary leading-tight">{label}</p>
      <div className="h-1.5 bg-surface-tertiary rounded-full mt-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(100, pct)}%`, background: color }}
        />
      </div>
      <p className="text-[11px] text-ink-tertiary mt-2 leading-snug">{detail}</p>
    </div>
  );
}
