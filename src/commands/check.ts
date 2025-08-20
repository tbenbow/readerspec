import { CommandOptions } from '../types';
import { readAllSpecFiles } from '../utils/filesystem';
import { parseReaderSpecFile } from '../parsers/markdown';
import { validateReaderSpec } from '../validators/schema';
import { log } from '../utils/logger';
import { Timer } from '../utils/timer';

export async function checkCommand(options: CommandOptions): Promise<void> {
  const timer = new Timer('check-command');
  const { specs = 'specs/' } = options;

  log.command('check', { specs });
  log.info(`🔍 Checking specs in: ${specs}`);

  try {
    // Read all spec files
    log.debug('Reading spec files');
    const specFiles = readAllSpecFiles(specs);
    log.fileOperation('read-specs', specs, { count: specFiles.length });

    if (specFiles.length === 0) {
      log.warn('⚠️  No .readerspec.md files found');
      timer.stop();
      return;
    }

    log.info(`📁 Found ${specFiles.length} spec file(s)`);

    let totalErrors = 0;
    let validSpecs = 0;

    // Validate each spec file
    for (const specFile of specFiles) {
      log.info(`📄 Checking ${specFile.name}...`);

      // Parse the markdown file
      const parsed = parseReaderSpecFile(specFile.content);

      if (parsed.errors.length > 0) {
        log.error(`Parse errors in ${specFile.name}:`, {
          file: specFile.name,
          errors: parsed.errors,
        });
        parsed.errors.forEach((error) => {
          log.error(`   - ${error}`);
        });
        totalErrors += parsed.errors.length;
        continue;
      }

      if (!parsed.jsonBlock) {
        log.error(`No valid JSON block found in ${specFile.name}`, {
          file: specFile.name,
        });
        totalErrors += 1;
        continue;
      }

      // Validate the JSON block
      const validation = validateReaderSpec(parsed.jsonBlock);

      if (validation.isValid) {
        log.info(`✅ ${specFile.name} is valid`, { file: specFile.name });

        // Show warnings if any
        if (validation.warnings && validation.warnings.length > 0) {
          log.warn(`⚠️  Warnings for ${specFile.name}:`);
          validation.warnings.forEach((warning) => {
            log.warn(`   - ${warning}`);
          });
        }

        validSpecs += 1;
      } else {
        log.error(`❌ Validation errors in ${specFile.name}:`, {
          file: specFile.name,
          errors: validation.errors,
        });
        validation.errors.forEach((error) => {
          log.error(`   - ${error}`);
        });

        // Show suggestions if any
        if (validation.suggestions && validation.suggestions.length > 0) {
          log.info(`💡 Suggestions for ${specFile.name}:`);
          validation.suggestions.forEach((suggestion) => {
            log.info(`   - ${suggestion}`);
          });
        }

        totalErrors += validation.errors.length;
      }
    }

    log.info(`📊 Summary:`, { validSpecs, totalErrors });
    log.info(`   Valid specs: ${validSpecs}`);
    log.info(`   Total errors: ${totalErrors}`);

    if (totalErrors === 0) {
      log.info(`✅ All specs are valid`);
    } else {
      log.error(`Validation failed with ${totalErrors} error(s)`, {
        totalErrors,
      });
      timer.stop();
      process.exit(1);
    }

    const duration = timer.stop();
    log.commandComplete('check', duration);
  } catch (error) {
    const duration = timer.stop();
    log.commandError(
      'check',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}
