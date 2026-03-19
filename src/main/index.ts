import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initDatabase } from './infrastructure/database/sqliteClient';
import { SqliteCotizacionRepository } from './infrastructure/database/repositories/SqliteCotizacionRepository';
import { GuardarBorradorUseCase } from './application/useCases/GuardarBorradorUseCase';
import { GetDraftsUseCase } from './application/useCases/GetDraftsUseCase';
import { quoteSchema } from '../shared/schemas/quoteSchema';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  initDatabase();

  const cotizacionRepo = new SqliteCotizacionRepository();
  const guardarBorradorUseCase = new GuardarBorradorUseCase(cotizacionRepo);
  const getDraftsUseCase = new GetDraftsUseCase(cotizacionRepo);

  ipcMain.handle('cotizaciones:guardar-borrador', (_event, payload) => {
    try {
      console.log('Main recibió petición para guardar borrador:', payload);
      const validacion = quoteSchema.safeParse(payload);

      if (!validacion.success) {
        console.warn('Bloqueado por el backend (Datos inválidos):', validacion.error.format());
        return { 
          success: false, 
          error: 'Validación de seguridad fallida en el servidor local', 
          details: validacion.error.format() 
        };      }
      return guardarBorradorUseCase.execute(payload);
      
    } catch (error) {
      console.error('Error al guardar borrador:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('quotes:get-drafts', () => {
    try {
      console.log('Main recibió petición para listar borradores');
      return getDraftsUseCase.execute();
    } catch (error) {
      console.error('Error al listar borradores:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  createWindow()

  app.on('activate', function () {

    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
