import db from '../sqliteClient';
import { ICotizacionRepository } from '../../../domain/repositories/ICotizacionRepository';
import { CotizacionBorrador, QuoteSummary } from '../../../../shared/types/Cotizacion';

export class SqliteCotizacionRepository implements ICotizacionRepository {
  guardarBorrador(cotizacion: CotizacionBorrador): number | bigint {
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

    const info = stmt.run({
      direccion: `${cotizacion.ubicacion.direccion}, ${cotizacion.ubicacion.colonia}, ${cotizacion.ubicacion.municipio}`,
      actividad: cotizacion.actividad,
      residuo: cotizacion.residuo,
      cantidad: cotizacion.volumenCantidad,
      unidad: cotizacion.volumenUnidad,
      frecuencia: cotizacion.frecuencia,
      fechaCreacion: cotizacion.fechaCreacion || Date.now()
    });

    return info.lastInsertRowid;
  }

  getDrafts(): QuoteSummary[] {
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

    return stmt.all() as QuoteSummary[];
  }

  getDraftById(id: number): any {
    const stmt = db.prepare(`
      SELECT * FROM quotes WHERE id = ? AND status = 'draft'
    `);
    
    const row = stmt.get(id) as any;

    if (!row) return null;

    const partesDireccion = row.location_address ? row.location_address.split(', ') : ['', '', ''];

    return {
      id: row.id,
      ubicacion: {
        direccion: partesDireccion[0] || '',
        colonia: partesDireccion[1] || '',
        municipio: partesDireccion[2] || ''
      },
      actividad: row.activity_type,
      residuo: row.waste_type,
      volumenCantidad: row.volume_quantity,
      volumenUnidad: row.volume_unit,
      frecuencia: row.service_frequency,
      fechaCreacion: row.created_at
    };
  }
}