/**
 * Production-safe logging utility
 * Reduces sensitive information disclosure in production environments
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class ProductionSafeLogger {
  private isProduction = process.env.NODE_ENV === 'production';
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // In production, remove sensitive fields
    if (this.isProduction) {
      const sensitiveFields = [
        'password',
        'token',
        'apiKey',
        'secret',
        'auth',
        'session',
        'key',
        'email',
        'phone',
        'ssn',
        'userId',
        'organizationId'
      ];
      
      const sanitized = JSON.parse(JSON.stringify(data));
      
      const removeSensitiveFields = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        if (Array.isArray(obj)) {
          return obj.map(removeSensitiveFields);
        }
        
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            result[key] = '[REDACTED]';
          } else {
            result[key] = removeSensitiveFields(value);
          }
        }
        return result;
      };
      
      return removeSensitiveFields(sanitized);
    }
    
    return data;
  }
  
  private formatLogEntry(entry: LogEntry): string {
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
    const contextStr = entry.context ? ` [${entry.context}]` : '';
    const dataStr = entry.data ? ` - ${JSON.stringify(entry.data)}` : '';
    
    return `${prefix}${contextStr}: ${entry.message}${dataStr}`;
  }
  
  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log errors and warnings
    if (this.isProduction) {
      return level === 'error' || level === 'warn';
    }
    
    return true;
  }
  
  error(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('error')) return;
    
    const entry: LogEntry = {
      level: 'error',
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
      context
    };
    
    console.error(this.formatLogEntry(entry));
  }
  
  warn(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('warn')) return;
    
    const entry: LogEntry = {
      level: 'warn',
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
      context
    };
    
    console.warn(this.formatLogEntry(entry));
  }
  
  info(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('info')) return;
    
    const entry: LogEntry = {
      level: 'info',
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
      context
    };
    
    console.info(this.formatLogEntry(entry));
  }
  
  debug(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('debug')) return;
    
    const entry: LogEntry = {
      level: 'debug',
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
      context
    };
    
    console.debug(this.formatLogEntry(entry));
  }
  
  // Security-focused logging methods
  logSecurityEvent(event: string, data?: any, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    const sanitizedData = this.sanitizeData(data);
    
    const securityEntry: LogEntry = {
      level: severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info',
      message: `Security Event: ${event}`,
      data: {
        ...sanitizedData,
        securityEvent: true,
        severity
      },
      timestamp: new Date().toISOString(),
      context: 'SECURITY'
    };
    
    // Always log security events regardless of environment
    console.log(this.formatLogEntry(securityEntry));
  }
  
  logAuthenticationEvent(event: string, userId?: string, success: boolean = true): void {
    const data = {
      event,
      userId: this.isProduction ? '[REDACTED]' : userId,
      success,
      timestamp: new Date().toISOString(),
      userAgent: this.isDevelopment ? navigator.userAgent : '[REDACTED]'
    };
    
    this.logSecurityEvent(`Authentication: ${event}`, data, success ? 'low' : 'medium');
  }
  
  logDataAccess(resource: string, action: string, userId?: string): void {
    const data = {
      resource,
      action,
      userId: this.isProduction ? '[REDACTED]' : userId,
      timestamp: new Date().toISOString()
    };
    
    this.logSecurityEvent(`Data Access: ${action} on ${resource}`, data, 'low');
  }
}

// Create singleton instance
export const logger = new ProductionSafeLogger();

// Export convenience methods
export const logError = (message: string, data?: any, context?: string) => logger.error(message, data, context);
export const logWarn = (message: string, data?: any, context?: string) => logger.warn(message, data, context);
export const logInfo = (message: string, data?: any, context?: string) => logger.info(message, data, context);
export const logDebug = (message: string, data?: any, context?: string) => logger.debug(message, data, context);
export const logSecurityEvent = (event: string, data?: any, severity?: 'low' | 'medium' | 'high') => logger.logSecurityEvent(event, data, severity);
export const logAuthenticationEvent = (event: string, userId?: string, success?: boolean) => logger.logAuthenticationEvent(event, userId, success);
export const logDataAccess = (resource: string, action: string, userId?: string) => logger.logDataAccess(resource, action, userId);