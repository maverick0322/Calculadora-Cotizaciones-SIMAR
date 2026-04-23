import { Database } from 'better-sqlite3';
import { User } from '../../../../shared/types/Auth';
import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';

export class SqliteAuthRepository implements IAuthRepository {
  constructor(private readonly db: Database) {}

  getUserByEmail(email: string): any | null {
    const stmt = this.db.prepare(`
      SELECT id, central_id, full_name, email, role, is_active, password_hash
      FROM users
      WHERE email = ?
    `);
    
    const user = stmt.get(email);
    return user || null;
  }
}