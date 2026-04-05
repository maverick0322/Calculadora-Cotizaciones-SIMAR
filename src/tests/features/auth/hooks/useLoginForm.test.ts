declare global {
  interface Window {
    api: any;
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useLoginForm } from '../../../../renderer/src/features/auth/hooks/useLoginForm';
describe('useLoginForm Hook', () => {
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    window.api = {
      login: vi.fn(),
    };
  });

  // --- AC 1: HAPPY PATH ---
  it('should call onLoginSuccess and clear errors when login is successful', async () => {
    const mockData = { email: 'admin@simar.com', password: '123' };
    const mockResponse = { success: true, data: { full_name: 'Admin' } };
    
    vi.mocked(window.api.login).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLoginForm(mockOnLoginSuccess));

    await act(async () => {
      await result.current.submitLogin(mockData);
    });

    expect(window.api.login).toHaveBeenCalledWith(mockData);
    expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.errorMsg).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // --- AC 2: INVALID CREDENTIALS ---
  it('should set errorMsg and NOT call onLoginSuccess when API returns success false', async () => {
    const mockData = { email: 'wrong@simar.com', password: '123' };
    const mockResponse = { success: false, error: 'Correo o contraseña incorrectos.' };
    vi.mocked(window.api.login).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLoginForm(mockOnLoginSuccess));

    await act(async () => {
      await result.current.submitLogin(mockData);
    });

    expect(window.api.login).toHaveBeenCalledWith(mockData);
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    expect(result.current.errorMsg).toBe('Correo o contraseña incorrectos.');
    expect(result.current.isLoading).toBe(false);
  });

  // --- AC 3: CONNECTION ERROR ---
  it('should catch IPC exceptions and set a generic connection error message', async () => {
    const mockData = { email: 'admin@simar.com', password: '123' };
    vi.mocked(window.api.login).mockRejectedValue(new Error('IPC Disconnected'));
    
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useLoginForm(mockOnLoginSuccess));

    await act(async () => {
      await result.current.submitLogin(mockData);
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    expect(result.current.errorMsg).toBe('Error de conexión con la base de datos local.');
    expect(result.current.isLoading).toBe(false);
  });
});