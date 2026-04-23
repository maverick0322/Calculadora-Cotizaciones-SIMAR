import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneratePdfPreviewUseCase } from '../../../main/application/useCases/GeneratePdfPreviewUseCase';
import * as fs from 'fs';
import { buildQuoteHtml } from '../../../main/infrastructure/templates/QuoteHtmlTemplate';

// 1. IMPORTANTE: Usamos vi.hoisted para que Vitest cree estos mocks ANTES de evaluar vi.mock('electron')
const { mockPrintToPDF, mockLoadURL, mockDestroy, mockIsDestroyed } = vi.hoisted(() => ({
  mockPrintToPDF: vi.fn(),
  mockLoadURL: vi.fn(),
  mockDestroy: vi.fn(),
  mockIsDestroyed: vi.fn().mockReturnValue(false),
}));

// 2. Burlamos el módulo nativo de Electron
vi.mock('electron', () => {
  return {
    app: {
      isPackaged: false,
      getAppPath: vi.fn().mockReturnValue('/mock/path')
    },
    // SOLUCIÓN: Usamos una "function()" clásica en lugar de una arrow function "() =>"
    // para que JavaScript permita usar la palabra reservada "new"
    BrowserWindow: vi.fn().mockImplementation(function() {
      return {
        loadURL: mockLoadURL,
        webContents: {
          printToPDF: mockPrintToPDF
        },
        destroy: mockDestroy,
        isDestroyed: mockIsDestroyed
      };
    })
  };
});

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

vi.mock('../../../main/infrastructure/templates/QuoteHtmlTemplate', () => ({
  buildQuoteHtml: vi.fn()
}));

describe('GeneratePdfPreviewUseCase', () => {
  let useCase: GeneratePdfPreviewUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GeneratePdfPreviewUseCase();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const validQuoteData = {
    services: [{ activity: 'collection' }]
  } as any;

  // --- AC 1: PROTECCIÓN MULTISERVICIO ---
  it('should fail immediately if quoteData is missing or has no services', async () => {
    const resultUndefined = await useCase.execute(undefined as any);
    const resultEmpty = await useCase.execute({ services: [] } as any);

    expect(resultUndefined.success).toBe(false);
    expect(resultUndefined.error).toBe('Datos de cotización inválidos o incompletos.');
    
    expect(resultEmpty.success).toBe(false);
    expect(resultEmpty.error).toBe('Datos de cotización inválidos o incompletos.');
    
    expect(mockLoadURL).not.toHaveBeenCalled();
  });

  // --- AC 2: CAMINO FELIZ (PDF GENERADO) ---
  it('should generate a PDF successfully with valid data', async () => {
    // [ ARRANGE ]
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from('mock-image'));
    vi.mocked(buildQuoteHtml).mockReturnValue('<html>Mock</html>');
    
    mockPrintToPDF.mockResolvedValue(Buffer.from('mock-pdf'));

    // [ ACT ]
    const result = await useCase.execute(validQuoteData);

    // [ ASSERT ]
    expect(mockLoadURL).toHaveBeenCalled();
    expect(mockPrintToPDF).toHaveBeenCalled();
    expect(mockDestroy).toHaveBeenCalled(); 
    
    expect(result).toEqual({
      success: true,
      pdfBase64: Buffer.from('mock-pdf').toString('base64')
    });
  });

  // --- AC 3: MANEJO DE CAÍDAS DEL MOTOR ---
  it('should handle printing errors gracefully and still destroy the window', async () => {
    // [ ARRANGE ]
    mockPrintToPDF.mockRejectedValue(new Error('PDF Engine crashed'));

    // [ ACT ]
    const result = await useCase.execute(validQuoteData);

    // [ ASSERT ]
    expect(result.success).toBe(false);
    expect(result.error).toBe('PDF Engine crashed');
    expect(mockDestroy).toHaveBeenCalled(); 
  });
});