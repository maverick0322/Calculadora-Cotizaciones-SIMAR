import { Database } from 'better-sqlite3';
import { User } from '../../../../shared/types/Auth';
import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';

export class SqliteAuthRepository implements IAuthRepository {
  constructor(private readonly db: Database) {}

  getUserByCredentials(email: string, passwordHash: string): User | null {
    const stmt = this.db.prepare(`
      SELECT id, central_id, full_name, email, role, is_active
      FROM users
      WHERE email = ? AND password_hash = ?
    `);
    
    const user = stmt.get(email, passwordHash) as User | undefined;
    return user || null;
  }
}