import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export interface SpecFile {
  path: string;
  content: string;
  name: string;
}

function scanDirectory(dir: string, files: string[]): void {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, files);
    } else if (item.endsWith('.readerspec.md')) {
      files.push(fullPath);
    }
  }
}

export function findReaderSpecFiles(specsDir: string): string[] {
  try {
    const files: string[] = [];
    scanDirectory(specsDir, files);
    return files;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Specs directory not found: ${specsDir}`);
    }
    throw error;
  }
}

export function readSpecFile(filePath: string): SpecFile {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const name =
      filePath.split('/').pop()?.replace('.readerspec.md', '') || 'unknown';

    return {
      path: filePath,
      content,
      name,
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(
      `Error reading file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function readAllSpecFiles(specsDir: string): SpecFile[] {
  const filePaths = findReaderSpecFiles(specsDir);
  return filePaths.map(readSpecFile);
}
