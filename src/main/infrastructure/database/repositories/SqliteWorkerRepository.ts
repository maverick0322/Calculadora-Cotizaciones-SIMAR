// src/main/infrastructure/database/repositories/SqliteWorkerRepository.ts
import { Database } from 'better-sqlite3';
import { WorkerData } from '../../../../shared/types/Worker';

export class SqliteWorkerRepository {
  constructor(private db: Database) {}

  save(worker: WorkerData) {
    const stmt = this.db.prepare(`
      INSERT INTO users (full_name, central_id, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(worker.fullName, worker.employeeId, worker.email, worker.password, worker.role);
  }
}
