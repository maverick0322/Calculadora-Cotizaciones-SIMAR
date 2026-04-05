import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginView } from '@renderer/features/auth/LoginView';
import * as useLoginFormModule from '@renderer/features/auth/hooks/useLoginForm';

describe('LoginView Component', () => {
  const mockOnLoginSuccess = vi.fn();
  
  const mockSubmitLogin = vi.fn();
  const mockRegister = vi.fn();
  const mockHandleSubmit = vi.fn((fn) => (e: any) => {
    e.preventDefault();
    fn({ email: 'test@test.com', password: '123' });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.spyOn(useLoginFormModule, 'useLoginForm').mockReturnValue({
      form: {
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
      } as any,
      submitLogin: mockSubmitLogin,
      errorMsg: null,
      isLoading: false,
    });
  });

  // --- AC 1: RENDERIZADO INICIAL ---
  it('should render the login form correctly', () => {
    // [ ARRANGE & ACT ]
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />);

    // [ ASSERT ]
    expect(screen.getByText('Iniciar Sesión')).toBeDefined();
    expect(screen.getByPlaceholderText('admin@simar.com')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
    
    const submitButton = screen.getByRole('button', { name: /ingresar/i });
    expect(submitButton).toBeDefined();
    // El botón no debe estar deshabilitado inicialmente
    expect((submitButton as HTMLButtonElement).disabled).toBe(false); 
  });

  // --- AC 2: ESTADO DE CARGA ---
  it('should disable the submit button and show spinner when isLoading is true', () => {
    // [ ARRANGE ]
    vi.spyOn(useLoginFormModule, 'useLoginForm').mockReturnValue({
      form: { register: mockRegister, handleSubmit: mockHandleSubmit } as any,
      submitLogin: mockSubmitLogin,
      errorMsg: null,
      isLoading: true,
    });

    // [ ACT ]
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />);

    // [ ASSERT ]
    const submitButton = screen.getByRole('button');
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText('Ingresar')).toBeNull();
  });

  // --- AC 3: MOSTRAR ERRORES ---
  it('should display error message when errorMsg is not null', () => {
    // [ ARRANGE ]
    const errorMessage = 'Credenciales súper incorrectas';
    vi.spyOn(useLoginFormModule, 'useLoginForm').mockReturnValue({
      form: { register: mockRegister, handleSubmit: mockHandleSubmit } as any,
      submitLogin: mockSubmitLogin,
      errorMsg: errorMessage, 
      isLoading: false,
    });

    // [ ACT ]
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />);

    // [ ASSERT ]
    expect(screen.getByText(errorMessage)).toBeDefined();
  });

  // --- AC 4: INTERACCIÓN DEL USUARIO ---
  it('should call submitLogin when the form is submitted', () => {
    // [ ARRANGE ]
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />);
    const submitButton = screen.getByRole('button', { name: /ingresar/i });

    // [ ACT ]
    fireEvent.click(submitButton);

    // [ ASSERT ]
    expect(mockHandleSubmit).toHaveBeenCalled();
    expect(mockSubmitLogin).toHaveBeenCalled();
  });
});