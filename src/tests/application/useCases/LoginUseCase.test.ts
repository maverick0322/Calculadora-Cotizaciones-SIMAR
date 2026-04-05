import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../../main/application/useCases/LoginUseCase';
import { IAuthRepository } from '../../../main/domain/repositories/IAuthRepository';
import { User } from '../../../shared/types/Auth';

describe('LoginUseCase', () => {
  let mockAuthRepository: IAuthRepository;
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    mockAuthRepository = {
      getUserByCredentials: vi.fn(),
    };
    loginUseCase = new LoginUseCase(mockAuthRepository);
  });

  // --- AC 1: SUCCESSFUL LOGIN ---
  it('should return success and user data when credentials are valid and user is active', () => {
    // [ ARRANGE ]
    const credentials = { email: 'admin@simar.com', password: 'hashed_password' };
    const mockUser: User = {
      id: 1,
      central_id: 'C-001',
      full_name: 'Admin Test',
      email: 'admin@simar.com',
      role: 'admin',
      is_active: 1
    };
    vi.mocked(mockAuthRepository.getUserByCredentials).mockReturnValue(mockUser);

    // [ ACT ]
    const result = loginUseCase.execute(credentials);

    // [ ASSERT ]
    expect(mockAuthRepository.getUserByCredentials).toHaveBeenCalledWith(credentials.email, credentials.password);
    expect(result).toEqual({ success: true, data: mockUser });
  });

  // --- AC 2: INVALID CREDENTIALS ---
  it('should return success false when credentials do not match any user', () => {
    // [ ARRANGE ]
    const credentials = { email: 'wrong@test.com', password: 'wrong_password' };
    vi.mocked(mockAuthRepository.getUserByCredentials).mockReturnValue(null);

    // [ ACT ]
    const result = loginUseCase.execute(credentials);

    // [ ASSERT ]
    expect(result).toEqual({ success: false, error: 'Invalid email or password.' });
  });

  // --- AC 3: DISABLED ACCOUNT ---
  it('should return success false and "disabled" message when user exists but is_active is 0', () => {
    // [ ARRANGE ]
    const credentials = { email: 'inactive@simar.com', password: 'password123' };
    const inactiveUser: User = {
      id: 2,
      central_id: null,
      full_name: 'User Inactive',
      email: 'inactive@simar.com',
      role: 'viewer',
      is_active: 0
    };
    vi.mocked(mockAuthRepository.getUserByCredentials).mockReturnValue(inactiveUser);

    // [ ACT ]
    const result = loginUseCase.execute(credentials);

    // [ ASSERT ]
    expect(result).toEqual({ success: false, error: 'Account disabled. Contact administrator.' });
  });

  // --- AC 4: DATABASE ERROR ---
  it('should return success false and internal error message when database throws an exception', () => {
    // [ ARRANGE ]
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const credentials = { email: 'any@test.com', password: 'any' };
    vi.mocked(mockAuthRepository.getUserByCredentials).mockImplementation(() => {
      throw new Error('SQLite disk I/O error');
    });

    // [ ACT ]
    const result = loginUseCase.execute(credentials);

    // [ ASSERT ]
    expect(result).toEqual({ success: false, error: 'Internal database error.' });
  });
});