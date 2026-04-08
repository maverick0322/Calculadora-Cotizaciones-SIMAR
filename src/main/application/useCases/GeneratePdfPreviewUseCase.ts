import { BrowserWindow, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { QuoteDraft } from '../../../shared/types/Quote';
import { buildQuoteHtml } from '../../infrastructure/templates/QuoteHtmlTemplate';

export class GeneratePdfPreviewUseCase {
  
  async execute(quoteData: QuoteDraft): Promise<{ success: boolean; pdfBase64?: string; error?: string }> {
    return new Promise(async (resolve) => {
      let printWindow: BrowserWindow | null = null;

      try {
        if (!quoteData || !quoteData.location) {
          throw new Error('Datos de cotización inválidos o incompletos.');
        }

        printWindow = new BrowserWindow({
          show: false, // 100% invisible
          webPreferences: { nodeIntegration: false, contextIsolation: true }
        });

        const logoBase64 = this.getLocalLogoBase64();

        const htmlContent = buildQuoteHtml(quoteData, logoBase64);

        await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

        const pdfBuffer = await printWindow.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4',
          margins: { marginType: 'default' }
        });

        resolve({ success: true, pdfBase64: pdfBuffer.toString('base64') });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar PDF';
        console.error('❌ Error crítico en GeneratePdfPreviewUseCase:', errorMessage);
        resolve({ success: false, error: errorMessage });
        
      } finally {
        if (printWindow && !printWindow.isDestroyed()) {
          printWindow.destroy();
          printWindow = null;
        }
      }
    });
  }

  private getLocalLogoBase64(): string {
    try {
      const isDev = !app.isPackaged;
      const logoPath = isDev 
        ? path.join(app.getAppPath(), 'src/renderer/src/assets/logo.png')
        : path.join(__dirname, '../renderer/assets/logo.png');
      
      if (fs.existsSync(logoPath)) {
        const imageBuffer = fs.readFileSync(logoPath);
        return `data:image/png;base64,${imageBuffer.toString('base64')}`;
      }
    } catch (err) {
      console.warn('⚠️ Error al leer el logo para el PDF:', err);
    }
    return '';
  }
}