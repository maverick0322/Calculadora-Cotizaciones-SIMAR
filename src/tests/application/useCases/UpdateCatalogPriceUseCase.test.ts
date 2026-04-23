import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCatalogPriceUseCase } from '../../../main/application/useCases/UpdateCatalogPriceUseCase';

describe('UpdateCatalogPriceUseCase', () => {
  let mockRepository: any;
  let useCase: UpdateCatalogPriceUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = {
      updateVehiclePrice: vi.fn(),
      updateSupplyPrice: vi.fn(),
    };
    useCase = new UpdateCatalogPriceUseCase(mockRepository);
  });

  // --- AC 1: VALIDACIÓN DE NEGATIVOS ---
  it('should throw an error if the provided price is negative', async () => {
    await expect(useCase.execute('vehicle', 1, -50)).rejects.toThrow("El precio no puede ser negativo");
    
    // Verificamos que nunca llamó al repositorio si el precio es inválido
    expect(mockRepository.updateVehiclePrice).not.toHaveBeenCalled();
    expect(mockRepository.updateSupplyPrice).not.toHaveBeenCalled();
  });

  // --- AC 2: RUTEO CORRECTO ---
  it('should route to updateVehiclePrice when type is vehicle', async () => {
    mockRepository.updateVehiclePrice.mockResolvedValue({ changes: 1 });
    
    await useCase.execute('vehicle', 10, 1500.50);
    
    expect(mockRepository.updateVehiclePrice).toHaveBeenCalledTimes(1);
    expect(mockRepository.updateVehiclePrice).toHaveBeenCalledWith(10, 1500.50);
    expect(mockRepository.updateSupplyPrice).not.toHaveBeenCalled();
  });

  it('should route to updateSupplyPrice when type is supply', async () => {
    mockRepository.updateSupplyPrice.mockResolvedValue({ changes: 1 });
    
    await useCase.execute('supply', 5, 25.00);
    
    expect(mockRepository.updateSupplyPrice).toHaveBeenCalledTimes(1);
    expect(mockRepository.updateSupplyPrice).toHaveBeenCalledWith(5, 25.00);
    expect(mockRepository.updateVehiclePrice).not.toHaveBeenCalled();
  });
});