import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import residuosCatalog from './catalogo_residuos.json';

const dbPath = path.join(app.getPath('userData'), 'gestor_residuos.sqlite');
const db: DatabaseType = new Database(dbPath, {});

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const initDatabase = () => {
    const schema = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          central_id VARCHAR UNIQUE,
          full_name VARCHAR,
          email VARCHAR UNIQUE,
          password_hash VARCHAR,
          role VARCHAR,
          is_active BOOLEAN DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_code VARCHAR,
            legal_name VARCHAR,
            tax_id VARCHAR,
            is_physical_person BOOLEAN,
            email VARCHAR
        );

        -- 👇 NUEVA ESTRUCTURA TÉCNICA DE VEHÍCULOS
        CREATE TABLE IF NOT EXISTS catalog_vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plate VARCHAR UNIQUE,
            name VARCHAR,
            vehicle_type VARCHAR,
            useful_tonnage DECIMAL,
            volume_m3 DECIMAL,
            drum_capacity INTEGER,
            fuel_efficiency_km_l DECIMAL,
            price_per_day DECIMAL,
            price_per_ton DECIMAL,
            price_per_m3 DECIMAL,
            is_active BOOLEAN DEFAULT 1
        );

        -- 👇 NUEVA ESTRUCTURA DE INSUMOS CON CATEGORÍA
        CREATE TABLE IF NOT EXISTS catalog_supplies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR,
            category VARCHAR, -- 'supply', 'material', 'equipment'
            unit VARCHAR,
            suggested_price DECIMAL,
            is_active BOOLEAN DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS catalog_warehouses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR,
            address TEXT,
            is_active BOOLEAN DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin VARCHAR,
            destination VARCHAR,
            distance_km DECIMAL,
            is_toll_road BOOLEAN,
            estimated_cost DECIMAL
        );

        CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folio VARCHAR UNIQUE,
            status VARCHAR DEFAULT 'draft',
            customer_id INTEGER,
            seller_id INTEGER,
            replaces_quote_id INTEGER,
            client_name VARCHAR,
            client_rfc VARCHAR,
            contact_name VARCHAR,
            contact_phone VARCHAR,
            contact_email VARCHAR,
            validity_days INTEGER,
            frequency_json TEXT,
            services_json TEXT,
            subtotal DECIMAL,
            total DECIMAL,
            created_at INTEGER,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (seller_id) REFERENCES users(id),
            FOREIGN KEY (replaces_quote_id) REFERENCES quotes(id)
        );

        CREATE TABLE IF NOT EXISTS quote_supplies (
            quote_id INTEGER,
            supply_id INTEGER,
            quantity INTEGER,
            historical_unit_cost DECIMAL,
            PRIMARY KEY (quote_id, supply_id),
            FOREIGN KEY (quote_id) REFERENCES quotes(id),
            FOREIGN KEY (supply_id) REFERENCES catalog_supplies(id)
        );

        CREATE TABLE IF NOT EXISTS quote_vehicles (
            quote_id INTEGER,
            vehicle_id INTEGER,
            quantity INTEGER,
            PRIMARY KEY (quote_id, vehicle_id),
            FOREIGN KEY (quote_id) REFERENCES quotes(id),
            FOREIGN KEY (vehicle_id) REFERENCES catalog_vehicles(id)
        );

        CREATE TABLE IF NOT EXISTS quote_extra_costs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_id INTEGER,
            description VARCHAR,
            amount DECIMAL,
            FOREIGN KEY (quote_id) REFERENCES quotes(id)
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action VARCHAR,
            entity VARCHAR,
            entity_id VARCHAR,
            details TEXT,
            created_at INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS catalog_residues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            residue_type TEXT NOT NULL,
            classification TEXT, 
            clave TEXT,          
            unit TEXT NOT NULL,
            base_price DECIMAL NOT NULL DEFAULT 0,
            is_active INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS catalog_states (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS catalog_municipalities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            state_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY (state_id) REFERENCES catalog_states(id),
            UNIQUE(state_id, name)
        );

        CREATE TABLE IF NOT EXISTS catalog_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            municipality_id INTEGER NOT NULL,
            cp TEXT NOT NULL,
            colony TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (municipality_id) REFERENCES catalog_municipalities(id)
        );

        CREATE TABLE IF NOT EXISTS user_custom_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cp TEXT,
            state TEXT NOT NULL,
            municipality TEXT NOT NULL,
            colony TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_clients_directory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_name VARCHAR NOT NULL,
            client_rfc VARCHAR,
            contact_name VARCHAR,
            contact_phone VARCHAR,
            contact_email VARCHAR,
            last_used_at INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_locations_cp ON catalog_locations(cp);
        CREATE INDEX IF NOT EXISTS idx_municipalities_state ON catalog_municipalities(state_id);
        CREATE INDEX IF NOT EXISTS idx_clients_name ON user_clients_directory(client_name);
    `;

    db.exec(schema);

    try {
        const seedTransaction = db.transaction(() => {
            const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
            if (userCount === 0) {
                console.log('🌱 Sembrando usuario administrador por defecto...');
                const insertUser = db.prepare(`INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)`);
                insertUser.run('admin@simar.com', '123456', 'Administrador SIMAR', 'admin');
            }

            const vehicleCount = (db.prepare('SELECT COUNT(*) as count FROM catalog_vehicles').get() as any).count;
            if (vehicleCount === 0) {
                console.log('🌱 Sembrando catálogo de vehículos con datos técnicos...');
                const insertVehicle = db.prepare(`
                    INSERT INTO catalog_vehicles 
                    (plate, name, vehicle_type, useful_tonnage, volume_m3, drum_capacity, fuel_efficiency_km_l, price_per_day, price_per_ton, price_per_m3) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                // Ejemplos técnicos listos para la Fase 3
                insertVehicle.run('XY-1234-A', 'Camioneta 3.5 Toneladas', 'Ligero', 3.0, 15.0, 12, 8.5, 1500.00, 500.00, 100.00);
                insertVehicle.run('AB-9876-Z', 'Tractocamión con Tolva', 'Pesado', 30.0, 60.0, 0, 3.2, 8500.00, 280.00, 140.00);
                insertVehicle.run('TR-5555-C', 'Camión Recolector Compactador', 'Mediano', 8.0, 25.0, 0, 5.5, 4200.00, 525.00, 168.00);
            }

            const supplyCount = (db.prepare('SELECT COUNT(*) as count FROM catalog_supplies').get() as any).count;
            if (supplyCount === 0) {
                console.log('🌱 Sembrando catálogo de insumos categorizados...');
                const insertSupply = db.prepare(`INSERT INTO catalog_supplies (name, category, unit, suggested_price) VALUES (?, ?, ?, ?)`);
                
                // Categoría Insumo
                insertSupply.run('Bolsas de plástico grueso (Paquete 100)', 'supply', 'Paquete', 250.00);
                insertSupply.run('Etiquetas de RME', 'supply', 'Unidad', 5.00);
                
                // Categoría Material
                insertSupply.run('Contenedor de 200L (Préstamo)', 'material', 'Unidad', 50.00);
                insertSupply.run('Supersaco 1 Tonelada', 'material', 'Unidad', 180.00);
                
                // Categoría Maquinaria/Equipo
                insertSupply.run('Equipo de Protección Personal (Desechable)', 'equipment', 'Kit', 120.00);
                insertSupply.run('Bomba extractora (Renta día)', 'equipment', 'Día', 850.00);
            }

            const warehouseCount = (db.prepare('SELECT COUNT(*) as count FROM catalog_warehouses').get() as any).count;
            if (warehouseCount === 0) {
                console.log('🌱 Sembrando catálogo de almacenes...');
                const insertWarehouse = db.prepare(`INSERT INTO catalog_warehouses (name, address) VALUES (?, ?)`);
                insertWarehouse.run('Almacén Central SIMAR', 'Av. de las Industrias S/N, Zona Industrial');
                insertWarehouse.run('Planta de Tratamiento Norte', 'Carretera Federal Km 15');
            }

            const residueCount = (db.prepare('SELECT COUNT(*) as count FROM catalog_residues').get() as any).count;
            if (residueCount === 0) {
                console.log(`🌱 Sembrando catálogo con ${residuosCatalog.length} residuos especiales...`);
                
                const insertResidue = db.prepare(`
                  INSERT INTO catalog_residues (name, residue_type, classification, clave, unit, base_price) 
                  VALUES (?, ?, ?, ?, ?, ?)
                `);
                
                for (const r of residuosCatalog) {
                  insertResidue.run(r.name, r.type, r.classification, r.clave, 'Kilogramo', 0.00);
                }
            }
        });

        seedTransaction();
    } catch (error) {
        console.error('❌ Error al inyectar datos semilla:', error);
    }

    console.log('Base de datos SQLite inicializada correctamente en:', dbPath);
};

export default db;