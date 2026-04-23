import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageCatalogUseCase } from '../../../main/application/useCases/ManageCatalogUseCase';

describe('ManageCatalogUseCase', () => {
  let mockRepository: any;
  let useCase: ManageCatalogUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = {
      deleteVehicle: vi.fn(),
      deleteSupply: vi.fn(),
      deleteWarehouse: vi.fn(),
      addVehicle: vi.fn(),
      addSupply: vi.fn(),
      addWarehouse: vi.fn(),
    };
    useCase = new ManageCatalogUseCase(mockRepository);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // --- AC 1: RUTAS DE ELIMINACIÓN ---
  describe('Delete Actions', () => {
    it('should throw an error if trying to delete without an ID', async () => {
      await expect(useCase.execute('delete', 'vehicle', {})).rejects.toThrow("Se requiere el ID para eliminar");
    });

    it('should route to the correct delete method based on type', async () => {
      await useCase.execute('delete', 'vehicle', { id: 1 });
      expect(mockRepository.deleteVehicle).toHaveBeenCalledWith(1);

      await useCase.execute('delete', 'supply', { id: 2 });
      expect(mockRepository.deleteSupply).toHaveBeenCalledWith(2);

      await useCase.execute('delete', 'warehouse', { id: 3 });
      expect(mockRepository.deleteWarehouse).toHaveBeenCalledWith(3);
    });
  });

  // --- AC 2: RUTAS DE CREACIÓN ---
  describe('Add Actions', () => {
    it('should route to the correct add method with mapped payload', async () => {
      await useCase.execute('add', 'vehicle', { name: 'V1', vehicleType: 'T1', capacityKg: 100, basePrice: 50 });
      expect(mockRepository.addVehicle).toHaveBeenCalledWith('V1', 'T1', 100, 50);

      await useCase.execute('add', 'supply', { name: 'S1', unit: 'kg', suggestedPrice: 10 });
      expect(mockRepository.addSupply).toHaveBeenCalledWith('S1', 'kg', 10);

      await useCase.execute('add', 'warehouse', { name: 'W1', address: 'Calle 1' });
      expect(mockRepository.addWarehouse).toHaveBeenCalledWith('W1', 'Calle 1');
    });
  });

  // --- AC 3: VALIDACIONES DE ERROR ---
  it('should throw an error for unsupported actions or types', async () => {
    // Simulamos un tipo inválido que se coló de alguna forma
    await expect(useCase.execute('add', 'invalid_type' as any, {})).rejects.toThrow('Acción o tipo de catálogo no soportado');
    await expect(useCase.execute('update' as any, 'vehicle', {})).rejects.toThrow('Acción o tipo de catálogo no soportado');
  });

  it('should log the error to console before rethrowing', async () => {
    // SOLUCIÓN: Forzamos un error síncrono, que es exactamente como funciona better-sqlite3
    mockRepository.deleteVehicle.mockImplementation(() => {
      throw new Error('DB Locked');
    });

    await expect(useCase.execute('delete', 'vehicle', { id: 1 })).rejects.toThrow('DB Locked');
    expect(console.error).toHaveBeenCalledWith('Error en ManageCatalogUseCase (delete vehicle):', expect.any(Error));
  });
});