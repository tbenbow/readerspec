import { LoggerService, log } from '../logger';
import { Timer } from '../timer';

// Mock winston to avoid actual file I/O in tests
jest.mock('winston', () => {
  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    child: jest.fn().mockReturnThis(),
    level: 'info',
    transports: [{ level: 'info' }, { level: 'error' }],
  };

  return {
    createLogger: jest.fn(() => mockLogger),
    addColors: jest.fn(),
    transports: {
      Console: jest.fn(),
    },
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      colorize: jest.fn(),
      printf: jest.fn(),
      errors: jest.fn(),
      json: jest.fn(),
    },
  };
});

// Get the mock logger instance
const winston = require('winston');
const mockLogger = winston.createLogger();

jest.mock('winston-daily-rotate-file', () => {
  return jest.fn();
});

describe('LoggerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock functions
    Object.values(mockLogger).forEach((fn: any) => {
      if (typeof fn === 'function' && fn.mockClear) {
        fn.mockClear();
      }
    });
  });

  describe('LoggerService class', () => {
    it('should create logger with default configuration', () => {
      const logger = new LoggerService();
      expect(winston.createLogger).toHaveBeenCalled();
      expect(logger.getConfig()).toEqual({
        level: 'info',
        enableConsole: true,
        enableFile: true,
        logDir: 'logs',
        maxFiles: 14,
        maxSize: '20m',
      });
    });

    it('should create logger with custom configuration', () => {
      const config = {
        level: 'debug',
        enableConsole: false,
        enableFile: true,
        logDir: 'custom-logs',
        maxFiles: 7,
        maxSize: '10m',
      };

      const logger = new LoggerService(config);
      expect(logger.getConfig()).toEqual(config);
    });

    it('should log messages at different levels', () => {
      const logger = new LoggerService();

      logger.error('Test error', { context: 'test' });
      logger.warn('Test warning');
      logger.info('Test info');
      logger.debug('Test debug');
      logger.verbose('Test verbose');

      expect(mockLogger.error).toHaveBeenCalledWith('Test error', {
        context: 'test',
      });
      expect(mockLogger.warn).toHaveBeenCalledWith('Test warning', undefined);
      expect(mockLogger.info).toHaveBeenCalledWith('Test info', undefined);
      expect(mockLogger.debug).toHaveBeenCalledWith('Test debug', undefined);
      expect(mockLogger.verbose).toHaveBeenCalledWith(
        'Test verbose',
        undefined
      );
    });

    it('should log command operations', () => {
      const logger = new LoggerService();

      logger.command('build', { specs: 'specs/', output: 'apps/api' });
      logger.commandComplete('build', 1500);
      logger.commandError('build', new Error('Build failed'));

      expect(mockLogger.info).toHaveBeenCalledWith('Executing command: build', {
        command: 'build',
        args: { specs: 'specs/', output: 'apps/api' },
      });
      expect(mockLogger.info).toHaveBeenCalledWith('Command completed: build', {
        command: 'build',
        duration: '1500ms',
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Command failed: build', {
        command: 'build',
        error: 'Build failed',
        stack: expect.any(String),
      });
    });

    it('should log file operations', () => {
      const logger = new LoggerService();

      logger.fileOperation('read', '/path/to/file.ts', { size: 1024 });

      expect(mockLogger.debug).toHaveBeenCalledWith('File operation: read', {
        operation: 'read',
        filePath: '/path/to/file.ts',
        size: 1024,
      });
    });

    it('should log generation operations', () => {
      const logger = new LoggerService();

      logger.generation('express-app', 'server.ts', { resources: 3 });

      expect(mockLogger.info).toHaveBeenCalledWith('Generated: express-app', {
        generator: 'express-app',
        output: 'server.ts',
        resources: 3,
      });
    });

    it('should log performance metrics', () => {
      const logger = new LoggerService();

      logger.performance('build-command', 2500, { files: 15 });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Performance: build-command took 2500ms',
        {
          operation: 'build-command',
          duration: 2500,
          files: 15,
        }
      );
    });

    it('should change log level dynamically', () => {
      const logger = new LoggerService();

      logger.setLevel('debug');

      expect(mockLogger.level).toBe('debug');
      expect(mockLogger.transports[0].level).toBe('debug');
      expect(mockLogger.transports[1].level).toBe('debug');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Log level changed to: debug',
        undefined
      );
    });

    it('should create child logger', () => {
      const logger = new LoggerService();
      const context = { module: 'test' };

      logger.child(context);

      expect(mockLogger.child).toHaveBeenCalledWith(context);
    });

    it('should return underlying winston logger', () => {
      const logger = new LoggerService();

      const underlyingLogger = logger.getLogger();

      expect(underlyingLogger).toBe(mockLogger);
    });
  });

  describe('Default logger exports', () => {
    it('should use default logger instance for log functions', () => {
      log.error('Test error');
      log.warn('Test warning');
      log.info('Test info');
      log.debug('Test debug');
      log.verbose('Test verbose');

      expect(mockLogger.error).toHaveBeenCalledWith('Test error', undefined);
      expect(mockLogger.warn).toHaveBeenCalledWith('Test warning', undefined);
      expect(mockLogger.info).toHaveBeenCalledWith('Test info', undefined);
      expect(mockLogger.debug).toHaveBeenCalledWith('Test debug', undefined);
      expect(mockLogger.verbose).toHaveBeenCalledWith(
        'Test verbose',
        undefined
      );
    });

    it('should use default logger for convenience methods', () => {
      log.command('test-command', { arg: 'value' });
      log.commandComplete('test-command', 1000);
      log.commandError('test-command', new Error('Test error'));
      log.fileOperation('write', '/test/file.ts');
      log.generation('generator', 'output.ts');
      log.performance('operation', 500);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Executing command: test-command',
        {
          command: 'test-command',
          args: { arg: 'value' },
        }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Command completed: test-command',
        {
          command: 'test-command',
          duration: '1000ms',
        }
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Command failed: test-command',
        {
          command: 'test-command',
          error: 'Test error',
          stack: expect.any(String),
        }
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('File operation: write', {
        operation: 'write',
        filePath: '/test/file.ts',
      });
      expect(mockLogger.info).toHaveBeenCalledWith('Generated: generator', {
        generator: 'generator',
        output: 'output.ts',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Performance: operation took 500ms',
        {
          operation: 'operation',
          duration: 500,
        }
      );
    });
  });
});

describe('Timer', () => {
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now for consistent timing
    dateNowSpy = jest.spyOn(Date, 'now');
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it('should measure operation time', () => {
    dateNowSpy
      .mockReturnValueOnce(1000) // start time
      .mockReturnValueOnce(1500); // stop time

    const timer = new Timer('test-operation', { context: 'test' });
    const duration = timer.stop();

    expect(duration).toBe(500);
    // Timer uses the default logger instance, so we check the mockLogger calls
    expect(mockLogger.debug).toHaveBeenCalledWith('Started: test-operation', {
      context: 'test',
    });
    expect(mockLogger.debug).toHaveBeenCalledWith(
      'Performance: test-operation took 500ms',
      {
        operation: 'test-operation',
        duration: 500,
        context: 'test',
      }
    );
  });

  it('should calculate elapsed time without stopping', () => {
    dateNowSpy
      .mockReturnValueOnce(1000) // start
      .mockReturnValueOnce(1300); // elapsed check

    const timer = new Timer('test-operation');
    const elapsed = timer.elapsed();

    expect(elapsed).toBe(300);
  });

  it('should log checkpoints', () => {
    dateNowSpy
      .mockReturnValueOnce(1000) // start
      .mockReturnValueOnce(1200); // checkpoint

    const timer = new Timer('test-operation', { context: 'test' });
    const elapsed = timer.checkpoint('halfway done');

    expect(elapsed).toBe(200);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      'test-operation - halfway done',
      {
        elapsed: 200,
        context: 'test',
      }
    );
  });
});
