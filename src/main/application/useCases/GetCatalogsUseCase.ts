import { SqliteCatalogRepository } from '../../infrastructure/database/repositories/SqliteCatalogRepository';

export class GetCatalogsUseCase {
  constructor(private readonly repository: SqliteCatalogRepository) {}

  execute() {
    try {
      const vehicles = this.repository.getAllVehicles();
      const supplies = this.repository.getAllSupplies();
      const warehouses = this.repository.getAllWarehouses();

      return {
        vehicles,
        supplies,
        warehouses
      };
    } catch (error) {
      console.error("Error executing GetCatalogsUseCase:", error);
      throw new Error("Failed to retrieve catalogs from database");
    }
  }
}