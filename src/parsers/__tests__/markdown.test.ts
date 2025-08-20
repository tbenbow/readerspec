import { parseReaderSpecFile, extractAllSpecs, ParsedSpec } from '../markdown';

describe('parseReaderSpecFile', () => {
  it('should parse a valid readerspec file', () => {
    const content = `# API Specification

This is a sample API spec.

\`\`\`readerspec
{
  "name": "Test API",
  "version": "1.0.0",
  "endpoints": [
    {
      "path": "/api/test",
      "method": "GET",
      "description": "Test endpoint"
    }
  ]
}
\`\`\`

More content here.`;

    const result = parseReaderSpecFile(content);

    expect(result.content).toBe(content);
    expect(result.errors).toHaveLength(0);
    expect(result.jsonBlock).toEqual({
      name: 'Test API',
      version: '1.0.0',
      endpoints: [
        {
          path: '/api/test',
          method: 'GET',
          description: 'Test endpoint',
        },
      ],
    });
  });

  it('should handle missing readerspec code block', () => {
    const content = `# API Specification

This is a regular markdown file without any readerspec blocks.`;

    const result = parseReaderSpecFile(content);

    expect(result.content).toBe(content);
    expect(result.jsonBlock).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toBe('No ```readerspec code block found');
  });

  it('should handle invalid JSON in readerspec block', () => {
    const content = `# API Specification

\`\`\`readerspec
{
  "name": "Test API",
  "version": "1.0.0",
  "endpoints": [
    {
      "path": "/api/test",
      "method": "GET",
      "description": "Test endpoint"
    }
  ]
\`\`\`

Missing closing brace.`;

    const result = parseReaderSpecFile(content);

    expect(result.content).toBe(content);
    expect(result.jsonBlock).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('JSON parse error');
  });

  it('should handle empty readerspec block', () => {
    const content = `# API Specification

\`\`\`readerspec

\`\`\`

Empty block.`;

    const result = parseReaderSpecFile(content);

    expect(result.content).toBe(content);
    expect(result.jsonBlock).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('JSON parse error');
  });

  it('should handle whitespace around the readerspec block', () => {
    const content = `# API Specification

\`\`\`readerspec
  {
    "name": "Test API"
  }
\`\`\`

With whitespace.`;

    const result = parseReaderSpecFile(content);

    expect(result.content).toBe(content);
    expect(result.errors).toHaveLength(0);
    expect(result.jsonBlock).toEqual({
      name: 'Test API',
    });
  });
});

describe('extractAllSpecs', () => {
  it('should extract specs from multiple files', () => {
    const files = [
      `# File 1
\`\`\`readerspec
{"name": "API 1"}
\`\`\``,
      `# File 2
\`\`\`readerspec
{"name": "API 2"}
\`\`\``,
    ];

    const results = extractAllSpecs(files);

    expect(results).toHaveLength(2);
    expect(results[0].file).toBe(files[0]);
    expect(results[0].spec.jsonBlock).toEqual({ name: 'API 1' });
    expect(results[1].file).toBe(files[1]);
    expect(results[1].spec.jsonBlock).toEqual({ name: 'API 2' });
  });

  it('should handle empty file array', () => {
    const results = extractAllSpecs([]);
    expect(results).toHaveLength(0);
  });
});
