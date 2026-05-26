export interface Movimiento {
  LINK: string;
  Nombre: string;
  HIPERVINCULO: string;
  FECHA: string;
  FECHA_STR: string;
  DESCRIPCION: string;
  ABONOS: number;
  EGRESO: number;
  SALDO: number;
  General: string;
  Detallado: string;
  Especifico: string;
  Centro_Negocios: string;
  Aporte_K: string;
  // Nuevos campos
  Cuenta?: string; // "Santander" | "BICE"
  esDevolucion?: boolean;
  CentroDevolucion?: string; // Proyecto canónico cuando la devolución vino mal clasificada
}

export interface OC {
  NumOC: string;
  Proyecto: string;
  Proveedor: string;
  Descripcion: string;
  PorPagar: number;
  Pagado: number;
  PendPago: number;
  Observacion: string;
}

export interface CuentaMeta {
  movimientos: number;
  saldo_final: number;
}

export interface DataSet {
  movimientos: Movimiento[];
  oc: OC[];
  metadata: {
    fecha_corte: string;
    total_movimientos: number;
    total_oc: number;
    rango_inicio: string;
    rango_fin: string;
    cuentas?: Record<string, CuentaMeta>;
    devoluciones?: number;
  };
}
