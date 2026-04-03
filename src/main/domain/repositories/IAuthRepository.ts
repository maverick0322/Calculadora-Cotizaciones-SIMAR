import { User } from '../../../shared/types/Auth';

export interface IAuthRepository {
  getUserByCredentials(email: string, passwordHash: string): User | null;
}