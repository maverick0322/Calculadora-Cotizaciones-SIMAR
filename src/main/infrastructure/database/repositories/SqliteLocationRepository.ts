import db from '../sqliteClient';

export class SqliteLocationRepository {
  
  getStates(): string[] {
    const stmt = db.prepare('SELECT name as state FROM catalog_states ORDER BY name ASC');
    return stmt.all().map((row: any) => row.state);
  }

  getMunicipalitiesByState(state: string): string[] {
    const stmt = db.prepare(`
      SELECT m.name as municipality 
      FROM catalog_municipalities m
      JOIN catalog_states s ON m.state_id = s.id
      WHERE s.name = ? 
      ORDER BY m.name ASC
    `);
    return stmt.all(state).map((row: any) => row.municipality);
  }

  getColonies(state: string, municipality: string): string[] {
    const official = db.prepare(`
      SELECT l.colony 
      FROM catalog_locations l
      JOIN catalog_municipalities m ON l.municipality_id = m.id
      JOIN catalog_states s ON m.state_id = s.id
      WHERE s.name = ? AND m.name = ? 
      ORDER BY l.colony ASC
    `).all(state, municipality).map((row: any) => row.colony);

    const custom = db.prepare(`
      SELECT DISTINCT colony FROM user_custom_locations 
      WHERE state = ? AND municipality = ? 
      ORDER BY colony ASC
    `).all(state, municipality).map((row: any) => row.colony);

    return Array.from(new Set([...official, ...custom])).sort();
  }

  getLocationByCP(cp: string) {
    const stmt = db.prepare(`
      SELECT s.name as state, m.name as municipality, l.colony 
      FROM catalog_locations l
      JOIN catalog_municipalities m ON l.municipality_id = m.id
      JOIN catalog_states s ON m.state_id = s.id
      WHERE l.cp = ?
    `);
    return stmt.all(cp); 
  }

  addCustomLocation(data: { cp?: string, state: string, municipality: string, colony: string }) {
    try {
      const stmt = db.prepare(`
        INSERT INTO user_custom_locations (cp, state, municipality, colony, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(data.cp || null, data.state, data.municipality, data.colony, Date.now());
      return { success: true, id: result.lastInsertRowid };
    } catch (error: any) {
      console.error("Error persistiendo localización personalizada:", error);
      throw new Error("No se pudo guardar la nueva colonia.");
    }
  }
}