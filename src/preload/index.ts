import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI, ElectronAPI } from '@electron-toolkit/preload'
import { QuoteDraft, QuoteSummary } from '../shared/types/Quote'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      registerWorker: (workerData: any) => Promise<any>;
      saveDraft: (data: QuoteDraft) => Promise<any>;
      getDraftById: (id: number | string) => Promise<any>;
      login: (credentials: Record<string, string>) => Promise<any>;
      getDrafts: () => Promise<any>;
      issueQuote: (id: number | string) => Promise<{ success: boolean; error?: string }>;
      getIssuedQuotes: () => Promise<QuoteSummary[]>;
      getQuoteById: (id: number | string) => Promise<QuoteDraft | null>;
      generatePdfPreview: (quoteData: QuoteDraft) => Promise<{ success: boolean; pdfBase64?: string; error?: string }>;
      savePdf: (pdfBase64: string, defaultFolio: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      getCatalogs: () => Promise<any>;
      manageCatalog: (action: 'add' | 'delete', type: 'vehicle' | 'supply' | 'warehouse', payload: any) => Promise<any>;
    }
  }
}

// Custom APIs for renderer
const api = {
  registerWorker: (workerData: any) => ipcRenderer.invoke('workers:register', workerData),
  saveDraft: (data: QuoteDraft) => ipcRenderer.invoke('quotes:save-draft', data),
  getDraftById: (id: number | string) => ipcRenderer.invoke('quotes:get-draft-by-id', id),
  login: (credentials: Record<string, string>) => ipcRenderer.invoke('auth:login', credentials),
  getDrafts: () => ipcRenderer.invoke('quotes:get-drafts'),
  issueQuote: (id: number | string) => ipcRenderer.invoke('quotes:issue', id),
  getIssuedQuotes: () => ipcRenderer.invoke('quotes:get-issued'),
  getQuoteById: (id: number | string) => ipcRenderer.invoke('quotes:get-quote-by-id', id),
  generatePdfPreview: (quoteData: QuoteDraft) => ipcRenderer.invoke('pdf:generate-preview', quoteData),
  savePdf: (pdfBase64: string, defaultFolio: string) => ipcRenderer.invoke('pdf:save', pdfBase64, defaultFolio),
  getCatalogs: () => ipcRenderer.invoke('catalogs:get-all'),
  manageCatalog: (action, type, payload) => ipcRenderer.invoke('catalogs:manage', { action, type, payload })
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}