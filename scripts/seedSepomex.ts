import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Detectamos automáticamente la carpeta AppData de Windows y el nombre de tu app
// (Asegúrate de que 'calculadora-cotizaciones-simar' sea el "name" exacto de tu package.json)
const appName = 'calculadora-cotizaciones-simar'; 
const userDataPath = process.env.APPDATA 
  ? path.join(process.env.APPDATA, appName) 
  : path.join(__dirname, '../'); // Fallback por si acaso

const dbPath = path.join(userDataPath, 'gestor_residuos.sqlite');

export const seedSepomex = () => {
  console.log("🚀 Iniciando migración masiva de SEPOMEX...");
  console.log("📂 Conectando a la base de datos en:", dbPath);

  const jsonPath = path.join(__dirname, 'sepomex.json');
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ No se encontró el archivo sepomex.json");
    return;
  }
  
  const sepomexData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const db = new Database(dbPath);
  
  const insertState = db.prepare(`INSERT OR IGNORE INTO catalog_states (name) VALUES (?)`);
  const insertMunicipality = db.prepare(`INSERT OR IGNORE INTO catalog_municipalities (state_id, name) VALUES (?, ?)`);
  const insertLocation = db.prepare(`INSERT INTO catalog_locations (municipality_id, cp, colony) VALUES (?, ?, ?)`);

  const getStateId = db.prepare(`SELECT id FROM catalog_states WHERE name = ?`);
  const getMunicipalityId = db.prepare(`SELECT id FROM catalog_municipalities WHERE state_id = ? AND name = ?`);

  const stateCache = new Map<string, number>();
  const municipalityCache = new Map<string, number>();

  const transaction = db.transaction((data) => {
    let count = 0;

    for (const row of data) {
      if (!stateCache.has(row.estado)) {
        insertState.run(row.estado);
        const stateId = (getStateId.get(row.estado) as any).id;
        stateCache.set(row.estado, stateId);
      }
      const stateId = stateCache.get(row.estado)!;
      
      const muniKey = `${stateId}-${row.municipio}`;
      if (!municipalityCache.has(muniKey)) {
        insertMunicipality.run(stateId, row.municipio);
        const muniId = (getMunicipalityId.get(stateId, row.municipio) as any).id;
        municipalityCache.set(muniKey, muniId);
      }
      const muniId = municipalityCache.get(muniKey)!;

      insertLocation.run(muniId, row.cp, row.asentamiento);
      
      count++;
      if (count % 25000 === 0) console.log(`⏳ Procesados ${count} registros...`);
    }
  });

  try {
    transaction(sepomexData);
    
    console.log("🧹 Compactando y optimizando la base de datos (VACUUM)...");
    db.exec("PRAGMA optimize;");
    db.exec("VACUUM;");
    
    console.log("✅ ¡Migración de SEPOMEX completada con éxito!");
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
  }
};

seedSepomex();