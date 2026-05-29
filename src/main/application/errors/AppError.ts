export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'INVALID_STATUS_TRANSITION'
  | 'DATABASE_ERROR'
  | 'PDF_GENERATION_ERROR'
  | 'CATALOG_ERROR'
  | 'IPC_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;
