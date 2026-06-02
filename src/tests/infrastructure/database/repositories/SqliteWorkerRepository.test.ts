import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteWorkerRepository } from '../../../../main/infrastructure/database/repositories/SqliteWorkerRepository';
import { WorkerData } from '../../../../shared/types/Worker';

describe('SqliteWorkerRepository', () => {
  let db: Database.Database;
  let repository: SqliteWorkerRepository;

  beforeAll(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        central_id TEXT UNIQUE,
        rfc TEXT,
        first_name TEXT,
        last_name TEXT,
        maternal_last_name TEXT,
        full_name TEXT,
        employee_key TEXT,
        initials TEXT,
        address TEXT,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT,
        is_active INTEGER DEFAULT 1
      );
    `);
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM users;');
    repository = new SqliteWorkerRepository(db);
  });

  const buildWorker = (overrides: Partial<WorkerData> = {}): WorkerData => ({
    rfc: 'PEPJ800101ABC',
    firstName: 'Juan',
    lastName: 'Perez',
    maternalLastName: 'Lopez',
    fullName: 'Juan Perez Lopez',
    employeeId: 'EMP-001',
    employeeKey: 'EVL',
    initials: 'EVL',
    address: 'Calle 1',
    email: 'juan.perez@simar.com',
    password: 'hashed_password_123',
    role: 'sales',
    isActive: true,
    ...overrides
  });

  it('saves a new worker with identity and access fields', () => {
    repository.save(buildWorker());

    const rows = db.prepare('SELECT * FROM users').all() as any[];

    expect(rows).toHaveLength(1);
    expect(rows[0].rfc).toBe('PEPJ800101ABC');
    expect(rows[0].full_name).toBe('Juan Perez Lopez');
    expect(rows[0].central_id).toBe('EMP-001');
    expect(rows[0].employee_key).toBe('EVL');
    expect(rows[0].initials).toBe('EVL');
    expect(rows[0].password_hash).toBe('hashed_password_123');
    expect(rows[0].role).toBe('sales');
  });

  it('lists workers without returning password hashes', () => {
    repository.save(buildWorker());

    const workers = repository.listActive();

    expect(workers).toEqual([expect.objectContaining({
      fullName: 'Juan Perez Lopez',
      employeeId: 'EMP-001',
      employeeKey: 'EVL',
      initials: 'EVL',
      role: 'sales',
      isActive: true
    })]);
    expect(workers[0]).not.toHaveProperty('password');
    expect(workers[0]).not.toHaveProperty('password_hash');
  });

  it('throws an error when a unique email constraint is violated', () => {
    repository.save(buildWorker());

    expect(() => repository.save(buildWorker({ employeeId: 'EMP-002' }))).toThrow();
  });
});
