import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { User } from '../../../shared/types/Auth';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  execute(credentials: Record<string, string>): { success: boolean; data?: User; error?: string } {
    const { email, password } = credentials;

    if (!email || !password) {
      return { success: false, error: 'Correo y contraseña son requeridos.' };
    }

    try {
      const user = this.authRepository.getUserByCredentials(email, password);

      if (!user) {
        return { success: false, error: 'Invalid email or password.' };
      }

      if (user.is_active === 0 || user.is_active === false) {
        return { success: false, error: 'Account disabled. Contact administrator.' };
      }

      return { success: true, data: user };
    } catch (error) {
      console.error('Login Error in UseCase:', error);
      return { success: false, error: 'Internal database error.' };
    }
  }
}