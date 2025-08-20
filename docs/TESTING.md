# Testing Guide

This project uses Jest as the testing framework with TypeScript support. Tests help ensure code quality and catch regressions as the project evolves.

## Test Setup

### Dependencies
- `jest` - Testing framework
- `@types/jest` - TypeScript types for Jest
- `ts-jest` - Jest transformer for TypeScript

### Configuration
Jest is configured in `jest.config.js` with the following settings:
- TypeScript support via `ts-jest` preset
- Test files located in `src`
- Coverage reporting enabled
- 10 second timeout for tests

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

### Test File Naming
Tests should follow these naming conventions:
- `__tests__/` directory for test files
- Files ending with `.test.ts` or `.spec.ts`
- Test files should be co-located with the code they test

## Writing Tests

### Test Structure
```typescript
import { functionToTest } from '../module';

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should handle normal case', () => {
      const result = functionToTest('input');
      expect(result).toBe('expected output');
    });

    it('should handle edge case', () => {
      const result = functionToTest('');
      expect(result).toBe('');
    });

    it('should throw error for invalid input', () => {
      expect(() => functionToTest(null)).toThrow('Invalid input');
    });
  });
});
```

### Testing Patterns

#### Unit Tests
Test individual functions in isolation:
```typescript
it('should parse valid JSON', () => {
  const input = '{"name": "test"}';
  const result = parseJSON(input);
  expect(result).toEqual({ name: 'test' });
});
```

#### Mocking
Use Jest mocks for external dependencies:
```typescript
jest.mock('fs');

const mockReadFileSync = require('fs').readFileSync;
mockReadFileSync.mockReturnValue('file content');
```

#### Error Testing
Test error conditions and edge cases:
```typescript
it('should handle file not found', () => {
  const error = new Error('ENOENT');
  (error as any).code = 'ENOENT';
  mockReadFileSync.mockImplementation(() => { throw error; });
  
  expect(() => readFile('/nonexistent')).toThrow('File not found');
});
```

### Test Coverage
The project aims for good test coverage. Current coverage:
- **Parsers**: ~26% (markdown parser well tested)
- **Generators**: ~3% (express-app generator tested)
- **Utils**: ~24% (filesystem utilities partially tested)

## Test Examples

### Markdown Parser Tests
Located in `src/parsers/__tests__/markdown.test.ts`
- Tests parsing of valid readerspec files
- Tests error handling for missing code blocks
- Tests JSON parsing errors
- Tests edge cases like empty blocks

### Express App Generator Tests
Located in `src/generators/__tests__/express-app.test.ts`
- Tests generation of Express.js applications
- Tests handling of multiple resources
- Tests middleware and route generation
- Tests package.json generation

### Filesystem Utility Tests
Located in `src/utils/__tests__/filesystem.test.ts`
- Tests file reading functionality
- Tests error handling for file operations
- Tests file path parsing

## Best Practices

1. **Test Organization**: Group related tests using `describe` blocks
2. **Test Names**: Use descriptive test names that explain the expected behavior
3. **Assertions**: Use specific assertions (`toBe`, `toEqual`, `toContain`) rather than generic ones
4. **Mocking**: Mock external dependencies to isolate the code under test
5. **Edge Cases**: Test error conditions, boundary values, and unexpected inputs
6. **Coverage**: Aim for high test coverage, especially for critical business logic

## Adding New Tests

When adding new functionality:

1. Create test files in the appropriate `__tests__` directory
2. Write tests before or alongside the implementation (TDD approach)
3. Ensure tests cover normal operation, edge cases, and error conditions
4. Run the test suite to ensure all tests pass
5. Check coverage to identify untested code paths

## Continuous Integration

Tests are automatically run in CI environments using:
```bash
npm run test:ci
```

This command:
- Runs all tests without watch mode
- Generates coverage reports
- Exits with non-zero code if tests fail
- Is suitable for automated build systems

## Troubleshooting

### Common Issues

**TypeScript Errors**: Ensure `@types/jest` is installed and Jest is configured for TypeScript
**Mock Not Working**: Check that mocks are set up before the function under test is called
**Coverage Issues**: Verify that test files are in the correct location and follow naming conventions

### Debugging Tests
- Use `console.log` in tests for debugging (will show in test output)
- Run individual test files: `npx jest path/to/test.ts`
- Use Jest's `--verbose` flag for more detailed output
- Check Jest configuration in `jest.config.js`
