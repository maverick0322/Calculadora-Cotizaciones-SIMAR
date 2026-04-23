import { User } from '../../../shared/types/Auth';

export interface IAuthRepository {
  getUserByEmail(email: string): any;
}