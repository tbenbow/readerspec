#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { checkCommand } from './commands/check';
import { buildCommand } from './commands/build';
import { devCommand } from './commands/dev';
import { translateCommand } from './commands/translate';

const program = new Command();

program
  .name('readerspec')
  .description(
    'Generate Express.js APIs from human-readable markdown specifications'
  )
  .version('1.0.0');

program
  .command('check')
  .description('Validate .readerspec.md files against schema')
  .option('-v, --verbose', 'Show detailed validation output')
  .action(checkCommand);

program
  .command('build')
  .description('Generate Express routes + Zod validators + OpenAPI file')
  .option('-s, --specs <path>', 'Path to specs directory', 'specs/')
  .option(
    '-o, --output <dir>',
    'Output directory for generated code',
    'apps/api'
  )
  .option('-f, --force', 'Overwrite existing generated files')
  .action(buildCommand);

program
  .command('dev')
  .description('Watch specs/ and rebuild on change')
  .option('-s, --specs <path>', 'Path to specs directory', 'specs/')
  .option(
    '-o, --output <dir>',
    'Output directory for generated code',
    'apps/api'
  )
  .option('-p, --port <port>', 'Port for the development server', '3000')
  .option('--open', 'Open browser automatically')
  .action(devCommand);

program
  .command('translate')
  .description('Translate human-readable text to JSON using AI')
  .option('-f, --file <path>', 'Specific file to translate')
  .option('-w, --watch', 'Watch for file changes and auto-translate')
  .option(
    '-k, --api-key <key>',
    'OpenAI API key (or set OPENAI_API_KEY env var)'
  )
  .option('-m, --model <model>', 'OpenAI model to use', 'gpt-4o-mini')
  .action(translateCommand);

program.parse();
