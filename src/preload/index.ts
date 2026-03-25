import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { CotizacionBorrador } from '../shared/types/Cotizacion';

// Custom APIs for renderer
const api = {
  guardarBorrador: (datos: CotizacionBorrador) => 
    ipcRenderer.invoke('cotizaciones:guardar-borrador', datos),
  getDraftById: (id) => ipcRenderer.invoke('quotes:get-draft-by-id', id),
  
  getDrafts: () => ipcRenderer.invoke('quotes:get-drafts')
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
