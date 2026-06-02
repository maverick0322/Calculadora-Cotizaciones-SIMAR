import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { runSepomexSeeder } from './seeders/sepomexSeeder';
import residuosCatalog from './catalogo_residuos.json';
import { logger } from '../logging/SafeLogger';
import { SERVICE_TYPES } from '../../../shared/constants/quoteConstants';

const dbPath = path.join(app.getPath('userData'), 'gestor_residuos.sqlite');
const db: DatabaseType = new Database(dbPath, {});

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const addColumnIfMissing = (tableName: string, columnName: string, definition: string) => {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
    const columnExists = columns.some((column) => column.name === columnName);

    if (!columnExists) {
        db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    }
};

const runMigrations = () => {
    addColumnIfMissing('quotes', 'person_type', 'VARCHAR');
    addColumnIfMissing('quotes', 'commercial_name', 'VARCHAR');
    addColumnIfMissing('quotes', 'contact_position', 'VARCHAR');
    addColumnIfMissing('quotes', 'issued_at', 'INTEGER');
    addColumnIfMissing('quotes', 'prepared_by_initials', 'VARCHAR');
    addColumnIfMissing('quotes', 'quote_type_code', 'VARCHAR');
    addColumnIfMissing('quotes', 'conditions_json', 'TEXT');
    addColumnIfMissing('users', 'rfc', 'VARCHAR');
    addColumnIfMissing('users', 'first_name', 'VARCHAR');
    addColumnIfMissing('users', 'last_name', 'VARCHAR');
    addColumnIfMissing('users', 'maternal_last_name', 'VARCHAR');
    addColumnIfMissing('users', 'employee_key', 'VARCHAR');
    addColumnIfMissing('users', 'initials', 'VARCHAR');
    addColumnIfMissing('users', 'address', 'TEXT');
    addColumnIfMissing('catalog_vehicles', 'vehicle_key', 'VARCHAR');
    addColumnIfMissing('catalog_vehicles', 'model_name', 'VARCHAR');

    db.prepare(`UPDATE quotes SET status = 'en_proceso' WHERE status = 'draft'`).run();
    db.prepare(`UPDATE quotes SET status = 'emitida' WHERE status = 'issued'`).run();
};

const seedDefaultConditions = () => {
    const count = (db.prepare('SELECT COUNT(*) as count FROM catalog_conditions').get() as { count: number }).count;
    if (count > 0) return;

    logger.warn('Sembrando condiciones comerciales y técnicas iniciales');
    const insertCondition = db.prepare(`
        INSERT INTO catalog_conditions (type, title, description, applies_to_service_types_json, is_active)
        VALUES (?, ?, ?, ?, 1)
    `);
    const allServiceTypes = JSON.stringify([...SERVICE_TYPES]);
    const residueServiceTypes = JSON.stringify(['rme', 'hazardous_waste', 'rpbi']);

    [
        ['commercial', 'Impuestos', 'Los precios indicados son más 16% de IVA.', allServiceTypes],
        ['commercial', 'Términos de pago', 'Pago por adelantado del concepto de transporte al 100% para la programación del servicio.', allServiceTypes],
        ['commercial', 'Vigencia', 'La cotización mantiene la vigencia indicada en el documento y no cuenta con financiamiento.', allServiceTypes],
        ['commercial', 'Aceptación del servicio', 'La aceptación debe confirmarse por escrito con firma de recibido.', allServiceTypes],
        ['commercial', 'Programación del servicio', 'La programación deberá solicitarse por escrito al área comercial.', allServiceTypes],
        ['commercial', 'Suministro de insumos', 'Los insumos adicionales se cotizan conforme al catálogo vigente.', allServiceTypes],
        ['commercial', 'Prestación del servicio', 'El servicio se realizará conforme al alcance descrito en la propuesta.', allServiceTypes],
        ['technical', 'Envasado y etiquetado', 'Los residuos deberán entregarse correctamente envasados, identificados y etiquetados.', residueServiceTypes],
        ['technical', 'Acceso operativo', 'El sitio deberá permitir acceso seguro para personal y unidades autorizadas.', residueServiceTypes],
        ['technical', 'Seguridad en sitio', 'El cliente deberá informar condiciones de riesgo previo a la ejecución del servicio.', allServiceTypes]
    ].forEach(([type, title, description, appliesTo]) => {
        insertCondition.run(type, title, description, appliesTo);
    });
};

export const initDatabase = () => {
    const schema = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          central_id VARCHAR UNIQUE,
          rfc VARCHAR,
          first_name VARCHAR,
          last_name VARCHAR,
          maternal_last_name VARCHAR,
          full_name VARCHAR,
          employee_key VARCHAR,
          initials VARCHAR,
          address TEXT,
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

        CREATE TABLE IF NOT EXISTS catalog_vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_key VARCHAR,
            plate VARCHAR UNIQUE,
            name VARCHAR,
            model_name VARCHAR,
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

        CREATE TABLE IF NOT EXISTS catalog_supplies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR,
            category VARCHAR,
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
            status VARCHAR DEFAULT 'en_proceso',
            customer_id INTEGER,
            seller_id INTEGER,
            replaces_quote_id INTEGER,
            person_type VARCHAR,
            commercial_name VARCHAR,
            client_name VARCHAR,
            client_rfc VARCHAR,
            contact_name VARCHAR,
            contact_position VARCHAR,
            contact_phone VARCHAR,
            contact_email VARCHAR,
            validity_days INTEGER,
            frequency_json TEXT,
            services_json TEXT,
            subtotal DECIMAL,
            total DECIMAL,
            created_at INTEGER,
            issued_at INTEGER,
            prepared_by_initials VARCHAR,
            quote_type_code VARCHAR,
            conditions_json TEXT,
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

        CREATE TABLE IF NOT EXISTS catalog_conditions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type VARCHAR NOT NULL,
            title VARCHAR NOT NULL,
            description TEXT NOT NULL,
            applies_to_service_types_json TEXT NOT NULL,
            is_active INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS quote_conditions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_id INTEGER NOT NULL,
            condition_id INTEGER,
            type VARCHAR NOT NULL,
            title VARCHAR NOT NULL,
            description TEXT NOT NULL,
            is_custom INTEGER DEFAULT 0,
            FOREIGN KEY (quote_id) REFERENCES quotes(id),
            FOREIGN KEY (condition_id) REFERENCES catalog_conditions(id)
        );

        CREATE INDEX IF NOT EXISTS idx_locations_cp ON catalog_locations(cp);
        CREATE INDEX IF NOT EXISTS idx_municipalities_state ON catalog_municipalities(state_id);
        CREATE INDEX IF NOT EXISTS idx_clients_name ON user_clients_directory(client_name);
        CREATE INDEX IF NOT EXISTS idx_quotes_issued_at ON quotes(issued_at);
        CREATE INDEX IF NOT EXISTS idx_conditions_type_active ON catalog_conditions(type, is_active);
    `;

    db.exec(schema);
    runMigrations();

    try {
        const seedTransaction = db.transaction(() => {
            const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
            if (userCount === 0) {
                logger.warn('Sembrando usuario administrador por defecto');
                const insertUser = db.prepare(`
                    INSERT INTO users (email, password_hash, full_name, first_name, last_name, employee_key, initials, role)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);
                insertUser.run('admin@simar.com', '123456', 'Administrador SIMAR', 'Administrador', 'SIMAR', 'ADM', 'ADM', 'admin');
            }

            const vehicleCount = (db.prepare('SELECT COUNT(*) as count FROM catalog_vehicles').get() as any).count;
            if (vehicleCount === 0) {
                logger.warn('Sembrando catálogo de vehículos con datos técnicos');
                const insertVehicle = db.prepare(`
                    INSERT INTO catalog_vehicles 
                    (vehicle_key, plate, name, model_name, vehicle_type, useful_tonnage, volume_m3, drum_capacity, fuel_efficiency_km_l, price_per_day, price_per_ton, price_per_m3) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                insertVehicle.run('VH-001', 'XY-1234-A', 'Camioneta 3.5 Toneladas', '3.5 toneladas', 'Ligero', 3.0, 15.0, 12, 8.5, 1500.00, 500.00, 100.00);
                insertVehicle.run('VH-002', 'AB-9876-Z', 'Tractocamión con Tolva', 'Tolva', 'Pesado', 30.0, 60.0, 0, 3.2, 8500.00, 280.00, 140.00);
                insertVehicle.run('VH-003', 'TR-5555-C', 'Camión Recolector Compactador', 'Compactador', 'Mediano', 8.0, 25.0, 0, 5.5, 4200.00, 525.00, 168.00);
            }

            const supplyCount = (db.prepare('SELECT COUNT(*) as count FROM catalog_supplies').get() as any).count;
            if (supplyCount === 0) {
                logger.warn('Sembrando catálogo de insumos categorizados');
                const insertSupply = db.prepare(`INSERT INTO catalog_supplies (name, category, unit, suggested_price) VALUES (?, ?, ?, ?)`);
                
                insertSupply.run('Bolsas de plástico grueso (Paquete 100)', 'supply', 'Paquete', 250.00);
                insertSupply.run('Etiquetas de RME', 'supply', 'Unidad', 5.00);
                insertSupply.run('Kit de herramienta manual', 'tool', 'Kit', 300.00);
                insertSupply.run('Contenedor de 200L (Préstamo)', 'material', 'Unidad', 50.00);
                insertSupply.run('Supersaco 1 Tonelada', 'material', 'Unidad', 180.00);
                insertSupply.run('Equipo de Protección Personal (Desechable)', 'equipment', 'Kit', 120.00);
                insertSupply.run('Bomba extractora (Renta día)', 'equipment', 'Día', 850.00);
                insertSupply.run('EPP especializado para residuos peligrosos', 'specialized_epp', 'Kit', 450.00);
            }

            const warehouseCount = (db.prepare('SELECT COUNT(*) as count FROM catalog_warehouses').get() as any).count;
            if (warehouseCount === 0) {
                logger.warn('Sembrando catálogo de almacenes');
                const insertWarehouse = db.prepare(`INSERT INTO catalog_warehouses (name, address) VALUES (?, ?)`);
                insertWarehouse.run('Almacén Central SIMAR', 'Av. de las Industrias S/N, Zona Industrial');
                insertWarehouse.run('Planta de Tratamiento Norte', 'Carretera Federal Km 15');
            }

            const residueCount = (db.prepare('SELECT COUNT(*) as count FROM catalog_residues').get() as any).count;
            if (residueCount === 0) {
                logger.warn('Sembrando catálogo de residuos especiales', { count: residuosCatalog.length });
                
                const insertResidue = db.prepare(`
                  INSERT INTO catalog_residues (name, residue_type, classification, clave, unit, base_price) 
                  VALUES (?, ?, ?, ?, ?, ?)
                `);
                
                for (const r of residuosCatalog) {
                  insertResidue.run(r.name, r.type, r.classification, r.clave, 'Kilogramo', 0.00);
                }
            }

            runSepomexSeeder(db);
            seedDefaultConditions();
        });

        seedTransaction();
    } catch (error) {
        logger.error('Error al inyectar datos semilla', { error });
    }

    logger.warn('Base de datos SQLite inicializada', { dbPath });
};

export default db;
