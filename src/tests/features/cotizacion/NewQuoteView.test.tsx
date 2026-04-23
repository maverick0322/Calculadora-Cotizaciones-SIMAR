import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Usamos los alias seguros @renderer
import { NewQuoteView } from '@renderer/features/cotizacion/NewQuoteView';
import * as useQuoteFormModule from '@renderer/features/cotizacion/hooks/useQuoteForm';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: { loading: vi.fn(), success: vi.fn(), error: vi.fn() }
}));

// ¡RUTAS CORREGIDAS! Usamos el alias para que los mocks enganchen perfecto
vi.mock('@renderer/features/cotizacion/components/LocationStep', () => ({ LocationStep: () => <div>LocationStep</div> }));
vi.mock('@renderer/features/cotizacion/components/WasteStep', () => ({ WasteStep: () => <div>WasteStep</div> }));
vi.mock('@renderer/features/cotizacion/components/TripStep', () => ({ TripStep: () => <div>TripStep</div> }));
vi.mock('@renderer/features/cotizacion/components/SummaryStep', () => ({ SummaryStep: () => <div>SummaryStep</div> }));
vi.mock('@renderer/features/cotizacion/components/VehiclesAndCrewStep', () => ({ VehiclesAndCrewStep: () => <div>VehiclesAndCrewStep</div> }));
vi.mock('@renderer/features/cotizacion/components/SuppliesStep', () => ({ SuppliesStep: () => <div>SuppliesStep</div> }));

// ESTE ES EL CAUSANTE DEL ERROR: Ahora sí se va a interceptar correctamente
vi.mock('@renderer/features/cotizacion/hooks/useQuoteCalculator', () => ({
  useQuoteCalculator: vi.fn(() => ({
    total: 1160,
    subtotal: 1000,
    iva: 160,
    breakdown: { logistics: 0, vehicles: 0, crew: 0, supplies: 0, extras: 0 }
  }))
}));

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
      clientName: 'Empresa Test',
      clientRfc: 'TEST010203',
      validityDays: 15,
      frequency: { type: 'one_time' },
      services: [{ id: 'fake-id-1' }]
    });

    mockHandleSubmit = vi.fn((onValid, onInvalid) => (e: any) => {
      e?.preventDefault();
      if (isFormValid) {
        onValid();
      } else {
        if (onInvalid) onInvalid({ fakeError: true });
      }
    });

    vi.spyOn(useQuoteFormModule, 'useQuoteForm').mockReturnValue({
      form: { 
        handleSubmit: mockHandleSubmit, 
        reset: mockReset, 
        getValues: mockGetValues,
        formState: { errors: {} },
        register: vi.fn(),        
        watch: vi.fn(),            
        setValue: vi.fn(),
        control: {} // La calculadora mockeada ya no intentará leer esto
      } as any,
      serviceFields: [{ id: 'fake-id-1' }],
      addNewService: vi.fn(),
      removeService: vi.fn(),
      submitDraft: mockSubmitDraft,
    } as any);
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
    
    fireEvent.click(screen.getByRole('button', { name: 'Revisar' }));
    
    expect(toast.error).toHaveBeenCalledWith('Hay campos inválidos o incompletos. Revisa las pestañas en rojo.');
    expect(mockSubmitDraft).not.toHaveBeenCalled();
  });

  it('should call submitDraft with raw data, show success toast, and reset form', async () => {
    mockSubmitDraft.mockResolvedValue(true);
    render(<NewQuoteView />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Revisar' }));
    
    const confirmButton = await screen.findByRole('button', { name: 'Confirmar y Guardar' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(mockSubmitDraft).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith('¡Borrador guardado exitosamente!', expect.any(Object));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should NOT reset form when updating an existing draft', async () => {
    mockSubmitDraft.mockResolvedValue(true);
    render(<NewQuoteView editId={5} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Revisar' }));
    
    const confirmButton = await screen.findByRole('button', { name: 'Confirmar Actualización' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(mockSubmitDraft).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith('¡Borrador actualizado!', expect.any(Object));
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('should show error toast if submitDraft returns false', async () => {
    mockSubmitDraft.mockResolvedValue(false);
    render(<NewQuoteView />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Revisar' }));
    
    const confirmButton = await screen.findByRole('button', { name: 'Confirmar y Guardar' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(mockSubmitDraft).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith('Error al guardar el borrador. Revisa tu conexión.', expect.any(Object));
  });
});