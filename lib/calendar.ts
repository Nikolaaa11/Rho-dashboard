/**
 * Utilities para parsear plazos contractuales (formato Adenda N°2) y
 * calcular days-to-deadline / overdue / urgency status.
 */
import { analizarCuotasAdenda, type CuotaConEstado } from "./data";

const MES_MAP: Record<string, string> = {
  ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
  jul: "07", ago: "08", sep: "09", oct: "10", nov: "11", dic: "12",
};

/**
 * Convierte plazos como "28 feb 2025" o "abr 2025" → "2025-02-28" o "2025-04-28".
 * Si no puede parsear devuelve null.
 */
export function plazoToDate(plazo: string): string | null {
  if (!plazo) return null;
  const partes = plazo.toLowerCase().trim().split(/\s+/);
  if (partes.length === 3) {
    const [day, mes, year] = partes;
    const mm = MES_MAP[mes.slice(0, 3)];
    if (!mm) return null;
    return `${year}-${mm}-${day.padStart(2, "0")}`;
  }
  if (partes.length === 2) {
    const [mes, year] = partes;
    const mm = MES_MAP[mes.slice(0, 3)];
    if (!mm) return null;
    // Día por defecto: último día del mes (más conservador para vencimientos)
    return `${year}-${mm}-28`;
  }
  return null;
}

export function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(to + "T12:00:00").getTime() - new Date(from + "T12:00:00").getTime()) / 86400000
  );
}

export type UrgencyLevel = "overdue" | "urgent" | "soon" | "future" | "paid";

export interface CallStatus {
  cuota: CuotaConEstado;
  plazoDate: string | null;
  daysToDeadline: number | null; // negativo si vencido
  urgency: UrgencyLevel;
  label: string; // "vencido hace 12 días" / "en 45 días" / etc.
}

export function getCallStatuses(): CallStatus[] {
  const cuotas = analizarCuotasAdenda();
  const today = new Date().toISOString().slice(0, 10);

  return cuotas.map((c) => {
    const plazoDate = plazoToDate(c.plazo);
    const days = plazoDate ? daysBetween(today, plazoDate) : null;

    let urgency: UrgencyLevel = "future";
    if (c.estado === "Pagada") urgency = "paid";
    else if (days === null) urgency = "future";
    else if (days < 0) urgency = "overdue";
    else if (days <= 30) urgency = "urgent";
    else if (days <= 90) urgency = "soon";
    else urgency = "future";

    let label = "";
    if (urgency === "paid") {
      label = "Pagada";
    } else if (urgency === "overdue" && days !== null) {
      const d = Math.abs(days);
      label = `Vencida hace ${d} día${d === 1 ? "" : "s"}`;
    } else if (days !== null) {
      label = `Vence en ${days} día${days === 1 ? "" : "s"}`;
    } else {
      label = c.plazo;
    }

    return { cuota: c, plazoDate, daysToDeadline: days, urgency, label };
  });
}

export const URGENCY_CONFIG: Record<
  UrgencyLevel,
  { color: string; bg: string; ring: string; label: string }
> = {
  overdue: { color: "#dc2626", bg: "#fee2e2", ring: "#fca5a5", label: "Vencido" },
  urgent: { color: "#d97706", bg: "#fef3c7", ring: "#fcd34d", label: "Urgente" },
  soon: { color: "#0891b2", bg: "#cffafe", ring: "#67e8f9", label: "Próximo" },
  future: { color: "#475569", bg: "#f1f5f9", ring: "#cbd5e1", label: "Futuro" },
  paid: { color: "#059669", bg: "#d1fae5", ring: "#6ee7b7", label: "Pagada" },
};
