import { Database } from 'better-sqlite3';

export class SqliteCatalogRepository {
  constructor(private readonly db: Database) {}

  getAllVehicles() {
    // 👇 Limpio y directo con las nuevas columnas
    const stmt = this.db.prepare(`
      SELECT 
        id, plate, name, vehicle_type, 
        useful_tonnage, volume_m3, drum_capacity, fuel_efficiency_km_l, 
        price_per_day, price_per_ton, price_per_m3 
      FROM catalog_vehicles 
      WHERE is_active = 1
    `);
    return stmt.all();
  }

  addVehicle(payload: any) {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_vehicles 
      (plate, name, vehicle_type, useful_tonnage, volume_m3, drum_capacity, fuel_efficiency_km_l, price_per_day, price_per_ton, price_per_m3) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const finalPlate = payload.plate || `TMP-${Date.now().toString().slice(-4)}`;

    return stmt.run(
      finalPlate, 
      payload.name, 
      payload.vehicleType || 'Mediano', 
      payload.usefulTonnage || 0, 
      payload.volumeM3 || 0, 
      payload.drumCapacity || 0, 
      payload.fuelEfficiencyKmL || 0,
      payload.pricePerDay || 0, 
      payload.pricePerTon || 0, 
      payload.pricePerM3 || 0
    );
  }

  editVehicle(payload: any) {
    const stmt = this.db.prepare(`
      UPDATE catalog_vehicles SET
        plate = ?, name = ?, vehicle_type = ?, useful_tonnage = ?, volume_m3 = ?, 
        drum_capacity = ?, fuel_efficiency_km_l = ?, price_per_day = ?, price_per_ton = ?, price_per_m3 = ?
      WHERE id = ?
    `);
    return stmt.run(
      payload.plate, payload.name, payload.vehicleType, payload.usefulTonnage, payload.volumeM3,
      payload.drumCapacity, payload.fuelEfficiencyKmL, payload.pricePerDay, payload.pricePerTon, payload.pricePerM3,
      payload.id
    );
  }

  deleteVehicle(id: number) {
    const stmt = this.db.prepare('DELETE FROM catalog_vehicles WHERE id = ?');
    return stmt.run(id);
  }

  getAllSupplies() {
    const stmt = this.db.prepare('SELECT id, name, category, unit, suggested_price FROM catalog_supplies WHERE is_active = 1');
    return stmt.all();
  }

  addSupply(payload: any) {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_supplies (name, category, unit, suggested_price) 
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(payload.name, payload.category || 'supply', payload.unit, payload.suggestedPrice);
  }

  editSupply(payload: any) {
    const stmt = this.db.prepare(`
      UPDATE catalog_supplies SET name = ?, category = ?, unit = ?, suggested_price = ? WHERE id = ?
    `);
    return stmt.run(payload.name, payload.category || 'supply', payload.unit, payload.suggestedPrice, payload.id);
  }

  deleteSupply(id: number) {
    const stmt = this.db.prepare('DELETE FROM catalog_supplies WHERE id = ?');
    return stmt.run(id);
  }

  getAllWarehouses() {
    const stmt = this.db.prepare('SELECT id, name, address FROM catalog_warehouses WHERE is_active = 1');
    return stmt.all();
  }

  addWarehouse(payload: any) {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_warehouses (name, address) 
      VALUES (?, ?)
    `);
    return stmt.run(payload.name, payload.address);
  }

  editWarehouse(payload: any) {
    const stmt = this.db.prepare(`
      UPDATE catalog_warehouses SET name = ?, address = ? WHERE id = ?
    `);
    return stmt.run(payload.name, payload.address, payload.id);
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