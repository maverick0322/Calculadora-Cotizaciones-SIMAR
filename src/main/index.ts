import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import db, { initDatabase } from './infrastructure/database/sqliteClient';
import { SqliteQuoteRepository } from './infrastructure/database/repositories/SqliteQuoteRepository';
import { SqliteAuthRepository } from './infrastructure/database/repositories/SqliteAuthRepository';
import { SqliteCatalogRepository } from './infrastructure/database/repositories/SqliteCatalogRepository';
import { SqliteWorkerRepository } from './infrastructure/database/repositories/SqliteWorkerRepository';
import { SqliteConditionRepository } from './infrastructure/database/repositories/SqliteConditionRepository';

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
import { registerLocationHandlers } from './ipc/locationHandlers';
import { LogAuditActionUseCase } from './application/useCases/LogAuditActionUseCase';
import { GetCatalogsUseCase } from './application/useCases/GetCatalogsUseCase';
import { UpdateCatalogPriceUseCase } from './application/useCases/UpdateCatalogPriceUseCase';
import { ManageCatalogUseCase } from './application/useCases/ManageCatalogUseCase';
import { RegisterWorkerUseCase } from './application/useCases/RegisterWorkerUseCase';
import { UpdateQuoteStatusUseCase } from './application/useCases/UpdateQuoteStatusUseCase';
import { ListWorkersUseCase } from './application/useCases/ListWorkersUseCase';
import { ManageConditionsUseCase } from './application/useCases/ManageConditionsUseCase';
import { SuggestQuoteFolioUseCase } from './application/useCases/SuggestQuoteFolioUseCase';

import { issueQuoteSchema, quoteSchema } from '../shared/schemas/quoteSchema';
import { registerResidueHandlers } from './ipc/residueHandlers';
import { registerClientDirectoryHandlers } from './ipc/clientDirectoryHandlers';
import { logger } from './infrastructure/logging/SafeLogger';
import { CurrentQuoteStatus } from '../shared/types/Quote';
import { QuoteFolioService } from './domain/services/QuoteFolioService';
import { QuoteTypeClassifier } from './domain/services/QuoteTypeClassifier';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
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

  ipcMain.on('ping', () => logger.warn('Ping recibido desde renderer'))

  initDatabase();

  const quoteRepo = new SqliteQuoteRepository(db);
  const authRepo = new SqliteAuthRepository(db);
  const workerRepo = new SqliteWorkerRepository(db);
  const registerWorkerUseCase = new RegisterWorkerUseCase(workerRepo);
  const auditRepo = new SqliteAuditRepository(db);
  const catalogRepo = new SqliteCatalogRepository(db);
  const conditionRepo = new SqliteConditionRepository(db);
  const quoteTypeClassifier = new QuoteTypeClassifier();
  const quoteFolioService = new QuoteFolioService();

  const logAuditUseCase = new LogAuditActionUseCase(auditRepo);
  const saveDraftUseCase = new SaveDraftUseCase(quoteRepo, logAuditUseCase);
  const getDraftsUseCase = new GetDraftsUseCase(quoteRepo);
  const getDraftByIdUseCase = new GetDraftByIdUseCase(quoteRepo);
  const loginUseCase = new LoginUseCase(authRepo);

  const fetchQuoteByIdUseCase = new FetchQuoteByIdUseCase(quoteRepo);
  const issueQuoteUseCase = new IssueQuoteUseCase(quoteRepo, conditionRepo, logAuditUseCase);
  const generatePdfPreviewUseCase = new GeneratePdfPreviewUseCase();
  const getIssuedQuotesUseCase = new GetIssuedQuotesUseCase(quoteRepo);
  const savePdfUseCase = new SavePdfUseCase();
  const getCatalogsUseCase = new GetCatalogsUseCase(catalogRepo);
  const updateCatalogUseCase = new UpdateCatalogPriceUseCase(catalogRepo);
  const manageCatalogUseCase = new ManageCatalogUseCase(catalogRepo);
  const updateQuoteStatusUseCase = new UpdateQuoteStatusUseCase(quoteRepo, logAuditUseCase);
  const listWorkersUseCase = new ListWorkersUseCase(workerRepo);
  const manageConditionsUseCase = new ManageConditionsUseCase(conditionRepo);
  const suggestQuoteFolioUseCase = new SuggestQuoteFolioUseCase(quoteRepo, quoteTypeClassifier, quoteFolioService);

  ipcMain.handle('quotes:save-draft', (_event, payload) => {
    try {
      const validation = quoteSchema.safeParse(payload);

      if (!validation.success) {
        logger.warn('Cotización bloqueada por validación local', { details: validation.error.format() });
        return {
          success: false,
          error: 'La cotización contiene campos inválidos o incompletos.',
          details: validation.error.format()
        };
      }

      return saveDraftUseCase.execute({
        ...validation.data,
        id: payload?.id,
        createdAt: payload?.createdAt ?? Date.now(),
        status: payload?.id ? (payload?.status ?? 'en_proceso') : 'en_proceso'
      });

    } catch (error) {
      logger.error('Error inesperado al guardar cotización', { quoteId: payload?.id, error });
      return { success: false, error: 'Error inesperado al guardar la cotización.' };
    }
  });

  ipcMain.handle('auth:login', async (_event, credentials) => {
    return loginUseCase.execute(credentials);
  });

  ipcMain.handle('workers:register', async (_event, workerData) => {
    return registerWorkerUseCase.execute(workerData);
  });

  ipcMain.handle('workers:list', () => {
    return listWorkersUseCase.execute();
  });

  ipcMain.handle('quotes:get-draft-by-id', async (_event, id) => {
    try {
      const data = getDraftByIdUseCase.execute(id);

      if (data) {
        return { success: true, data };
      } else {
        return { success: false, error: 'No se encontró la cotización en seguimiento.' };
      }
    } catch (error) {
      logger.error('Error al obtener cotización en seguimiento', { quoteId: id, error });
      return { success: false, error: 'Error inesperado al obtener la cotización.' };
    }
  });

  ipcMain.handle('quotes:get-drafts', () => {
    try {
      return getDraftsUseCase.execute();
    } catch (error) {
      logger.error('Error al listar cotizaciones en proceso', { error });
      return { success: false, error: 'Error inesperado al listar cotizaciones.' };
    }
  });

  ipcMain.handle('quotes:suggest-folio', (_event, payload: { quoteId: number; preparedByInitials?: string }) => {
    return suggestQuoteFolioUseCase.execute(payload);
  });

  ipcMain.handle('quotes:issue', async (_event, payload) => {
    const validation = issueQuoteSchema.safeParse(payload);
    if (!validation.success) {
      logger.warn('Emisión bloqueada por payload inválido', { details: validation.error.format() });
      return {
        success: false,
        error: 'Los datos para emitir la cotización son inválidos.',
        details: validation.error.format()
      };
    }

    return await issueQuoteUseCase.execute(validation.data);
  });

  ipcMain.handle('quotes:update-status', (_event, { id, nextStatus }: { id: number; nextStatus: CurrentQuoteStatus }) => {
    return updateQuoteStatusUseCase.execute(id, nextStatus);
  });

  ipcMain.handle('quotes:get-quote-by-id', (_event, id) => {
    return fetchQuoteByIdUseCase.execute(id);
  });

  ipcMain.handle('pdf:generate-preview', async (_event, payload) => {
    const data = payload.quoteData ? payload.quoteData : payload;
    const isDetailed = payload.isDetailed || false;
    
    return await generatePdfPreviewUseCase.execute(data, isDetailed);
  });

  ipcMain.handle('pdf:save', async (_event, pdfBase64, defaultFolio) => {
    return await savePdfUseCase.execute(pdfBase64, defaultFolio);
  });

  ipcMain.handle('quotes:get-issued', () => {
    return getIssuedQuotesUseCase.execute(); 
  });

  ipcMain.handle('catalogs:get-all', () => {
    try {
      const data = getCatalogsUseCase.execute();
      return { success: true, data };
    } catch (error) {
      logger.error('Error al obtener catálogos', { error });
      return { success: false, error: 'Error inesperado al obtener catálogos.' };
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

  ipcMain.handle('conditions:manage', (_event, { action, payload }) => {
    return manageConditionsUseCase.execute(action, payload);
  });
  
  registerLocationHandlers();
  registerResidueHandlers();
  registerClientDirectoryHandlers();

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
