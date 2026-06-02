import { Database } from 'better-sqlite3';
import {
  ConditionCatalogPayload,
  IConditionRepository
} from '../../../domain/repositories/IConditionRepository';
import { QuoteCondition, QuoteConditionSelection, ServiceType } from '../../../../shared/types/Quote';

interface ConditionRow {
  id: number;
  type: 'commercial' | 'technical';
  title: string;
  description: string;
  applies_to_service_types_json: string;
  is_active: number;
}

export class SqliteConditionRepository implements IConditionRepository {
  constructor(private readonly db: Database) {}

  listActive(): QuoteCondition[] {
    const stmt = this.db.prepare(`
      SELECT id, type, title, description, applies_to_service_types_json, is_active
      FROM catalog_conditions
      WHERE is_active = 1
      ORDER BY type ASC, title ASC
    `);

    return (stmt.all() as ConditionRow[]).map((row) => this.mapRow(row));
  }

  listActiveByServiceTypes(serviceTypes: ServiceType[]): QuoteCondition[] {
    const activeConditions = this.listActive();
    if (serviceTypes.length === 0) return activeConditions;

    return activeConditions.filter((condition) =>
      condition.type === 'commercial' ||
      condition.appliesToServiceTypes.length === 0 ||
      condition.appliesToServiceTypes.some((serviceType) => serviceTypes.includes(serviceType))
    );
  }

  add(payload: ConditionCatalogPayload): number | bigint {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_conditions (type, title, description, applies_to_service_types_json, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);
    const info = stmt.run(
      payload.type,
      payload.title.trim(),
      payload.description.trim(),
      JSON.stringify(payload.appliesToServiceTypes)
    );
    return info.lastInsertRowid;
  }

  update(id: number, payload: ConditionCatalogPayload): boolean {
    const stmt = this.db.prepare(`
      UPDATE catalog_conditions
      SET type = ?, title = ?, description = ?, applies_to_service_types_json = ?
      WHERE id = ? AND is_active = 1
    `);
    const info = stmt.run(
      payload.type,
      payload.title.trim(),
      payload.description.trim(),
      JSON.stringify(payload.appliesToServiceTypes),
      id
    );
    return info.changes > 0;
  }

  deactivate(id: number): boolean {
    const stmt = this.db.prepare(`UPDATE catalog_conditions SET is_active = 0 WHERE id = ?`);
    const info = stmt.run(id);
    return info.changes > 0;
  }

  saveQuoteSnapshot(quoteId: number, conditions: QuoteConditionSelection[]): void {
    const deleteStmt = this.db.prepare(`DELETE FROM quote_conditions WHERE quote_id = ?`);
    const insertStmt = this.db.prepare(`
      INSERT INTO quote_conditions (quote_id, condition_id, type, title, description, is_custom)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      deleteStmt.run(quoteId);
      for (const condition of conditions) {
        insertStmt.run(
          quoteId,
          condition.conditionId ?? null,
          condition.type,
          condition.title,
          condition.description,
          condition.isCustom ? 1 : 0
        );
      }
    });

    transaction();
  }

  private mapRow(row: ConditionRow): QuoteCondition {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      appliesToServiceTypes: this.parseServiceTypes(row.applies_to_service_types_json),
      isActive: Boolean(row.is_active)
    };
  }

  private parseServiceTypes(value: string): ServiceType[] {
    try {
      return JSON.parse(value || '[]') as ServiceType[];
    } catch {
      return [];
    }
  }
}
