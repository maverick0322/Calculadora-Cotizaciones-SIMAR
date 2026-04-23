import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import db, { initDatabase } from './infrastructure/database/sqliteClient'; 
import { SqliteQuoteRepository } from './infrastructure/database/repositories/SqliteQuoteRepository';
import { SqliteAuthRepository } from './infrastructure/database/repositories/SqliteAuthRepository';
import { SqliteCatalogRepository } from './infrastructure/database/repositories/SqliteCatalogRepository';

import { SaveDraftUseCase } from './application/useCases/SaveDraftUseCase'; 
import { GetDraftsUseCase } from './application/useCases/GetDraftsUseCase';
import { GetDraftByIdUseCase } from './application/useCases/GetDraftByIdUseCase'; 
import { LoginUseCase } from './application/useCases/LoginUseCase';

import { FetchQuoteByIdUseCase } from './application/useCases/FetchQuoteByIdUseCase';
import { IssueQuoteUseCase } from './application/useCases/IssueQuoteUseCase';
import { GeneratePdfPreviewUseCase } from './application/useCases/GeneratePdfPreviewUseCase';
import { GetIssuedQuotesUseCase } from './application/useCases/GetIssuedQuotesUseCase';
import { SavePdfUseCase } from './application/useCases/SavePdfUseCase';
import { SqliteAuditRepository } from './infrastructure/database/repositories/SqliteAuditRepository';
import { LogAuditActionUseCase } from './application/useCases/LogAuditActionUseCase';
import { GetCatalogsUseCase } from './application/useCases/GetCatalogsUseCase';
import { UpdateCatalogPriceUseCase } from './application/useCases/UpdateCatalogPriceUseCase';
import { ManageCatalogUseCase } from './application/useCases/ManageCatalogUseCase';

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
      sandbox: false,
      plugins: true
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

  const quoteRepo = new SqliteQuoteRepository(db);
  const authRepo = new SqliteAuthRepository(db);
  const auditRepo = new SqliteAuditRepository(db);
  const catalogRepo = new SqliteCatalogRepository(db);

  const logAuditUseCase = new LogAuditActionUseCase(auditRepo);
  const saveDraftUseCase = new SaveDraftUseCase(quoteRepo, logAuditUseCase);
  const getDraftsUseCase = new GetDraftsUseCase(quoteRepo);
  const getDraftByIdUseCase = new GetDraftByIdUseCase(quoteRepo);
  const loginUseCase = new LoginUseCase(authRepo);

  const fetchQuoteByIdUseCase = new FetchQuoteByIdUseCase(quoteRepo);  
  const issueQuoteUseCase = new IssueQuoteUseCase(quoteRepo, logAuditUseCase);
  const generatePdfPreviewUseCase = new GeneratePdfPreviewUseCase();
  const getIssuedQuotesUseCase = new GetIssuedQuotesUseCase(quoteRepo);
  const savePdfUseCase = new SavePdfUseCase();
  const getCatalogsUseCase = new GetCatalogsUseCase(catalogRepo);
  const updateCatalogUseCase = new UpdateCatalogPriceUseCase(catalogRepo);
  const manageCatalogUseCase = new ManageCatalogUseCase(catalogRepo);

  ipcMain.handle('quotes:save-draft', (_event, payload) => {
    try {
      console.log('Main received request to save draft:', payload);
      
      const validation = quoteSchema.safeParse(payload);

      if (!validation.success) {
        console.warn('Blocked by local backend (Invalid data):', validation.error.format());
        return {
          success: false,
          error: 'Local server security validation failed',
          details: validation.error.format()
        };      
      }
      
      return saveDraftUseCase.execute(payload);

    } catch (error) {
      console.error('Error saving draft:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('auth:login', async (_event, credentials) => {
    console.log(`Attempting login for: ${credentials?.email}`);
    return loginUseCase.execute(credentials);
  });

  ipcMain.handle('quotes:get-draft-by-id', async (_event, id) => {
    try {
      console.log(`Main received request to fetch draft #${id}`);
      
      const data = getDraftByIdUseCase.execute(id);
      
      if (data) {
        return { success: true, data };
      } else {
        return { success: false, error: 'Draft not found' };
      }
    } catch (error) {
      console.error('Error fetching draft:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('quotes:get-drafts', () => {
    try {
      console.log('Main received request to list drafts');
      return getDraftsUseCase.execute();
    } catch (error) {
      console.error('Error listing drafts:', error);
      return { success: false, error: (error as Error).message };
    }
  });
  
  ipcMain.handle('quotes:issue', async (_event, id) => {
    console.log(`Main received request to issue quote #${id}`);
    return await issueQuoteUseCase.execute(id);
  });

  ipcMain.handle('quotes:get-quote-by-id', (_event, id) => {
    console.log(`Main received request to fetch ANY quote #${id}`);
    return fetchQuoteByIdUseCase.execute(id);
  });

  ipcMain.handle('pdf:generate-preview', async (_event, quoteData) => {
    console.log('Main received request to generate PDF preview');
    return await generatePdfPreviewUseCase.execute(quoteData);
  });

  ipcMain.handle('pdf:save', async (_event, pdfBase64, defaultFolio) => {
    console.log('Main received request to save PDF to disk');
    return await savePdfUseCase.execute(pdfBase64, defaultFolio);
  });

  ipcMain.handle('quotes:get-issued', () => {
    console.log("Main received request to get issued quotes");
  return getIssuedQuotesUseCase.execute(); 
  });

  ipcMain.handle('catalogs:get-all', () => {
    try {
      console.log('Main received request to fetch catalogs');
      const data = getCatalogsUseCase.execute();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('catalogs:update-price', async (_event, { type, id, price }) => {
    try {
      const result = await updateCatalogUseCase.execute(type, id, price);
      return { success: true, changes: result.changes };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('catalogs:manage', async (_event, { action, type, payload }) => {
  try {
    const result = await manageCatalogUseCase.execute(action, type, payload);
    return { success: true, changes: result.changes, lastInsertRowid: result.lastInsertRowid };
  } catch (error) {
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