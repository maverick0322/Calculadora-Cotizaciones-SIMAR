import Database from 'better-sqlite3';

export interface Residue {
  id?: number;
  name: string;
  residue_type: string;
  classification?: string; 
  clave?: string;      
  unit: string;
  base_price: number;
  is_active?: number;
}

export class SqliteResidueRepository {
  private db: Database.Database;

  // 👇 Mantenemos la inyección de dependencias para las pruebas
  constructor(db: Database.Database) {
    this.db = db;
  }

  getAllActive(): Residue[] {
    const stmt = this.db.prepare('SELECT * FROM catalog_residues WHERE is_active = 1 ORDER BY name ASC');
    return stmt.all() as Residue[];
  }

  add(residue: Residue) {
    const stmt = this.db.prepare(`
      INSERT INTO catalog_residues (name, residue_type, classification, clave, unit, base_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      residue.name, 
      residue.residue_type, 
      residue.classification || null, 
      residue.clave || null, 
      residue.unit, 
      residue.base_price
    );
  }

  delete(id: number) {
    const stmt = this.db.prepare('UPDATE catalog_residues SET is_active = 0 WHERE id = ?');
    return stmt.run(id);
  }

  updatePrice(id: number, newPrice: number) {
    const stmt = this.db.prepare('UPDATE catalog_residues SET base_price = ? WHERE id = ?');
    return stmt.run(newPrice, id);
  }
}