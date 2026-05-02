import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteQuoteRepository } from '../../../../main/infrastructure/database/repositories/SqliteQuoteRepository';

describe('SqliteQuoteRepository', () => {
  let db: Database.Database;
  let repository: SqliteQuoteRepository;

  beforeAll(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folio VARCHAR UNIQUE,
        status VARCHAR DEFAULT 'draft',
        replaces_quote_id INTEGER,
        client_name VARCHAR,
        client_rfc VARCHAR,
        contact_name VARCHAR,
        contact_phone VARCHAR,
        contact_email VARCHAR,
        validity_days INTEGER,
        frequency_json TEXT,
        services_json TEXT,
        subtotal DECIMAL,
        total DECIMAL,
        created_at INTEGER
      );
    `);
  });

  afterAll(() => {
    db?.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM quotes;');
    repository = new SqliteQuoteRepository(db);
  });

  const mockDraftPayload = {
    clientName: 'Cliente Prueba',
    clientRfc: 'XAXX010101000',
    contactName: 'Juan Pérez',
    contactPhone: '2288123456',
    contactEmail: 'juan@prueba.com',
    validityDays: 15,
    frequency: { type: 'weekly' },
    services: [
      {
        location: { street: 'Av. Luz', neighborhood: 'Centro', municipality: 'Xalapa', state: 'Veracruz' },
        wastes: [
          { name: 'Basura Doméstica', quantity: 100, unit: 'kg' }
        ]
      }
    ],
    createdAt: 1672531200000,
    status: 'draft'
  } as any; 

  // --- AC 1: CREATE NEW DRAFT ---
  it('should insert a new draft and return the new row ID', () => {
    const newId = repository.saveDraft(mockDraftPayload);

    expect(Number(newId)).toBeGreaterThan(0);

    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(newId) as any;
    expect(row.client_name).toBe('Cliente Prueba');
    expect(row.contact_name).toBe('Juan Pérez'); // Confirmamos que se guarda
    expect(row.status).toBe('draft');
    expect(row.services_json).toContain('Av. Luz');
  });

  // --- AC 2: UPDATE EXISTING DRAFT ---
  it('should update an existing draft if ID is provided', () => {
    const insertId = repository.saveDraft(mockDraftPayload);

    const updatePayload = JSON.parse(JSON.stringify(mockDraftPayload));
    updatePayload.id = Number(insertId);
    updatePayload.services[0].location.street = 'Calle Oscura';
    updatePayload.contactName = 'Pedro Editado';

    const returnedId = repository.saveDraft(updatePayload);

    expect(Number(returnedId)).toBe(Number(insertId));
    
    const row = db.prepare('SELECT services_json, contact_name, status FROM quotes WHERE id = ?').get(insertId) as any;
    expect(row.services_json).toContain('Calle Oscura');
    expect(row.contact_name).toBe('Pedro Editado'); // Confirmamos actualización
    
    const count = db.prepare('SELECT COUNT(*) as count FROM quotes').get() as any;
    expect(count.count).toBe(1);
  });

  // --- AC 3: GET DRAFTS ---
  it('should return only drafts ordered by date, mapping location and volume correctly', () => {
    const p1 = JSON.parse(JSON.stringify(mockDraftPayload));
    p1.services[0].wastes[0].quantity = 50;
    p1.createdAt = 1000;
    repository.saveDraft(p1);

    const p2 = JSON.parse(JSON.stringify(mockDraftPayload));
    p2.services[0].wastes[0].quantity = 20;
    p2.createdAt = 5000;
    repository.saveDraft(p2);
    
    db.prepare(`
      INSERT INTO quotes (client_name, services_json, status, created_at) 
      VALUES ('Ignorado', '[{"location":{"street":"A", "neighborhood":"", "municipality":"", "state":""},"wastes":[]}]', 'issued', 9000)
    `).run();

    const drafts = repository.getDrafts();

    expect(drafts).toHaveLength(2);
    expect(drafts[0].wastesSummary).toBe('20 kg de Basura Doméstica'); 
    expect(drafts[0].location).toContain('Av. Luz'); 
    expect(drafts[0].status).toBe('draft');
  });

  // --- AC 4: GET DRAFT BY ID ---
  it('should map a raw database row to a complete QuoteDraft object including trip data', () => {
    const payloadWithTrip = JSON.parse(JSON.stringify(mockDraftPayload));
    payloadWithTrip.services[0].trip = {
      kilometers: 50, vehicles: 1, crewMembers: 2, routes: 1, fuelLiters: 10,
      roadType: 'paved', origin: 'Punto A', destinationWarehouse: 'Bodega B'
    };
    
    const newId = Number(repository.saveDraft(payloadWithTrip));
    const draft = repository.getDraftById(newId);

    expect(draft).not.toBeNull();
    expect(draft?.id).toBe(newId);
    expect(draft?.services[0].location.street).toBe('Av. Luz');
    expect(draft?.contactName).toBe('Juan Pérez'); // Confirmamos mapeo de retorno
  });

  // --- AC 5: DRAFT NOT FOUND OR NOT A DRAFT ---
  it('should return null if the id does not exist or status is not draft', () => {
    const notFoundDraft = repository.getDraftById(999);
    expect(notFoundDraft).toBeNull();

    const info = db.prepare(`INSERT INTO quotes (client_name, status) VALUES ('Test', 'issued')`).run();
    const issuedDraft = repository.getDraftById(Number(info.lastInsertRowid));
    expect(issuedDraft).toBeNull();
  });

  // --- AC 6: ISSUE QUOTE ---
  it('should successfully change a quote status from draft to issued', () => {
    const insertId = Number(repository.saveDraft(mockDraftPayload));
    
    const success = repository.issueQuote(insertId);
    
    expect(success).toBe(true);
    
    const row = db.prepare('SELECT status, folio FROM quotes WHERE id = ?').get(insertId) as any;
    expect(row.status).toBe('issued');
  });

  it('should return false if trying to issue a quote that does not exist or is already issued', () => {
    const fail1 = repository.issueQuote(9999);
    expect(fail1).toBe(false);

    const insertId = Number(repository.saveDraft(mockDraftPayload));
    repository.issueQuote(insertId);
    const fail2 = repository.issueQuote(insertId); 
    expect(fail2).toBe(false); 
  });

  // --- AC 7: GET ISSUED QUOTES ---
  it('should return only issued quotes for the PDF dashboard', () => {
    const p1 = JSON.parse(JSON.stringify(mockDraftPayload));
    p1.services[0].wastes[0].quantity = 10;
    const id1 = Number(repository.saveDraft(p1));

    const p2 = JSON.parse(JSON.stringify(mockDraftPayload));
    p2.services[0].wastes[0].quantity = 20;
    const id2 = Number(repository.saveDraft(p2));
    
    repository.issueQuote(id2);

    const issuedQuotes = repository.getIssuedQuotes();

    expect(issuedQuotes).toHaveLength(1);
    expect(issuedQuotes[0].wastesSummary).toBe('20 kg de Basura Doméstica');
    expect(issuedQuotes[0].status).toBe('issued');
  });
});