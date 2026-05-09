import { ipcMain } from 'electron';
import db from '../infrastructure/database/sqliteClient';

export function registerClientDirectoryHandlers() {
  ipcMain.handle('clients:manage', (_event, { action, payload }) => {
    try {
      // --- BUSCAR CLIENTES (AUTOCOMPLETADO) ---
      if (action === 'search') {
        // Buscamos coincidencias en Nombre o RFC, limitamos a 10 resultados para no saturar la UI
        const searchTerm = `%${(payload || '').toLowerCase()}%`;
        const stmt = db.prepare(`
          SELECT * FROM user_clients_directory
          WHERE LOWER(client_name) LIKE ? OR LOWER(client_rfc) LIKE ?
          ORDER BY last_used_at DESC
          LIMIT 10
        `);
        return { success: true, data: stmt.all(searchTerm, searchTerm) };
      }

      // --- GUARDAR O ACTUALIZAR CLIENTE (AL EMITIR BORRADOR) ---
      if (action === 'upsert') {
        const { clientName, clientRfc, contactName, contactPhone, contactEmail } = payload;
        const now = Date.now();

        // 1. Verificamos si el cliente ya existe por nombre o RFC
        const existing = db.prepare(`
          SELECT id FROM user_clients_directory 
          WHERE client_name = ? OR (client_rfc = ? AND client_rfc != '')
        `).get(clientName, clientRfc || null) as { id: number } | undefined;

        if (existing) {
           // Si existe, actualizamos su información y su fecha de último uso
           const updateStmt = db.prepare(`
             UPDATE user_clients_directory
             SET client_rfc = ?, contact_name = ?, contact_phone = ?, contact_email = ?, last_used_at = ?
             WHERE id = ?
           `);
           updateStmt.run(clientRfc, contactName, contactPhone, contactEmail, now, existing.id);
           return { success: true, id: existing.id };
        } else {
           // Si no existe, lo insertamos como cliente nuevo
           const insertStmt = db.prepare(`
             INSERT INTO user_clients_directory (client_name, client_rfc, contact_name, contact_phone, contact_email, last_used_at)
             VALUES (?, ?, ?, ?, ?, ?)
           `);
           const info = insertStmt.run(clientName, clientRfc, contactName, contactPhone, contactEmail, now);
           return { success: true, id: info.lastInsertRowid };
        }
      }

      return { success: false, error: 'Acción no reconocida' };
    } catch (error) {
      console.error('❌ Error en clients:manage:', error);
      return { success: false, error: (error as Error).message };
    }
  });
}