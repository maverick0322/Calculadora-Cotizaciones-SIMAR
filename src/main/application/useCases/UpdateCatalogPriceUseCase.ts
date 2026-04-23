// src/main/application/useCases/UpdateCatalogPriceUseCase.ts
import { SqliteCatalogRepository } from '../../infrastructure/database/repositories/SqliteCatalogRepository';

export class UpdateCatalogPriceUseCase {
  constructor(private readonly repository: SqliteCatalogRepository) {}

  async execute(type: 'vehicle' | 'supply', id: number, price: number) {
    if (price < 0) throw new Error("El precio no puede ser negativo");
    
    if (type === 'vehicle') {
      return this.repository.updateVehiclePrice(id, price);
    }
    return this.repository.updateSupplyPrice(id, price);
  }
}