import { watch } from 'fs';
import { join } from 'path';
import { TranslationService } from '../ai/translation-service';
import { AITranslationOptions } from '../types';

export class FileWatcher {
  private translationService: TranslationService;
  private watchPaths: string[];
  private isWatching: boolean = false;
  private debounceTimers: Map<string, NodeJS.Timeout | undefined> = new Map();
  private readonly DEBOUNCE_DELAY = 1000; // 1 second

  constructor(
    options: AITranslationOptions,
    watchPaths: string[] = ['specs/']
  ) {
    this.translationService = new TranslationService(options);
    this.watchPaths = watchPaths.map((path) => join(process.cwd(), path));
  }

  start(): void {
    if (this.isWatching) {
      console.log('File watcher is already running');
      return;
    }

    console.log('🚀 Starting AI translation file watcher...');
    console.log(`📁 Watching paths: ${this.watchPaths.join(', ')}`);

    this.watchPaths.forEach((watchPath) => {
      try {
        watch(watchPath, { recursive: true }, (eventType, filename) => {
          if (filename && filename.endsWith('.readerspec.md')) {
            this.handleFileChange(join(watchPath, filename));
          }
        });
      } catch (error) {
        console.error(`❌ Error watching path ${watchPath}:`, error);
      }
    });

    this.isWatching = true;
    console.log('✅ File watcher started successfully');
  }

  stop(): void {
    if (!this.isWatching) {
      console.log('File watcher is not running');
      return;
    }

    // Clear all debounce timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    this.isWatching = false;
    console.log('🛑 File watcher stopped');
  }

  private handleFileChange(filePath: string): void {
    // Clear existing timer for this file
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced timer
    const timer = setTimeout(async () => {
      await this.processFileChange(filePath);
      this.debounceTimers.delete(filePath);
    }, this.DEBOUNCE_DELAY);

    this.debounceTimers.set(filePath, timer);
  }

  private async processFileChange(filePath: string): Promise<void> {
    try {
      console.log(`🔄 Processing file change: ${filePath}`);

      const result = await this.translationService.translateAndUpdate(filePath);

      if (result.success) {
        console.log(`✅ Successfully translated and updated: ${filePath}`);
        if (result.confidence) {
          console.log(
            `📊 Translation confidence: ${(result.confidence * 100).toFixed(1)}%`
          );
        }
      } else {
        console.error(`❌ Translation failed for ${filePath}:`, result.error);
      }
    } catch (error) {
      console.error(`💥 Error processing file change for ${filePath}:`, error);
    }
  }

  async translateFileNow(filePath: string): Promise<void> {
    console.log(`🔄 Manual translation requested for: ${filePath}`);
    await this.processFileChange(filePath);
  }
}
