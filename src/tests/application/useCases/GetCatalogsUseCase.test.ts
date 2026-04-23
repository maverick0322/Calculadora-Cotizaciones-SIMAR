import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCatalogsUseCase } from '../../../main/application/useCases/GetCatalogsUseCase';

describe('GetCatalogsUseCase', () => {
  let mockRepository: any;
  let useCase: GetCatalogsUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    // Burlamos el repositorio para no tocar la base de datos real
    mockRepository = {
      getAllVehicles: vi.fn(),
      getAllSupplies: vi.fn(),
      getAllWarehouses: vi.fn()
    };
    useCase = new GetCatalogsUseCase(mockRepository);
    
    // Ocultamos los console.error esperados para no ensuciar la terminal
    vi.spyOn(console, 'error').mockImplementation(() => {}); 
  });

  it('should retrieve and combine all catalogs successfully', () => {
    // [ ARRANGE ]
    mockRepository.getAllVehicles.mockReturnValue([{ id: 1, name: 'Camión' }]);
    mockRepository.getAllSupplies.mockReturnValue([{ id: 1, name: 'Bolsas' }]);
    mockRepository.getAllWarehouses.mockReturnValue([{ id: 1, name: 'Almacén Central' }]);

    // [ ACT ]
    const result = useCase.execute();

    // [ ASSERT ]
    expect(mockRepository.getAllVehicles).toHaveBeenCalledTimes(1);
    expect(mockRepository.getAllSupplies).toHaveBeenCalledTimes(1);
    expect(mockRepository.getAllWarehouses).toHaveBeenCalledTimes(1);
    
    expect(result).toEqual({
      vehicles: [{ id: 1, name: 'Camión' }],
      supplies: [{ id: 1, name: 'Bolsas' }],
      warehouses: [{ id: 1, name: 'Almacén Central' }]
    });
  });

  it('should throw an error if the repository fails to retrieve data', () => {
    // [ ARRANGE ]
    mockRepository.getAllVehicles.mockImplementation(() => {
      throw new Error('Database connection lost');
    });

    // [ ACT & ASSERT ]
    expect(() => useCase.execute()).toThrowError('Failed to retrieve catalogs from database');
    expect(console.error).toHaveBeenCalled();
  });
});