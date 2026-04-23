import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteWorkerRepository } from '../../../../main/infrastructure/database/repositories/SqliteWorkerRepository';

describe('SqliteWorkerRepository', () => {
  let db: Database.Database;
  let repository: SqliteWorkerRepository;

  beforeAll(() => {
    db = new Database(':memory:');
    
    // Creamos la tabla users simulando el esquema principal
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        central_id TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT
      );
    `);
  });

  afterAll(() => {
    db?.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM users;');
    repository = new SqliteWorkerRepository(db);
  });

  it('should successfully save a new worker into the database', () => {
    // [ ARRANGE ]
    const workerData = {
      fullName: 'Juan Perez',
      employeeId: 'EMP-001',
      email: 'juan.perez@simar.com',
      password: 'hashed_password_123',
      role: 'technician'
    } as any;

    // [ ACT ]
    repository.save(workerData);

    // [ ASSERT ]
    const rows = db.prepare('SELECT * FROM users').all() as any[];
    
    expect(rows).toHaveLength(1);
    expect(rows[0].full_name).toBe('Juan Perez');
    expect(rows[0].central_id).toBe('EMP-001');
    expect(rows[0].email).toBe('juan.perez@simar.com');
    expect(rows[0].password_hash).toBe('hashed_password_123');
    expect(rows[0].role).toBe('technician');
  });

  it('should throw an error if a unique constraint is violated (e.g., duplicate email)', () => {
    // [ ARRANGE ]
    const workerData = {
      fullName: 'Ana Gomez',
      employeeId: 'EMP-002',
      email: 'ana@simar.com',
      password: 'hash',
      role: 'admin'
    } as any;

    repository.save(workerData);

    // Intentamos guardar un segundo trabajador con el MISMO correo
    const duplicateWorker = { 
      ...workerData, 
      employeeId: 'EMP-003' 
    };

    // [ ACT & ASSERT ]
    expect(() => repository.save(duplicateWorker)).toThrow();
  });
});