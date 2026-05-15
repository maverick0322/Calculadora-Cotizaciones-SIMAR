import { Database } from 'better-sqlite3';

export class SqliteCatalogRepository {
  constructor(private readonly db: Database) {}

  getAllVehicles() {
    const stmt = this.db.prepare(`
      SELECT 
        id, plate, name, vehicle_type, 
        useful_tonnage, 
        (useful_tonnage * 1000) AS capacity_kg, 
        volume_m3, drum_capacity, fuel_efficiency_km_l, 
        price_per_day, 
        price_per_day AS base_price,
        price_per_ton, price_per_m3 
      FROM catalog_vehicles 
      WHERE is_active = 1
    `);
    return stmt.all();
  }

  addVehicle(name: string, vehicleType: string, capacityKg: number, basePrice: number) {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_vehicles 
      (plate, name, vehicle_type, useful_tonnage, volume_m3, drum_capacity, fuel_efficiency_km_l, price_per_day, price_per_ton, price_per_m3) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tempPlate = `TMP-${Date.now().toString().slice(-4)}`;
    const usefulTonnage = capacityKg ? (capacityKg / 1000) : 0;
    return stmt.run(tempPlate, name, vehicleType, usefulTonnage, 0, 0, 0, basePrice, 0, 0);
  }

  deleteVehicle(id: number) {
    const stmt = this.db.prepare('DELETE FROM catalog_vehicles WHERE id = ?');
    return stmt.run(id);
  }

  getAllSupplies() {
    const stmt = this.db.prepare('SELECT id, name, category, unit, suggested_price FROM catalog_supplies WHERE is_active = 1');
    return stmt.all();
  }

  addSupply(name: string, unit: string, suggestedPrice: number) {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_supplies (name, category, unit, suggested_price) 
      VALUES (?, 'supply', ?, ?)
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
    const stmt = this.db.prepare('UPDATE catalog_vehicles SET price_per_day = ? WHERE id = ?');
    return stmt.run(newPrice, id);
  }

  updateSupplyPrice(id: number, newPrice: number) {
    const stmt = this.db.prepare('UPDATE catalog_supplies SET suggested_price = ? WHERE id = ?');
    return stmt.run(newPrice, id);
  }
}