import { ElectronAPI } from '@electron-toolkit/preload'
import { CotizacionBorrador, QuoteSummary } from '../shared/types/Quote'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveDraft: (data: QuoteDraft) => Promise<any>;
      getDraftById: (id: number | string) => Promise<any>;
      login: (credentials: Record<string, string>) => Promise<any>;
      getDrafts: () => Promise<any>;
    }
  }
}
