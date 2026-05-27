"use client";

import { fmtCLP, fmtMM, analizarCuotasAdenda, ADENDA_N2_METADATA } from "@/lib/data";
import {
  headlineKPIs,
  ocSummary,
  getESGSnapshot,
  saldosPorCuenta,
  PROYECTOS_GEO,
} from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Building2,
  Users,
  Award,
  Banknote,
  Target,
  Leaf,
  Shield,
  ArrowRight,
  Mail,
  Phone,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  HandCoins,
  Globe,
} from "lucide-react";

/**
 * IR Deck — Material ready-to-share para LPs, CORFO y bancos.
 * Estructura típica de pitch institucional:
 *  Cover → Problem → Solution → Market → Portfolio →
 *  Traction → Financials → Use of proceeds → Team → Ask → Risks → Disclaimers
 */

export default function IRDeckView() {
  return (
    <section className="py-12 md:py-20 bg-surface-secondary/30 print:bg-white">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 print:px-0">
        <SectionHeader
          eyebrow="Investor Relations Deck · Mayo 2026"
          title="Material institucional para inversionistas, CORFO y banca."
          subtitle="Equity story completa de Rho Generación + FIP CEHTA ESG. Optimizado para imprimir o enviar como PDF. Todos los montos en pesos chilenos a menos que se indique."
          actions={
            <button onClick={() => window.print()} className="btn-primary">
              <Printer className="w-4 h-4" />
              Imprimir / Guardar PDF
            </button>
          }
        />

        {/* ====================== COVER ====================== */}
        <Slide eyebrow="Cover" title="">
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rho-ultralight border border-rho-medium/30 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-rho-medium animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-rho-dark">
                Confidencial · Para inversionistas autorizados
              </span>
            </div>
            <h1 className="h-mega brand-gradient mb-4">Rho Generación</h1>
            <p className="text-xl text-ink-secondary mb-2 max-w-xl mx-auto">
              Independent Power Producer chileno · Solar PV + Almacenamiento BESS
            </p>
            <p className="text-sm text-ink-tertiary">
              FIP CEHTA ESG · Administrado por AFIS S.A. · Mayo 2026
            </p>
          </div>
        </Slide>

        {/* ====================== EXECUTIVE SUMMARY ====================== */}
        <Slide
          eyebrow="Executive Summary"
          title="Una página, toda la oportunidad."
          accent="emerald"
          icon={<Sparkles className="w-4 h-4" />}
        >
          <ExecutiveSummary />
        </Slide>

        {/* ====================== PROBLEM ====================== */}
        <Slide
          eyebrow="01 · El problema"
          title="Chile genera energía solar barata. No la sabe almacenar."
          accent="amber"
          icon={<Zap className="w-4 h-4" />}
        >
          <ProblemSlide />
        </Slide>

        {/* ====================== SOLUTION ====================== */}
        <Slide
          eyebrow="02 · La solución"
          title="Solar PV + BESS de gran escala, co-ubicados."
          accent="violet"
          icon={<Building2 className="w-4 h-4" />}
        >
          <SolutionSlide />
        </Slide>

        {/* ====================== MARKET ====================== */}
        <Slide
          eyebrow="03 · Mercado"
          title="USD 560M+ en BESS en Chile en los próximos años."
          accent="cyan"
          icon={<TrendingUp className="w-4 h-4" />}
        >
          <MarketSlide />
        </Slide>

        {/* ====================== PORTFOLIO ====================== */}
        <Slide
          eyebrow="04 · Portafolio"
          title="116 MW + 396 MWh BESS · 4 activos en Chile."
          accent="emerald"
          icon={<Building2 className="w-4 h-4" />}
        >
          <PortfolioSlide />
        </Slide>

        {/* ====================== TRACTION ====================== */}
        <Slide
          eyebrow="05 · Tracción"
          title="Lo que hemos construido hasta hoy."
          accent="rho"
          icon={<Award className="w-4 h-4" />}
        >
          <TractionSlide />
        </Slide>

        {/* ====================== FINANCIALS ====================== */}
        <Slide
          eyebrow="06 · Financials"
          title="Plan trazable, números auditables."
          accent="rho"
          icon={<Banknote className="w-4 h-4" />}
        >
          <FinancialsSlide />
        </Slide>

        {/* ====================== USE OF PROCEEDS ====================== */}
        <Slide
          eyebrow="07 · Use of proceeds"
          title="A qué se destinan los aportes."
          accent="violet"
          icon={<Target className="w-4 h-4" />}
        >
          <UseOfProceedsSlide />
        </Slide>

        {/* ====================== TEAM ====================== */}
        <Slide
          eyebrow="08 · Equipo"
          title="Quiénes están detrás de Rho."
          accent="cyan"
          icon={<Users className="w-4 h-4" />}
        >
          <TeamSlide />
        </Slide>

        {/* ====================== ASK ====================== */}
        <Slide
          eyebrow="09 · The Ask"
          title="$750M de equity para destrabar Panimávida."
          accent="emerald"
          icon={<HandCoins className="w-4 h-4" />}
        >
          <AskSlide />
        </Slide>

        {/* ====================== ESG ====================== */}
        <Slide
          eyebrow="10 · ESG · Impacto"
          title="51 GWh anuales · 20k tCO₂ evitadas / año."
          accent="emerald"
          icon={<Leaf className="w-4 h-4" />}
        >
          <ESGSlide />
        </Slide>

        {/* ====================== RISKS ====================== */}
        <Slide
          eyebrow="11 · Riesgos materiales"
          title="Lo que evaluamos y mitigamos."
          accent="amber"
          icon={<AlertTriangle className="w-4 h-4" />}
        >
          <RisksSlide />
        </Slide>

        {/* ====================== CONTACT ====================== */}
        <Slide
          eyebrow="12 · IR Contact"
          title="Próximos pasos."
          accent="rho"
          icon={<Mail className="w-4 h-4" />}
        >
          <ContactSlide />
        </Slide>

        {/* ====================== DISCLAIMERS ====================== */}
        <DisclaimersSlide />
      </div>
    </section>
  );
}

// ============================================================================
// SLIDE WRAPPER
// ============================================================================

function Slide({
  eyebrow,
  title,
  children,
  accent = "rho",
  icon,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  accent?: "emerald" | "violet" | "cyan" | "amber" | "rho";
  icon?: React.ReactNode;
}) {
  const accentColor = {
    emerald: "text-emerald-700",
    violet: "text-violet-700",
    cyan: "text-cyan-700",
    amber: "text-amber-700",
    rho: "text-rho-dark",
  }[accent];

  const iconBg = {
    emerald: "from-emerald-500 to-cyan-500",
    violet: "from-violet-500 to-purple-500",
    cyan: "from-cyan-500 to-blue-500",
    amber: "from-amber-500 to-orange-500",
    rho: "from-rho-dark to-rho-medium",
  }[accent];

  return (
    <article className="card-elevated p-8 md:p-10 mb-6 print:page-break print:break-after-page print:shadow-none">
      {(eyebrow || title) && (
        <header className="mb-6">
          {(eyebrow || icon) && (
            <div className="flex items-center gap-2 mb-2">
              {icon && (
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center text-white shrink-0`}
                >
                  {icon}
                </div>
              )}
              {eyebrow && (
                <p className={`text-[10px] uppercase tracking-[0.14em] font-bold ${accentColor}`}>
                  {eyebrow}
                </p>
              )}
            </div>
          )}
          {title && (
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tightest text-ink-primary">
              {title}
            </h2>
          )}
        </header>
      )}
      {children}
    </article>
  );
}

// ============================================================================
// SLIDES
// ============================================================================

function ExecutiveSummary() {
  const k = headlineKPIs();
  const saldos = saldosPorCuenta();
  const ttlSaldo = saldos.reduce((a, s) => a + s.saldoActual, 0);

  return (
    <div>
      <p className="text-lg md:text-xl text-ink-primary leading-snug mb-5 tracking-snug">
        Rho Generación es un IPP chileno con <strong>116 MW</strong> entre solar PV y BESS,
        articulado en torno al <strong>primer agrivoltaico de Chile (Panimávida)</strong> y un BESS
        de gran escala en <strong>La Ligua co-ubicado con METLEN 213 MW</strong>. A la fecha, FIP
        CEHTA ha aportado <strong>{fmtMM(k.pagado)}</strong> de los{" "}
        <strong>{fmtMM(k.planContractual)}</strong> comprometidos en la Adenda N°2 — <strong>4 de 6
        cuotas cumplidas</strong> — y ya ejecutados <strong>{fmtMM(k.ejecutado)}</strong> en gastos
        operativos auditables.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-quaternary/40 rounded-2xl overflow-hidden mt-6">
        <SummaryStat label="Capacidad portafolio" value="116 MW" sub="17 PV + 99 BESS" />
        <SummaryStat label="Almacenamiento" value="396 MWh" sub="Pana + La Ligua" />
        <SummaryStat label="Capital aportado" value={fmtMM(k.pagado)} sub={`${k.pctPagado.toFixed(0)}% del plan`} accent />
        <SummaryStat label="Liquidez total" value={fmtMM(ttlSaldo)} sub="Santander + BICE" />
      </div>
    </div>
  );
}

function SummaryStat({
  label, value, sub, accent,
}: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`p-4 ${accent ? "bg-rho-ultralight/40" : "bg-white"}`}>
      <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-bold">{label}</p>
      <p className={`mono-num text-xl font-semibold tabular-nums mt-1 ${accent ? "text-rho-dark" : ""}`}>
        {value}
      </p>
      <p className="text-[10px] text-ink-tertiary mt-0.5">{sub}</p>
    </div>
  );
}

function ProblemSlide() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ProblemCard
        n="01"
        title="Sobreoferta solar al mediodía"
        body="Chile recorta solar (curtailment) cuando hay sol y precio cero. Generación cara cuando se necesita en la tarde-noche."
      />
      <ProblemCard
        n="02"
        title="Sin storage, el grid colapsa"
        body="La transición renovable está bloqueada sin BESS de gran escala. Sólo BESS habilita el despacho confiable."
      />
      <ProblemCard
        n="03"
        title="Capital escaso para BESS"
        body="Pocos jugadores con bancabilidad estructurada. Ventana de oportunidad ahora — capacity factor del mercado en formación."
      />
    </div>
  );
}

function ProblemCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-5">
      <p className="text-3xl font-semibold text-amber-700 mono-num">{n}</p>
      <p className="text-base font-semibold text-ink-primary mt-2">{title}</p>
      <p className="text-sm text-ink-secondary leading-snug mt-1.5">{body}</p>
    </div>
  );
}

function SolutionSlide() {
  return (
    <div className="space-y-4">
      <p className="text-base text-ink-secondary leading-relaxed">
        Rho construye, opera y vende energía de proyectos <strong>solar PV co-ubicados con BESS</strong>,
        capturando arbitraje horario y servicios auxiliares al CEN.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SolutionPillar
          icon="☀"
          title="Generación solar PV"
          desc="17 MW PV en construcción/pipeline. Panimávida (3 MW) es el primer agrivoltaico de Chile — cultivos compatibles con paneles."
        />
        <SolutionPillar
          icon="🔋"
          title="Almacenamiento BESS"
          desc="99 MW / 396 MWh entre Panimávida (9 MW/36 MWh) y La Ligua (90 MW/360 MWh). Duración 4h."
        />
      </div>
      <div className="bg-violet-50/40 border border-violet-200 rounded-xl p-4 mt-4">
        <p className="text-sm text-violet-900 leading-snug">
          <strong>Ventaja competitiva:</strong> La Ligua está co-ubicado con la planta solar METLEN
          213 MW, lo que da PPA de costo cero y permite hacer arbitraje al máximo precio del día.
        </p>
      </div>
    </div>
  );
}

function SolutionPillar({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white border border-ink-quaternary/40 rounded-2xl p-5">
      <p className="text-3xl mb-2">{icon}</p>
      <p className="text-lg font-semibold text-ink-primary">{title}</p>
      <p className="text-sm text-ink-secondary leading-snug mt-1">{desc}</p>
    </div>
  );
}

function MarketSlide() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BigStat value="USD 560M+" label="Mercado BESS Chile" sub="Conservador, próximos 3 años" color="#06b6d4" />
        <BigStat value="6.7 GW" label="Capacidad solar instalada" sub="A nivel sistema chileno" color="#f59e0b" />
        <BigStat value="USD 42+" label="PPA target La Ligua" sub="Por MWh — habilita bancabilidad" color="#059669" />
      </div>
      <p className="text-sm text-ink-secondary leading-relaxed mt-4">
        Chile lidera la transición energética en Latinoamérica. La regulación (NCh 4, DS 1/2026,
        ICC del CEN) habilita explícitamente BESS para servicios auxiliares y arbitraje. La
        ventana de oportunidad es ahora — antes que el mercado se sature.
      </p>
    </div>
  );
}

function BigStat({ value, label, sub, color }: { value: string; label: string; sub: string; color: string }) {
  return (
    <div className="bg-white border-2 rounded-2xl p-5 text-center" style={{ borderColor: color + "30" }}>
      <p className="mono-num text-3xl md:text-4xl font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
      <p className="text-sm font-semibold text-ink-primary mt-1">{label}</p>
      <p className="text-[11px] text-ink-tertiary mt-0.5">{sub}</p>
    </div>
  );
}

function PortfolioSlide() {
  const proyectos = PROYECTOS_GEO;
  return (
    <div>
      <p className="text-base text-ink-secondary leading-relaxed mb-5">
        4 activos en Chile · 2 en construcción/pre-construcción y 2 en pipeline PMGD. Total{" "}
        <strong>116 MW</strong> + <strong>396 MWh</strong> de almacenamiento.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {proyectos.map((p) => (
          <div
            key={p.centro}
            className="flex items-start gap-3 p-4 rounded-xl border border-ink-quaternary/40 bg-white"
          >
            <div className="w-10 h-10 rounded-xl bg-rho-ultralight flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-rho-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-ink-primary">{p.nombre}</p>
              <p className="text-xs text-ink-secondary">{p.comuna} · {p.region}</p>
              <p className="text-xs text-ink-tertiary mt-1">{p.capacidad}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="pill pill-neutral text-[10px]">{p.etapa}</span>
              <p className="mono-num text-sm font-semibold mt-1">COD {p.cod}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TractionSlide() {
  const cuotas = analizarCuotasAdenda();
  const cuotasOK = cuotas.filter((c) => c.estado === "Pagada").length;
  const k = headlineKPIs();
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        <Bullet>
          <strong>{cuotasOK} de 6 cuotas</strong> Adenda N°2 pagadas con respaldo bancario auditable.
        </Bullet>
        <Bullet>
          <strong>{fmtMM(k.ejecutado)}</strong> de capital ya desplegados en gasto operativo
          ({k.pctEjecutado.toFixed(0)}% del aportado).
        </Bullet>
        <Bullet>
          <strong>117 órdenes de compra</strong> emitidas a 47 proveedores con 90% de tasa de pago.
        </Bullet>
        <Bullet>
          <strong>Panimávida</strong> con SEA aprobado, PPA en negociación, construcción agendada
          mayo 2026.
        </Bullet>
        <Bullet>
          <strong>La Ligua</strong> estructurada con 80% supplier finance (CATL en negociación
          activa con LOI firmado) + 20% equity FIP.
        </Bullet>
        <Bullet>
          <strong>Diversificación bancaria:</strong> CC Santander + CC BICE habilitadas, eliminando
          riesgo de single-bank exposure.
        </Bullet>
        <Bullet>
          <strong>$54.7M recuperados</strong> vía boletas de garantía liberadas (Santa Victoria +
          proyecto discontinuado Codegua).
        </Bullet>
      </ul>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm text-ink-primary leading-relaxed">
      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function FinancialsSlide() {
  const k = headlineKPIs();
  const oc = ocSummary();
  const saldos = saldosPorCuenta();
  const ttl = saldos.reduce((a, s) => a + s.saldoActual, 0);

  const rows = [
    { cat: "Capital", metric: "Plan contractual Adenda N°2", value: fmtCLP(k.planContractual), fuente: "Notarial" },
    { cat: "Capital", metric: "Capital paid-in", value: fmtCLP(k.pagado), fuente: "Banco" },
    { cat: "Capital", metric: "Capital ejecutado", value: fmtCLP(k.ejecutado), fuente: "Egresos op." },
    { cat: "Capital", metric: "Por solicitar", value: fmtCLP(k.planContractual - k.pagado), fuente: "Adenda N°2" },
    { cat: "Liquidez", metric: "CC Santander", value: fmtCLP(saldos.find((s) => s.cuenta === "Santander")?.saldoActual ?? 0), fuente: "Banco" },
    { cat: "Liquidez", metric: "CC BICE", value: fmtCLP(saldos.find((s) => s.cuenta === "BICE")?.saldoActual ?? 0), fuente: "Banco" },
    { cat: "Liquidez", metric: "Total disponible", value: fmtCLP(ttl), fuente: "Consolidado" },
    { cat: "Operación", metric: "OC comprometidas", value: fmtCLP(oc.comprometido), fuente: `${oc.total} OC` },
    { cat: "Operación", metric: "OC pagadas", value: fmtCLP(oc.pagado), fuente: `${oc.pctPagado.toFixed(0)}%` },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-ink-tertiary border-b border-ink-quaternary/40">
            <th className="text-left py-2 font-bold">Categoría</th>
            <th className="text-left py-2 font-bold">Métrica</th>
            <th className="text-right py-2 font-bold">Valor</th>
            <th className="text-left py-2 pl-4 font-bold">Fuente</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-quaternary/30">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-surface-tertiary/40">
              <td className="py-2.5">
                <span className="pill pill-neutral text-[10px]">{r.cat}</span>
              </td>
              <td className="py-2.5 font-medium text-ink-primary">{r.metric}</td>
              <td className="py-2.5 text-right mono-num tabular-nums font-semibold">{r.value}</td>
              <td className="py-2.5 pl-4 text-xs text-ink-tertiary">{r.fuente}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UseOfProceedsSlide() {
  const uses = [
    { label: "Construcción Panimávida", monto: 3_000_000_000, pct: 50, color: "#f59e0b", desc: "Mov tierra, civil, BESS 9 MW, PV 3 MW, conexión" },
    { label: "Equity La Ligua (20%)", monto: 1_500_000_000, pct: 25, color: "#06b6d4", desc: "Match al supplier finance CATL 80%" },
    { label: "Desarrollo pipeline", monto: 600_000_000, pct: 10, color: "#8b5cf6", desc: "Quebrada Escobar + Ruil + SE 2 (150 MW)" },
    { label: "Capital de trabajo + sueldos", monto: 600_000_000, pct: 10, color: "#3C8B3C", desc: "Operación 18 meses post-cierre" },
    { label: "Contingencias 5%", monto: 300_000_000, pct: 5, color: "#94a3b8", desc: "Cobertura riesgos no previstos" },
  ];
  return (
    <div>
      <p className="text-sm text-ink-secondary mb-5">
        Distribución típica del capital levantado en ronda completa de USD 7M+ equivalente. La
        Estrategia C propuesta apila inversionista ($750M) + CORFO match ($750M) + banco ($1.500M).
      </p>
      <div className="space-y-3">
        {uses.map((u, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: u.color }} />
                <span className="text-sm font-semibold text-ink-primary">{u.label}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="mono-num text-sm font-semibold tabular-nums">{fmtCLP(u.monto, { compact: true })}</span>
                <span className="text-xs text-ink-tertiary mono-num w-10 text-right">{u.pct}%</span>
              </div>
            </div>
            <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${u.pct * 2}%`, background: u.color }}
              />
            </div>
            <p className="text-[11px] text-ink-tertiary mt-1 pl-4.5">{u.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSlide() {
  const team = [
    { name: "Guido Rietta", role: "General Manager", bio: "Liderazgo operacional. 15+ años en project finance y energía renovable en Chile." },
    { name: "Nicolás Rietta", role: "COO · FIP CEHTA", bio: "Operaciones del fondo. Gestión multi-empresa (CSL, RHO, DTE, REVTECH, EVOQUE, TRONGKAI)." },
    { name: "Francisco Chandia", role: "Project Manager Panimávida", bio: "Coordinación de obra, terreno, proveedores en faena." },
    { name: "Victoria · AFIS", role: "Tesorería FIP", bio: "Gestión de capital calls, relación con bancos y reporting a aportantes." },
    { name: "MCG Auditores", role: "Auditor externo", bio: "Auditoría de EE.FF. del fondo y portfolio companies." },
    { name: "Notario JR San Martín U.", role: "Documentación legal", bio: "Adenda N°2 firmada ante notario · Cód. 20251027170542JRZ." },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {team.map((t, i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-ink-quaternary/40">
          <div className="w-10 h-10 rounded-full bg-rho-ultralight flex items-center justify-center text-rho-dark font-semibold shrink-0">
            {t.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-primary">{t.name}</p>
            <p className="text-[11px] text-rho-medium font-medium uppercase tracking-wider">{t.role}</p>
            <p className="text-xs text-ink-secondary leading-snug mt-1">{t.bio}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AskSlide() {
  return (
    <div>
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 mb-5">
        <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold mb-2">
          Buscando aporte LP de
        </p>
        <p className="mono-num text-5xl md:text-6xl font-semibold tabular-nums text-emerald-700 mb-2">
          $750M CLP
        </p>
        <p className="text-base text-emerald-900 leading-relaxed">
          Activa <strong>match CORFO</strong> ($750M adicionales) → habilita{" "}
          <strong>$1.500M de project finance bancario</strong> → total{" "}
          <strong>$3.000M para Panimávida construido al 100%</strong>.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <DealStructure title="Ticket mínimo sugerido" value="$250M" sub="Múltiplos posibles" />
        <DealStructure title="Vehículo" value="FIP CEHTA ESG" sub="Cuotas vía AFIS" />
        <DealStructure title="Plazo cierre" value="60 días" sub="LOI → wire" />
      </div>
      <div className="bg-rho-ultralight/40 border border-rho-medium/30 rounded-xl p-4">
        <p className="text-sm text-rho-dark leading-snug">
          <strong>Términos disponibles bajo NDA:</strong> ownership %, dividend policy, gobernanza,
          drag/tag rights, exit waterfall. Solicitar a IR contact.
        </p>
      </div>
    </div>
  );
}

function DealStructure({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-ink-quaternary/40 rounded-xl p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-bold">{title}</p>
      <p className="mono-num text-2xl font-semibold tabular-nums mt-1 text-ink-primary">{value}</p>
      <p className="text-[10px] text-ink-tertiary mt-0.5">{sub}</p>
    </div>
  );
}

function ESGSlide() {
  const esg = getESGSnapshot();
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <BigStat value={`${(esg.generacionAnualMWh / 1000).toFixed(0)} GWh`} label="Generación anual" sub="Cuando full COD" color="#10b981" />
        <BigStat value={`${(esg.co2EvitadoTonAnual / 1000).toFixed(0)}k tCO₂`} label="CO₂ evitado / año" sub="vs grid promedio Chile" color="#059669" />
        <BigStat value={`${esg.comunasImpactadas}`} label="Comunas impactadas" sub={`${esg.regionesImpactadas} regiones`} color="#0891b2" />
        <BigStat value={`~${esg.empleosConstruccion}`} label="Empleos construcción" sub={`~${esg.empleosOperacion} operación`} color="#8b5cf6" />
      </div>
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Alineamiento normativo</p>
            <p className="text-xs text-emerald-800 leading-snug mt-1">
              SFDR Art. 9 · Taxonomía UE actividad 4.1 · ODS 7, 9, 13 · PAI reporting en
              preparación · CMF NCG 461 reporting integrado. Apto para DFIs (BID Invest, IFC,
              Proparco) y fondos institucionales europeos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RisksSlide() {
  const risks = [
    { titulo: "Atraso venta San Expedito", mitigacion: "PPAs activos + 2 asesores en paralelo + comprador backup identificado.", sev: "Alto" },
    { titulo: "CORFO match no aprobado", mitigacion: "Cumplimiento KPI CORFO ya verificado. Backup: solo equity LP + banco extendido.", sev: "Medio" },
    { titulo: "Banco no entra al match", mitigacion: "Term sheets simultáneos con Santander, BCI y BICE. Garantías PPA + activos.", sev: "Medio" },
    { titulo: "Curtailment solar Chile", mitigacion: "BESS resuelve precisamente esto. La Ligua co-ubicado con METLEN reduce exposición spot.", sev: "Bajo" },
    { titulo: "Concentración top-1 proyecto", mitigacion: "La Ligua = 77% portafolio MW. Mitigación: pipeline 4 proyectos adicionales activos.", sev: "Medio" },
    { titulo: "FX / tipo de cambio", mitigacion: "Estructura mayormente en CLP. CAPEX clave en USD cubierto con forwards.", sev: "Bajo" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {risks.map((r, i) => {
        const sevColor = r.sev === "Alto" ? "#dc2626" : r.sev === "Medio" ? "#d97706" : "#0891b2";
        return (
          <div key={i} className="p-4 rounded-xl border bg-white" style={{ borderColor: sevColor + "40" }}>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-sm font-semibold text-ink-primary leading-tight">{r.titulo}</p>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0"
                style={{ background: sevColor + "20", color: sevColor }}
              >
                {r.sev}
              </span>
            </div>
            <p className="text-xs text-ink-secondary leading-snug">
              <strong className="text-ink-primary">Mitigación: </strong>
              {r.mitigacion}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ContactSlide() {
  return (
    <div className="text-center py-6">
      <p className="text-base text-ink-secondary leading-relaxed mb-6 max-w-2xl mx-auto">
        Para term sheet completo, due diligence vault o reunión 1-on-1, contactanos.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="p-5 rounded-2xl border-2 border-rho-medium/40 bg-white">
          <Users className="w-5 h-5 text-rho-dark mx-auto mb-2" />
          <p className="text-sm font-bold text-ink-primary">Guido Rietta</p>
          <p className="text-xs text-ink-tertiary mb-2">General Manager</p>
          <p className="text-xs text-rho-dark">guido@rhogeneracion.cl</p>
        </div>
        <div className="p-5 rounded-2xl border-2 border-rho-medium/40 bg-white">
          <Users className="w-5 h-5 text-rho-dark mx-auto mb-2" />
          <p className="text-sm font-bold text-ink-primary">Nicolás Rietta</p>
          <p className="text-xs text-ink-tertiary mb-2">COO · FIP CEHTA</p>
          <p className="text-xs text-rho-dark">nicolas@cehta.cl</p>
        </div>
      </div>
      <p className="text-xs text-ink-tertiary mt-6">
        Adenda N°2 disponible en{" "}
        <a href="/docs/Adenda_N2_RHO_FIP_CEHTA.pdf" target="_blank" rel="noopener noreferrer" className="text-rho-dark font-medium underline">
          /docs/Adenda_N2_RHO_FIP_CEHTA.pdf
        </a>
      </p>
    </div>
  );
}

function DisclaimersSlide() {
  return (
    <article className="card-elevated p-6 md:p-8 mb-6 bg-surface-secondary/40 border-t-4 border-ink-quaternary/60">
      <div className="flex items-start gap-3 mb-4">
        <Shield className="w-5 h-5 text-ink-tertiary mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-bold">
            Disclaimers · información legal
          </p>
          <h3 className="text-base font-semibold text-ink-primary mt-1">Aviso institucional</h3>
        </div>
      </div>
      <div className="space-y-3 text-xs text-ink-secondary leading-relaxed max-w-4xl">
        <p>
          <strong>1. Confidencialidad.</strong> Este documento contiene información confidencial
          propiedad de Rho Generación SpA (RUT 77.931.386-7) y del FIP CEHTA ESG (RUT 77.751.766-K).
          Su distribución está limitada a inversionistas autorizados, CORFO y contrapartes
          bancarias bajo NDA. Prohibida su reproducción o circulación sin autorización escrita.
        </p>
        <p>
          <strong>2. Información prospectiva.</strong> Las proyecciones, TIRs, paybacks y
          escenarios incluidos en este reporte constituyen expectativas razonables al{" "}
          {new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}{" "}
          y no garantizan resultados futuros. Sujetos a condiciones de mercado, regulación,
          financiamiento bancario y otros factores fuera de control de la administración.
        </p>
        <p>
          <strong>3. Adenda N°2.</strong> Toda referencia al plan contractual se basa en la Adenda
          N°2 al Contrato de Suscripción de Acciones, firmada el 27 de octubre de 2025 ante el
          Notario Público Sr. Juan Ricardo San Martín Urrejola. Código de verificación{" "}
          <span className="mono-num">20251027170542JRZ</span>.
        </p>
        <p>
          <strong>4. Auditoría.</strong> Los movimientos bancarios provienen del extracto Santander
          + BICE al corte de fecha. Sujetos a auditoría formal por MCG Auditores.
        </p>
        <p>
          <strong>5. Riesgos.</strong> La inversión en proyectos de energía renovable conlleva
          riesgos materiales detallados en la sección "Riesgos". El potencial retorno está
          condicionado a la materialización exitosa del plan operativo y financiero.
        </p>
        <p>
          <strong>6. Marco regulatorio.</strong> FIP CEHTA ESG es un Fondo de Inversión Privado
          regulado por CMF (NCG 532 + NCG 554), administrado por AFIS S.A. Cumplimiento UAF,
          CORFO covenants y SII al día.
        </p>
        <p className="pt-2 border-t border-ink-quaternary/40 italic">
          © Rho Generación SpA · FIP CEHTA ESG · Documento generado por Rho Dashboard v2 ·{" "}
          {new Date().toLocaleDateString("es-CL")}
        </p>
      </div>
    </article>
  );
}
