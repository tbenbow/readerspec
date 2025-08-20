import { CommandOptions } from '../types';
import { readAllSpecFiles } from '../utils/filesystem';
import { parseReaderSpecFile } from '../parsers/markdown';
import { validateReaderSpec } from '../validators/schema';
import { generateAllRoutes } from '../generators/express-routes';
import { generateAllServices } from '../generators/service';
import {
  generateExpressApp,
  generatePackageJson,
  generateJestConfig,
  generateTestSetup,
} from '../generators/express-app';
import { generateAllValidationSchemas } from '../generators/validation-schemas';
import { generateAllQueryProcessors } from '../generators/query-processor';
import { generateAllOpenAPI } from '../generators/openapi';
import { generateAllMarkdownDocs } from '../generators/markdown-docs';
import { generateAllTypeScriptTypes } from '../generators/typescript-types';
import { generateAllPostmanCollections } from '../generators/postman-collection';
import { writeGeneratedFiles, generateTsConfig } from '../utils/file-writer';
import { log } from '../utils/logger';
import { Timer } from '../utils/timer';

export async function buildCommand(options: CommandOptions): Promise<void> {
  const timer = new Timer('build-command');
  const { specs = 'specs/', output = 'apps/api' } = options;

  log.command('build', { specs, output });
  log.info(`🔨 Building API from specs in: ${specs}`);
  log.info(`📁 Output directory: ${output}`);

  try {
    // Read and validate all spec files
    log.debug('Reading spec files');
    const specFiles = readAllSpecFiles(specs);
    log.fileOperation('read-specs', specs, { count: specFiles.length });

    if (specFiles.length === 0) {
      log.warn('⚠️  No .readerspec.md files found');
      timer.stop();
      return;
    }

    log.info(`📁 Found ${specFiles.length} spec file(s)`);

    const validSpecs = [];
    let totalErrors = 0;

    // Parse and validate each spec
    for (const specFile of specFiles) {
      log.info(`📄 Processing ${specFile.name}...`);

      const parsed = parseReaderSpecFile(specFile.content);

      if (parsed.errors.length > 0) {
        log.error(`❌ Parse errors in ${specFile.name}:`, {
          file: specFile.name,
          errors: parsed.errors,
        });
        parsed.errors.forEach((error) => log.error(`   - ${error}`));
        totalErrors += parsed.errors.length;
        continue;
      }

      if (!parsed.jsonBlock) {
        log.error(`❌ No valid JSON block found in ${specFile.name}`, {
          file: specFile.name,
        });
        totalErrors += 1;
        continue;
      }

      const validation = validateReaderSpec(parsed.jsonBlock);

      if (!validation.isValid) {
        log.error(`❌ Validation errors in ${specFile.name}:`, {
          file: specFile.name,
          errors: validation.errors,
        });
        validation.errors.forEach((error) => log.error(`   - ${error}`));
        totalErrors += validation.errors.length;
        continue;
      }

      validSpecs.push(parsed.jsonBlock);
      log.info(`✅ ${specFile.name} validated successfully`, {
        file: specFile.name,
      });
    }

    if (totalErrors > 0) {
      log.error(`Build failed: ${totalErrors} validation error(s)`, {
        totalErrors,
        validSpecs: validSpecs.length,
      });
      timer.stop();
      process.exit(1);
    }

    if (validSpecs.length === 0) {
      log.error('No valid specs found to generate API');
      timer.stop();
      process.exit(1);
    }

    log.info(`🏗️  Generating API for ${validSpecs.length} resource(s)...`, {
      resourceCount: validSpecs.length,
    });

    // Generate all the code
    timer.checkpoint('Starting code generation');

    log.debug('Generating routes');
    const routes = generateAllRoutes(validSpecs);
    log.generation('routes', `${routes.length} route files`);

    log.debug('Generating services');
    const services = generateAllServices(validSpecs);
    log.generation('services', `${services.length} service files`);

    log.debug('Generating validation schemas');
    const validationSchemas = generateAllValidationSchemas(validSpecs);
    log.generation(
      'validation-schemas',
      `${validationSchemas.length} schema files`
    );

    log.debug('Generating query processors');
    const queryProcessors = generateAllQueryProcessors(validSpecs);
    log.generation(
      'query-processors',
      `${queryProcessors.length} processor files`
    );

    log.debug('Generating Express app');
    const app = generateExpressApp(validSpecs);
    const packageJson = generatePackageJson();
    const jestConfig = generateJestConfig();
    const testSetup = generateTestSetup();
    log.generation('app-structure', 'Express app, package.json, Jest config');

    timer.checkpoint('Core generation complete');

    // Generate documentation
    log.debug('Generating documentation');
    const openapi = generateAllOpenAPI(validSpecs);
    log.generation('openapi', `${openapi.length} OpenAPI files`);

    const markdownDocs = generateAllMarkdownDocs(validSpecs);
    log.generation(
      'markdown-docs',
      `${markdownDocs.length} documentation files`
    );

    const typescriptTypes = generateAllTypeScriptTypes(validSpecs);
    log.generation('typescript-types', `${typescriptTypes.length} type files`);

    const postmanCollections = generateAllPostmanCollections(validSpecs);
    log.generation(
      'postman-collections',
      `${postmanCollections.length} collection files`
    );

    timer.checkpoint('Documentation generation complete');

    const allFiles = [
      ...routes.map((r) => ({
        filename: `routes/${r.filename}`,
        content: r.content,
      })),
      ...services.map((s) => ({
        filename: `services/${s.filename}`,
        content: s.content,
      })),
      ...validationSchemas.map((v) => ({
        filename: `validation/${v.filename}`,
        content: v.content,
      })),
      ...queryProcessors.map((q) => ({
        filename: `query-processors/${q.filename}`,
        content: q.content,
      })),
      ...openapi.map((o) => ({
        filename: o.filename,
        content: o.content,
      })),
      ...markdownDocs.map((m) => ({
        filename: m.filename,
        content: m.content,
      })),
      ...typescriptTypes.map((t) => ({
        filename: t.filename,
        content: t.content,
      })),
      ...postmanCollections.map((p) => ({
        filename: p.filename,
        content: p.content,
      })),
      app,
      packageJson,
      jestConfig,
      testSetup,
    ];

    // Write all generated files
    log.debug('Writing generated files');
    writeGeneratedFiles(output || './apps/api', allFiles);
    generateTsConfig(output || './apps/api');
    log.fileOperation('write-files', output, { count: allFiles.length + 1 });

    const duration = timer.stop();
    log.commandComplete('build', duration);

    log.info(`✅ API generated successfully!`);
    log.info(`📦 Generated ${allFiles.length + 1} files`);
    log.info(`🚀 To start the API:`);
    log.info(`   npm run dev`);
    log.info(
      `💡 Tip: Use 'npm run dev' from the project root to start the API server`
    );
  } catch (error) {
    const duration = timer.stop();
    log.commandError(
      'build',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}
