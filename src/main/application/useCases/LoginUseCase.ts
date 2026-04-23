import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { User } from '../../../shared/types/Auth';
import bcrypt from 'bcryptjs'; 

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  execute(credentials: Record<string, string>): { success: boolean; data?: User; error?: string } {
    const { email, password } = credentials;

    if (!email || !password) {
      return { success: false, error: 'Correo y contraseña son requeridos.' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      console.log(`[LOGIN] Intentando ingresar con: '${cleanEmail}'`);

      const userRecord = this.authRepository.getUserByEmail(cleanEmail);

      if (!userRecord) {
        console.warn(`[LOGIN] Usuario no encontrado en BD: '${cleanEmail}'`);
        return { success: false, error: 'Correo o contraseña inválidos.' };
      }

      let isPasswordValid = false;
      
      if (userRecord.password_hash.startsWith('$2a$') || userRecord.password_hash.startsWith('$2b$')) {
        isPasswordValid = bcrypt.compareSync(password, userRecord.password_hash);
      } else {
        isPasswordValid = (password === userRecord.password_hash);
      }

      if (!isPasswordValid) {
        console.warn(`[LOGIN] Contraseña incorrecta para: '${cleanEmail}'`);
        return { success: false, error: 'Correo o contraseña inválidos.' };
      }

      if (userRecord.is_active === 0 || userRecord.is_active === false) {
        console.warn(`[LOGIN] Cuenta deshabilitada para: '${cleanEmail}'`);
        return { success: false, error: 'Cuenta deshabilitada. Contacte al administrador.' };
      }

      console.log(`[LOGIN] Acceso concedido a: '${cleanEmail}'`);
      const { password_hash, ...safeUser } = userRecord;

      return { success: true, data: safeUser as User };
    } catch (error) {
      console.error('Login Error in UseCase:', error);
      return { success: false, error: 'Error interno de la base de datos.' };
    }
  }
}