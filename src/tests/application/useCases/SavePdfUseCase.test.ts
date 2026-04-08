import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavePdfUseCase } from '../../../main/application/useCases/SavePdfUseCase';
import { dialog } from 'electron';
import * as fs from 'fs';

// Burlamos módulos nativos
vi.mock('electron', () => ({
  dialog: { showSaveDialog: vi.fn() }
}));
vi.mock('fs', () => ({
  writeFileSync: vi.fn()
}));

describe('SavePdfUseCase', () => {
  let useCase: SavePdfUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SavePdfUseCase();
  });

  it('should save the file and return the path when user selects a destination', async () => {
    // Simulamos que el usuario eligió una ruta
    vi.mocked(dialog.showSaveDialog).mockResolvedValue({
      canceled: false,
      filePath: '/ruta/falsa/cotizacion.pdf'
    });

    const result = await useCase.execute('base64String', 'FOLIO-123');

    expect(dialog.showSaveDialog).toHaveBeenCalledWith(expect.objectContaining({
      defaultPath: expect.stringContaining('FOLIO-123')
    }));
    
    expect(fs.writeFileSync).toHaveBeenCalledWith('/ruta/falsa/cotizacion.pdf', expect.any(Buffer));
    
    expect(result.success).toBe(true);
    expect(result.filePath).toBe('/ruta/falsa/cotizacion.pdf');
  });

  it('should return success false when user cancels the save dialog', async () => {
    vi.mocked(dialog.showSaveDialog).mockResolvedValue({
      canceled: true,
      filePath: ""
    });

    const result = await useCase.execute('base64', 'FOLIO');

    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toContain('cancelada');
  });

  it('should return success false if an exception is thrown', async () => {
    vi.mocked(dialog.showSaveDialog).mockRejectedValue(new Error('Permission denied'));

    const result = await useCase.execute('base64', 'FOLIO');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Permission denied');
  });
});