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
        folio TEXT,
        street TEXT,
        neighborhood TEXT,
        municipality TEXT,
        activity_type TEXT,
        waste_type TEXT,
        volume_quantity REAL,
        volume_unit TEXT,
        service_frequency TEXT,
        created_at INTEGER,
        status TEXT,
        trip_kilometers REAL,
        trip_vehicles INTEGER,
        trip_crew_members INTEGER,
        trip_routes INTEGER,
        trip_fuel_liters REAL,
        trip_road_type TEXT,
        trip_tolls INTEGER,
        trip_total_toll_cost REAL,
        trip_origin TEXT,
        trip_destination_warehouse TEXT
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
    location: { street: 'Av. Luz', neighborhood: 'Centro', municipality: 'Xalapa' },
    activity: 'collection',
    waste: 'domestic',
    volumeQuantity: 100,
    volumeUnit: 'kg',
    frequency: 'one_time', 
    createdAt: 1672531200000,
    status: 'draft'
  } as any; 

  // --- AC 1: CREATE NEW DRAFT ---
  it('should insert a new draft and return the new row ID', () => {
    const newId = repository.saveDraft(mockDraftPayload);

    expect(Number(newId)).toBeGreaterThan(0);

    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(newId) as any;
    expect(row.street).toBe('Av. Luz');
    expect(row.status).toBe('draft');
  });

  // --- AC 2: UPDATE EXISTING DRAFT ---
  it('should update an existing draft if ID is provided', () => {
    const insertId = repository.saveDraft(mockDraftPayload);

    const updatePayload = {
      ...mockDraftPayload,
      id: Number(insertId),
      location: { ...mockDraftPayload.location, street: 'Calle Oscura' }
    } as any;

    const returnedId = repository.saveDraft(updatePayload);

    expect(Number(returnedId)).toBe(Number(insertId));
    
    const row = db.prepare('SELECT street, status FROM quotes WHERE id = ?').get(insertId) as any;
    expect(row.street).toBe('Calle Oscura');
    
    const count = db.prepare('SELECT COUNT(*) as count FROM quotes').get() as any;
    expect(count.count).toBe(1);
  });

  // --- AC 3: GET DRAFTS ---
  it('should return only drafts ordered by date, mapping location and volume correctly', () => {
    repository.saveDraft({ ...mockDraftPayload, volumeQuantity: 50, createdAt: 1000 });
    repository.saveDraft({ ...mockDraftPayload, volumeQuantity: 20, createdAt: 5000 });
    
    db.prepare(`INSERT INTO quotes (street, neighborhood, municipality, status, created_at) 
                VALUES ('A', 'B', 'C', 'issued', 9000)`).run();

    const drafts = repository.getDrafts();

    expect(drafts).toHaveLength(2);
    expect(drafts[0].volume).toBe('20.0 kg'); 
    expect(drafts[0].location).toBe('Av. Luz, Centro, Xalapa'); 
    expect(drafts[0].status).toBe('draft');
  });

  // --- AC 4: GET DRAFT BY ID ---
  it('should map a raw database row to a complete QuoteDraft object including trip data', () => {
    const payloadWithTrip = {
      ...mockDraftPayload,
      trip: {
        kilometers: 50, vehicles: 1, crewMembers: 2, routes: 1, fuelLiters: 10,
        roadType: 'paved',
        origin: 'Punto A', destinationWarehouse: 'Bodega B'
      }
    } as any;
    
    const newId = Number(repository.saveDraft(payloadWithTrip));
    const draft = repository.getDraftById(newId);

    expect(draft).not.toBeNull();
    expect(draft?.id).toBe(newId);
    expect(draft?.location.street).toBe('Av. Luz');
    expect(draft?.trip?.kilometers).toBe(50);
    expect(draft?.trip?.roadType).toBe('paved');
  });

  // --- AC 5: DRAFT NOT FOUND OR NOT A DRAFT ---
  it('should return null if the id does not exist or status is not draft', () => {
    const notFoundDraft = repository.getDraftById(999);
    expect(notFoundDraft).toBeNull();

    const info = db.prepare(`INSERT INTO quotes (street, status) VALUES ('X', 'issued')`).run();
    const issuedDraft = repository.getDraftById(Number(info.lastInsertRowid));
    expect(issuedDraft).toBeNull();
  });
});