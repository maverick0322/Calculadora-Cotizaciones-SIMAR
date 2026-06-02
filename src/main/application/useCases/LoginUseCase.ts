import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { User } from '../../../shared/types/Auth';
import bcrypt from 'bcryptjs'; 
import { logger } from '../../infrastructure/logging/SafeLogger';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  execute(credentials: Record<string, string>): { success: boolean; data?: User; error?: string } {
    const { email, password } = credentials;

    if (!email || !password) {
      return { success: false, error: 'Correo y contraseña son requeridos.' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const userRecord = this.authRepository.getUserByEmail(cleanEmail);

      if (!userRecord) {
        logger.warn('Intento de inicio de sesión con usuario inexistente');
        return { success: false, error: 'Correo o contraseña inválidos.' };
      }

      let isPasswordValid = false;
      
      if (userRecord.password_hash.startsWith('$2a$') || userRecord.password_hash.startsWith('$2b$')) {
        isPasswordValid = bcrypt.compareSync(password, userRecord.password_hash);
      } else {
        isPasswordValid = (password === userRecord.password_hash);
      }

      if (!isPasswordValid) {
        logger.warn('Intento de inicio de sesión con contraseña inválida', { userId: userRecord.id });
        return { success: false, error: 'Correo o contraseña inválidos.' };
      }

      if (userRecord.is_active === 0 || userRecord.is_active === false) {
        logger.warn('Intento de inicio de sesión con cuenta deshabilitada', { userId: userRecord.id });
        return { success: false, error: 'Cuenta deshabilitada. Contacte al administrador.' };
      }

      const { password_hash, ...safeUser } = userRecord;

      return { success: true, data: safeUser as User };
    } catch (error) {
      logger.error('Error inesperado al iniciar sesión', { error });
      return { success: false, error: 'Error interno de la base de datos.' };
    }
  }
}
