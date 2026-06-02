import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteCatalogRepository } from '../../../../main/infrastructure/database/repositories/SqliteCatalogRepository';

describe('SqliteCatalogRepository', () => {
  let db: Database.Database;
  let repository: SqliteCatalogRepository;

  beforeAll(() => {
    db = new Database(':memory:');
    db.exec(`
      CREATE TABLE catalog_vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_key TEXT,
        plate TEXT UNIQUE,
        name TEXT,
        model_name TEXT,
        vehicle_type TEXT,
        useful_tonnage REAL,
        volume_m3 REAL,
        drum_capacity INTEGER,
        fuel_efficiency_km_l REAL,
        price_per_day REAL,
        price_per_ton REAL,
        price_per_m3 REAL,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE catalog_supplies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        category TEXT,
        unit TEXT,
        suggested_price REAL,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE catalog_warehouses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        address TEXT,
        is_active INTEGER DEFAULT 1
      );
    `);
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM catalog_vehicles; DELETE FROM catalog_supplies; DELETE FROM catalog_warehouses;');
    repository = new SqliteCatalogRepository(db);
  });

  const vehiclePayload = {
    vehicleKey: 'VH-001',
    plate: 'ABC-123',
    name: 'Camion 3.5T',
    modelName: 'Modelo 2026',
    vehicleType: 'Ligero',
    usefulTonnage: 3.5,
    volumeM3: 15,
    drumCapacity: 75,
    fuelEfficiencyKmL: 8.5,
    pricePerDay: 1500.5,
    pricePerTon: 400,
    pricePerM3: 120
  };

  describe('vehicles management', () => {
    it('adds and retrieves active vehicles with technical fields', () => {
      repository.addVehicle(vehiclePayload);
      db.prepare('INSERT INTO catalog_vehicles (name, is_active) VALUES (?, 0)').run('Inactivo');

      const vehicles = repository.getAllVehicles();

      expect(vehicles).toHaveLength(1);
      expect(vehicles[0]).toMatchObject({
        vehicle_key: 'VH-001',
        plate: 'ABC-123',
        name: 'Camion 3.5T',
        useful_tonnage: 3.5,
        price_per_day: 1500.5
      });
    });

    it('updates a vehicle price per day', () => {
      const info = repository.addVehicle(vehiclePayload);

      repository.updateVehiclePrice(Number(info.lastInsertRowid), 250);

      const vehicle = db.prepare('SELECT price_per_day FROM catalog_vehicles WHERE id = ?').get(info.lastInsertRowid) as any;
      expect(vehicle.price_per_day).toBe(250);
    });

    it('deletes a vehicle', () => {
      const info = repository.addVehicle(vehiclePayload);

      repository.deleteVehicle(Number(info.lastInsertRowid));

      expect(repository.getAllVehicles()).toHaveLength(0);
    });
  });

  describe('supplies management', () => {
    it('adds and retrieves active supplies', () => {
      repository.addSupply({ name: 'Bolsas Negras Jumbo', category: 'supply', unit: 'paquete', suggestedPrice: 150 });

      const supplies = repository.getAllSupplies();

      expect(supplies).toHaveLength(1);
      expect(supplies[0]).toMatchObject({
        name: 'Bolsas Negras Jumbo',
        category: 'supply',
        unit: 'paquete',
        suggested_price: 150
      });
    });

    it('updates a supply price', () => {
      const info = repository.addSupply({ name: 'Guantes', category: 'supply', unit: 'par', suggestedPrice: 50 });

      repository.updateSupplyPrice(Number(info.lastInsertRowid), 75.5);

      const supply = db.prepare('SELECT suggested_price FROM catalog_supplies WHERE id = ?').get(info.lastInsertRowid) as any;
      expect(supply.suggested_price).toBe(75.5);
    });

    it('deletes a supply', () => {
      const info = repository.addSupply({ name: 'A Borrar', category: 'tool', unit: 'pz', suggestedPrice: 10 });

      repository.deleteSupply(Number(info.lastInsertRowid));

      expect(repository.getAllSupplies()).toHaveLength(0);
    });
  });

  describe('warehouses management', () => {
    it('adds and retrieves active warehouses', () => {
      repository.addWarehouse({ name: 'Almacen Central', address: 'Av. Industrial 100' });

      const warehouses = repository.getAllWarehouses();

      expect(warehouses).toHaveLength(1);
      expect(warehouses[0]).toMatchObject({ name: 'Almacen Central', address: 'Av. Industrial 100' });
    });

    it('deletes a warehouse', () => {
      const info = repository.addWarehouse({ name: 'Almacen Temporal', address: 'Calle 2' });

      repository.deleteWarehouse(Number(info.lastInsertRowid));

      expect(repository.getAllWarehouses()).toHaveLength(0);
    });
  });
});
