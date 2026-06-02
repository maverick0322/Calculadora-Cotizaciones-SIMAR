import bcrypt from 'bcryptjs';
import { IWorkerRepository } from '../../domain/repositories/IWorkerRepository';
import { WorkerData } from '../../../shared/types/Worker';
import { logger } from '../../infrastructure/logging/SafeLogger';

const ADMIN_REGISTRATION_KEY = 'SIMAR-ADMIN-2026';
const PASSWORD_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const RFC_PATTERN = /^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/i;

export class RegisterWorkerUseCase {
  constructor(private readonly workerRepo: IWorkerRepository) {}

  async execute(worker: WorkerData) {
    try {
      const normalizedWorker = this.normalizeAndValidate(worker);
      const salt = bcrypt.genSaltSync(PASSWORD_SALT_ROUNDS);
      const hashedPassword = bcrypt.hashSync(normalizedWorker.password!, salt);

      const result = this.workerRepo.save({
        ...normalizedWorker,
        password: hashedPassword
      });

      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        logger.warn('Registro de empleado rechazado por duplicidad lógica');
        return {
          success: false,
          error: 'La clave del empleado o el correo ya están registrados.'
        };
      }

      if (error instanceof Error) {
        logger.warn('Registro de empleado rechazado por validación');
        return { success: false, error: error.message };
      }

      logger.error('Error inesperado al registrar empleado');
      return { success: false, error: 'Error inesperado al registrar el empleado.' };
    }
  }

  private normalizeAndValidate(worker: WorkerData): WorkerData {
    if (worker.superUserKey !== ADMIN_REGISTRATION_KEY) {
      throw new Error('La clave de superusuario no es válida.');
    }

    if (!worker.password || worker.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error('La contraseña temporal debe tener al menos 8 caracteres.');
    }

    const cleanWorker: WorkerData = {
      ...worker,
      rfc: worker.rfc.trim().toUpperCase(),
      firstName: worker.firstName.trim(),
      lastName: worker.lastName.trim(),
      maternalLastName: worker.maternalLastName?.trim() ?? '',
      employeeId: worker.employeeId.trim(),
      employeeKey: worker.employeeKey.trim().toUpperCase(),
      initials: worker.initials.trim().toUpperCase(),
      address: worker.address?.trim() ?? '',
      email: worker.email.trim().toLowerCase(),
      role: worker.role ?? 'sales',
      isActive: worker.isActive !== false
    };

    cleanWorker.fullName = [cleanWorker.firstName, cleanWorker.lastName, cleanWorker.maternalLastName]
      .filter(Boolean)
      .join(' ');

    if (!RFC_PATTERN.test(cleanWorker.rfc)) {
      throw new Error('El RFC del empleado no tiene un formato válido.');
    }

    if (!cleanWorker.firstName || !cleanWorker.lastName) {
      throw new Error('El nombre y apellido paterno del empleado son obligatorios.');
    }

    if (!cleanWorker.employeeId || !cleanWorker.employeeKey || !cleanWorker.initials) {
      throw new Error('La clave, ID e iniciales del empleado son obligatorias.');
    }

    return cleanWorker;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Error && error.message.includes('UNIQUE constraint failed');
  }
}
