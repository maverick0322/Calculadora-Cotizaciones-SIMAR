import { ElectronAPI } from '@electron-toolkit/preload'
import { CotizacionBorrador, QuoteSummary } from '../shared/types/Cotizacion'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      guardarBorrador: (datos: CotizacionBorrador) => Promise<{ success: boolean; id?: number | bigint; error?: string; message?: string }>
      getDrafts: () => Promise<{ success: boolean; data?: QuoteSummary[]; error?: string }>;
      getDraftById: (id: number) => Promise<any>;
    }
  }
}
