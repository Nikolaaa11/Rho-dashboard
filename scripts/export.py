"""
Genera data/data.json desde el Excel multi-cuenta (Santander + BICE).

Uso:
    python scripts/export.py <ruta_excel>

Por defecto lee `2026.02.17_CC SANTANDER_VA.xlsx`.

Incluye:
- Movimientos de CC Santander (cuenta principal)
- Movimientos de CC BICE (cuenta secundaria)
- OC (órdenes de compra)
- Marca cada movimiento con su Cuenta ("Santander" | "BICE")
- Detecta devoluciones (abonos asociados a un Centro_Negocios)
"""
import sys
import json
import pandas as pd
from pathlib import Path

EXCEL = sys.argv[1] if len(sys.argv) > 1 else "2026.02.17_CC SANTANDER_VA.xlsx"
OUT = Path("data/data.json")

COLS = [
    "LINK", "Nombre", "HIPERVINCULO", "FECHA", "DESCRIPCION", "ABONOS",
    "EGRESO", "SALDO", "General", "Detallado", "Especifico",
    "Centro_Negocios", "Aporte_K",
]


def load_cc(excel_path: str, sheet: str, cuenta: str) -> pd.DataFrame:
    """Lee una pestaña de cuenta corriente y devuelve DataFrame normalizado."""
    df = pd.read_excel(excel_path, sheet_name=sheet, header=0)
    df = df.iloc[:, :13]
    df.columns = COLS
    df = df.dropna(subset=["FECHA"]).reset_index(drop=True)
    df["FECHA"] = pd.to_datetime(df["FECHA"], errors="coerce")
    df = df.dropna(subset=["FECHA"]).reset_index(drop=True)
    df["FECHA_STR"] = df["FECHA"].dt.strftime("%Y-%m-%d")
    df["ABONOS"] = df["ABONOS"].fillna(0).astype(float)
    df["EGRESO"] = df["EGRESO"].fillna(0).astype(float)
    df["SALDO"] = df["SALDO"].fillna(0).astype(float)
    for col in ["LINK", "Nombre", "DESCRIPCION", "General", "Detallado",
                "Especifico", "Centro_Negocios", "Aporte_K"]:
        df[col] = df[col].fillna("").astype(str)
    df["Cuenta"] = cuenta
    return df


def detectar_devolucion(row) -> bool:
    """Devolución = abono entrante asociado a un proyecto. Casos:
    - Abono con descripción que contenga 'devolución' / 'devolucion' / 'reembolso'
    - Abono asociado a un Centro_Negocios de proyecto (no Oficina ni Reversa)
      y categoría de gasto productivo (Desarrollo_Proyecto, RRHH, etc).
    - Boletas de garantía devueltas (mencionadas en la descripción).
    """
    if row.get("ABONOS", 0) <= 0:
        return False
    desc = (row.get("DESCRIPCION") or "").lower()
    # Patrones explícitos en descripción
    patrones_dev = ("devoluci", "reembolso", "reintegro", "boleta de garant")
    if any(p in desc for p in patrones_dev):
        # Excluir préstamos (devolución de préstamo a la oficina)
        general = (row.get("General") or "").strip()
        if general == "Préstamos":
            return False
        return True
    # Centro de proyecto + categoría productiva
    centro = (row.get("Centro_Negocios") or "").strip()
    if centro and centro not in ("Oficina", "Reversa", ""):
        general = (row.get("General") or "").strip()
        if general in ("Desarrollo_Proyecto", "RRHH", "Administración", "Operación"):
            return True
    return False


def proyecto_canonico(centro: str, desc: str) -> str:
    """Si la descripción menciona un proyecto explícito (ej. 'Explícito 20 MW'),
    devuelve el Centro_Negocios canónico. Útil para reversas que están en 'Reversa'
    pero son de un proyecto específico."""
    d = (desc or "").lower()
    mapping = [
        ("expl", "Codegua (Explícito)"),
        ("santa victoria", "Santa Victoria 15 MW"),
        ("panim", "Panimávida(BESS RHO)"),
        ("la ligua", "La Ligua (San Expedito) "),
        ("san expedito", "La Ligua (San Expedito) "),
        ("agua santa", "Agua Santa (San Expedito II)"),
        ("ranguil", "PMGD Ranguil III"),
        ("quebrada escobar", "PMGD Quebrada Escobar"),
        ("ruil", "RUIL"),
    ]
    for token, key in mapping:
        if token in d:
            return key
    return centro


def main():
    # Cargar cuentas
    print(f"Leyendo Excel: {EXCEL}")
    df_st = load_cc(EXCEL, "CC Santader", "Santander")
    print(f"  Santander: {len(df_st)} movimientos")

    try:
        df_bice = load_cc(EXCEL, "CC BICE", "BICE")
        print(f"  BICE:      {len(df_bice)} movimientos")
    except Exception as e:
        print(f"  BICE:      0 (no se pudo cargar - {e})")
        df_bice = pd.DataFrame(columns=COLS + ["FECHA_STR", "Cuenta"])

    # Combinar
    df = pd.concat([df_st, df_bice], ignore_index=True)
    df = df.sort_values("FECHA").reset_index(drop=True)

    # Marcar devoluciones
    df["esDevolucion"] = df.apply(detectar_devolucion, axis=1)
    n_dev = int(df["esDevolucion"].sum())
    monto_dev = float(df.loc[df["esDevolucion"], "ABONOS"].sum())
    print(f"  Devoluciones detectadas: {n_dev}  · ${monto_dev:,.0f}")

    # Para devoluciones que están en Centro 'Reversa' u 'Oficina', intentar reasignar al proyecto canónico
    def reasignar(row):
        if not row["esDevolucion"]:
            return row["Centro_Negocios"]
        centro = row["Centro_Negocios"]
        if centro in ("Reversa", "Oficina", "") or not centro:
            return proyecto_canonico(centro, row["DESCRIPCION"])
        return centro

    df["CentroDevolucion"] = df.apply(reasignar, axis=1)

    # OC
    df_oc = pd.read_excel(EXCEL, sheet_name="OC", header=0)
    df_oc = df_oc.iloc[:, :8]
    df_oc.columns = ["NumOC", "Proyecto", "Proveedor", "Descripcion",
                     "PorPagar", "Pagado", "PendPago", "Observacion"]
    df_oc = df_oc.dropna(subset=["NumOC"]).reset_index(drop=True)
    df_oc["PorPagar"] = pd.to_numeric(df_oc["PorPagar"], errors="coerce").fillna(0)
    df_oc["Pagado"] = pd.to_numeric(df_oc["Pagado"], errors="coerce").fillna(0)
    df_oc["PendPago"] = pd.to_numeric(df_oc["PendPago"], errors="coerce").fillna(0)
    for col in ["NumOC", "Proyecto", "Proveedor", "Descripcion", "Observacion"]:
        df_oc[col] = df_oc[col].fillna("").astype(str)

    movimientos = df.to_dict(orient="records")
    for m in movimientos:
        if isinstance(m["FECHA"], pd.Timestamp):
            m["FECHA"] = m["FECHA"].isoformat()
        # convertir bools a JSON serializables
        m["esDevolucion"] = bool(m["esDevolucion"])
        m["CentroDevolucion"] = str(m.get("CentroDevolucion") or "")

    # Stats por cuenta
    saldo_st = df_st["SALDO"].iloc[-1] if len(df_st) > 0 else 0
    saldo_bice = df_bice["SALDO"].iloc[-1] if len(df_bice) > 0 else 0

    data = {
        "movimientos": movimientos,
        "oc": df_oc.to_dict(orient="records"),
        "metadata": {
            "fecha_corte": df["FECHA"].max().isoformat(),
            "total_movimientos": len(movimientos),
            "total_oc": len(df_oc),
            "rango_inicio": df["FECHA"].min().isoformat(),
            "rango_fin": df["FECHA"].max().isoformat(),
            "cuentas": {
                "Santander": {
                    "movimientos": len(df_st),
                    "saldo_final": float(saldo_st),
                },
                "BICE": {
                    "movimientos": len(df_bice),
                    "saldo_final": float(saldo_bice),
                },
            },
            "devoluciones": n_dev,
        },
    }

    OUT.parent.mkdir(exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, default=str)

    print(f"\nOK  · {len(movimientos)} movs ({len(df_st)} ST + {len(df_bice)} BICE), "
          f"{len(df_oc)} OC, {n_dev} devoluciones -> {OUT}")


if __name__ == "__main__":
    main()
