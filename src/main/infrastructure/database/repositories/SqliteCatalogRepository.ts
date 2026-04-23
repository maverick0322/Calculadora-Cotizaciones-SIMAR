import { Database } from 'better-sqlite3';

export class SqliteCatalogRepository {
  constructor(private readonly db: Database) {}

  getAllVehicles() {
    const stmt = this.db.prepare('SELECT id, name, vehicle_type, capacity_kg, base_price FROM catalog_vehicles WHERE is_active = 1');
    return stmt.all();
  }

  addVehicle(name: string, vehicleType: string, capacityKg: number, basePrice: number) {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_vehicles (name, vehicle_type, capacity_kg, base_price) 
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(name, vehicleType, capacityKg, basePrice);
  }

  deleteVehicle(id: number) {
    const stmt = this.db.prepare('DELETE FROM catalog_vehicles WHERE id = ?');
    return stmt.run(id);
  }

  getAllSupplies() {
    const stmt = this.db.prepare('SELECT id, name, unit, suggested_price FROM catalog_supplies WHERE is_active = 1');
    return stmt.all();
  }

  addSupply(name: string, unit: string, suggestedPrice: number) {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_supplies (name, unit, suggested_price) 
      VALUES (?, ?, ?)
    `);
    return stmt.run(name, unit, suggestedPrice);
  }

  deleteSupply(id: number) {
    const stmt = this.db.prepare('DELETE FROM catalog_supplies WHERE id = ?');
    return stmt.run(id);
  }

  getAllWarehouses() {
    const stmt = this.db.prepare('SELECT id, name, address FROM catalog_warehouses WHERE is_active = 1');
    return stmt.all();
  }

  addWarehouse(name: string, address: string) {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_warehouses (name, address) 
      VALUES (?, ?)
    `);
    return stmt.run(name, address);
  }

  deleteWarehouse(id: number) {
    const stmt = this.db.prepare('DELETE FROM catalog_warehouses WHERE id = ?');
    return stmt.run(id);
  }

  updateVehiclePrice(id: number, newPrice: number) {
    const stmt = this.db.prepare('UPDATE catalog_vehicles SET base_price = ? WHERE id = ?');
    return stmt.run(newPrice, id);
  }

  updateSupplyPrice(id: number, newPrice: number) {
    const stmt = this.db.prepare('UPDATE catalog_supplies SET suggested_price = ? WHERE id = ?');
    return stmt.run(newPrice, id);
  }
}