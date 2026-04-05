import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteAuthRepository } from '../../../../main/infrastructure/database/repositories/SqliteAuthRepository';

describe('SqliteAuthRepository', () => {
  let db: Database.Database;
  let repository: SqliteAuthRepository;

  beforeAll(() => {
    db = new Database(':memory:');
    
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        central_id TEXT,
        full_name TEXT,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT,
        is_active INTEGER
      );
    `);
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM users;');
    
    db.prepare(`
      INSERT INTO users (central_id, full_name, email, password_hash, role, is_active)
      VALUES ('C-123', 'John Doe', 'admin@simar.com', 'hashed_pass_123', 'admin', 1)
    `).run();

    repository = new SqliteAuthRepository(db);
  });

  // --- AC 1: HAPPY PATH ---
  it('should return the user object when email and password match perfectly', () => {
    // [ ACT ]
    const user = repository.getUserByCredentials('admin@simar.com', 'hashed_pass_123');

    // [ ASSERT ]
    expect(user).not.toBeNull();
    expect(user?.full_name).toBe('John Doe');
    expect(user?.email).toBe('admin@simar.com');
    expect(user?.role).toBe('admin');
    expect(user?.is_active).toBe(1);
  });

  // --- AC 2: UNEXISTING EMAIL ---
  it('should return null when the email does not exist in the database', () => {
    const user = repository.getUserByCredentials('wrong@simar.com', 'hashed_pass_123');
    expect(user).toBeNull();
  });

  // --- AC 3: INCORRECT PASSWORD ---
  it('should return null when the email exists but the password hash is incorrect', () => {
    const user = repository.getUserByCredentials('admin@simar.com', 'wrong_hash');
    expect(user).toBeNull();
  });

  // --- AC 4: INACTIVE USER ---
  it('should return the user data even if is_active is 0 (UseCase handles the lock)', () => {
    db.prepare(`
      INSERT INTO users (central_id, full_name, email, password_hash, role, is_active)
      VALUES ('C-999', 'Inactive User', 'inactive@simar.com', 'hash_456', 'viewer', 0)
    `).run();

    const user = repository.getUserByCredentials('inactive@simar.com', 'hash_456');

    expect(user).not.toBeNull();
    expect(user?.is_active).toBe(0);
  });
});