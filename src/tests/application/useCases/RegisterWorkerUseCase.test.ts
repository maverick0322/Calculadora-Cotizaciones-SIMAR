import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { RegisterWorkerUseCase } from '../../../main/application/useCases/RegisterWorkerUseCase';
import { IWorkerRepository } from '../../../main/domain/repositories/IWorkerRepository';
import { WorkerData } from '../../../shared/types/Worker';

vi.mock('bcryptjs', () => ({
  default: {
    genSaltSync: vi.fn().mockReturnValue('fake_salt'),
    hashSync: vi.fn().mockReturnValue('hashed_password_123')
  }
}));

describe('RegisterWorkerUseCase', () => {
  let mockWorkerRepo: IWorkerRepository;
  let useCase: RegisterWorkerUseCase;

  beforeEach(() => {
    mockWorkerRepo = {
      save: vi.fn(),
      listActive: vi.fn()
    };
    useCase = new RegisterWorkerUseCase(mockWorkerRepo);
    vi.clearAllMocks();
  });

  const buildValidWorker = (overrides: Partial<WorkerData> = {}): WorkerData => ({
    rfc: 'PEPJ800101ABC',
    firstName: ' Juan ',
    lastName: ' Perez ',
    maternalLastName: ' Lopez ',
    employeeId: ' EMP-01 ',
    employeeKey: ' evl ',
    initials: ' evl ',
    address: ' Calle 1 ',
    email: ' Juan.Perez@SIMAR.COM ',
    password: '123456',
    superUserKey: 'SIMAR-ADMIN-2026',
    role: 'sales',
    ...overrides
  });

  it('cleans worker data, hashes password and returns the new worker id', async () => {
    vi.mocked(mockWorkerRepo.save).mockReturnValue({ lastInsertRowid: 10 });

    const result = await useCase.execute(buildValidWorker());

    expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10);
    expect(bcrypt.hashSync).toHaveBeenCalledWith('123456', 'fake_salt');
    expect(mockWorkerRepo.save).toHaveBeenCalledWith({
      rfc: 'PEPJ800101ABC',
      firstName: 'Juan',
      lastName: 'Perez',
      maternalLastName: 'Lopez',
      fullName: 'Juan Perez Lopez',
      employeeId: 'EMP-01',
      employeeKey: 'EVL',
      initials: 'EVL',
      address: 'Calle 1',
      email: 'juan.perez@simar.com',
      password: 'hashed_password_123',
      superUserKey: 'SIMAR-ADMIN-2026',
      role: 'sales',
      isActive: true
    });
    expect(result).toEqual({ success: true, id: 10 });
  });

  it('returns a specific error when the password is missing', async () => {
    const result = await useCase.execute(buildValidWorker({ password: '' }));

    expect(result).toEqual({
      success: false,
      error: 'La contraseña temporal debe tener al menos 6 caracteres.'
    });
    expect(mockWorkerRepo.save).not.toHaveBeenCalled();
  });

  it('returns a specific error when the super user key is invalid', async () => {
    const result = await useCase.execute(buildValidWorker({ superUserKey: 'wrong-key' }));

    expect(result).toEqual({
      success: false,
      error: 'La clave de superusuario no es válida.'
    });
    expect(mockWorkerRepo.save).not.toHaveBeenCalled();
  });

  it('maps SQLite unique constraint errors to a user friendly message', async () => {
    vi.mocked(mockWorkerRepo.save).mockImplementation(() => {
      throw new Error('UNIQUE constraint failed: users.email');
    });

    const result = await useCase.execute(buildValidWorker());

    expect(result).toEqual({
      success: false,
      error: 'La clave del empleado o el correo ya están registrados.'
    });
  });
});
