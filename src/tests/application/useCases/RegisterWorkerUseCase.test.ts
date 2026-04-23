import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterWorkerUseCase } from '../../../main/application/useCases/RegisterWorkerUseCase';
import { SqliteWorkerRepository } from '../../../main/infrastructure/database/repositories/SqliteWorkerRepository';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
  default: {
    genSaltSync: vi.fn().mockReturnValue('fake_salt'),
    hashSync: vi.fn().mockReturnValue('hashed_password_123'),
  }
}));

describe('RegisterWorkerUseCase', () => {
  let mockWorkerRepo: any;
  let useCase: RegisterWorkerUseCase;

  beforeEach(() => {
    mockWorkerRepo = {
      save: vi.fn()
    };
    useCase = new RegisterWorkerUseCase(mockWorkerRepo as unknown as SqliteWorkerRepository);
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Ocultar console.errors esperados
  });

  // --- AC 1: HAPPY PATH CON LIMPIEZA DE DATOS ---
  it('should clean data, hash password, and return success with ID', async () => {
    // [ ARRANGE ]
    mockWorkerRepo.save.mockReturnValue({ lastInsertRowid: 10 });
    
    // Inyectamos datos sucios con espacios extra y mayúsculas
    const rawWorker = {
      fullName: ' Juan Perez  ',
      employeeId: ' EMP-01 ',
      email: ' Juan.Perez@SIMAR.COM ',
      password: 'mypassword',
      role: 'technician'
    } as any;

    // [ ACT ]
    const result = await useCase.execute(rawWorker);

    // [ ASSERT ]
    expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10);
    expect(bcrypt.hashSync).toHaveBeenCalledWith('mypassword', 'fake_salt');
    
    // Verificamos que al repositorio le lleguen los datos perfectamente limpios
    expect(mockWorkerRepo.save).toHaveBeenCalledWith({
      fullName: 'Juan Perez',
      employeeId: 'EMP-01',
      email: 'juan.perez@simar.com',
      password: 'hashed_password_123', // Guarda el hash, no la contraseña plana
      role: 'technician'
    });

    expect(result).toEqual({ success: true, id: 10 });
  });

  // --- AC 2: ERROR SIN CONTRASEÑA ---
  it('should return an error if the password is missing', async () => {
    const rawWorker = { fullName: 'Juan', email: 'j@s.com', employeeId: '1', role: 'admin' } as any;

    const result = await useCase.execute(rawWorker);

    expect(result).toEqual({ success: false, error: 'La contraseña es obligatoria para el registro.' });
    expect(mockWorkerRepo.save).not.toHaveBeenCalled();
  });

  // --- AC 3: MANEJO DE RESTRICCIONES UNIQUE (SQLITE) ---
  it('should map SQLite UNIQUE constraint errors to a user-friendly message', async () => {
    mockWorkerRepo.save.mockImplementation(() => {
      throw new Error('UNIQUE constraint failed: users.email');
    });

    const rawWorker = { fullName: 'Juan', email: 'j@s.com', employeeId: '1', role: 'admin', password: '123' } as any;

    const result = await useCase.execute(rawWorker);

    expect(result).toEqual({ 
      success: false, 
      error: 'El ID Central o el Correo ya están registrados en el sistema.' 
    });
  });

  // --- AC 4: ERRORES GENERALES ---
  it('should return a generic error message for other database failures', async () => {
    mockWorkerRepo.save.mockImplementation(() => {
      throw new Error('Database locked');
    });

    const rawWorker = { fullName: 'Juan', email: 'j@s.com', employeeId: '1', role: 'admin', password: '123' } as any;

    const result = await useCase.execute(rawWorker);

    expect(result).toEqual({ success: false, error: 'Database locked' });
  });
});