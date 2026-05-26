"""
Genera data/data.json desde el Excel de cuenta corriente Santander.

Uso:
    python scripts/export.py <ruta_excel>

Por defecto lee `2026_02_17_CC_SANTANDER_VA.xlsx` desde la raíz.
"""
import sys
import json
import pandas as pd
from pathlib import Path

EXCEL = sys.argv[1] if len(sys.argv) > 1 else "2026_02_17_CC_SANTANDER_VA.xlsx"
OUT = Path("data/data.json")


def main():
    # CC Santander
    df = pd.read_excel(EXCEL, sheet_name="CC Santader", header=0)
    df = df.iloc[:, :13]
    df.columns = [
        "LINK", "Nombre", "HIPERVINCULO", "FECHA", "DESCRIPCION", "ABONOS",
        "EGRESO", "SALDO", "General", "Detallado", "Especifico",
        "Centro_Negocios", "Aporte_K",
    ]
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

    data = {
        "movimientos": movimientos,
        "oc": df_oc.to_dict(orient="records"),
        "metadata": {
            "fecha_corte": df["FECHA"].max().isoformat(),
            "total_movimientos": len(movimientos),
            "total_oc": len(df_oc),
            "rango_inicio": df["FECHA"].min().isoformat(),
            "rango_fin": df["FECHA"].max().isoformat(),
        },
    }

    OUT.parent.mkdir(exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, default=str)

    print(f"OK  · {len(movimientos)} movimientos, {len(df_oc)} OC -> {OUT}")


if __name__ == "__main__":
    main()
