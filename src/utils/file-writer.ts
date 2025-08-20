import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

export interface GeneratedFile {
  filename: string;
  content: string;
}

export function writeGeneratedFiles(
  outputDir: string,
  files: GeneratedFile[]
): void {
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Create subdirectories
  const subdirs = ['routes', 'services', 'validation', 'query-processors'];
  subdirs.forEach((subdir) => {
    const subdirPath = join(outputDir, subdir);
    if (!existsSync(subdirPath)) {
      mkdirSync(subdirPath, { recursive: true });
    }
  });

  // Write all files
  files.forEach((file) => {
    const filePath = join(outputDir, file.filename);
    const fileDir = dirname(filePath);

    // Ensure directory exists
    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, { recursive: true });
    }

    writeFileSync(filePath, file.content, 'utf-8');
    console.log(`📝 Generated: ${file.filename}`);
  });
}

export function generateTsConfig(outputDir: string): void {
  const tsConfigContent = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true
  },
  "include": [
    "**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}`;

  const tsConfigPath = join(outputDir, 'tsconfig.json');
  writeFileSync(tsConfigPath, tsConfigContent, 'utf-8');
  console.log(`📝 Generated: tsconfig.json`);
}
