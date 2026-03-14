import { ElectronAPI } from '@electron-toolkit/preload'
import { CotizacionBorrador } from '../shared/types/Cotizacion'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      guardarBorrador: (datos: CotizacionBorrador) => Promise<{ success: boolean; id?: number | bigint; error?: string; message?: string }>
    }
  }
}
