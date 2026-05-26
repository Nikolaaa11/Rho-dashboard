import type { DataSet, Movimiento, OC } from "./types";
import raw from "@/data/data.json";

export const dataset = raw as unknown as DataSet;

// === Formatters ===
export const fmtCLP = (n: number, opts: { compact?: boolean; decimals?: number } = {}) => {
  const { compact = false, decimals = 0 } = opts;
  if (compact) {
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    // En CLP: 1M = 1 millón; 1.000M = 1.000 millones (no usamos "MM MM")
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000).toFixed(0)} M`;
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)} M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)} K`;
    return `${sign}$${abs.toFixed(0)}`;
  }
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);
};

// Formato "$X.XXX M" en millones de CLP (ideal para KPIs grandes en columnas estrechas)
export const fmtMM = (n: number) => {
  const millones = n / 1_000_000;
  return `$${new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(millones)} M`;
};

export const fmtNum = (n: number, decimals = 0) =>
  new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);

export const fmtDate = (s: string) => {
  try {
    const d = new Date(s);
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
};

export const fmtMonth = (s: string) => {
  try {
    const d = new Date(s);
    return d.toLocaleDateString("es-CL", { month: "short", year: "2-digit" });
  } catch {
    return s;
  }
};

// === Project metadata ===
export type ProjectStage = "Construcción" | "Pre-construcción" | "Pipeline" | "Discontinuado" | "Estructura";

export interface ProjectMeta {
  nombre: string;
  codigo: string;
  estado: "Activo" | "Discontinuado" | "Exploratorio";
  etapa: ProjectStage;
  tecnologia: string;
  capacidad: string;
  ubicacion: string;
  cod: string; // Fecha esperada de operación comercial
  descripcion: string;
  highlights: string[];
}

export const PROYECTOS: Record<string, ProjectMeta> = {
  "Panimávida(BESS RHO)": {
    nombre: "Panimávida",
    codigo: "RHO0001",
    estado: "Activo",
    etapa: "Construcción",
    tecnologia: "Agrivoltaico + BESS",
    capacidad: "PV 3 MW + BESS 9 MW / 36 MWh",
    ubicacion: "Región del Maule",
    cod: "Q1 2027",
    descripcion:
      "Primer proyecto agrivoltaico de Chile. Vehículo ancla para la línea de crédito Sinosure y la estrategia de financiamiento con proveedores chinos.",
    highlights: [
      "Inicio de construcción Mayo 2026",
      "Permiso SEA aprobado",
      "PPA en negociación",
      "Hito clave para Sinosure",
    ],
  },
  "La Ligua (San Expedito) ": {
    nombre: "La Ligua / San Expedito",
    codigo: "RHO0002",
    estado: "Activo",
    etapa: "Pre-construcción",
    tecnologia: "BESS standalone",
    capacidad: "90 MW / 360 MWh",
    ubicacion: "Región de Valparaíso",
    cod: "Q4 2027",
    descripcion:
      "BESS de gran escala co-ubicado con la planta solar de METLEN (213 MW) en Subestación Nueva La Ligua. SPV: San Expedito Energy SpA.",
    highlights: [
      "Co-ubicación con METLEN 213 MW solar",
      "Estructura: 80% supplier finance + 20% equity",
      "PPA target ≥ USD 42/MWh",
      "Negociación CATL activa",
    ],
  },
  "Codegua (Explícito)": {
    nombre: "Codegua",
    codigo: "RHO0003",
    estado: "Discontinuado",
    etapa: "Discontinuado",
    tecnologia: "—",
    capacidad: "—",
    ubicacion: "Región de O'Higgins",
    cod: "—",
    descripcion: "Proyecto evaluado y discontinuado. Aprendizajes incorporados al pipeline activo.",
    highlights: [],
  },
  "Santa Victoria 15 MW": {
    nombre: "Santa Victoria",
    codigo: "RHO0005",
    estado: "Activo",
    etapa: "Pipeline",
    tecnologia: "Solar PV",
    capacidad: "15 MW",
    ubicacion: "Chile central",
    cod: "2028",
    descripcion: "Proyecto solar de mediana escala en etapa de estudios preoperativos.",
    highlights: ["Estudios de conexión en curso"],
  },
  RUIL: {
    nombre: "Ruil",
    codigo: "RHO0009",
    estado: "Activo",
    etapa: "Pipeline",
    tecnologia: "Solar PV",
    capacidad: "Por definir",
    ubicacion: "Chile central",
    cod: "2028",
    descripcion: "Proyecto en pre-evaluación.",
    highlights: [],
  },
  "Agua Santa (San Expedito II)": {
    nombre: "Agua Santa",
    codigo: "RHO0008",
    estado: "Activo",
    etapa: "Pipeline",
    tecnologia: "BESS",
    capacidad: "Por definir",
    ubicacion: "Región de Valparaíso",
    cod: "2028",
    descripcion: "Segunda fase de San Expedito. Aprovecha la estructura ya desarrollada en La Ligua.",
    highlights: ["Sinergia con San Expedito I"],
  },
  "PMGD Ranguil III": {
    nombre: "PMGD Ranguil III",
    codigo: "RHO0010",
    estado: "Activo",
    etapa: "Pipeline",
    tecnologia: "PMGD Solar",
    capacidad: "9 MW",
    ubicacion: "Chile central",
    cod: "2028",
    descripcion: "Pequeño Medio de Generación Distribuida — esquema regulatorio estabilizado.",
    highlights: [],
  },
  "PMGD Quebrada Escobar": {
    nombre: "PMGD Quebrada Escobar",
    codigo: "RHO00QE",
    estado: "Activo",
    etapa: "Pipeline",
    tecnologia: "PMGD Solar",
    capacidad: "9 MW",
    ubicacion: "Chile central",
    cod: "2028",
    descripcion: "PMGD en etapa avanzada de desarrollo.",
    highlights: [],
  },
  Oficina: {
    nombre: "Estructura corporativa",
    codigo: "—",
    estado: "Activo",
    etapa: "Estructura",
    tecnologia: "—",
    capacidad: "—",
    ubicacion: "Santiago",
    cod: "—",
    descripcion:
      "RRHH, oficinas, contabilidad, asesorías corporativas y viajes (incluyendo gira China para negociación con CATL).",
    highlights: ["Equipo de 4 personas + asesores", "Directorio activo"],
  },
  Reversa: {
    nombre: "Ajustes contables",
    codigo: "—",
    estado: "Activo",
    etapa: "Estructura",
    tecnologia: "—",
    capacidad: "—",
    ubicacion: "—",
    cod: "—",
    descripcion: "Movimientos de reversa por errores bancarios. No constituyen gasto real.",
    highlights: [],
  },
};

export function projectMeta(centro: string): ProjectMeta {
  return (
    PROYECTOS[centro] ?? {
      nombre: centro || "Sin clasificar",
      codigo: "—",
      estado: "Activo",
      etapa: "Pipeline",
      tecnologia: "—",
      capacidad: "—",
      ubicacion: "—",
      cod: "—",
      descripcion: "",
      highlights: [],
    }
  );
}

// Mapping de código de OC a centro de negocios
export function ocProyectoToCentro(p: string): string {
  const map: Record<string, string> = {
    RHO001: "Panimávida(BESS RHO)",
    RHO002: "La Ligua (San Expedito) ",
    RHO003: "Codegua (Explícito)",
    RHO005: "Santa Victoria 15 MW",
    RHO008: "Agua Santa (San Expedito II)",
    RHO009: "RUIL",
    RHO010: "PMGD Ranguil III",
    Oficina: "Oficina",
  };
  return map[(p ?? "").trim()] ?? p;
}

// === Hitos / Aporte K ===
export const HITOS: Record<string, { label: string; aporte_clp: number; acciones: number; orden: number }> = {
  Primer_abono: { label: "Hito 1", aporte_clp: 300_000_000, acciones: 944, orden: 1 },
  Segundo_abono: { label: "Hito 2", aporte_clp: 250_000_000, acciones: 786, orden: 2 },
  Tercer_abono: { label: "Hito 3", aporte_clp: 249_000_000, acciones: 786, orden: 3 },
  Cuarto_abono: { label: "Hito 4", aporte_clp: 135_357_666, acciones: 426, orden: 4 },
  FFMM: { label: "Fondos Mutuos", aporte_clp: 0, acciones: 0, orden: 5 },
  Préstamos: { label: "Préstamos", aporte_clp: 0, acciones: 0, orden: 6 },
  Reversa: { label: "Reversa", aporte_clp: 0, acciones: 0, orden: 7 },
  Oficina: { label: "Oficina", aporte_clp: 0, acciones: 0, orden: 8 },
};

export const TOTAL_APORTE_FIP_CLP = 1_800_002_765; // según acciones_financiamiento

// === Aggregations ===
export function sum<T>(arr: T[], pick: (x: T) => number) {
  return arr.reduce((a, b) => a + (pick(b) || 0), 0);
}

export function groupBy<T>(arr: T[], key: (x: T) => string) {
  const out: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item) || "—";
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  return out;
}

export function unique<T>(arr: T[], key: (x: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

// Egresos operativos: excluye Préstamos, Reversa, Fondos Mutuos, Capital
export function isOperativo(m: Movimiento) {
  return !["Préstamos", "Reversa", "Fondos_Mutuos", "Capital"].includes(m.General);
}

// Aportes de capital reales (entradas que son aporte K)
export function isAporteCapital(m: Movimiento) {
  return m.General === "Capital" || ["Primer_abono", "Segundo_abono", "Tercer_abono", "Cuarto_abono"].includes(m.Aporte_K) && m.ABONOS > 0;
}

// Filtra movimientos a fechas reales (<= hoy)
export function movimientosHistoricos(): Movimiento[] {
  const today = new Date().toISOString().slice(0, 10);
  return dataset.movimientos.filter((m) => m.FECHA_STR <= today);
}

// === Project analytics ===
export interface ProjectAnalytics {
  centro: string;
  meta: ProjectMeta;
  totalEjecutado: number;
  movs: Movimiento[];
  ocs: OC[];
  ocComprometido: number;
  ocPagado: number;
  primerGasto: string;
  ultimoGasto: string;
  porCategoria: { categoria: string; subcat: string; valor: number }[];
  mensual: { mes: string; valor: number }[];
  proveedores: { proveedor: string; valor: number }[];
}

export function analyzeProject(centro: string, movs: Movimiento[], ocs: OC[]): ProjectAnalytics {
  const items = movs.filter((m) => m.Centro_Negocios === centro && m.EGRESO > 0);
  const projOcs = ocs.filter((o) => ocProyectoToCentro(o.Proyecto) === centro);

  // Por categoría (General + Detallado)
  const catMap: Record<string, number> = {};
  for (const m of items) {
    const key = `${m.General}|${m.Detallado}`;
    catMap[key] = (catMap[key] || 0) + m.EGRESO;
  }
  const porCategoria = Object.entries(catMap)
    .map(([k, v]) => {
      const [general, sub] = k.split("|");
      return { categoria: general, subcat: sub, valor: v };
    })
    .sort((a, b) => b.valor - a.valor);

  // Mensual
  const mMap: Record<string, number> = {};
  for (const m of items) {
    const mes = m.FECHA_STR.slice(0, 7);
    mMap[mes] = (mMap[mes] || 0) + m.EGRESO;
  }
  const mensual = Object.entries(mMap)
    .map(([mes, valor]) => ({ mes, valor }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  // Proveedores (desde OC pagados)
  const provMap: Record<string, number> = {};
  for (const o of projOcs) {
    provMap[o.Proveedor] = (provMap[o.Proveedor] || 0) + o.Pagado;
  }
  const proveedores = Object.entries(provMap)
    .map(([proveedor, valor]) => ({ proveedor, valor }))
    .sort((a, b) => b.valor - a.valor);

  const fechas = items.map((m) => m.FECHA_STR).sort();

  return {
    centro,
    meta: projectMeta(centro),
    totalEjecutado: items.reduce((a, b) => a + b.EGRESO, 0),
    movs: items,
    ocs: projOcs,
    ocComprometido: projOcs.reduce((a, b) => a + b.PorPagar, 0),
    ocPagado: projOcs.reduce((a, b) => a + b.Pagado, 0),
    primerGasto: fechas[0] ?? "",
    ultimoGasto: fechas[fechas.length - 1] ?? "",
    porCategoria,
    mensual,
    proveedores,
  };
}

// === Plan de desembolsos ===
// Plan original CONTRACTUAL según Adenda N°2 al Contrato de Suscripción de Acciones,
// firmada el 27 de octubre de 2025 ante el Notario Juan Ricardo San Martín Urrejola.
// 6 cuotas (a-f) por un total de 5.665 acciones = $1.800.002.765 a $317.741 por acción.
export interface CuotaAdenda {
  id: string;
  letra: string;
  label: string;
  plazo: string; // fecha legal según Adenda
  monto: number;
  acciones: number;
  aporteKey: string; // mapping al campo Aporte_K del Excel
  cuotaOrden: number;
}

export const CUOTAS_ADENDA_N2: CuotaAdenda[] = [
  {
    id: "a",
    letra: "a)",
    label: "Primera cuota",
    plazo: "28 feb 2025",
    monto: 298_676_540,
    acciones: 940,
    aporteKey: "Primer_abono",
    cuotaOrden: 1,
  },
  {
    id: "b",
    letra: "b)",
    label: "Segunda cuota",
    plazo: "abr 2025",
    monto: 317_741_000,
    acciones: 1000,
    aporteKey: "Segundo_abono",
    cuotaOrden: 2,
  },
  {
    id: "c",
    letra: "c)",
    label: "Tercera cuota",
    plazo: "oct 2025",
    monto: 182_383_334,
    acciones: 574,
    aporteKey: "Tercer_abono",
    cuotaOrden: 3,
  },
  {
    id: "d",
    letra: "d)",
    label: "Cuarta cuota",
    plazo: "dic 2025",
    monto: 135_357_666,
    acciones: 426,
    aporteKey: "Cuarto_abono",
    cuotaOrden: 4,
  },
  {
    id: "e",
    letra: "e)",
    label: "Quinta cuota",
    plazo: "feb 2026",
    monto: 432_763_242,
    acciones: 1362,
    aporteKey: "Quinto_abono",
    cuotaOrden: 5,
  },
  {
    id: "f",
    letra: "f)",
    label: "Sexta cuota",
    plazo: "abr 2026",
    monto: 433_080_983,
    acciones: 1363,
    aporteKey: "Sexto_abono",
    cuotaOrden: 6,
  },
];

export const ADENDA_N2_METADATA = {
  fechaFirma: "2025-10-27",
  notario: "Juan Ricardo San Martín Urrejola",
  codigoVerificacion: "20251027170542JRZ",
  fechaContratoOriginal: "2024-11-25",
  fechaAdendaN1: "2025-04-04",
  valorAccion: 317_741,
  accionesTotales: 5665,
  participacion: 0.85, // 85% de la sociedad
};

// Para cada cuota, calcula el estado real:
//   - Pagado: si los abonos al banco con ese Aporte_K alcanzan el monto requerido
//   - Vencido: si plazo <= hoy y no está pagado
//   - Próximo: si plazo > hoy
export type EstadoCuota = "Pagada" | "Pagada parcial" | "Vencida" | "Próxima";

export interface CuotaConEstado extends CuotaAdenda {
  pagado: number;
  fechaPagoUltima: string;
  ejecutado: number; // gasto operativo clasificado a esa cuota
  estado: EstadoCuota;
  pctPago: number;
}

export function analizarCuotasAdenda(): CuotaConEstado[] {
  const today = new Date().toISOString().slice(0, 10);
  const movs = dataset.movimientos;
  return CUOTAS_ADENDA_N2.map((cuota) => {
    // Pagos efectivos al banco con ese Aporte_K en categoría Capital
    const pagosBancarios = movs.filter(
      (m) => m.Aporte_K === cuota.aporteKey && m.ABONOS > 0 && m.General === "Capital"
    );
    const pagado = pagosBancarios.reduce((a, b) => a + b.ABONOS, 0);
    const fechasPago = pagosBancarios.map((m) => m.FECHA_STR).sort();
    const fechaPagoUltima = fechasPago[fechasPago.length - 1] ?? "";

    // Gasto operativo ejecutado de esa cuota
    const ejecutado = movs
      .filter((m) => m.Aporte_K === cuota.aporteKey && isOperativo(m))
      .reduce((a, b) => a + b.EGRESO, 0);

    // Determinar estado
    // Convertir plazo a fecha (aprox al primer día del mes)
    const plazoDate = parsePlazo(cuota.plazo);
    const vencida = plazoDate <= today;
    const completa = pagado >= cuota.monto * 0.98; // tolerancia 2%
    const parcial = pagado > 0 && !completa;

    let estado: EstadoCuota;
    if (completa) estado = "Pagada";
    else if (parcial) estado = "Pagada parcial";
    else if (vencida) estado = "Vencida";
    else estado = "Próxima";

    return {
      ...cuota,
      pagado,
      fechaPagoUltima,
      ejecutado,
      estado,
      pctPago: cuota.monto > 0 ? (pagado / cuota.monto) * 100 : 0,
    };
  });
}

function parsePlazo(plazo: string): string {
  // "28 feb 2025" -> "2025-02-28"; "abr 2025" -> "2025-04-30"
  const meses: Record<string, string> = {
    ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
    jul: "07", ago: "08", sep: "09", oct: "10", nov: "11", dic: "12",
  };
  const partes = plazo.toLowerCase().split(" ");
  if (partes.length === 3) {
    const [day, mes, year] = partes;
    return `${year}-${meses[mes] || "01"}-${day.padStart(2, "0")}`;
  } else if (partes.length === 2) {
    const [mes, year] = partes;
    return `${year}-${meses[mes] || "01"}-28`;
  }
  return plazo;
}

// Asignación proyectada de las cuotas pendientes (d, e, f) por proyecto
export const PLAN_USO_CUOTAS_PENDIENTES = [
  {
    proyecto: "Panimávida(BESS RHO)",
    porcentaje: 40,
    descripcion: "Inicio de construcción agrivoltaico + BESS. Aporte de equity para destrabar línea Sinosure.",
  },
  {
    proyecto: "La Ligua (San Expedito) ",
    porcentaje: 30,
    descripcion: "Equity 20% para BESS 90 MW, cierre PPA con Energy Asset, desarrollo SPV.",
  },
  {
    proyecto: "Pipeline desarrollo",
    porcentaje: 20,
    descripcion: "Santa Victoria, Ruil, PMGD Ranguil III, Agua Santa: estudios, DIA, conexión.",
  },
  {
    proyecto: "Estructura",
    porcentaje: 10,
    descripcion: "RRHH, oficina, asesorías, viajes (LOI CATL, Sinosure, due diligence).",
  },
];

// Legacy (mantenido por compatibilidad con vistas que aún lo usan)
export const PLAN_DESEMBOLSOS_ORIGINAL = CUOTAS_ADENDA_N2.map((c) => ({
  id: `h${c.cuotaOrden}`,
  label: c.label,
  fecha: parsePlazo(c.plazo).slice(0, 7),
  monto: c.monto,
  acciones: c.acciones,
  estado: "Ejecutado" as const,
}));

export const PLAN_USO_HITO5 = PLAN_USO_CUOTAS_PENDIENTES.map((u) => ({
  ...u,
  monto: 0,
}));
