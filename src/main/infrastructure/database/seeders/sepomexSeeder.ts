import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import type { Database as DatabaseType } from 'better-sqlite3';

export const runSepomexSeeder = (db: DatabaseType) => {
  // 1. Verificamos si ya hay datos para no hacer nada
  const locationCount = (db.prepare('SELECT COUNT(*) as count FROM catalog_locations').get() as any).count;
  if (locationCount > 0) return;

  console.log('🌱 Sembrando catálogo oficial de SEPOMEX (esto tomará unos segundos)...');

  try {
    const sepomexPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'sepomex.json')
      : path.join(__dirname, '../../resources/sepomex.json');

    if (!fs.existsSync(sepomexPath)) {
      console.warn('⚠️ No se encontró sepomex.json en:', sepomexPath);
      return;
    }

    const sepomexData = JSON.parse(fs.readFileSync(sepomexPath, 'utf-8'));

    const insertState = db.prepare(`INSERT OR IGNORE INTO catalog_states (name) VALUES (?)`);
    const insertMunicipality = db.prepare(`INSERT OR IGNORE INTO catalog_municipalities (state_id, name) VALUES (?, ?)`);
    const insertLocation = db.prepare(`INSERT INTO catalog_locations (municipality_id, cp, colony) VALUES (?, ?, ?)`);

    const getStateId = db.prepare(`SELECT id FROM catalog_states WHERE name = ?`);
    const getMunicipalityId = db.prepare(`SELECT id FROM catalog_municipalities WHERE state_id = ? AND name = ?`);

    const stateCache = new Map<string, number>();
    const municipalityCache = new Map<string, number>();

    // 3. Ejecutamos la inserción masiva
    for (const row of sepomexData) {
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
    }
    
    console.log('✅ SEPOMEX sembrado con éxito.');
  } catch (error) {
    console.error('❌ Error inyectando SEPOMEX automáticamente:', error);
  }
};