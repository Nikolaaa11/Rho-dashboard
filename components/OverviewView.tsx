"use client";

import { useMemo } from "react";
import {
  fmtCLP,
  fmtMM,
  TOTAL_APORTE_FIP_CLP,
  movimientosHistoricos,
  isOperativo,
  PROYECTOS,
  analizarCuotasAdenda,
} from "@/lib/data";
import {
  mesesAgregados,
  inversionPorProyecto,
  headlineKPIs,
  ocSummary,
} from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import ChartCard from "./ui/ChartCard";
import BulletChart from "./ui/BulletChart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceDot,
} from "recharts";
import {
  TrendingUp,
  Sparkles,
  Building2,
  Target,
  Activity,
  PieChart as PieIcon,
  GitBranch,
} from "lucide-react";

export default function OverviewView() {
  const movs = movimientosHistoricos();
  const k = headlineKPIs();
  const cuotas = analizarCuotasAdenda();
  const oc = ocSummary();
  const meses = mesesAgregados();
  const inv = inversionPorProyecto();
  const totalOperativo = inv.reduce((a, b) => a + b.valor, 0);

  // Acumulado para chart con plan superpuesto
  const mensualAcumulado = useMemo(() => {
    const cuotasSorted = [...cuotas].sort((a, b) => a.cuotaOrden - b.cuotaOrden);
    let planAcum = 0;
    const cuotaPlanByMes: Record<string, number> = {};
    for (const c of cuotasSorted) {
      planAcum += c.monto;
      // Convertir plazo a YYYY-MM
      const mesPlan = plazoToMes(c.plazo);
      cuotaPlanByMes[mesPlan] = planAcum;
    }
    let currentPlan = 0;
    const planSeries: number[] = [];
    return meses.map((m) => {
      if (cuotaPlanByMes[m.mes]) currentPlan = cuotaPlanByMes[m.mes];
      planSeries.push(currentPlan);
      return {
        mes: m.mes,
        plan: currentPlan,
        aportado: m.acumAbono,
        ejecutado: m.acumEgreso,
      };
    });
  }, [meses, cuotas]);

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* === Story bar === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14 md:mb-20">
          <StoryCard
            icon={<Sparkles className="w-5 h-5" />}
            eyebrow="La oportunidad"
            title="Energía + almacenamiento"
            body="Chile lidera la transición energética en Latinoamérica. El BESS resuelve el cuello de botella del solar: desplazar energía del mediodía a la tarde-noche. Mercado conservador USD 560M en los próximos años."
          />
          <StoryCard
            icon={<Building2 className="w-5 h-5" />}
            eyebrow="Nuestra ventaja"
            title="102 MW + 396 MWh"
            body="Portafolio activo: primer agrivoltaico de Chile (Panimávida, 3 MW PV + 9 MW BESS) y BESS de gran escala (La Ligua, 90 MW co-ubicado con METLEN 213 MW). Pipeline de PMGD Quebrada Escobar (9 MW) + Ruil (5 MW)."
          />
          <StoryCard
            icon={<Target className="w-5 h-5" />}
            eyebrow="Capital trazable"
            title="Plan contractual notarial"
            body="Adenda N°2 firmada el 27 oct 2025 ante notario establece 6 cuotas por $1.800M. 715 transacciones bancarias y 117 OC respaldan cada peso ejecutado peso por peso."
          />
        </div>

        <SectionHeader
          eyebrow="Visión consolidada"
          title="Capital aportado vs. ejecutado vs. plan."
          subtitle="Curva acumulada que muestra cómo se ha desembolsado el plan de capital, a qué ritmo se ha ejecutado y el plan contractual que sirve de referencia."
        />

        {/* === CURVA PRINCIPAL CON PLAN === */}
        <div className="card-elevated p-6 md:p-8 mb-10">
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart
              data={mensualAcumulado}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="gradAbono" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3C8B3C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3C8B3C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradEgreso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A4A1A" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#1A4A1A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F5F5F7" vertical={false} />
              <XAxis dataKey="mes" stroke="#86868B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#86868B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmtCLP(v, { compact: true })}
                domain={[0, "dataMax"]}
              />
              <Tooltip
                formatter={(v: number) => fmtCLP(v)}
                labelFormatter={(l) => `Mes ${l}`}
              />
              <Legend wrapperStyle={{ paddingTop: 12 }} iconType="circle" />
              <Area
                type="stepAfter"
                dataKey="plan"
                name="Plan contractual"
                stroke="#86868B"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fill="transparent"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="aportado"
                name="Capital aportado por el FIP"
                stroke="#3C8B3C"
                strokeWidth={2.5}
                fill="url(#gradAbono)"
              />
              <Area
                type="monotone"
                dataKey="ejecutado"
                name="Capital ejecutado en proyectos"
                stroke="#1A4A1A"
                strokeWidth={2.5}
                fill="url(#gradEgreso)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* === BULLET CHARTS — comparaciones plan vs real === */}
        <ChartCard
          icon={<Target className="w-4 h-4" />}
          eyebrow="Plan vs. real"
          title="¿Cómo va cada métrica contra su meta?"
          subtitle="Comparación de cuatro dimensiones críticas: capital, ejecución, órdenes de compra y cobertura de cuotas."
          accent="rho"
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BulletChart
              label="Capital aportado al banco"
              sub={`${k.pctPagado.toFixed(0)}% del plan`}
              actual={k.pagado}
              target={k.planContractual}
              fmt={(n) => fmtCLP(n, { compact: true })}
              color="#3C8B3C"
            />
            <BulletChart
              label="Capital ejecutado en proyectos"
              sub={`${k.pctEjecutado.toFixed(0)}% del aportado`}
              actual={k.ejecutado}
              target={k.pagado || 1}
              fmt={(n) => fmtCLP(n, { compact: true })}
              color="#1A4A1A"
            />
            <BulletChart
              label="Órdenes de compra pagadas"
              sub={`${oc.pctPagado.toFixed(0)}% del comprometido`}
              actual={oc.pagado}
              target={oc.comprometido}
              fmt={(n) => fmtCLP(n, { compact: true })}
              color="#06b6d4"
            />
            <BulletChart
              label="Cuotas Adenda N°2 cumplidas"
              sub={`${k.cuotasPagadas} de ${k.cuotasTotal} cuotas`}
              actual={k.cuotasPagadas}
              target={k.cuotasTotal}
              max={k.cuotasTotal}
              fmt={(n) => `${n.toFixed(0)}`}
              color="#8b5cf6"
            />
          </div>
        </ChartCard>

        {/* === DÓNDE SE INVIRTIÓ === */}
        <ChartCard
          icon={<GitBranch className="w-4 h-4" />}
          eyebrow="Asignación de capital"
          title="¿Dónde se invirtió el capital?"
          subtitle="Cada proyecto del portafolio, ordenado por monto ejecutado a la fecha."
          accent="emerald"
        >
          <div className="space-y-3">
            {inv.map((p, i) => {
              const pct = totalOperativo > 0 ? (p.valor / totalOperativo) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink-primary">{p.meta.nombre}</span>
                      {p.meta.etapa && (
                        <span className="text-xs text-ink-tertiary">· {p.meta.etapa}</span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm tabular-nums text-ink-secondary">
                        {fmtCLP(p.valor)}
                      </span>
                      <span className="text-xs text-ink-tertiary tabular-nums w-12 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rho-medium to-rho-dark transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </section>
  );
}

function StoryCard({
  icon,
  eyebrow,
  title,
  body,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card-elevated p-7">
      <div className="w-10 h-10 rounded-2xl bg-rho-ultralight flex items-center justify-center text-rho-dark mb-4">
        {icon}
      </div>
      <p className="text-xs font-medium text-rho-medium uppercase tracking-[0.1em] mb-2">{eyebrow}</p>
      <h3 className="text-xl font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-ink-secondary leading-relaxed">{body}</p>
    </div>
  );
}

function plazoToMes(plazo: string): string {
  const meses: Record<string, string> = {
    ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
    jul: "07", ago: "08", sep: "09", oct: "10", nov: "11", dic: "12",
  };
  const partes = plazo.toLowerCase().split(" ");
  if (partes.length === 3) return `${partes[2]}-${meses[partes[1]] || "01"}`;
  if (partes.length === 2) return `${partes[1]}-${meses[partes[0]] || "01"}`;
  return plazo;
}
