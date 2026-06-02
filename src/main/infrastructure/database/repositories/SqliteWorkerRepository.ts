// src/main/infrastructure/database/repositories/SqliteWorkerRepository.ts
import { Database } from 'better-sqlite3';
import { IWorkerRepository } from '../../../domain/repositories/IWorkerRepository';
import { WorkerData, WorkerSummary } from '../../../../shared/types/Worker';

interface WorkerRow {
  id: number;
  rfc: string | null;
  full_name: string;
  central_id: string;
  employee_key: string | null;
  initials: string | null;
  email: string;
  role: 'admin' | 'sales';
  is_active: number;
}

export class SqliteWorkerRepository implements IWorkerRepository {
  constructor(private readonly db: Database) {}

  save(worker: WorkerData) {
    const stmt = this.db.prepare(`
      INSERT INTO users (
        rfc, first_name, last_name, maternal_last_name, full_name, central_id,
        employee_key, initials, address, email, password_hash, role, is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      worker.rfc,
      worker.firstName,
      worker.lastName,
      worker.maternalLastName ?? '',
      worker.fullName,
      worker.employeeId,
      worker.employeeKey,
      worker.initials,
      worker.address ?? '',
      worker.email,
      worker.password,
      worker.role,
      worker.isActive === false ? 0 : 1
    );
  }

  listActive(): WorkerSummary[] {
    const stmt = this.db.prepare(`
      SELECT id, rfc, full_name, central_id, employee_key, initials, email, role, is_active
      FROM users
      ORDER BY full_name ASC
    `);

    return (stmt.all() as WorkerRow[]).map((worker) => ({
      id: worker.id,
      rfc: worker.rfc ?? '',
      fullName: worker.full_name,
      employeeId: worker.central_id,
      employeeKey: worker.employee_key ?? '',
      initials: worker.initials ?? '',
      email: worker.email,
      role: worker.role,
      isActive: Boolean(worker.is_active)
    }));
  }
}
