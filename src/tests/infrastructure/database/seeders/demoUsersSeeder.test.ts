import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { runDemoUsersSeeder } from '../../../../main/infrastructure/database/seeders/demoUsersSeeder';

vi.mock('bcryptjs', () => ({
  default: {
    hashSync: vi.fn(() => 'hashed_123456')
  }
}));

describe('runDemoUsersSeeder', () => {
  let db: Database.Database;

  beforeEach(() => {
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

  afterEach(() => {
    db?.close();
  });

  it('seeds three sales users with V ids and derived initials without duplicates', () => {
    runDemoUsersSeeder(db);
    runDemoUsersSeeder(db);

    const rows = db.prepare(`
      SELECT central_id, employee_key, full_name, initials, email, password_hash, role, is_active
      FROM users
      ORDER BY central_id ASC
    `).all() as Array<Record<string, unknown>>;

    expect(rows).toHaveLength(3);
    expect(rows).toEqual([
      expect.objectContaining({
        central_id: 'V-001',
        employee_key: 'V-001',
        full_name: 'Valeria Morales Ruiz',
        initials: 'VMR',
        email: 'valeria.morales@simar.com',
        password_hash: 'hashed_123456',
        role: 'sales',
        is_active: 1
      }),
      expect.objectContaining({
        central_id: 'V-002',
        employee_key: 'V-002',
        full_name: 'Victor Hernandez Lopez',
        initials: 'VHL',
        email: 'victor.hernandez@simar.com',
        role: 'sales',
        is_active: 1
      }),
      expect.objectContaining({
        central_id: 'V-003',
        employee_key: 'V-003',
        full_name: 'Vanessa Ortega Diaz',
        initials: 'VOD',
        email: 'vanessa.ortega@simar.com',
        role: 'sales',
        is_active: 1
      })
    ]);
  });
});
