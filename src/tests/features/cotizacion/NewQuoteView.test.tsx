import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewQuoteView } from '../../../renderer/src/features/cotizacion/NewQuoteView';

// 1. Importamos todo el módulo como un namespace en lugar de solo el hook
import * as useQuoteFormModule from '../../../renderer/src/features/cotizacion/hooks/useQuoteForm';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: { loading: vi.fn(), success: vi.fn(), error: vi.fn() }
}));

// Burlamos los steps para que no compliquen la prueba
vi.mock('../../../../renderer/src/features/cotizacion/components/LocationStep', () => ({ LocationStep: () => <div>LocationStep</div> }));
vi.mock('../../../../renderer/src/features/cotizacion/components/WasteStep', () => ({ WasteStep: () => <div>WasteStep</div> }));
vi.mock('../../../../renderer/src/features/cotizacion/components/TripStep', () => ({ TripStep: () => <div>TripStep</div> }));
vi.mock('../../../../renderer/src/features/cotizacion/components/SummaryStep', () => ({ SummaryStep: () => <div>SummaryStep</div> }));

describe('NewQuoteView Component', () => {
  const mockSubmitDraft = vi.fn();
  const mockReset = vi.fn();
  const mockGetValues = vi.fn();
  let mockHandleSubmit: any;
  let isFormValid = true;

  beforeEach(() => {
    vi.clearAllMocks();
    isFormValid = true;

    mockGetValues.mockReturnValue({
      location: { street: 'Calle Falsa', neighborhood: 'Centro', municipality: 'Xalapa' },
      activity: 'collection',
      waste: 'domestic',
      volumeQuantity: 10,
      volumeUnit: 'kg',
      frequency: 'weekly'
    });

    // Burlamos la validación de React Hook Form
    mockHandleSubmit = vi.fn((onValid, onInvalid) => (e: any) => {
      e?.preventDefault();
      if (isFormValid) {
        onValid();
      } else {
        if (onInvalid) onInvalid({ fakeError: true });
      }
    });

    // 2. SOLUCIÓN: Usamos spyOn para interceptar el hook directamente de su módulo
    vi.spyOn(useQuoteFormModule, 'useQuoteForm').mockReturnValue({
      form: { 
        handleSubmit: mockHandleSubmit, 
        reset: mockReset, 
        getValues: mockGetValues,
        formState: { errors: {} }, // <--- AGREGAMOS ESTO
        register: vi.fn(),         // <--- AGREGAMOS ESTO
        watch: vi.fn(),            // <--- AGREGAMOS ESTO por si acaso
        setValue: vi.fn(),
        control: {}
      } as any,
      submitDraft: mockSubmitDraft,
    });
  });

  it('should render correct texts based on editId presence', () => {
    const { rerender } = render(<NewQuoteView />);
    expect(screen.getByText('Nueva Cotización')).toBeDefined();

    rerender(<NewQuoteView editId={5} />);
    expect(screen.getByText('Editando Borrador #5')).toBeDefined();
  });

  it('should show error toast when form validation fails', () => {
    isFormValid = false;
    render(<NewQuoteView />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Revisar Cotización' }));
    
    expect(toast.error).toHaveBeenCalledWith('Hay campos inválidos o incompletos. Revisa la consola.');
    expect(mockSubmitDraft).not.toHaveBeenCalled();
  });

  it('should call submitDraft with raw data, show success toast, and reset form', async () => {
    mockSubmitDraft.mockResolvedValue(true);
    render(<NewQuoteView />);
    
    // 1. Fase de captura
    fireEvent.click(screen.getByRole('button', { name: 'Revisar Cotización' }));
    
    // 2. Fase de revisión
    const confirmButton = await screen.findByRole('button', { name: 'Confirmar y Guardar' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(mockSubmitDraft).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith('¡Borrador guardado exitosamente!', expect.any(Object));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should NOT reset form when updating an existing draft', async () => {
    mockSubmitDraft.mockResolvedValue(true);
    render(<NewQuoteView editId={5} />);
    
    // 1. Fase de captura
    fireEvent.click(screen.getByRole('button', { name: 'Revisar Cotización' }));
    
    // 2. Fase de revisión
    const confirmButton = await screen.findByRole('button', { name: 'Confirmar Actualización' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(mockSubmitDraft).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith('¡Borrador actualizado!', expect.any(Object));
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('should show error toast if submitDraft returns false', async () => {
    mockSubmitDraft.mockResolvedValue(false);
    render(<NewQuoteView />);
    
    // 1. Fase de captura
    fireEvent.click(screen.getByRole('button', { name: 'Revisar Cotización' }));
    
    // 2. Fase de revisión
    const confirmButton = await screen.findByRole('button', { name: 'Confirmar y Guardar' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(mockSubmitDraft).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith('Error al guardar el borrador. Revisa tu conexión.', expect.any(Object));
  });
});