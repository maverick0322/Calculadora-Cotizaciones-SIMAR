import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteAuditRepository } from '../../../../main/infrastructure/database/repositories/SqliteAuditRepository';
import { AuditLog } from '../../../../main/domain/repositories/IAuditRepository';

describe('SqliteAuditRepository', () => {
  let db: Database.Database;
  let repository: SqliteAuditRepository;

  beforeAll(() => {
    db = new Database(':memory:');
    
    db.exec(`
      CREATE TABLE audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT,
        entity TEXT,
        entity_id TEXT,
        details TEXT,
        created_at INTEGER
      );
    `);
  });

  afterAll(() => {
    db?.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM audit_logs;');
    repository = new SqliteAuditRepository(db);
  });

  it('should successfully log an action with all fields provided', () => {
    const log: AuditLog = {
      userId: 1,
      action: 'CREATE',
      entity: 'QUOTE',
      entityId: 100,
      details: 'Created draft quote',
      createdAt: 1672531200000
    };

    repository.logAction(log);

    const rows = db.prepare('SELECT * FROM audit_logs').all() as any[];
    
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(1);
    expect(rows[0].action).toBe('CREATE');
    expect(rows[0].entity).toBe('QUOTE');
    // El repositorio lo convierte a string
    expect(rows[0].entity_id).toBe('100'); 
    expect(rows[0].details).toBe('Created draft quote');
    expect(rows[0].created_at).toBe(1672531200000);
  });

  it('should handle missing optional fields (entityId, details) and auto-generate createdAt', () => {
    const log: AuditLog = {
      userId: 2,
      action: 'LOGIN',
      entity: 'USER'
    };

    repository.logAction(log);

    const rows = db.prepare('SELECT * FROM audit_logs').all() as any[];
    
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(2);
    expect(rows[0].action).toBe('LOGIN');
    expect(rows[0].entity_id).toBeNull();
    expect(rows[0].details).toBeNull();
    // Verifica que se haya generado un timestamp válido
    expect(rows[0].created_at).toBeGreaterThan(0); 
  });
});