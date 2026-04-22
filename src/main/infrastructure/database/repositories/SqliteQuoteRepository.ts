import { Database } from 'better-sqlite3'; 
import { IQuoteRepository } from '../../../domain/repositories/IQuoteRepository';
import { 
  QuoteDraft, 
  QuoteSummary, 
  QuoteStatus,
  ServiceItem
} from '../../../../shared/types/Quote';

interface RawQuoteRow {
  id: number;
  folio: string | null;
  client_name: string;
  client_rfc: string;
  validity_days: number;
  frequency_json: string;
  services_json: string;
  created_at: number;
  status: string;
  replaces_quote_id: number | null;
}

export class SqliteQuoteRepository implements IQuoteRepository {

  constructor(private readonly db: Database) {}

  saveDraft(quote: QuoteDraft): number | bigint {
    const params = {
      clientName: quote.clientName,
      clientRfc: quote.clientRfc,
      validityDays: quote.validityDays,
      frequencyJson: JSON.stringify(quote.frequency),
      servicesJson: JSON.stringify(quote.services),
      createdAt: quote.createdAt || Date.now(),
      replacesQuoteId: quote.replacesQuoteId ?? null
    };

    if (quote.id) {
      const stmt = this.db.prepare(`
        UPDATE quotes SET
          client_name = @clientName,
          client_rfc = @clientRfc,
          validity_days = @validityDays,
          frequency_json = @frequencyJson,
          services_json = @servicesJson,
          replaces_quote_id = @replacesQuoteId
        WHERE id = @id AND status = 'draft'
      `);

      stmt.run({ ...params, id: quote.id });
      return typeof quote.id === 'string' ? parseInt(quote.id, 10) : quote.id;
    } 
    
    const stmt = this.db.prepare(`
      INSERT INTO quotes (
        client_name, client_rfc, validity_days, frequency_json, 
        services_json, created_at, status, replaces_quote_id
      ) VALUES (
        @clientName, @clientRfc, @validityDays, @frequencyJson, 
        @servicesJson, @createdAt, 'draft', @replacesQuoteId
      )
    `);

    const info = stmt.run(params);
    return info.lastInsertRowid;
  }

  // Helper interno para armar el resumen para los tableros
  private mapRowsToSummaries(rows: any[]): QuoteSummary[] {
    return rows.map(row => {
      const services: ServiceItem[] = JSON.parse(row.services_json || '[]');
      
      // Tomamos la dirección del primer servicio
      const firstLocation = services.length > 0 
        ? `${services[0].location.street}, ${services[0].location.municipality}` 
        : 'Sin dirección';

      // Sumamos todos los residuos de todos los servicios para el resumen
      const allWastes = services.flatMap(s => s.wastes);
      const wastesSummary = allWastes.map((w: any) => `${w.quantity} ${w.unit} de ${w.name}`).join(' | ');

      return {
        id: row.id,
        folio: row.folio,
        location: services.length > 1 ? `${firstLocation} (+${services.length - 1} más)` : firstLocation,
        wastesSummary: wastesSummary || 'Sin residuos',
        createdAt: row.createdAt,
        status: row.status
      };
    });
  }

  getDrafts(): QuoteSummary[] {
    const stmt = this.db.prepare(`
      SELECT id, folio, services_json, created_at AS createdAt, status
      FROM quotes 
      WHERE status = 'draft' 
      ORDER BY created_at DESC
    `);
    return this.mapRowsToSummaries(stmt.all());
  }

  getIssuedQuotes(): QuoteSummary[] {
    const stmt = this.db.prepare(`
      SELECT id, folio, services_json, created_at AS createdAt, status
      FROM quotes 
      WHERE status = 'issued' 
      ORDER BY created_at DESC
    `);
    return this.mapRowsToSummaries(stmt.all());
  }

  getDraftById(id: number): QuoteDraft | null {
    const stmt = this.db.prepare(`SELECT * FROM quotes WHERE id = ? AND status = 'draft'`);
    const row = stmt.get(id) as RawQuoteRow | undefined;
    if (!row) return null;
    return this.mapRowToDraft(row);
  }

  getQuoteById(id: number): QuoteDraft | null {
    const stmt = this.db.prepare(`SELECT * FROM quotes WHERE id = ?`);
    const row = stmt.get(id) as RawQuoteRow | undefined;
    if (!row) return null;
    return this.mapRowToDraft(row);
  }

  private mapRowToDraft(row: RawQuoteRow): QuoteDraft {
    return {
      id: row.id,
      folio: row.folio || undefined,
      replacesQuoteId: row.replaces_quote_id || undefined,
      clientName: row.client_name,
      clientRfc: row.client_rfc,
      validityDays: row.validity_days,
      frequency: JSON.parse(row.frequency_json || '{}'),
      services: JSON.parse(row.services_json || '[]'),
      createdAt: row.created_at,
      status: row.status as QuoteStatus
    };
  }

  issueQuote(id: number): boolean {
    const checkStmt = this.db.prepare(`SELECT replaces_quote_id FROM quotes WHERE id = ?`);
    const row = checkStmt.get(id) as { replaces_quote_id: number | null };

    const issueStmt = this.db.prepare(`UPDATE quotes SET status = 'issued' WHERE id = ? AND status = 'draft'`);
    const replaceStmt = this.db.prepare(`UPDATE quotes SET status = 'replaced' WHERE id = ?`);

    const transaction = this.db.transaction(() => {
      const info = issueStmt.run(id);
      if (info.changes > 0 && row && row.replaces_quote_id) {
        replaceStmt.run(row.replaces_quote_id);
      }
      return info.changes > 0; 
    });
    return transaction();
  }
}