import { CotizacionBorrador, QuoteSummary } from '../../../shared/types/Cotizacion';

export interface ICotizacionRepository {
  guardarBorrador(cotizacion: CotizacionBorrador): number | bigint;
}

export interface ICotizacionRepository {
  guardarBorrador(cotizacion: CotizacionBorrador): number | bigint;
  
  getDrafts(): QuoteSummary[];
}