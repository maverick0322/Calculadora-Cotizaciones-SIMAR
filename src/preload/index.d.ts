import { ElectronAPI } from '@electron-toolkit/preload'
import { ApiResult, CurrentQuoteStatus, QuoteDraft, QuoteSummary } from '../shared/types/Quote'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      registerWorker: (workerData: any) => Promise<any>;
      saveDraft: (data: QuoteDraft) => Promise<ApiResult<number | bigint>>;
      getDraftById: (id: number | string) => Promise<ApiResult<QuoteDraft>>;
      login: (credentials: Record<string, string>) => Promise<any>;
      getDrafts: () => Promise<ApiResult<QuoteSummary[]>>;
      updateQuoteStatus: (id: number | string, nextStatus: CurrentQuoteStatus) => Promise<ApiResult>;
      issueQuote: (id: number | string) => Promise<{ success: boolean; error?: string }>;
      getIssuedQuotes: () => Promise<ApiResult<QuoteSummary[]>>;
      getQuoteById: (id: number | string) => Promise<QuoteDraft | null>;
      generatePdfPreview: (payload: { quoteData: QuoteDraft; isDetailed: boolean }) => Promise<{ success: boolean; pdfBase64?: string; error?: string }>;
      savePdf: (pdfBase64: string, defaultFolio: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      
      getCatalogs: () => Promise<{ success: boolean; data?: any; error?: string }>;
      updateCatalogPrice: (type: 'vehicle' | 'supply', id: number, price: number) => Promise<any>;
      manageCatalog: (action: 'add' | 'delete' | 'edit', type: 'vehicle' | 'supply' | 'warehouse', payload: any) => Promise<any>;
      getLocations: (action: 'states' | 'municipalities' | 'colonies' | 'byCP', payload?: any) => Promise<{ success: boolean, data?: any, error?: string }>;
      addCustomLocation: (data: any) => Promise<{ success: boolean, id?: number, error?: string }>;
      manageResidues: (action: 'add' | 'delete' | 'updatePrice' | 'get', payload?: any) => Promise<any>;
      manageClientDirectory: (action: 'search' | 'upsert', payload?: any) => Promise<any>;
    }
  }
}
