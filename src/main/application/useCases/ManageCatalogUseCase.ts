import { SqliteCatalogRepository } from '../../infrastructure/database/repositories/SqliteCatalogRepository';

export class ManageCatalogUseCase {
  constructor(private readonly repository: SqliteCatalogRepository) {}

  async execute(action: 'add' | 'delete' | 'edit', type: 'vehicle' | 'supply' | 'warehouse', payload: any) {
    try {
      if (action === 'delete') {
        if (!payload.id) throw new Error("Se requiere el ID para eliminar");
        
        if (type === 'vehicle') return this.repository.deleteVehicle(payload.id);
        if (type === 'supply') return this.repository.deleteSupply(payload.id);
        if (type === 'warehouse') return this.repository.deleteWarehouse(payload.id);
      }

      if (action === 'add') {
        if (type === 'vehicle') return this.repository.addVehicle(payload);
        if (type === 'supply') return this.repository.addSupply(payload);
        if (type === 'warehouse') return this.repository.addWarehouse(payload);
      }

      if (action === 'edit') {
        if (!payload.id) throw new Error("Se requiere el ID para editar");
        
        if (type === 'vehicle') return this.repository.editVehicle(payload);
        if (type === 'supply') return this.repository.editSupply(payload);
        if (type === 'warehouse') return this.repository.editWarehouse(payload);
      }

      throw new Error('Acción o tipo de catálogo no soportado');
    } catch (error) {
      console.error(`Error en ManageCatalogUseCase (${action} ${type}):`, error);
      throw error;
    }
  }
}