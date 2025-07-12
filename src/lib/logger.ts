import { errorLoggingService } from "@/services/error-logging-service";

// Log severity levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogContext {
  component?: string;
  module?: string;
  userId?: string;
  organizationId?: string;
  route?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: number;
}

class Logger {
  private sessionId: string;
  private isDevelopment: boolean;
  private minLogLevel: LogLevel;

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.isDevelopment = import.meta.env.DEV;
    // Set minimum log level based on environment
    this.minLogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLogLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const component = entry.context?.component || 'Unknown';
    return `[${timestamp}] ${levelName} [${component}] ${entry.message}`;
  }

  private async persistError(entry: LogEntry): Promise<void> {
    if (entry.level >= LogLevel.ERROR && entry.context) {
      try {
        await errorLoggingService.logError({
          route: entry.context.route || window.location.pathname,
          error_message: entry.message,
          error_stack: entry.error?.stack,
          severity: entry.level === LogLevel.CRITICAL ? 'critical' : 'error',
          module_name: entry.context.module,
          component_name: entry.context.component,
          session_id: entry.context.sessionId || this.sessionId,
          metadata: {
            ...entry.context.metadata,
            logLevel: LogLevel[entry.level],
            timestamp: entry.timestamp
          }
        });
      } catch (err) {
        // Fallback to console if persistence fails
        console.error('Failed to persist error log:', err);
      }
    }
  }

  private async log(level: LogLevel, message: string, context?: LogContext, error?: Error): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context: {
        route: window.location.pathname,
        sessionId: this.sessionId,
        ...context
      },
      error,
      timestamp: Date.now()
    };

    // Console output for development and critical errors in production
    if (this.isDevelopment || level >= LogLevel.ERROR) {
      const formattedMessage = this.formatMessage(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, entry.context, error);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, entry.context);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, entry.context);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, entry.context, error);
          break;
        case LogLevel.CRITICAL:
          console.error(`🚨 CRITICAL: ${formattedMessage}`, entry.context, error);
          break;
      }
    }

    // Persist errors to database
    if (level >= LogLevel.ERROR) {
      await this.persistError(entry);
    }

    // TODO: Add external monitoring service integration (Sentry, LogRocket, etc.)
    // if (level >= LogLevel.ERROR && !this.isDevelopment) {
    //   await this.sendToExternalService(entry);
    // }
  }

  // Public logging methods
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  critical(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  // Specialized methods for common use cases
  authError(message: string, userId?: string, error?: Error): void {
    this.error(message, {
      module: 'authentication',
      userId,
      metadata: { authFlow: true }
    }, error);
  }

  navigationDebug(message: string, context?: Record<string, any>): void {
    this.debug(message, {
      module: 'navigation',
      metadata: context
    });
  }

  apiError(message: string, endpoint: string, error?: Error): void {
    this.error(message, {
      module: 'api',
      metadata: { endpoint }
    }, error);
  }

  performanceWarn(message: string, metrics?: Record<string, number>): void {
    this.warn(message, {
      module: 'performance',
      metadata: metrics
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Migration helpers for gradual replacement
export const loggerMigration = {
  // Replace console.error with structured error logging
  replaceConsoleError: (message: string, context?: LogContext, error?: Error) => {
    // TODO: Remove console.error calls and replace with logger.error
    logger.error(message, context, error);
  },
  
  // Replace console.log debug statements
  replaceConsoleLog: (message: string, context?: LogContext) => {
    // TODO: Remove console.log calls and replace with logger.debug/info
    logger.debug(message, context);
  },
  
  // Replace console.warn
  replaceConsoleWarn: (message: string, context?: LogContext) => {
    // TODO: Remove console.warn calls and replace with logger.warn
    logger.warn(message, context);
  }
};