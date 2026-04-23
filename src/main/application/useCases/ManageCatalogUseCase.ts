import { SqliteCatalogRepository } from '../../infrastructure/database/repositories/SqliteCatalogRepository';

export class ManageCatalogUseCase {
  constructor(private readonly repository: SqliteCatalogRepository) {}

  async execute(action: 'add' | 'delete', type: 'vehicle' | 'supply' | 'warehouse', payload: any) {
    try {
      if (action === 'delete') {
        if (!payload.id) throw new Error("Se requiere el ID para eliminar");
        
        if (type === 'vehicle') return this.repository.deleteVehicle(payload.id);
        if (type === 'supply') return this.repository.deleteSupply(payload.id);
        if (type === 'warehouse') return this.repository.deleteWarehouse(payload.id);
      }

      if (action === 'add') {
        if (type === 'vehicle') {
          return this.repository.addVehicle(payload.name, payload.vehicleType, payload.capacityKg, payload.basePrice);
        }
        if (type === 'supply') {
          return this.repository.addSupply(payload.name, payload.unit, payload.suggestedPrice);
        }
        if (type === 'warehouse') {
          return this.repository.addWarehouse(payload.name, payload.address);
        }
      }

      throw new Error('Acción o tipo de catálogo no soportado');
    } catch (error) {
      console.error(`Error en ManageCatalogUseCase (${action} ${type}):`, error);
      throw error;
    }
  }
}