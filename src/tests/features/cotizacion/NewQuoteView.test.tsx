import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewQuoteView } from '@renderer/features/cotizacion/NewQuoteView';
import * as useQuoteFormModule from '@renderer/features/cotizacion/hooks/useQuoteForm';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: { loading: vi.fn(() => 'mock-toast-id'), success: vi.fn(), error: vi.fn() }
}));

vi.mock('@renderer/features/cotizacion/components/LocationStep', () => ({ LocationStep: () => <div /> }));
vi.mock('@renderer/features/cotizacion/components/WasteStep', () => ({ WasteStep: () => <div /> }));
vi.mock('@renderer/features/cotizacion/components/TripStep', () => ({ TripStep: () => <div /> }));

describe('NewQuoteView Component', () => {
  const mockSubmitDraft = vi.fn();
  const mockReset = vi.fn();
  let isFormValid = true; 
  let mockDataToSubmit: any = {};

  const mockHandleSubmit = vi.fn((onValid, onInvalid) => (e: any) => {
    e.preventDefault();
    if (isFormValid) onValid(mockDataToSubmit);
    else onInvalid({ general: { message: 'Error' } });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    isFormValid = true;
    mockDataToSubmit = { activity: 'collection', waste: 'domestic' };

    vi.spyOn(useQuoteFormModule, 'useQuoteForm').mockReturnValue({
      form: { handleSubmit: mockHandleSubmit, reset: mockReset } as any,
      submitDraft: mockSubmitDraft,
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render correct texts based on editId presence', () => {
    const { unmount } = render(<NewQuoteView />);
    expect(screen.getByText('Nueva Cotización')).toBeDefined();
    
    unmount();
    render(<NewQuoteView editId={10} />);
    expect(screen.getByText('Editando Borrador #10')).toBeDefined();
  });

  it('should show error toast when form validation fails', async () => {
    isFormValid = false;
    render(<NewQuoteView />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Borrador' }));
    expect(toast.error).toHaveBeenCalledWith('Hay campos inválidos o incompletos. Revisa la consola.');
    expect(mockSubmitDraft).not.toHaveBeenCalled();
  });

  it('should call submitDraft with raw data, show success toast, and reset form', async () => {
    mockSubmitDraft.mockResolvedValue(true);
    render(<NewQuoteView />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Borrador' }));

    await waitFor(() => expect(mockSubmitDraft).toHaveBeenCalledWith(mockDataToSubmit));
    expect(toast.loading).toHaveBeenCalledWith('Guardando borrador...');
    expect(toast.success).toHaveBeenCalledWith('¡Borrador guardado exitosamente!', expect.any(Object));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should NOT reset form when updating an existing draft', async () => {
    mockSubmitDraft.mockResolvedValue(true);
    render(<NewQuoteView editId={5} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar Borrador' }));

    await waitFor(() => expect(mockSubmitDraft).toHaveBeenCalledTimes(1));
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('should show error toast if submitDraft returns false', async () => {
    mockSubmitDraft.mockResolvedValue(false);
    render(<NewQuoteView />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Borrador' }));

    await waitFor(() => expect(mockSubmitDraft).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith('Error al guardar el borrador. Revisa tu conexión.', expect.any(Object));
  });
});