/**
 * Audit checks — validan integridad y consistencia del dataset.
 * Cada check devuelve un AuditCheck con status "pass" | "warn" | "fail".
 */
import { dataset, analizarCuotasAdenda, cuotaCanonica, TOTAL_APORTE_FIP_CLP, isOperativo, sum } from "./data";
import { saldosPorCuenta, listarDevoluciones, dataQuality, ocSummary } from "./derived";

export type AuditStatus = "pass" | "warn" | "fail";

export interface AuditCheck {
  id: string;
  category: "Capital" | "Cuentas" | "OC" | "Clasificación" | "Datos";
  title: string;
  status: AuditStatus;
  detail: string;
  metric?: string;
  evidence?: string[];
}

export function runAuditChecks(): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const movs = dataset.movimientos;
  const ocs = dataset.oc;
  const cuotas = analizarCuotasAdenda();
  const saldos = saldosPorCuenta();
  const devs = listarDevoluciones();
  const dq = dataQuality();
  const oc = ocSummary();

  // === Check 1 — Cuotas pagadas consistentes ===
  for (const c of cuotas) {
    const ok = c.pctPago >= 98;
    const today = new Date().toISOString().slice(0, 10);
    const meses: Record<string, string> = {
      ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06",
      jul: "07", ago: "08", sep: "09", oct: "10", nov: "11", dic: "12",
    };
    const partes = c.plazo.toLowerCase().split(" ");
    let plazoDate = "";
    if (partes.length === 3) plazoDate = `${partes[2]}-${meses[partes[1]] || "01"}-${partes[0].padStart(2, "0")}`;
    else if (partes.length === 2) plazoDate = `${partes[1]}-${meses[partes[0]] || "01"}-28`;
    const vencida = plazoDate && plazoDate <= today;

    const cuentaUsada = movs
      .filter((m) => cuotaCanonica(m.Aporte_K) === c.aporteKey && m.ABONOS > 0 && m.General === "Capital")
      .map((m) => m.Cuenta || "Santander");
    const cuentaUnica = Array.from(new Set(cuentaUsada)).join(" + ") || "—";

    checks.push({
      id: `cuota-${c.id}`,
      category: "Capital",
      title: `Cuota ${c.letra} ${c.label}`,
      status: ok ? "pass" : vencida ? "fail" : "warn",
      detail: ok
        ? `Pagada al ${c.pctPago.toFixed(1)}% (plan $${Math.round(c.monto / 1e6)}M) vía ${cuentaUnica}.`
        : vencida
        ? `Plazo cumplido (${c.plazo}). Solo ${c.pctPago.toFixed(0)}% pagado.`
        : `Plazo futuro (${c.plazo}). Aún sin aporte.`,
      metric: `${c.pctPago.toFixed(0)}%`,
    });
  }

  // === Check 2 — Total pagado vs plan ===
  const totalPagado = cuotas.reduce((a, b) => a + b.pagado, 0);
  const pctTotal = (totalPagado / TOTAL_APORTE_FIP_CLP) * 100;
  checks.push({
    id: "total-pagado",
    category: "Capital",
    title: "Total paid-in vs plan contractual",
    status: pctTotal >= 90 ? "pass" : pctTotal >= 50 ? "warn" : "fail",
    detail: `Aportado $${Math.round(totalPagado / 1e6)}M de $${Math.round(TOTAL_APORTE_FIP_CLP / 1e6)}M (${pctTotal.toFixed(1)}%).`,
    metric: `${pctTotal.toFixed(1)}%`,
  });

  // === Check 3 — Saldos por cuenta presentes ===
  const ttlSaldo = saldos.reduce((a, s) => a + s.saldoActual, 0);
  checks.push({
    id: "saldos-cuentas",
    category: "Cuentas",
    title: `Saldos disponibles en ${saldos.length} cuenta${saldos.length === 1 ? "" : "s"}`,
    status: saldos.length >= 1 ? "pass" : "fail",
    detail: saldos.map((s) => `${s.cuenta}: $${Math.round(s.saldoActual / 1e6)}M (${s.movimientos} mov)`).join(" · "),
    metric: `$${Math.round(ttlSaldo / 1e6)}M`,
  });

  // === Check 4 — BICE detectada ===
  const hayBice = saldos.some((s) => s.cuenta === "BICE");
  checks.push({
    id: "cc-bice-presente",
    category: "Cuentas",
    title: "CC BICE integrada al dataset",
    status: hayBice ? "pass" : "warn",
    detail: hayBice
      ? "Movimientos del Banco BICE cargados correctamente."
      : "No se detectaron movimientos del Banco BICE en el dataset actual.",
  });

  // === Check 5 — Aporte_K normalizado ===
  const aporteVariantes = new Set(movs.map((m) => (m.Aporte_K || "").trim()).filter(Boolean));
  const huerfanas = Array.from(aporteVariantes).filter(
    (v) => !cuotaCanonica(v) && !["Préstamos", "Préstamo", "Reversa", "Oficina", "FFMM"].includes(v)
  );
  checks.push({
    id: "aporte-k-normalizado",
    category: "Clasificación",
    title: "Aporte_K: variantes reconocidas",
    status: huerfanas.length === 0 ? "pass" : "warn",
    detail:
      huerfanas.length === 0
        ? `${aporteVariantes.size} valores únicos · todas las cuotas (Cuarto_abono / Cuarto abono / etc.) se normalizan correctamente.`
        : `Valores Aporte_K sin mapeo a cuota: ${huerfanas.join(", ")}.`,
    evidence: huerfanas.length > 0 ? huerfanas : undefined,
  });

  // === Check 6 — Cobertura clasificación ===
  checks.push({
    id: "dq-general",
    category: "Datos",
    title: "Cobertura de clasificación contable",
    status: dq.pctClasificados >= 95 ? "pass" : dq.pctClasificados >= 80 ? "warn" : "fail",
    detail: `${dq.clasificados}/${dq.totalMovs} (${dq.pctClasificados.toFixed(1)}%) con categoría General; ${dq.pctConCentro.toFixed(0)}% con Centro de Negocios; ${dq.pctConHito.toFixed(0)}% con Aporte_K.`,
    metric: `${dq.pctClasificados.toFixed(0)}%`,
  });

  // === Check 7 — OC con discrepancia ===
  // Vincular pagos en movimientos vs tabla OC
  const ocPagosMovs: Record<string, number> = {};
  for (const m of movs) {
    const nombre = (m.Nombre || "").trim();
    const match = nombre.match(/^OC\d+/i);
    if (match) {
      const k = match[0];
      ocPagosMovs[k] = (ocPagosMovs[k] || 0) + m.EGRESO;
    }
  }
  let discrepancias = 0;
  for (const o of ocs) {
    const diff = Math.abs(o.Pagado - (ocPagosMovs[o.NumOC] || 0));
    if (diff > 1000 && o.Pagado > 0) discrepancias++;
  }
  const totalOcs = ocs.filter((o) => o.Pagado > 0).length;
  const pctReconciliado = totalOcs > 0 ? ((totalOcs - discrepancias) / totalOcs) * 100 : 100;
  checks.push({
    id: "oc-reconciliacion",
    category: "OC",
    title: "Reconciliación OC tabla vs pagos en banco",
    status: pctReconciliado >= 95 ? "pass" : pctReconciliado >= 70 ? "warn" : "fail",
    detail: `${discrepancias} de ${totalOcs} OC con diferencia entre Pagado (tabla) y suma de movimientos por NumOC. Esto es normal porque el campo Nombre en banco no siempre coincide con NumOC formal.`,
    metric: `${pctReconciliado.toFixed(0)}%`,
  });

  // === Check 8 — Devoluciones detectadas ===
  checks.push({
    id: "devoluciones",
    category: "Capital",
    title: "Devoluciones / boletas de garantía recuperadas",
    status: devs.length > 0 ? "pass" : "warn",
    detail:
      devs.length > 0
        ? `${devs.length} devoluciones detectadas por $${Math.round(devs.reduce((a, d) => a + d.monto, 0) / 1e6)}M (incluye boletas de garantía Santa Victoria + Codegua).`
        : "Sin devoluciones detectadas — verificar manualmente patrones nuevos.",
  });

  // === Check 9 — OC summary saludable ===
  checks.push({
    id: "oc-summary",
    category: "OC",
    title: "Estado del ciclo de OC",
    status: oc.pctPagado >= 85 ? "pass" : oc.pctPagado >= 60 ? "warn" : "fail",
    detail: `${oc.ocPagadas} OC pagadas 100%, ${oc.ocParciales} parciales, ${oc.ocPendientes} sin pago iniciar — total comprometido $${Math.round(oc.comprometido / 1e6)}M, pagado $${Math.round(oc.pagado / 1e6)}M.`,
    metric: `${oc.pctPagado.toFixed(1)}%`,
  });

  // === Check 10 — Saldo CC vs aportes/egresos coherente ===
  const totalAbonos = movs.reduce((a, m) => a + (m.ABONOS || 0), 0);
  const totalEgresos = movs.reduce((a, m) => a + (m.EGRESO || 0), 0);
  // Saldo CC = abonos - egresos (debería ser igual o muy cercano al saldo final agregado)
  const saldoCalculado = totalAbonos - totalEgresos;
  const diff = Math.abs(saldoCalculado - ttlSaldo);
  checks.push({
    id: "saldo-coherente",
    category: "Cuentas",
    title: "Identidad contable: Σ abonos − Σ egresos = Σ saldos",
    status: diff < 1000 ? "pass" : diff < 100_000 ? "warn" : "fail",
    detail: `Calculado $${Math.round(saldoCalculado / 1e6)}M · Saldos finales $${Math.round(ttlSaldo / 1e6)}M · diferencia $${Math.round(diff / 1000)}K.`,
    metric: `±$${Math.round(diff / 1000)}K`,
  });

  return checks;
}

export function auditSummary(checks: AuditCheck[]): {
  pass: number;
  warn: number;
  fail: number;
  total: number;
  score: number;
} {
  const pass = checks.filter((c) => c.status === "pass").length;
  const warn = checks.filter((c) => c.status === "warn").length;
  const fail = checks.filter((c) => c.status === "fail").length;
  const total = checks.length;
  const score = total > 0 ? Math.round(((pass + warn * 0.5) / total) * 100) : 0;
  return { pass, warn, fail, total, score };
}
