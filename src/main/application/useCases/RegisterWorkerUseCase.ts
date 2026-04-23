import bcrypt from 'bcryptjs';
import { SqliteWorkerRepository } from '../../infrastructure/database/repositories/SqliteWorkerRepository';
import { WorkerData } from '../../../shared/types/Worker';

export class RegisterWorkerUseCase {
  constructor(private workerRepo: SqliteWorkerRepository) {}

  async execute(worker: WorkerData) {
    try {
      if (!worker.password) {
        throw new Error('La contraseña es obligatoria para el registro.');
      }

      // 1. Encriptación segura de la contraseña
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(worker.password, salt);

      const cleanEmail = worker.email.trim().toLowerCase();
      const cleanEmployeeId = worker.employeeId.trim();
      const cleanFullName = worker.fullName.trim();

      // 3. Guardado en base de datos
      const result = this.workerRepo.save({
        ...worker,
        email: cleanEmail,
        employeeId: cleanEmployeeId,
        fullName: cleanFullName,
        password: hashedPassword
      });

      return { success: true, id: result.lastInsertRowid };
    } catch (error: any) {
      console.error('Error en RegisterWorkerUseCase:', error.message);

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