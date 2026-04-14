import { Database } from 'better-sqlite3';
import { IAuditRepository, AuditLog } from '../../../domain/repositories/IAuditRepository';

export class SqliteAuditRepository implements IAuditRepository {
  constructor(private readonly db: Database) {}

  logAction(audit: AuditLog): void {
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (user_id, action, entity, entity_id, details, created_at)
      VALUES (@userId, @action, @entity, @entityId, @details, @createdAt)
    `);
    
    stmt.run({
      userId: audit.userId,
      action: audit.action,
      entity: audit.entity,
      entityId: audit.entityId ? String(audit.entityId) : null,
      details: audit.details || null,
      createdAt: audit.createdAt || Date.now()
    });
  }
}