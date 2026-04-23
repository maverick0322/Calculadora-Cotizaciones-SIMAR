import { dialog } from 'electron';
import * as fs from 'fs';

export class SavePdfUseCase {
  async execute(pdfBase64: string, defaultFolio: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Guardar Cotización PDF',
        defaultPath: `${defaultFolio}.pdf`,
        filters: [{ name: 'Documentos PDF', extensions: ['pdf'] }]
      });

      if (canceled || !filePath) return { success: false, error: 'Operación cancelada por el usuario.' };

      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      fs.writeFileSync(filePath, pdfBuffer);

      return { success: true, filePath };
    } catch (error) {
      console.error('Error al guardar el archivo PDF:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}