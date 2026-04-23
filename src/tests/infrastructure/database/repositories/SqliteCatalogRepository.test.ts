import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteCatalogRepository } from '../../../../main/infrastructure/database/repositories/SqliteCatalogRepository';

describe('SqliteCatalogRepository', () => {
  let db: Database.Database;
  let repository: SqliteCatalogRepository;

  beforeAll(() => {
    db = new Database(':memory:');
    
    // Creamos las tablas necesarias para los catálogos
    db.exec(`
      CREATE TABLE catalog_vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        vehicle_type TEXT,
        capacity_kg REAL,
        base_price REAL,
        is_active INTEGER DEFAULT 1
      );
      
      CREATE TABLE catalog_supplies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
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
    db?.close();
  });

  beforeEach(() => {
    // Limpiamos las tablas antes de cada prueba
    db.exec('DELETE FROM catalog_vehicles; DELETE FROM catalog_supplies; DELETE FROM catalog_warehouses;');
    repository = new SqliteCatalogRepository(db);
  });

  // --- VEHICLES TESTS ---
  describe('Vehicles Management', () => {
    it('should add and retrieve active vehicles', () => {
      repository.addVehicle('Camión 3.5T', 'camion', 3500, 1500.50);
      repository.addVehicle('Camioneta 1T', 'camioneta', 1000, 800.00);

      // Simulamos un vehículo inactivo directamente en la BD
      db.prepare('INSERT INTO catalog_vehicles (name, is_active) VALUES (?, 0)').run('Inactivo');

      const vehicles = repository.getAllVehicles();
      
      expect(vehicles).toHaveLength(2);
      expect(vehicles[0]).toMatchObject({ name: 'Camión 3.5T', capacity_kg: 3500, base_price: 1500.50 });
    });

    it('should update a vehicle price', () => {
      const info = repository.addVehicle('Camión Test', 'camion', 1000, 100);
      repository.updateVehiclePrice(Number(info.lastInsertRowid), 250);

      const vehicle = db.prepare('SELECT base_price FROM catalog_vehicles WHERE id = ?').get(info.lastInsertRowid) as any;
      expect(vehicle.base_price).toBe(250);
    });

    it('should delete a vehicle', () => {
      const info = repository.addVehicle('A Borrar', 'camion', 1000, 100);
      repository.deleteVehicle(Number(info.lastInsertRowid));

      const vehicles = repository.getAllVehicles();
      expect(vehicles).toHaveLength(0);
    });
  });

  // --- SUPPLIES TESTS ---
  describe('Supplies Management', () => {
    it('should add and retrieve active supplies', () => {
      repository.addSupply('Bolsas Negras Jumbo', 'paquete', 150.00);
      
      const supplies = repository.getAllSupplies();
      
      expect(supplies).toHaveLength(1);
      expect(supplies[0]).toMatchObject({ name: 'Bolsas Negras Jumbo', unit: 'paquete', suggested_price: 150 });
    });

    it('should update a supply price', () => {
      const info = repository.addSupply('Guantes', 'par', 50);
      repository.updateSupplyPrice(Number(info.lastInsertRowid), 75.50);

      const supply = db.prepare('SELECT suggested_price FROM catalog_supplies WHERE id = ?').get(info.lastInsertRowid) as any;
      expect(supply.suggested_price).toBe(75.50);
    });

    it('should delete a supply', () => {
      const info = repository.addSupply('A Borrar', 'pz', 10);
      repository.deleteSupply(Number(info.lastInsertRowid));

      const supplies = repository.getAllSupplies();
      expect(supplies).toHaveLength(0);
    });
  });

  // --- WAREHOUSES TESTS ---
  describe('Warehouses Management', () => {
    it('should add and retrieve active warehouses', () => {
      repository.addWarehouse('Almacén Central', 'Av. Industrial 100');
      
      const warehouses = repository.getAllWarehouses();
      
      expect(warehouses).toHaveLength(1);
      expect(warehouses[0]).toMatchObject({ name: 'Almacén Central', address: 'Av. Industrial 100' });
    });

    it('should delete a warehouse', () => {
      const info = repository.addWarehouse('Almacén Temporal', 'Calle 2');
      repository.deleteWarehouse(Number(info.lastInsertRowid));

      const warehouses = repository.getAllWarehouses();
      expect(warehouses).toHaveLength(0);
    });
  });
});