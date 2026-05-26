import {
  dataset,
  movimientosHistoricos,
  isOperativo,
  PROYECTOS,
  analizarCuotasAdenda,
  ocProyectoToCentro,
  TOTAL_APORTE_FIP_CLP,
  sum,
  projectMeta,
} from "./data";
import type { Movimiento, OC } from "./types";
export type { Movimiento, OC };

// ============================================================================
// Geographic metadata for projects — used in the Mapa Chile view.
// Coordinates approximate (lat, lon). Used to position pins on the SVG of Chile.
// ============================================================================

export interface GeoProyecto {
  centro: string; // key in PROYECTOS
  nombre: string;
  lat: number;
  lon: number;
  comuna: string;
  region: string;
  mw: number;
  mwh: number; // BESS only
  etapa: string;
  cod: string;
  capacidad: string;
}

// Bounding box used by the Chile SVG. Pure mainland (-17.5 to -56 lat, -75.7 to -66.4 lon).
export const CHILE_BBOX = {
  latMax: -17.5,
  latMin: -56,
  lonMin: -75.7,
  lonMax: -66.4,
};

export const PROYECTOS_GEO: GeoProyecto[] = [
  {
    centro: "Panimávida(BESS RHO)",
    nombre: "Panimávida",
    lat: -35.74,
    lon: -71.42,
    comuna: "Colbún",
    region: "Maule",
    mw: 3,
    mwh: 36,
    etapa: "Construcción",
    cod: "Q1 2027",
    capacidad: "PV 3 MW + BESS 9 MW / 36 MWh",
  },
  {
    centro: "La Ligua (San Expedito) ",
    nombre: "La Ligua",
    lat: -32.45,
    lon: -71.23,
    comuna: "La Ligua",
    region: "Valparaíso",
    mw: 90,
    mwh: 360,
    etapa: "Pre-construcción",
    cod: "Q4 2027",
    capacidad: "BESS 90 MW / 360 MWh",
  },
  {
    centro: "Santa Victoria 15 MW",
    nombre: "Santa Victoria",
    lat: -34.65,
    lon: -71.25,
    comuna: "Litueche",
    region: "O'Higgins",
    mw: 15,
    mwh: 0,
    etapa: "Pipeline",
    cod: "2028",
    capacidad: "Solar PV 15 MW",
  },
  {
    centro: "PMGD Ranguil III",
    nombre: "Ranguil III",
    lat: -36.10,
    lon: -71.85,
    comuna: "San Carlos",
    region: "Ñuble",
    mw: 9,
    mwh: 0,
    etapa: "Pipeline",
    cod: "2028",
    capacidad: "PMGD Solar 9 MW",
  },
  {
    centro: "PMGD Quebrada Escobar",
    nombre: "Quebrada Escobar",
    lat: -33.75,
    lon: -70.95,
    comuna: "Til Til",
    region: "Metropolitana",
    mw: 9,
    mwh: 0,
    etapa: "Pipeline",
    cod: "2028",
    capacidad: "PMGD Solar 9 MW",
  },
  {
    centro: "Agua Santa (San Expedito II)",
    nombre: "Agua Santa",
    lat: -32.60,
    lon: -71.30,
    comuna: "La Ligua",
    region: "Valparaíso",
    mw: 30,
    mwh: 120,
    etapa: "Pipeline",
    cod: "2028",
    capacidad: "BESS — por definir",
  },
  {
    centro: "RUIL",
    nombre: "Ruil",
    lat: -35.55,
    lon: -72.30,
    comuna: "Cauquenes",
    region: "Maule",
    mw: 5,
    mwh: 0,
    etapa: "Pipeline",
    cod: "2028",
    capacidad: "Solar PV — por definir",
  },
];

// ============================================================================
// Gantt — fases por proyecto, en años/quarters
// ============================================================================

export type GanttPhase = "Desarrollo" | "Permisos" | "Financiamiento" | "Construcción" | "Operación";

export interface GanttFase {
  fase: GanttPhase;
  start: string; // YYYY-MM
  end: string;
  color: string;
}

export interface ProyectoGantt {
  centro: string;
  nombre: string;
  fases: GanttFase[];
  cod: string;
  mw: number;
}

const PHASE_COLORS: Record<GanttPhase, string> = {
  Desarrollo: "#94a3b8",
  Permisos: "#06b6d4",
  Financiamiento: "#8b5cf6",
  Construcción: "#f59e0b",
  Operación: "#10b981",
};

export const PROYECTOS_GANTT: ProyectoGantt[] = [
  {
    centro: "Panimávida(BESS RHO)",
    nombre: "Panimávida",
    cod: "Q1 2027",
    mw: 3,
    fases: [
      { fase: "Desarrollo", start: "2024-09", end: "2025-06", color: PHASE_COLORS.Desarrollo },
      { fase: "Permisos", start: "2025-04", end: "2025-12", color: PHASE_COLORS.Permisos },
      { fase: "Financiamiento", start: "2025-10", end: "2026-04", color: PHASE_COLORS.Financiamiento },
      { fase: "Construcción", start: "2026-05", end: "2027-02", color: PHASE_COLORS.Construcción },
      { fase: "Operación", start: "2027-03", end: "2030-12", color: PHASE_COLORS.Operación },
    ],
  },
  {
    centro: "La Ligua (San Expedito) ",
    nombre: "La Ligua / San Expedito",
    cod: "Q4 2027",
    mw: 90,
    fases: [
      { fase: "Desarrollo", start: "2024-11", end: "2025-08", color: PHASE_COLORS.Desarrollo },
      { fase: "Permisos", start: "2025-06", end: "2026-04", color: PHASE_COLORS.Permisos },
      { fase: "Financiamiento", start: "2025-12", end: "2026-09", color: PHASE_COLORS.Financiamiento },
      { fase: "Construcción", start: "2026-10", end: "2027-11", color: PHASE_COLORS.Construcción },
      { fase: "Operación", start: "2027-12", end: "2030-12", color: PHASE_COLORS.Operación },
    ],
  },
  {
    centro: "Santa Victoria 15 MW",
    nombre: "Santa Victoria",
    cod: "2028",
    mw: 15,
    fases: [
      { fase: "Desarrollo", start: "2025-06", end: "2026-06", color: PHASE_COLORS.Desarrollo },
      { fase: "Permisos", start: "2026-03", end: "2027-03", color: PHASE_COLORS.Permisos },
      { fase: "Financiamiento", start: "2026-12", end: "2027-09", color: PHASE_COLORS.Financiamiento },
      { fase: "Construcción", start: "2027-10", end: "2028-09", color: PHASE_COLORS.Construcción },
      { fase: "Operación", start: "2028-10", end: "2030-12", color: PHASE_COLORS.Operación },
    ],
  },
  {
    centro: "PMGD Ranguil III",
    nombre: "Ranguil III (PMGD)",
    cod: "2028",
    mw: 9,
    fases: [
      { fase: "Desarrollo", start: "2025-09", end: "2026-09", color: PHASE_COLORS.Desarrollo },
      { fase: "Permisos", start: "2026-06", end: "2027-06", color: PHASE_COLORS.Permisos },
      { fase: "Financiamiento", start: "2027-03", end: "2027-12", color: PHASE_COLORS.Financiamiento },
      { fase: "Construcción", start: "2028-01", end: "2028-10", color: PHASE_COLORS.Construcción },
      { fase: "Operación", start: "2028-11", end: "2030-12", color: PHASE_COLORS.Operación },
    ],
  },
  {
    centro: "PMGD Quebrada Escobar",
    nombre: "Quebrada Escobar (PMGD)",
    cod: "2028",
    mw: 9,
    fases: [
      { fase: "Desarrollo", start: "2025-09", end: "2026-09", color: PHASE_COLORS.Desarrollo },
      { fase: "Permisos", start: "2026-06", end: "2027-06", color: PHASE_COLORS.Permisos },
      { fase: "Financiamiento", start: "2027-03", end: "2027-12", color: PHASE_COLORS.Financiamiento },
      { fase: "Construcción", start: "2028-02", end: "2028-11", color: PHASE_COLORS.Construcción },
      { fase: "Operación", start: "2028-12", end: "2030-12", color: PHASE_COLORS.Operación },
    ],
  },
  {
    centro: "Agua Santa (San Expedito II)",
    nombre: "Agua Santa",
    cod: "2028",
    mw: 30,
    fases: [
      { fase: "Desarrollo", start: "2025-10", end: "2026-10", color: PHASE_COLORS.Desarrollo },
      { fase: "Permisos", start: "2026-08", end: "2027-08", color: PHASE_COLORS.Permisos },
      { fase: "Financiamiento", start: "2027-04", end: "2028-01", color: PHASE_COLORS.Financiamiento },
      { fase: "Construcción", start: "2028-02", end: "2028-12", color: PHASE_COLORS.Construcción },
      { fase: "Operación", start: "2029-01", end: "2030-12", color: PHASE_COLORS.Operación },
    ],
  },
];

export { PHASE_COLORS };

// Convert YYYY-MM to fractional year (e.g. 2025-04 -> 2025.25)
export function monthToFloat(s: string): number {
  const [y, m] = s.split("-").map(Number);
  return y + (m - 1) / 12;
}

// ============================================================================
// ESG / Impact estimates
// ============================================================================

export interface ESGSnapshot {
  mwTotal: number;
  mwhBESS: number;
  pvMW: number;
  bessMW: number;
  // Estimated annual generation (MWh) assuming capacity factor:
  //   PV ~ 0.27, BESS doesn't generate directly but enables shifting
  generacionAnualMWh: number;
  // CO2 avoided assuming grid emission factor ~0.39 tCO2/MWh (CDEC Chile aprox)
  co2EvitadoTonAnual: number;
  comunasImpactadas: number;
  regionesImpactadas: number;
  empleosConstruccion: number; // estimación: 8 empleos/MW solar, 3/MW BESS
  empleosOperacion: number;
  proyectosActivos: number;
  proyectosPipeline: number;
}

export function getESGSnapshot(): ESGSnapshot {
  // Capacidades reales por tecnología — explícitas para evitar doble conteo.
  // Panimávida combina PV 3 MW + BESS 9 MW / 36 MWh dentro del mismo SPV.
  const techByCentro: Record<string, { pv: number; bess: number; mwh: number }> = {
    "Panimávida(BESS RHO)": { pv: 3, bess: 9, mwh: 36 },
    "La Ligua (San Expedito) ": { pv: 0, bess: 90, mwh: 360 },
    "Santa Victoria 15 MW": { pv: 15, bess: 0, mwh: 0 },
    "PMGD Ranguil III": { pv: 9, bess: 0, mwh: 0 },
    "PMGD Quebrada Escobar": { pv: 9, bess: 0, mwh: 0 },
    "Agua Santa (San Expedito II)": { pv: 0, bess: 30, mwh: 120 },
    RUIL: { pv: 5, bess: 0, mwh: 0 },
  };
  const totalPv = Object.values(techByCentro).reduce((a, t) => a + t.pv, 0);
  const totalBess = Object.values(techByCentro).reduce((a, t) => a + t.bess, 0);
  const mwTotal = totalPv + totalBess;
  const mwhBESS = Object.values(techByCentro).reduce((a, t) => a + t.mwh, 0);
  // Generación PV: cap factor 0.27 -> MWh anuales = MW * 8760 * 0.27
  const generacionAnualMWh = Math.round(totalPv * 8760 * 0.27);
  const co2EvitadoTonAnual = Math.round(generacionAnualMWh * 0.39);
  const comunas = new Set(PROYECTOS_GEO.map((p) => p.comuna));
  const regiones = new Set(PROYECTOS_GEO.map((p) => p.region));
  const empleosConstruccion = Math.round(totalPv * 8 + totalBess * 3);
  const empleosOperacion = Math.round(totalPv * 0.3 + totalBess * 0.2);
  return {
    mwTotal,
    mwhBESS,
    pvMW: totalPv,
    bessMW: totalBess,
    generacionAnualMWh,
    co2EvitadoTonAnual,
    comunasImpactadas: comunas.size,
    regionesImpactadas: regiones.size,
    empleosConstruccion,
    empleosOperacion,
    proyectosActivos: PROYECTOS_GEO.filter((p) => p.etapa === "Construcción" || p.etapa === "Pre-construcción").length,
    proyectosPipeline: PROYECTOS_GEO.filter((p) => p.etapa === "Pipeline").length,
  };
}

// ============================================================================
// Risk surface — alertas accionables para directorio
// ============================================================================

export type Severity = "high" | "medium" | "low";

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  category: "Financiero" | "Operativo" | "Regulatorio" | "Comercial";
  severity: Severity;
  amount?: number;
  count?: number;
  due?: string;
  action?: string;
}

export function getRiskSurface(): RiskItem[] {
  const cuotas = analizarCuotasAdenda();
  const cuotasVencidas = cuotas.filter((c) => c.estado === "Vencida");
  const cuotasParcial = cuotas.filter((c) => c.estado === "Pagada parcial");
  const cuotasProximas = cuotas.filter((c) => {
    if (c.estado !== "Próxima") return false;
    // próximas a vencer en 30 días
    const meses: Record<string, string> = {
      ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
      jul: "07", ago: "08", sep: "09", oct: "10", nov: "11", dic: "12",
    };
    const partes = c.plazo.toLowerCase().split(" ");
    let plazoDate = "";
    if (partes.length === 3) {
      plazoDate = `${partes[2]}-${meses[partes[1]] || "01"}-${partes[0].padStart(2, "0")}`;
    } else if (partes.length === 2) {
      plazoDate = `${partes[1]}-${meses[partes[0]] || "01"}-28`;
    }
    if (!plazoDate) return false;
    const days = Math.round((new Date(plazoDate).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 60;
  });

  const ocs = dataset.oc;
  const ocsImpagas = ocs.filter((o) => o.Pagado === 0 && o.PorPagar > 0);
  const ocsParciales = ocs.filter((o) => o.Pagado > 0 && o.Pagado < o.PorPagar);

  const montoVencido = cuotasVencidas.reduce((a, b) => a + b.monto, 0);
  const montoOcPendiente = ocsImpagas.reduce((a, b) => a + b.PorPagar, 0);

  const items: RiskItem[] = [];

  if (cuotasVencidas.length > 0) {
    items.push({
      id: "cuotas-vencidas",
      title: `${cuotasVencidas.length} cuotas con plazo cumplido sin pagar`,
      description: `Cuotas ${cuotasVencidas
        .map((c) => c.letra)
        .join(", ")} suman ${formatLocal(montoVencido)}. Sin regularización, no hay equity para destrabar Sinosure ni cierre PPA La Ligua.`,
      category: "Financiero",
      severity: "high",
      amount: montoVencido,
      count: cuotasVencidas.length,
      action: "Regularizar pago al banco y formalizar nuevo plazo en próxima junta.",
    });
  }

  if (cuotasParcial.length > 0) {
    const monto = cuotasParcial.reduce((a, b) => a + (b.monto - b.pagado), 0);
    items.push({
      id: "cuotas-parciales",
      title: `${cuotasParcial.length} cuotas pagadas parcialmente`,
      description: `Falta completar ${formatLocal(monto)}. Pendiente cierre administrativo.`,
      category: "Financiero",
      severity: "medium",
      amount: monto,
      count: cuotasParcial.length,
    });
  }

  if (cuotasProximas.length > 0) {
    const monto = cuotasProximas.reduce((a, b) => a + b.monto, 0);
    items.push({
      id: "cuotas-proximas",
      title: `${cuotasProximas.length} cuotas próximas a vencer (60 días)`,
      description: `Cuotas ${cuotasProximas
        .map((c) => c.letra)
        .join(", ")} por ${formatLocal(monto)} con plazo dentro de los próximos 60 días.`,
      category: "Financiero",
      severity: "medium",
      amount: monto,
      count: cuotasProximas.length,
    });
  }

  if (ocsImpagas.length > 5) {
    items.push({
      id: "oc-impagas",
      title: `${ocsImpagas.length} órdenes de compra emitidas sin pago`,
      description: `${formatLocal(montoOcPendiente)} comprometido a proveedores sin desembolso bancario.`,
      category: "Operativo",
      severity: "medium",
      amount: montoOcPendiente,
      count: ocsImpagas.length,
    });
  }

  // Dependencias críticas estructurales
  items.push({
    id: "dep-sinosure",
    title: "Sinosure: línea condicionada a equity completo",
    description:
      "La línea de seguro Sinosure para Panimávida + La Ligua exige el aporte de capital completo del FIP CEHTA reflejado en balance Rho.",
    category: "Comercial",
    severity: "high",
    action: "Completar cuotas e/f + Auditoría flash antes de Q3 2026.",
  });

  items.push({
    id: "dep-catl",
    title: "CATL — LOI activo, cierre comercial pendiente",
    description:
      "Negociación CATL en curso para BESS La Ligua. Cierre depende de visita técnica y respaldo equity demostrable.",
    category: "Comercial",
    severity: "medium",
    action: "Confirmar gira China Q3 2026.",
  });

  items.push({
    id: "dep-ppa",
    title: "PPA La Ligua: target ≥ USD 42/MWh",
    description:
      "PPA con Energy Asset en negociación. Cierre es precondición para project finance.",
    category: "Comercial",
    severity: "medium",
  });

  items.push({
    id: "reg-sea",
    title: "SEA Panimávida: aprobado · seguimiento ambiental activo",
    description:
      "Permiso ambiental obtenido. Mantener cumplimiento de PAS y reporting trimestral.",
    category: "Regulatorio",
    severity: "low",
  });

  return items.sort((a, b) => {
    const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

function formatLocal(n: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

// ============================================================================
// Monthly aggregates — useful as series for sparklines and overview charts
// ============================================================================

export interface MesAgg {
  mes: string;
  abonos: number;
  egresoOp: number;
  saldoFinal: number;
  acumAbono: number;
  acumEgreso: number;
  numTx: number;
}

export function mesesAgregados(): MesAgg[] {
  const movs = movimientosHistoricos();
  const map: Record<string, MesAgg> = {};
  for (const m of movs) {
    const mes = m.FECHA_STR.slice(0, 7);
    if (!map[mes]) {
      map[mes] = {
        mes,
        abonos: 0,
        egresoOp: 0,
        saldoFinal: 0,
        acumAbono: 0,
        acumEgreso: 0,
        numTx: 0,
      };
    }
    if (m.ABONOS > 0 && m.General === "Capital") map[mes].abonos += m.ABONOS;
    if (isOperativo(m)) map[mes].egresoOp += m.EGRESO;
    map[mes].saldoFinal = m.SALDO;
    map[mes].numTx += 1;
  }
  const sorted = Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes));
  let accA = 0;
  let accE = 0;
  for (const r of sorted) {
    accA += r.abonos;
    accE += r.egresoOp;
    r.acumAbono = accA;
    r.acumEgreso = accE;
  }
  return sorted;
}

// Velocity (gasto del último mes vs. anterior)
export function velocityChange(): { last: number; prev: number; delta: number } {
  const m = mesesAgregados();
  if (m.length < 2) return { last: 0, prev: 0, delta: 0 };
  const last = m[m.length - 1].egresoOp;
  const prev = m[m.length - 2].egresoOp;
  const delta = prev > 0 ? ((last - prev) / prev) * 100 : 0;
  return { last, prev, delta };
}

// Days since last operational movement
export function diasDesdeUltimoGasto(): number {
  const movs = movimientosHistoricos();
  const ult = movs
    .filter((m) => m.EGRESO > 0 && isOperativo(m))
    .map((m) => m.FECHA_STR)
    .sort()
    .pop();
  if (!ult) return 0;
  return Math.floor((Date.now() - new Date(ult + "T12:00:00").getTime()) / 86400000);
}

// Data quality snapshot (% de movimientos clasificados)
export interface DataQuality {
  totalMovs: number;
  clasificados: number;
  pctClasificados: number;
  conCentro: number;
  pctConCentro: number;
  conHito: number;
  pctConHito: number;
  fechaCorte: string;
}

export function dataQuality(): DataQuality {
  const movs = dataset.movimientos;
  const total = movs.length;
  const clasif = movs.filter((m) => m.General && m.General !== "—").length;
  const conCentro = movs.filter((m) => m.Centro_Negocios && m.Centro_Negocios !== "—").length;
  const conHito = movs.filter((m) => m.Aporte_K && m.Aporte_K !== "—").length;
  const fechaCorte = dataset.metadata?.fecha_corte || movs.map((m) => m.FECHA_STR).sort().pop() || "";
  return {
    totalMovs: total,
    clasificados: clasif,
    pctClasificados: total > 0 ? (clasif / total) * 100 : 0,
    conCentro,
    pctConCentro: total > 0 ? (conCentro / total) * 100 : 0,
    conHito,
    pctConHito: total > 0 ? (conHito / total) * 100 : 0,
    fechaCorte,
  };
}

// Inversión por proyecto (operativa, excluyendo Oficina/Reversa)
// Resta devoluciones que vinieron de vuelta del proyecto para mostrar INVERSIÓN NETA.
export function inversionPorProyecto(): {
  centro: string;
  nombre: string;
  valor: number;          // = bruto - devoluciones (NETO)
  bruto: number;          // egresos totales clasificados al proyecto
  devoluciones: number;   // abonos clasificados como devolución a ese proyecto
  meta: any;
}[] {
  const movs = movimientosHistoricos();
  const brutoMap: Record<string, number> = {};
  const devMap: Record<string, number> = {};

  for (const m of movs) {
    // Egresos clasificados al proyecto
    if (isOperativo(m) && m.Centro_Negocios && m.Centro_Negocios !== "Reversa" && m.EGRESO > 0) {
      brutoMap[m.Centro_Negocios] = (brutoMap[m.Centro_Negocios] || 0) + m.EGRESO;
    }
    // Devoluciones — usar CentroDevolucion (puede ser reasignado desde "Reversa")
    if (m.esDevolucion) {
      const centro = m.CentroDevolucion || m.Centro_Negocios;
      if (centro && centro !== "Reversa" && centro !== "Oficina") {
        devMap[centro] = (devMap[centro] || 0) + m.ABONOS;
      }
    }
  }

  // Combinar keys
  const keys = new Set([...Object.keys(brutoMap), ...Object.keys(devMap)]);
  return Array.from(keys)
    .map((centro) => {
      const bruto = brutoMap[centro] || 0;
      const devoluciones = devMap[centro] || 0;
      return {
        centro,
        bruto,
        devoluciones,
        valor: Math.max(0, bruto - devoluciones),
        nombre: projectMeta(centro).nombre,
        meta: projectMeta(centro),
      };
    })
    .filter((p) => p.valor > 0 || p.devoluciones > 0)
    .sort((a, b) => b.valor - a.valor);
}

// ============================================================================
// Devoluciones — todas las que existen, con detalle
// ============================================================================
export interface Devolucion {
  fecha: string;
  monto: number;
  proyecto: string;
  proyectoNombre: string;
  descripcion: string;
  general: string;
  cuenta: string;
}

export function listarDevoluciones(): Devolucion[] {
  const movs = movimientosHistoricos();
  return movs
    .filter((m) => m.esDevolucion)
    .map((m) => {
      const centro = m.CentroDevolucion || m.Centro_Negocios || "—";
      return {
        fecha: m.FECHA_STR,
        monto: m.ABONOS,
        proyecto: centro,
        proyectoNombre: projectMeta(centro).nombre,
        descripcion: m.DESCRIPCION,
        general: m.General,
        cuenta: m.Cuenta || "Santander",
      };
    })
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export interface DevolucionAgg {
  proyecto: string;
  proyectoNombre: string;
  count: number;
  total: number;
  meta: any;
}

export function devolucionesAgregadas(): DevolucionAgg[] {
  const map: Record<string, { count: number; total: number }> = {};
  for (const d of listarDevoluciones()) {
    const k = d.proyecto;
    if (!map[k]) map[k] = { count: 0, total: 0 };
    map[k].count += 1;
    map[k].total += d.monto;
  }
  return Object.entries(map)
    .map(([proyecto, v]) => ({
      proyecto,
      proyectoNombre: projectMeta(proyecto).nombre,
      meta: projectMeta(proyecto),
      ...v,
    }))
    .sort((a, b) => b.total - a.total);
}

// ============================================================================
// Saldos por cuenta (CC Santander + CC BICE)
// ============================================================================
export interface SaldoCuenta {
  cuenta: string;
  saldoActual: number;
  movimientos: number;
}

export function saldosPorCuenta(): SaldoCuenta[] {
  const movs = dataset.movimientos;
  const map: Record<string, { mov: number; ultMov?: Movimiento }> = {};
  for (const m of movs) {
    const c = m.Cuenta || "Santander";
    if (!map[c]) map[c] = { mov: 0 };
    map[c].mov += 1;
    if (!map[c].ultMov || m.FECHA_STR >= (map[c].ultMov as Movimiento).FECHA_STR) {
      map[c].ultMov = m;
    }
  }
  // Fallback: usar metadata.cuentas si existe
  const meta = dataset.metadata?.cuentas;
  return Object.entries(map).map(([cuenta, v]) => ({
    cuenta,
    saldoActual: meta?.[cuenta]?.saldo_final ?? v.ultMov?.SALDO ?? 0,
    movimientos: v.mov,
  }));
}


// OC summary
export interface OCSummary {
  total: number;
  comprometido: number;
  pagado: number;
  pendiente: number;
  pctPagado: number;
  proveedoresUnicos: number;
  ocPagadas: number;
  ocParciales: number;
  ocPendientes: number;
}

export function ocSummary(): OCSummary {
  const ocs = dataset.oc;
  const comprometido = sum(ocs, (o) => o.PorPagar);
  const pagado = sum(ocs, (o) => o.Pagado);
  const pendiente = comprometido - pagado;
  return {
    total: ocs.length,
    comprometido,
    pagado,
    pendiente,
    pctPagado: comprometido > 0 ? (pagado / comprometido) * 100 : 0,
    proveedoresUnicos: new Set(ocs.map((o) => o.Proveedor).filter(Boolean)).size,
    ocPagadas: ocs.filter((o) => o.Pagado >= o.PorPagar && o.PorPagar > 0).length,
    ocParciales: ocs.filter((o) => o.Pagado > 0 && o.Pagado < o.PorPagar).length,
    ocPendientes: ocs.filter((o) => o.Pagado === 0 && o.PorPagar > 0).length,
  };
}

// ============================================================================
// Saldo bancario (saldo actual de la cuenta corriente)
// ============================================================================
export function saldoActual(): number {
  const movs = movimientosHistoricos();
  if (movs.length === 0) return 0;
  // Tomamos saldo de la última fila ordenada por fecha
  const last = [...movs].sort((a, b) => a.FECHA_STR.localeCompare(b.FECHA_STR)).pop();
  return last?.SALDO ?? 0;
}

// ============================================================================
// Headline KPIs — usado por Hero y One-Pager
// ============================================================================
export interface HeadlineKPIs {
  planContractual: number;
  pagado: number;
  ejecutado: number;
  vencido: number;
  saldoCC: number;
  cuotasPagadas: number;
  cuotasVencidas: number;
  cuotasTotal: number;
  pctPagado: number;
  pctEjecutado: number;
  fechaCorte: string;
  diasUltimo: number;
}

export function headlineKPIs(): HeadlineKPIs {
  const cuotas = analizarCuotasAdenda();
  const movs = movimientosHistoricos();
  const ejecutado = sum(movs.filter(isOperativo), (m) => m.EGRESO);
  const pagado = cuotas.reduce((a, b) => a + b.pagado, 0);
  const venc = cuotas.filter((c) => c.estado === "Vencida");
  const vencido = venc.reduce((a, b) => a + b.monto, 0);
  const fechaCorte = movs
    .filter((m) => m.EGRESO > 0 || m.ABONOS > 0)
    .map((m) => m.FECHA_STR)
    .sort()
    .pop() ?? new Date().toISOString().slice(0, 10);
  return {
    planContractual: TOTAL_APORTE_FIP_CLP,
    pagado,
    ejecutado,
    vencido,
    saldoCC: saldoActual(),
    cuotasPagadas: cuotas.filter((c) => c.estado === "Pagada").length,
    cuotasVencidas: venc.length,
    cuotasTotal: cuotas.length,
    pctPagado: (pagado / TOTAL_APORTE_FIP_CLP) * 100,
    pctEjecutado: pagado > 0 ? (ejecutado / pagado) * 100 : 0,
    fechaCorte,
    diasUltimo: diasDesdeUltimoGasto(),
  };
}
