// src/main/infrastructure/database/sqliteClient.ts
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'gestor_residuos.sqlite');
const db: DatabaseType = new Database(dbPath, {});

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const initDatabase = () => {
    const schema = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            central_id VARCHAR,
            full_name VARCHAR,
            email VARCHAR,
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

        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fuel_type VARCHAR,
            weight_capacity_kg DECIMAL,
            vehicle_type VARCHAR
        );

        CREATE TABLE IF NOT EXISTS supplies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR,
            unit_cost DECIMAL
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

            street TEXT,
            neighborhood TEXT,
            municipality TEXT,
            
            activity_type VARCHAR,
            wastes_json TEXT,
            service_frequency VARCHAR,
            subtotal DECIMAL,
            total DECIMAL,
            
            trip_kilometers DECIMAL,
            trip_vehicles INTEGER,
            trip_crew_members INTEGER,
            trip_fuel_liters DECIMAL,
            trip_road_type VARCHAR,
            trip_tolls INTEGER,
            trip_total_toll_cost DECIMAL,
            trip_origin VARCHAR,
            trip_destination_warehouse VARCHAR,
            
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
            FOREIGN KEY (supply_id) REFERENCES supplies(id)
        );

        CREATE TABLE IF NOT EXISTS quote_vehicles (
            quote_id INTEGER,
            vehicle_id INTEGER,
            quantity INTEGER,
            PRIMARY KEY (quote_id, vehicle_id),
            FOREIGN KEY (quote_id) REFERENCES quotes(id),
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
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
    `;

    db.exec(schema);

    try {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
        const result = stmt.get() as { count: number };

        if (result.count === 0) {
            console.log('🌱 Sembrando usuario administrador por defecto...');
            const insertUser = db.prepare(`
                INSERT INTO users (email, password_hash, full_name, role)
                VALUES (?, ?, ?, ?)
            `);

            insertUser.run('admin@simar.com', '123456', 'Administrador SIMAR', 'admin');
            console.log('✅ Administrador creado: admin@simar.com / 123456');
        }
    } catch (error) {
        console.error('❌ Error al inyectar el usuario semilla:', error);
    }

    console.log('Base de datos SQLite inicializada correctamente en:', dbPath);
};

export default db;