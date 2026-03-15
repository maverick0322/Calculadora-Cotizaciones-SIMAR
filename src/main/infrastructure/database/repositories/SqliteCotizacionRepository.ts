import db from '../sqliteClient';
import { ICotizacionRepository } from '../../../domain/repositories/ICotizacionRepository';
import { CotizacionBorrador, QuoteSummary } from '../../../../shared/types/Cotizacion';

export class SqliteCotizacionRepository implements ICotizacionRepository {
  guardarBorrador(cotizacion: CotizacionBorrador): number | bigint {
    // Usamos sentencias preparadas (Prepared Statements) para evitar SQL Injection
    const stmt = db.prepare(`
      INSERT INTO quotes (
        location_address, activity_type, waste_type, 
        volume_quantity, volume_unit, service_frequency, 
        created_at, status
      ) VALUES (
        @direccion, @actividad, @residuo, 
        @cantidad, @unidad, @frecuencia, 
        @fechaCreacion, 'draft'
      )
    `);

    // Ejecutamos la consulta mapeando el DTO a los parámetros del SQL
    const info = stmt.run({
      direccion: `${cotizacion.ubicacion.direccion}, ${cotizacion.ubicacion.colonia}, ${cotizacion.ubicacion.municipio}`,
      actividad: cotizacion.actividad,
      residuo: cotizacion.residuo,
      cantidad: cotizacion.volumenCantidad,
      unidad: cotizacion.volumenUnidad,
      frecuencia: cotizacion.frecuencia,
      fechaCreacion: cotizacion.fechaCreacion || Date.now()
    });

    // lastInsertRowid nos devuelve el ID autoincremental que SQLite acaba de generar
    return info.lastInsertRowid;
  }

  getDrafts(): QuoteSummary[] {
    // Usamos alias (AS) para que el resultado haga match perfecto con la interfaz QuoteSummary
    const stmt = db.prepare(`
      SELECT 
        id, 
        folio, 
        location_address AS locationAddress, 
        activity_type AS activityType, 
        waste_type AS wasteType, 
        created_at AS createdAt, 
        status
      FROM quotes 
      WHERE status = 'draft' 
      ORDER BY created_at DESC
    `);

    // .all() ejecuta la consulta y devuelve un arreglo de objetos
    return stmt.all() as QuoteSummary[];
  }
}