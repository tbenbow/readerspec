import { log } from './logger';

/**
 * Performance timer utility for measuring execution times
 */
export class Timer {
  private startTime: number;
  private operation: string;
  private metadata?: Record<string, any>;

  constructor(operation: string, metadata?: Record<string, any>) {
    this.operation = operation;
    this.metadata = metadata;
    this.startTime = Date.now();
    log.debug(`Started: ${operation}`, metadata);
  }

  /**
   * Stop the timer and log the duration
   */
  stop(): number {
    const duration = Date.now() - this.startTime;
    log.performance(this.operation, duration, this.metadata);
    return duration;
  }

  /**
   * Get elapsed time without stopping the timer
   */
  elapsed(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Log an intermediate checkpoint
   */
  checkpoint(message: string): number {
    const elapsed = this.elapsed();
    log.debug(`${this.operation} - ${message}`, { elapsed, ...this.metadata });
    return elapsed;
  }
}

/**
 * Decorator function to automatically time async functions
 */
export function timed(operation?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const operationName =
      operation || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const timer = new Timer(operationName, { args: args.length });
      try {
        const result = await originalMethod.apply(this, args);
        timer.stop();
        return result;
      } catch (error) {
        timer.stop();
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Utility function to time any async operation
 */
export async function timeAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const timer = new Timer(operation, metadata);
  try {
    const result = await fn();
    timer.stop();
    return result;
  } catch (error) {
    timer.stop();
    throw error;
  }
}

/**
 * Utility function to time any synchronous operation
 */
export function timeSync<T>(
  operation: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const timer = new Timer(operation, metadata);
  try {
    const result = fn();
    timer.stop();
    return result;
  } catch (error) {
    timer.stop();
    throw error;
  }
}
