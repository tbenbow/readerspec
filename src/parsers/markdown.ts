import { ReaderSpec } from '../types';

export interface ParsedSpec {
  content: string;
  jsonBlock: ReaderSpec | null;
  errors: string[];
}

export function parseReaderSpecFile(content: string): ParsedSpec {
  const errors: string[] = [];
  let jsonBlock: ReaderSpec | null = null;

  // Look for the ```readerspec code block
  const codeBlockRegex = /```readerspec\s*\n([\s\S]*?)\n```/;
  const match = content.match(codeBlockRegex);

  if (!match) {
    errors.push('No ```readerspec code block found');
    return { content, jsonBlock: null, errors };
  }

  const jsonString = match[1].trim();

  try {
    const parsed = JSON.parse(jsonString);
    jsonBlock = parsed as ReaderSpec;
  } catch (parseError) {
    if (parseError instanceof Error) {
      errors.push(`JSON parse error: ${parseError.message}`);
    } else {
      errors.push('Unknown JSON parse error');
    }
  }

  return { content, jsonBlock, errors };
}

export function extractAllSpecs(
  files: string[]
): Array<{ file: string; spec: ParsedSpec }> {
  return files.map((file) => ({
    file,
    spec: parseReaderSpecFile(file),
  }));
}
