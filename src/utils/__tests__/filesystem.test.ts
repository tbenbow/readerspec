import { readSpecFile, SpecFile } from '../filesystem';

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

const mockReadFileSync = require('fs').readFileSync;

describe('filesystem utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readSpecFile', () => {
    it('should read and parse spec file correctly', () => {
      const filePath = '/test/sample.readerspec.md';
      const content = '# Sample API\n```readerspec\n{"name": "Test"}\n```';

      mockReadFileSync.mockReturnValue(content);

      const result = readSpecFile(filePath);

      expect(result).toEqual({
        path: filePath,
        content,
        name: 'sample',
      });
      expect(mockReadFileSync).toHaveBeenCalledWith(filePath, 'utf-8');
    });

    it('should handle file not found error', () => {
      const filePath = '/test/missing.readerspec.md';
      const error = new Error('ENOENT');
      (error as any).code = 'ENOENT';
      mockReadFileSync.mockImplementation(() => {
        throw error;
      });

      expect(() => readSpecFile(filePath)).toThrow(
        'File not found: /test/missing.readerspec.md'
      );
    });

    it('should handle other file reading errors', () => {
      const filePath = '/test/error.readerspec.md';
      const error = new Error('Permission denied');
      mockReadFileSync.mockImplementation(() => {
        throw error;
      });

      expect(() => readSpecFile(filePath)).toThrow(
        'Error reading file /test/error.readerspec.md: Permission denied'
      );
    });

    it('should handle file path without .readerspec.md extension', () => {
      const filePath = '/test/weird-name';
      const content = '# Content';

      mockReadFileSync.mockReturnValue(content);

      const result = readSpecFile(filePath);

      expect(result.name).toBe('weird-name');
    });
  });
});
