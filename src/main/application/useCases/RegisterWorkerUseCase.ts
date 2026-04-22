// src/main/application/useCases/RegisterWorkerUseCase.ts
import bcrypt from 'bcryptjs';
import { SqliteWorkerRepository } from '../../infrastructure/database/repositories/SqliteWorkerRepository';
import { WorkerData } from '../../../shared/types/Worker';

export class RegisterWorkerUseCase {
  constructor(private workerRepo: SqliteWorkerRepository) {}

  async execute(worker: WorkerData) {
    try {
      // 1. Validamos que la contraseña exista antes de procesarla
      if (!worker.password) {
        throw new Error('La contraseña es obligatoria para el registro.');
      }

      // 2. Generamos el Hash (Seguridad en el lado del servidor/main)
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(worker.password, salt);

      // 3. Guardamos en la DB reemplazando la contraseña plana por la encriptada
      const result = this.workerRepo.save({
        ...worker,
        password: hashedPassword
      });

      return { success: true, id: result.lastInsertRowid };
    } catch (error: any) {
      console.error('Error en RegisterWorkerUseCase:', error.message);

      // Manejo amigable de errores (ej. si el ID ya existe)
      if (error.message.includes('UNIQUE constraint failed')) {
        return {
          success: false,
          error: 'El ID Central o el Correo ya están registrados en el sistema.'
        };
      }

      return { success: false, error: error.message };
    }
  }
}
