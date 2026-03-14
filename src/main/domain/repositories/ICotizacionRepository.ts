import { CotizacionBorrador } from '../../../shared/types/Cotizacion';

export interface ICotizacionRepository {
  // Retornará el ID o Folio generado
  guardarBorrador(cotizacion: CotizacionBorrador): number | bigint;
}