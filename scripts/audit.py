"""
Auditoría integral de data.json:
- Reconciliación de cuotas Adenda N°2 vs aportes reales en CC
- Validación de OC vs movimientos bancarios
- Detección de problemas de clasificación (Aporte_K, Centro_Negocios)
- Validación de saldos por cuenta
- Reporte de inconsistencias
"""
import json
import re
import unicodedata
from pathlib import Path
from collections import Counter, defaultdict

DATA = json.load(open(r"C:\Users\nicol\Downloads\rho-dashboard (2)\rho-dashboard\data\data.json", encoding="utf-8"))
movs = DATA["movimientos"]
ocs = DATA["oc"]

# =============================================================================
# CUOTAS ADENDA N°2 (referencia contractual)
# =============================================================================
CUOTAS = [
    {"id": "a", "letra": "a)", "label": "Primera cuota", "plazo": "28 feb 2025", "monto": 298_676_540, "key": "Primer_abono"},
    {"id": "b", "letra": "b)", "label": "Segunda cuota", "plazo": "abr 2025",    "monto": 317_741_000, "key": "Segundo_abono"},
    {"id": "c", "letra": "c)", "label": "Tercera cuota", "plazo": "oct 2025",    "monto": 182_383_334, "key": "Tercer_abono"},
    {"id": "d", "letra": "d)", "label": "Cuarta cuota",  "plazo": "dic 2025",    "monto": 135_357_666, "key": "Cuarto_abono"},
    {"id": "e", "letra": "e)", "label": "Quinta cuota",  "plazo": "feb 2026",    "monto": 432_763_242, "key": "Quinto_abono"},
    {"id": "f", "letra": "f)", "label": "Sexta cuota",   "plazo": "abr 2026",    "monto": 433_080_983, "key": "Sexto_abono"},
]


def normalize_key(s: str) -> str:
    """Normaliza Aporte_K: minúsculas, sin acentos, espacios/underscores unificados."""
    if not s:
        return ""
    s = s.strip().lower()
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[\s_]+", "_", s)
    return s


KEY_VARIANTS = {
    "Primer_abono":   ["primer_abono", "primer abono", "primera_cuota"],
    "Segundo_abono":  ["segundo_abono", "segundo abono"],
    "Tercer_abono":   ["tercer_abono", "tercer abono", "tercera_cuota"],
    "Cuarto_abono":   ["cuarto_abono", "cuarto abono", "cuarta_cuota"],
    "Quinto_abono":   ["quinto_abono", "quinto abono", "quinta_cuota"],
    "Sexto_abono":    ["sexto_abono", "sexto abono", "sexta_cuota"],
}

# Construir set de variantes normalizadas para cada cuota
LOOKUP = {}
for canonical, variants in KEY_VARIANTS.items():
    for v in variants:
        LOOKUP[normalize_key(v)] = canonical


def cuota_canonica(aporte_k: str) -> str | None:
    """Devuelve la key canónica si el Aporte_K matchea alguna cuota."""
    n = normalize_key(aporte_k)
    return LOOKUP.get(n)


# =============================================================================
# AUDIT 1 — UNIVERSO DE VALORES Aporte_K
# =============================================================================
print("=" * 78)
print("AUDIT 1 · Universo de valores Aporte_K")
print("=" * 78)
c_raw = Counter()
c_norm = Counter()
for m in movs:
    raw = m.get("Aporte_K") or ""
    c_raw[raw] += 1
    c_norm[normalize_key(raw)] += 1

print("\nValores RAW de Aporte_K (top 20):")
for v, n in c_raw.most_common(20):
    canon = cuota_canonica(v)
    flag = f"  → {canon}" if canon else ("  → (no es cuota)" if v else "")
    print(f"  {n:4d}  {v!r:30}{flag}")

print(f"\nTotal valores únicos: {len(c_raw)}")


# =============================================================================
# AUDIT 2 — Cuota por cuota: pagado vs comprometido
# =============================================================================
print("\n" + "=" * 78)
print("AUDIT 2 · Pago de cuotas Adenda N°2 (consolidado Santander + BICE)")
print("=" * 78)

for c in CUOTAS:
    canon = c["key"]
    # Capital pagado para esta cuota
    pagos = [
        m for m in movs
        if cuota_canonica(m.get("Aporte_K")) == canon
        and m.get("ABONOS", 0) > 0
        and (m.get("General") == "Capital" or "abono capital" in (m.get("DESCRIPCION") or "").lower())
    ]
    total = sum(m["ABONOS"] for m in pagos)
    cuentas_uso = set(m.get("Cuenta", "Santander") for m in pagos)
    plan = c["monto"]
    pct = (total / plan * 100) if plan > 0 else 0
    estado = "PAGADA ✓" if pct >= 98 else ("PARCIAL" if total > 0 else "SIN PAGO")
    print(f"\n  Cuota {c['letra']} {c['label']}  — plazo {c['plazo']}")
    print(f"    Plan:    ${plan:>15,.0f}")
    print(f"    Pagado:  ${total:>15,.0f}  ({pct:.1f}%)  · {estado}")
    print(f"    Cuentas: {', '.join(cuentas_uso) if cuentas_uso else '—'}")
    for m in pagos:
        print(f"      {m['FECHA_STR']} · {m.get('Cuenta','?'):10}  ${m['ABONOS']:>15,.0f}  {m.get('DESCRIPCION','')[:60]}")


# =============================================================================
# AUDIT 3 — Saldo por cuenta
# =============================================================================
print("\n" + "=" * 78)
print("AUDIT 3 · Saldos por cuenta")
print("=" * 78)
by_cuenta = defaultdict(list)
for m in movs:
    by_cuenta[m.get("Cuenta", "Santander")].append(m)

for cuenta, mvs in by_cuenta.items():
    mvs_sorted = sorted(mvs, key=lambda m: m["FECHA_STR"])
    total_abonos = sum(m["ABONOS"] for m in mvs)
    total_egresos = sum(m["EGRESO"] for m in mvs)
    saldo = mvs_sorted[-1]["SALDO"] if mvs_sorted else 0
    print(f"\n  Cuenta {cuenta}:")
    print(f"    Movimientos:    {len(mvs)}")
    print(f"    Total abonos:   ${total_abonos:>15,.0f}")
    print(f"    Total egresos:  ${total_egresos:>15,.0f}")
    print(f"    Saldo final:    ${saldo:>15,.0f}")
    if mvs_sorted:
        print(f"    Rango:          {mvs_sorted[0]['FECHA_STR']} → {mvs_sorted[-1]['FECHA_STR']}")


# =============================================================================
# AUDIT 4 — OC vs pagos en movimientos
# =============================================================================
print("\n" + "=" * 78)
print("AUDIT 4 · Reconciliación OC vs movimientos")
print("=" * 78)

# Por cada OC, sumar pagos en movimientos cuyo Nombre coincide con NumOC
oc_pagos_movs = defaultdict(float)
for m in movs:
    nombre = (m.get("Nombre") or "").strip()
    if re.match(r"^OC\d+", nombre, re.IGNORECASE):
        # Tomar primera palabra (puede ser "OC0001")
        oc_id = nombre.split()[0]
        oc_pagos_movs[oc_id] += m["EGRESO"]

# Comparar
discrepancias = []
for o in ocs:
    num = o["NumOC"]
    pagado_oc = o["Pagado"]
    pagado_movs = oc_pagos_movs.get(num, 0)
    diff = abs(pagado_oc - pagado_movs)
    if diff > 1000 and pagado_oc > 0:  # tolerancia 1000 CLP
        discrepancias.append({
            "oc": num,
            "proveedor": o["Proveedor"],
            "tabla_oc": pagado_oc,
            "en_movs": pagado_movs,
            "diff": pagado_oc - pagado_movs,
        })

print(f"\nOC con discrepancias mayores a $1000: {len(discrepancias)}")
for d in discrepancias[:15]:
    print(f"  {d['oc']:10} {d['proveedor'][:25]:25}  tabla=${d['tabla_oc']:>12,.0f}  movs=${d['en_movs']:>12,.0f}  diff=${d['diff']:>12,.0f}")
if len(discrepancias) > 15:
    print(f"  ... y {len(discrepancias) - 15} más")


# =============================================================================
# AUDIT 5 — Movimientos sin clasificar (% del total)
# =============================================================================
print("\n" + "=" * 78)
print("AUDIT 5 · Calidad del dato — % clasificado")
print("=" * 78)

total = len(movs)
con_general = sum(1 for m in movs if (m.get("General") or "").strip())
con_centro = sum(1 for m in movs if (m.get("Centro_Negocios") or "").strip())
con_aporte = sum(1 for m in movs if (m.get("Aporte_K") or "").strip())
con_doc = sum(1 for m in movs if (m.get("LINK") or "").startswith("http"))

print(f"  Total movimientos:              {total}")
print(f"  Con General:                    {con_general:>4d}  ({con_general/total*100:5.1f}%)")
print(f"  Con Centro_Negocios:            {con_centro:>4d}  ({con_centro/total*100:5.1f}%)")
print(f"  Con Aporte_K:                   {con_aporte:>4d}  ({con_aporte/total*100:5.1f}%)")
print(f"  Con LINK doc (Dropbox):         {con_doc:>4d}  ({con_doc/total*100:5.1f}%)")


# =============================================================================
# AUDIT 6 — Centro_Negocios huérfanos (no listados en proyectos)
# =============================================================================
print("\n" + "=" * 78)
print("AUDIT 6 · Centros de negocio en data — para validar contra PROYECTOS")
print("=" * 78)
centros = Counter(m.get("Centro_Negocios") or "" for m in movs)
for c, n in sorted(centros.items(), key=lambda x: -x[1])[:15]:
    print(f"  {n:4d}  {c!r}")


# =============================================================================
# AUDIT 7 — Devoluciones
# =============================================================================
print("\n" + "=" * 78)
print("AUDIT 7 · Devoluciones detectadas")
print("=" * 78)
devs = [m for m in movs if m.get("esDevolucion")]
print(f"\nTotal devoluciones: {len(devs)} por ${sum(d['ABONOS'] for d in devs):,.0f}")
for d in devs:
    print(f"  {d['FECHA_STR']} · {d.get('CentroDevolucion') or d.get('Centro_Negocios','?'):25}  ${d['ABONOS']:>15,.0f}  {d.get('DESCRIPCION','')[:60]}")


print("\n" + "=" * 78)
print("FIN DE AUDITORÍA")
print("=" * 78)
