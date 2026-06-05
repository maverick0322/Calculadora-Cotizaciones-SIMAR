import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteQuoteRepository } from '../../../../main/infrastructure/database/repositories/SqliteQuoteRepository';
import { IssueQuoteRequest, QuoteDraft } from '../../../../shared/types/Quote';

describe('SqliteQuoteRepository', () => {
  let db: Database.Database;
  let repository: SqliteQuoteRepository;

  beforeAll(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folio VARCHAR UNIQUE,
        status VARCHAR DEFAULT 'en_proceso',
        customer_id INTEGER,
        seller_id INTEGER,
        replaces_quote_id INTEGER,
        person_type VARCHAR,
        commercial_name VARCHAR,
        client_name VARCHAR,
        client_rfc VARCHAR,
        contact_name VARCHAR,
        contact_position VARCHAR,
        contact_phone VARCHAR,
        contact_email VARCHAR,
        validity_days INTEGER,
        frequency_json TEXT,
        services_json TEXT,
        subtotal DECIMAL,
        total DECIMAL,
        created_at INTEGER,
        issued_at INTEGER,
        prepared_by_initials VARCHAR,
        quote_type_code VARCHAR,
        conditions_json TEXT
      );
    `);
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM quotes;');
    repository = new SqliteQuoteRepository(db);
  });

  const buildDraft = (overrides: Partial<QuoteDraft> = {}): QuoteDraft => ({
    clientName: 'Cliente Prueba',
    clientRfc: 'XAXX010101000',
    contactName: 'Juan Perez',
    contactPhone: '2288123456',
    contactEmail: 'juan@prueba.com',
    validityDays: 15,
    services: [{
      id: 'service-1',
      serviceType: 'rme',
      activity: 'collection',
      frequency: { type: 'one_time' },
      location: { street: 'Av. Luz', neighborhood: 'Centro', municipality: 'Xalapa', state: 'Veracruz' },
      wastes: [{ name: 'Basura Domestica', type: 'rme', classification: 'RME', clave: 'R-001', quantity: 100, unit: 'kg', pricePerUnit: 1 }],
      vehicles: [],
      crew: [],
      supplies: [],
      tools: [],
      materials: [],
      equipment: [],
      specializedEpp: [],
      logistics: { origin: '', primaryDestination: '', kilometers: 0, fuelLiters: 0, fuelPricePerLiter: 0, viaticos: 0 },
      extraCosts: []
    }],
    subtotal: 100,
    total: 116,
    createdAt: 1672531200000,
    status: 'en_proceso',
    ...overrides
  });

  const buildIssuePayload = (quoteId: number): IssueQuoteRequest => ({
    quoteId,
    folio: '001-0526-RME-CP',
    preparedByUserId: 7,
    preparedByInitials: 'EVL',
    quoteTypeCode: 'RME',
    conditions: [{
      conditionId: 1,
      type: 'commercial',
      title: 'Vigencia',
      description: 'La vigencia indicada aplica a esta cotización.',
      isCustom: false
    }]
  });

  it('inserts a new draft and returns the new row id', () => {
    const newId = repository.saveDraft(buildDraft());

    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(newId) as any;

    expect(Number(newId)).toBeGreaterThan(0);
    expect(row.client_name).toBe('Cliente Prueba');
    expect(row.status).toBe('en_proceso');
    expect(row.services_json).toContain('Av. Luz');
  });

  it('updates an existing draft without creating another row', () => {
    const insertId = Number(repository.saveDraft(buildDraft()));

    repository.saveDraft(buildDraft({
      id: insertId,
      services: [{ ...buildDraft().services[0], location: { street: 'Calle Oscura', neighborhood: 'Centro', municipality: 'Xalapa', state: 'Veracruz' } }]
    }));

    const row = db.prepare('SELECT services_json FROM quotes WHERE id = ?').get(insertId) as any;
    const count = db.prepare('SELECT COUNT(*) as count FROM quotes').get() as any;

    expect(row.services_json).toContain('Calle Oscura');
    expect(count.count).toBe(1);
  });

  it('loads and updates pre-issued quotes without changing their status', () => {
    const quoteId = Number(repository.saveDraft(buildDraft()));
    db.prepare(`UPDATE quotes SET status = 'autorizada' WHERE id = ?`).run(quoteId);

    const loadedQuote = repository.getDraftById(quoteId);
    repository.saveDraft(buildDraft({
      id: quoteId,
      status: 'autorizada',
      services: [{ ...buildDraft().services[0], location: { street: 'Av. Editada', neighborhood: 'Centro', municipality: 'Xalapa', state: 'Veracruz' } }]
    }));

    const row = db.prepare('SELECT status, services_json FROM quotes WHERE id = ?').get(quoteId) as any;

    expect(loadedQuote?.status).toBe('autorizada');
    expect(row.status).toBe('autorizada');
    expect(row.services_json).toContain('Av. Editada');
  });

  it('does not load issued quotes through the draft editing lookup', () => {
    const quoteId = Number(repository.saveDraft(buildDraft()));
    db.prepare(`UPDATE quotes SET status = 'emitida' WHERE id = ?`).run(quoteId);

    expect(repository.getDraftById(quoteId)).toBeNull();
  });

  it('returns drafts ordered by creation date', () => {
    repository.saveDraft(buildDraft({ createdAt: 1000 }));
    repository.saveDraft(buildDraft({ createdAt: 5000 }));
    db.prepare(`INSERT INTO quotes (client_name, services_json, status, created_at) VALUES ('Ignorado', '[]', 'emitida', 9000)`).run();

    const drafts = repository.getDrafts();

    expect(drafts).toHaveLength(2);
    expect(drafts[0].createdAt).toBe(5000);
    expect(drafts[0].status).toBe('en_proceso');
  });

  it('emits an authorized quote with editable folio and emission metadata', () => {
    const quoteId = Number(repository.saveDraft(buildDraft()));
    db.prepare(`UPDATE quotes SET status = 'autorizada' WHERE id = ?`).run(quoteId);

    const success = repository.issueQuote(buildIssuePayload(quoteId));

    const row = db.prepare('SELECT status, folio, seller_id, prepared_by_initials, quote_type_code, conditions_json FROM quotes WHERE id = ?').get(quoteId) as any;
    expect(success).toBe(true);
    expect(row.status).toBe('emitida');
    expect(row.folio).toBe('001-0526-RME-CP');
    expect(row.seller_id).toBe(7);
    expect(row.prepared_by_initials).toBe('EVL');
    expect(row.quote_type_code).toBe('RME');
    expect(row.conditions_json).toContain('Vigencia');
  });

  it('throws a business error when trying to emit a quote that is not authorized', () => {
    const quoteId = Number(repository.saveDraft(buildDraft()));

    expect(() => repository.issueQuote(buildIssuePayload(quoteId))).toThrow('Solo una cotización autorizada puede emitirse.');
  });

  it('returns issued summaries only for emitted quotes', () => {
    const quoteId = Number(repository.saveDraft(buildDraft()));
    db.prepare(`UPDATE quotes SET status = 'autorizada' WHERE id = ?`).run(quoteId);
    repository.issueQuote(buildIssuePayload(quoteId));
    repository.saveDraft(buildDraft());

    const issuedQuotes = repository.getIssuedQuotes();

    expect(issuedQuotes).toHaveLength(1);
    expect(issuedQuotes[0].folio).toBe('001-0526-RME-CP');
    expect(issuedQuotes[0].status).toBe('emitida');
  });
});
