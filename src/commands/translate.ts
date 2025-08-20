import { CommandOptions } from '../types';
import { FileWatcher } from '../watchers/file-watcher';
import { TranslationService } from '../ai/translation-service';
import { findReaderSpecFiles } from '../utils/filesystem';

interface TranslateOptions extends CommandOptions {
  file?: string;
  watch?: boolean;
  apiKey?: string;
  model?: string;
}

export async function translateCommand(
  options: TranslateOptions
): Promise<void> {
  const apiKey = options.apiKey || process.env.OPEN_AI_API_KEY;

  if (!apiKey) {
    console.error('❌ OpenAI API key is required.');
    console.error('');
    console.error('You can provide it in one of these ways:');
    console.error('1. Set the OPEN_AI_API_KEY environment variable:');
    console.error('   export OPEN_AI_API_KEY="your-api-key-here"');
    console.error('2. Use the --api-key option:');
    console.error('   readerspec translate --api-key "your-api-key-here"');
    console.error('3. Use the --api-key option with a specific file:');
    console.error(
      '   readerspec translate --file specs/todo.readerspec.md --api-key "your-api-key-here"'
    );
    console.error('');
    console.error(
      'Get your API key from: https://platform.openai.com/account/api-keys'
    );
    process.exit(1);
  }

  const aiOptions = {
    openaiApiKey: apiKey,
    model: options.model || 'gpt-4o-mini',
    temperature: 0.1,
    maxTokens: 1000,
  };

  if (options.watch) {
    // Start file watcher
    const watcher = new FileWatcher(aiOptions);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down file watcher...');
      watcher.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down file watcher...');
      watcher.stop();
      process.exit(0);
    });

    watcher.start();

    // Keep the process running
    await new Promise(() => {});
  } else if (options.file) {
    // Translate specific file
    const translationService = new TranslationService(aiOptions);
    const result = await translationService.translateAndUpdate(options.file);

    if (result.success) {
      console.log(`✅ Successfully translated: ${options.file}`);
      if (result.confidence) {
        console.log(
          `📊 Translation confidence: ${(result.confidence * 100).toFixed(1)}%`
        );
      }
    } else {
      console.error(`❌ Translation failed:`, result.error);
      process.exit(1);
    }
  } else {
    // Translate all spec files
    console.log('🔄 Translating all .readerspec.md files...');

    const specFiles = await findReaderSpecFiles('specs/');

    if (specFiles.length === 0) {
      console.log('📁 No .readerspec.md files found');
      return;
    }

    const translationService = new TranslationService(aiOptions);
    let successCount = 0;
    let errorCount = 0;

    for (const file of specFiles) {
      try {
        console.log(`🔄 Processing: ${file}`);
        const result = await translationService.translateAndUpdate(file);

        if (result.success) {
          console.log(`✅ Success: ${file}`);
          successCount++;
        } else {
          console.error(`❌ Failed: ${file} - ${result.error}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`💥 Error processing ${file}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Translation Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📁 Total files: ${specFiles.length}`);

    if (errorCount > 0) {
      process.exit(1);
    }
  }
}
