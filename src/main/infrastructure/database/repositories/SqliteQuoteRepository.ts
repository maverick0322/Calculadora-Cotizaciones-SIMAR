import { Database } from 'better-sqlite3';
import { IQuoteRepository } from '../../../domain/repositories/IQuoteRepository';
import { QUOTE_STATUS_FLOW, SERVICE_TYPE_LABELS } from '../../../../shared/constants/quoteConstants';
import {
  CurrentQuoteStatus,
  QuoteDraft,
  QuoteStatus,
  QuoteSummary,
  ServiceItem
} from '../../../../shared/types/Quote';
import { AppError } from '../../../application/errors/AppError';

interface RawQuoteRow {
  id: number;
  folio: string | null;
  person_type: 'fisica' | 'moral' | null;
  commercial_name: string | null;
  client_name: string;
  client_rfc: string;
  contact_name: string | null;
  contact_position: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  validity_days: number;
  services_json: string;
  subtotal: number;
  total: number;
  created_at: number;
  status: string;
  replaces_quote_id: number | null;
}

const normalizeStatus = (status: string): QuoteStatus => {
  if (status === 'draft') return 'en_proceso';
  if (status === 'issued') return 'emitida';
  return status as QuoteStatus;
};

const getNextStatus = (status: CurrentQuoteStatus): CurrentQuoteStatus | null => {
  const currentIndex = QUOTE_STATUS_FLOW.indexOf(status);
  const nextStatus = QUOTE_STATUS_FLOW[currentIndex + 1];
  return nextStatus ?? null;
};

export class SqliteQuoteRepository implements IQuoteRepository {
  constructor(private readonly db: Database) {}

  saveDraft(quote: QuoteDraft): number | bigint {
    const params = {
      personType: quote.personType ?? 'moral',
      commercialName: quote.commercialName ?? '',
      clientName: quote.clientName,
      clientRfc: quote.clientRfc,
      contactName: quote.contactName ?? '',
      contactPosition: quote.contactPosition ?? '',
      contactPhone: quote.contactPhone ?? '',
      contactEmail: quote.contactEmail ?? '',
      validityDays: quote.validityDays,
      frequencyJson: JSON.stringify({}),
      servicesJson: JSON.stringify(quote.services),
      subtotal: quote.subtotal ?? 0,
      total: quote.total ?? 0,
      createdAt: quote.createdAt || Date.now(),
      replacesQuoteId: quote.replacesQuoteId ?? null
    };

    if (quote.id) {
      const stmt = this.db.prepare(`
        UPDATE quotes SET
          person_type = @personType,
          commercial_name = @commercialName,
          client_name = @clientName,
          client_rfc = @clientRfc,
          contact_name = @contactName,
          contact_position = @contactPosition,
          contact_phone = @contactPhone,
          contact_email = @contactEmail,
          validity_days = @validityDays,
          frequency_json = @frequencyJson,
          services_json = @servicesJson,
          subtotal = @subtotal,
          total = @total,
          replaces_quote_id = @replacesQuoteId
        WHERE id = @id AND status IN ('en_proceso', 'draft')
      `);

      stmt.run({ ...params, id: quote.id });
      return typeof quote.id === 'string' ? parseInt(quote.id, 10) : quote.id;
    }

    const stmt = this.db.prepare(`
      INSERT INTO quotes (
        person_type, commercial_name, client_name, client_rfc, contact_name, contact_position, contact_phone, contact_email,
        validity_days, frequency_json, services_json, subtotal, total, created_at, status, replaces_quote_id
      ) VALUES (
        @personType, @commercialName, @clientName, @clientRfc, @contactName, @contactPosition, @contactPhone, @contactEmail,
        @validityDays, @frequencyJson, @servicesJson, @subtotal, @total, @createdAt, 'en_proceso', @replacesQuoteId
      )
    `);

    const info = stmt.run(params);
    return info.lastInsertRowid;
  }

  getDrafts(): QuoteSummary[] {
    const stmt = this.db.prepare(`
      SELECT id, folio, services_json, created_at AS createdAt, status
      FROM quotes
      WHERE status IN ('en_proceso', 'terminada', 'autorizada')
      ORDER BY created_at DESC
    `);

    return this.mapRowsToSummaries(stmt.all());
  }

  getQuotesByStatus(status: CurrentQuoteStatus): QuoteSummary[] {
    const stmt = this.db.prepare(`
      SELECT id, folio, services_json, created_at AS createdAt, status
      FROM quotes
      WHERE status = ?
      ORDER BY created_at DESC
    `);

    return this.mapRowsToSummaries(stmt.all(status));
  }

  getIssuedQuotes(): QuoteSummary[] {
    return this.getQuotesByStatus('emitida');
  }

  getDraftById(id: number): QuoteDraft | null {
    const stmt = this.db.prepare(`SELECT * FROM quotes WHERE id = ? AND status IN ('en_proceso', 'draft')`);
    const row = stmt.get(id) as RawQuoteRow | undefined;
    return row ? this.mapRowToDraft(row) : null;
  }

  getQuoteById(id: number): QuoteDraft | null {
    const stmt = this.db.prepare(`SELECT * FROM quotes WHERE id = ?`);
    const row = stmt.get(id) as RawQuoteRow | undefined;
    return row ? this.mapRowToDraft(row) : null;
  }

  updateQuoteStatus(id: number, nextStatus: CurrentQuoteStatus): boolean {
    const currentStatus = this.getCurrentStatus(id);
    const allowedNextStatus = getNextStatus(currentStatus);

    if (allowedNextStatus !== nextStatus) {
      throw new AppError('INVALID_STATUS_TRANSITION', 'La cotización solo puede avanzar al siguiente estado permitido.', {
        quoteId: id,
        currentStatus,
        requestedStatus: nextStatus
      });
    }

    const stmt = this.db.prepare(`UPDATE quotes SET status = ? WHERE id = ? AND status = ?`);
    const info = stmt.run(nextStatus, id, currentStatus);
    return info.changes > 0;
  }

  issueQuote(id: number): boolean {
    const currentStatus = this.getCurrentStatus(id);
    if (currentStatus !== 'autorizada') {
      throw new AppError('INVALID_STATUS_TRANSITION', 'Solo una cotización autorizada puede emitirse.', {
        quoteId: id,
        currentStatus
      });
    }

    const currentYear = new Date().getFullYear();
    const folio = this.getOrCreateFolio(id, currentYear);
    const issueStmt = this.db.prepare(`UPDATE quotes SET status = 'emitida', folio = ? WHERE id = ? AND status = 'autorizada'`);
    const replaceStmt = this.db.prepare(`UPDATE quotes SET status = 'replaced' WHERE id = ?`);
    const quote = this.db.prepare(`SELECT replaces_quote_id FROM quotes WHERE id = ?`).get(id) as { replaces_quote_id: number | null };

    const transaction = this.db.transaction(() => {
      const info = issueStmt.run(folio, id);
      if (info.changes > 0 && quote.replaces_quote_id) {
        replaceStmt.run(quote.replaces_quote_id);
      }

      return info.changes > 0;
    });

    return transaction();
  }

  private getCurrentStatus(id: number): CurrentQuoteStatus {
    const row = this.db.prepare(`SELECT status FROM quotes WHERE id = ?`).get(id) as { status: string } | undefined;

    if (!row) {
      throw new AppError('NOT_FOUND', 'No se encontró la cotización solicitada.', { quoteId: id });
    }

    return normalizeStatus(row.status) as CurrentQuoteStatus;
  }

  private getOrCreateFolio(id: number, year: number): string {
    const row = this.db.prepare(`SELECT folio FROM quotes WHERE id = ?`).get(id) as { folio: string | null } | undefined;
    if (!row) {
      throw new AppError('NOT_FOUND', 'No se encontró la cotización para generar folio.', { quoteId: id });
    }

    if (row.folio) return row.folio;

    const folioPrefix = `COT-${year}-`;
    const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM quotes WHERE folio LIKE ?`);
    const { count } = countStmt.get(`${folioPrefix}%`) as { count: number };
    const nextSequence = String(count + 1).padStart(3, '0');
    return `${folioPrefix}${nextSequence}`;
  }

  private mapRowsToSummaries(rows: unknown[]): QuoteSummary[] {
    return rows.map((row) => {
      const typedRow = row as { id: number; folio: string | null; services_json: string; createdAt: number; status: string };
      const services = this.parseServices(typedRow.services_json);
      const firstLocation = this.buildFirstLocation(services);
      const wastesSummary = this.buildServiceSummary(services);

      return {
        id: typedRow.id,
        folio: typedRow.folio ?? '',
        location: services.length > 1 ? `${firstLocation} (+${services.length - 1} más)` : firstLocation,
        wastesSummary,
        createdAt: typedRow.createdAt,
        status: normalizeStatus(typedRow.status)
      };
    });
  }

  private mapRowToDraft(row: RawQuoteRow): QuoteDraft {
    return {
      id: row.id,
      folio: row.folio ?? undefined,
      replacesQuoteId: row.replaces_quote_id ?? undefined,
      personType: row.person_type ?? 'moral',
      commercialName: row.commercial_name ?? '',
      clientName: row.client_name,
      clientRfc: row.client_rfc,
      contactName: row.contact_name ?? '',
      contactPosition: row.contact_position ?? '',
      contactPhone: row.contact_phone ?? '',
      contactEmail: row.contact_email ?? '',
      validityDays: row.validity_days,
      services: this.parseServices(row.services_json),
      subtotal: row.subtotal,
      total: row.total,
      createdAt: row.created_at,
      status: normalizeStatus(row.status)
    };
  }

  private parseServices(servicesJson: string): ServiceItem[] {
    const services = JSON.parse(servicesJson || '[]') as ServiceItem[];
    return services.map((service) => ({
      ...service,
      serviceType: service.serviceType ?? 'rme',
      tools: service.tools ?? [],
      materials: service.materials ?? [],
      equipment: service.equipment ?? [],
      specializedEpp: service.specializedEpp ?? []
    }));
  }

  private buildFirstLocation(services: ServiceItem[]): string {
    const loc = services[0]?.location;
    if (!loc) return 'Sin dirección';

    const parts = [loc.street, loc.neighborhood, loc.municipality, loc.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Sin dirección';
  }

  private buildServiceSummary(services: ServiceItem[]): string {
    const allWastes = services.flatMap((service) => service.wastes ?? []);
    if (allWastes.length > 0) {
      return allWastes.map((waste) => `${waste.quantity} ${waste.unit} de ${waste.name}`).join(' | ');
    }

    return services
      .map((service) => SERVICE_TYPE_LABELS[service.serviceType] ?? 'Servicio')
      .join(' | ') || 'Sin servicios';
  }
}
