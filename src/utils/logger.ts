import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

// Define log levels with priorities
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4,
};

// Define colors for different log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  verbose: 'cyan',
};

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuration interface
export interface LoggerConfig {
  level?: string;
  enableConsole?: boolean;
  enableFile?: boolean;
  logDir?: string;
  maxFiles?: number;
  maxSize?: string;
}

class LoggerService {
  private logger: winston.Logger;
  private config: LoggerConfig;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: process.env.LOG_LEVEL || 'info',
      enableConsole: true,
      enableFile: true,
      logDir: process.env.LOG_DIR || 'logs',
      maxFiles: 14, // Keep 2 weeks of logs
      maxSize: '20m', // Max 20MB per file
      ...config,
    };

    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    // Add colors to winston
    winston.addColors(logColors);

    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          level: this.config.level,
          format: consoleFormat,
          handleExceptions: true,
          handleRejections: true,
        })
      );
    }

    // File transports
    if (this.config.enableFile) {
      // General application logs with rotation
      transports.push(
        new DailyRotateFile({
          filename: join(this.config.logDir!, 'app-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: this.config.level,
          format: fileFormat,
          maxFiles: this.config.maxFiles,
          maxSize: this.config.maxSize,
          handleExceptions: true,
          handleRejections: true,
        })
      );

      // Error-only logs
      transports.push(
        new DailyRotateFile({
          filename: join(this.config.logDir!, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: fileFormat,
          maxFiles: this.config.maxFiles,
          maxSize: this.config.maxSize,
        })
      );
    }

    return winston.createLogger({
      levels: logLevels,
      level: this.config.level,
      transports,
      exitOnError: false,
    });
  }

  // Core logging methods
  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }

  // Convenience methods for common scenarios
  command(commandName: string, args?: any): void {
    this.info(`Executing command: ${commandName}`, {
      command: commandName,
      args,
    });
  }

  commandComplete(commandName: string, duration?: number): void {
    this.info(`Command completed: ${commandName}`, {
      command: commandName,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  commandError(commandName: string, error: Error): void {
    this.error(`Command failed: ${commandName}`, {
      command: commandName,
      error: error.message,
      stack: error.stack,
    });
  }

  fileOperation(operation: string, filePath: string, details?: any): void {
    this.debug(`File operation: ${operation}`, {
      operation,
      filePath,
      ...details,
    });
  }

  generation(generatorName: string, output: string, details?: any): void {
    this.info(`Generated: ${generatorName}`, {
      generator: generatorName,
      output,
      ...details,
    });
  }

  performance(operation: string, duration: number, details?: any): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...details,
    });
  }

  // Create child logger with additional context
  child(context: Record<string, any>): winston.Logger {
    return this.logger.child(context);
  }

  // Get the underlying winston logger for advanced usage
  getLogger(): winston.Logger {
    return this.logger;
  }

  // Update log level at runtime
  setLevel(level: string): void {
    this.config.level = level;
    this.logger.level = level;
    this.logger.transports.forEach((transport) => {
      transport.level = level;
    });
    this.info(`Log level changed to: ${level}`);
  }

  // Get current configuration
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Create singleton instance
const defaultLogger = new LoggerService();

// Export singleton instance and class
export { LoggerService };
export default defaultLogger;

// Export convenience functions that use the default logger
export const log = {
  error: (message: string, meta?: any) => defaultLogger.error(message, meta),
  warn: (message: string, meta?: any) => defaultLogger.warn(message, meta),
  info: (message: string, meta?: any) => defaultLogger.info(message, meta),
  debug: (message: string, meta?: any) => defaultLogger.debug(message, meta),
  verbose: (message: string, meta?: any) =>
    defaultLogger.verbose(message, meta),
  command: (commandName: string, args?: any) =>
    defaultLogger.command(commandName, args),
  commandComplete: (commandName: string, duration?: number) =>
    defaultLogger.commandComplete(commandName, duration),
  commandError: (commandName: string, error: Error) =>
    defaultLogger.commandError(commandName, error),
  fileOperation: (operation: string, filePath: string, details?: any) =>
    defaultLogger.fileOperation(operation, filePath, details),
  generation: (generatorName: string, output: string, details?: any) =>
    defaultLogger.generation(generatorName, output, details),
  performance: (operation: string, duration: number, details?: any) =>
    defaultLogger.performance(operation, duration, details),
};
