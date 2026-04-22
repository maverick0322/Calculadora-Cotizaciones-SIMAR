import { Database } from 'better-sqlite3';

export class SqliteCatalogRepository {
  constructor(private readonly db: Database) {}

  getAllVehicles() {
    const stmt = this.db.prepare('SELECT id, name, vehicle_type, capacity_kg, base_price FROM catalog_vehicles WHERE is_active = 1');
    return stmt.all();
  }

  getAllSupplies() {
    const stmt = this.db.prepare('SELECT id, name, unit, suggested_price FROM catalog_supplies WHERE is_active = 1');
    return stmt.all();
  }

  getAllWarehouses() {
    const stmt = this.db.prepare('SELECT id, name, address FROM catalog_warehouses WHERE is_active = 1');
    return stmt.all();
  }
}