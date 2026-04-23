import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../../main/application/useCases/LoginUseCase';
import { IAuthRepository } from '../../../main/domain/repositories/IAuthRepository';
import { User } from '../../../shared/types/Auth';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
  default: {
    compareSync: vi.fn(),
  },
}));

describe('LoginUseCase', () => {
  let mockAuthRepository: IAuthRepository;
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    mockAuthRepository = {
      getUserByEmail: vi.fn(),
    };
    loginUseCase = new LoginUseCase(mockAuthRepository);
    vi.clearAllMocks();
  });

  // --- AC 1: SUCCESSFUL LOGIN (CON BCRYPT) ---
  it('should return success and user data when credentials are valid and user is active', () => {
    // [ ARRANGE ]
    const credentials = { email: 'admin@simar.com', password: 'my_secure_password' };
    const mockDbRecord = {
      id: 1,
      central_id: 'C-001',
      full_name: 'Admin Test',
      email: 'admin@simar.com',
      role: 'admin',
      is_active: 1,
      password_hash: '$2a$10$somelonghashstring',
    };
    
    vi.mocked(mockAuthRepository.getUserByEmail).mockReturnValue(mockDbRecord);
    vi.mocked(bcrypt.compareSync).mockReturnValue(true);

    // [ ACT ]
    const result = loginUseCase.execute(credentials);

    // [ ASSERT ]
    expect(mockAuthRepository.getUserByEmail).toHaveBeenCalledWith('admin@simar.com');
    expect(bcrypt.compareSync).toHaveBeenCalledWith('my_secure_password', mockDbRecord.password_hash);
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('email', 'admin@simar.com');
    expect(result.data).not.toHaveProperty('password_hash');
  });

  // --- AC 2: SUCCESSFUL LOGIN (RETROCOMPATIBILIDAD TEXTO PLANO) ---
  it('should return success for legacy plain-text passwords', () => {
    const credentials = { email: 'legacy@simar.com', password: '123456' };
    const mockDbRecord = {
      id: 2,
      email: 'legacy@simar.com',
      is_active: 1,
      password_hash: '123456',
    };
    
    vi.mocked(mockAuthRepository.getUserByEmail).mockReturnValue(mockDbRecord);

    const result = loginUseCase.execute(credentials);

    expect(result.success).toBe(true);
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
  });

  // --- AC 3: INVALID CREDENTIALS (WRONG PASSWORD) ---
  it('should return success false when password comparison fails', () => {
    const credentials = { email: 'admin@simar.com', password: 'wrong_password' };
    const mockDbRecord = {
      id: 1,
      email: 'admin@simar.com',
      is_active: 1,
      password_hash: '$2a$10$somelonghashstring',
    };
    
    vi.mocked(mockAuthRepository.getUserByEmail).mockReturnValue(mockDbRecord);
    vi.mocked(bcrypt.compareSync).mockReturnValue(false); 

    const result = loginUseCase.execute(credentials);

    expect(result).toEqual({ success: false, error: 'Correo o contraseña inválidos.' });
  });

  // --- AC 4: INVALID CREDENTIALS (EMAIL NOT FOUND) ---
  it('should return success false when email does not exist', () => {
    const credentials = { email: 'wrong@test.com', password: 'any' };
    vi.mocked(mockAuthRepository.getUserByEmail).mockReturnValue(null);

    const result = loginUseCase.execute(credentials);

    expect(result).toEqual({ success: false, error: 'Correo o contraseña inválidos.' });
  });

  // --- AC 5: DISABLED ACCOUNT ---
  it('should return success false and "disabled" message when user exists but is_active is 0', () => {
    const credentials = { email: 'inactive@simar.com', password: 'password123' };
    const inactiveUser = {
      id: 2,
      email: 'inactive@simar.com',
      is_active: 0,
      password_hash: 'password123'
    };
    vi.mocked(mockAuthRepository.getUserByEmail).mockReturnValue(inactiveUser);

    const result = loginUseCase.execute(credentials);

    expect(result).toEqual({ success: false, error: 'Cuenta deshabilitada. Contacte al administrador.' });
  });

  // --- AC 6: DATABASE ERROR ---
  it('should return success false and internal error message when database throws an exception', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const credentials = { email: 'any@test.com', password: 'any' };
    vi.mocked(mockAuthRepository.getUserByEmail).mockImplementation(() => {
      throw new Error('SQLite disk I/O error');
    });

    const result = loginUseCase.execute(credentials);

    expect(result).toEqual({ success: false, error: 'Error interno de la base de datos.' });
  });
});