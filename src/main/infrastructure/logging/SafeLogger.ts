type LogContext = Record<string, unknown>;

const SENSITIVE_KEYS = [
  'password',
  'password_hash',
  'email',
  'rfc',
  'clientName',
  'clientRfc',
  'contactName',
  'contactPhone',
  'contactEmail',
  'fullName',
  'firstName',
  'lastName',
  'maternalLastName',
  'address'
];

export interface ILogger {
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

export class SafeLogger implements ILogger {
  warn(message: string, context: LogContext = {}): void {
    console.warn(message, this.sanitize(context));
  }

  error(message: string, context: LogContext = {}): void {
    console.error(message, this.sanitize(context));
  }

  private sanitize(value: unknown): unknown {
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map((item) => this.sanitize(item));

    return Object.entries(value as LogContext).reduce<LogContext>((safeContext, [key, entryValue]) => {
      if (SENSITIVE_KEYS.includes(key)) {
        safeContext[key] = '[redacted]';
        return safeContext;
      }

      safeContext[key] = this.sanitize(entryValue);
      return safeContext;
    }, {});
  }
}

export const logger = new SafeLogger();
