import { ElectronAPI } from '@electron-toolkit/preload'
import { QuoteDraft, QuoteSummary } from '../shared/types/Quote'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveDraft: (data: QuoteDraft) => Promise<any>;
      getDraftById: (id: number | string) => Promise<any>;
      login: (credentials: Record<string, string>) => Promise<any>;
      getDrafts: () => Promise<any>;
      issueQuote: (id: number | string) => Promise<{ success: boolean; error?: string }>;
      getIssuedQuotes: () => Promise<QuoteSummary[]>;
      getQuoteById: (id: number | string) => Promise<QuoteDraft | null>;
      generatePdfPreview: (quoteData: QuoteDraft) => Promise<{ success: boolean; pdfBase64?: string; error?: string }>;
      savePdf: (pdfBase64: string, defaultFolio: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      
      // NUEVA FUNCIÓN AÑADIDA
      getCatalogs: () => Promise<{ success: boolean; data?: any; error?: string }>;
    }
  }
}