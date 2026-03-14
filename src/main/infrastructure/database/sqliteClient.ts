// src/main/infrastructure/database/sqliteClient.ts
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3'; // <-- Importamos el Tipo explícitamente
import { app } from 'electron';
import path from 'path';
// 1. DEFINIR LA UBICACIÓN SEGURA DEL ARCHIVO
// En Electron no debes guardar la base de datos en la misma carpeta del proyecto,
// porque cuando instales la app en Windows (Archivos de Programa), el sistema
// bloqueará la escritura por seguridad. 
// app.getPath('userData') apunta a C:\Users\TuUsuario\AppData\Roaming\TuApp\
const dbPath = path.join(app.getPath('userData'), 'gestor_residuos.sqlite');

// 2. CREAR LA INSTANCIA DE LA BASE DE DATOS
// El objeto db mantendrá la conexión abierta con el archivo.
const db: DatabaseType = new Database(dbPath, { 
    // verbose: console.log 
});

// 3. CONFIGURACIONES CRÍTICAS DE SQLITE (PRAGMAS)
// Activa el modo WAL (Write-Ahead Logging). Hace que SQLite sea mucho más rápido y evita bloqueos.
db.pragma('journal_mode = WAL');
// ¡Mortalmente importante! SQLite tiene las llaves foráneas APAGADAS por defecto por razones históricas.
// Si no prendemos esto, las relaciones de tus tablas no se respetarán.
db.pragma('foreign_keys = ON');

// 4. FUNCIÓN PARA INICIALIZAR EL ESQUEMA (TABLAS)
export const initDatabase = () => {
    // Aquí usamos el esquema que definimos, adaptado a la sintaxis de SQLite
    const schema = `
        -- 1. CATÁLOGOS CORE
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

        -- 2. TRANSACCIONAL CORE
        CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folio VARCHAR UNIQUE,
            status VARCHAR DEFAULT 'draft',
            customer_id INTEGER,
            seller_id INTEGER,
            replaces_quote_id INTEGER,
            location_address TEXT,
            activity_type VARCHAR,
            waste_type VARCHAR,
            volume_quantity DECIMAL,
            volume_unit VARCHAR,
            service_frequency VARCHAR,
            subtotal DECIMAL,
            total DECIMAL,
            created_at INTEGER,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (seller_id) REFERENCES users(id),
            FOREIGN KEY (replaces_quote_id) REFERENCES quotes(id)
        );

        -- 3. TABLAS INTERMEDIAS (SNAPSHOTS)
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
    `;

    // db.exec ejecuta múltiples sentencias SQL de un solo golpe.
    // Usamos IF NOT EXISTS para que solo las cree la primera vez que se abre la app.
    db.exec(schema);
    
    console.log('Base de datos SQLite inicializada correctamente en:', dbPath);
};

export default db;