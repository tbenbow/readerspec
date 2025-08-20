import { OpenAIClient } from './openai-client';
import {
  parseHumanReadableSections,
  formatSectionsForAI,
} from '../parsers/human-readable';
import {
  AITranslationOptions,
  AITranslationResult,
  MarkdownParseResult,
} from '../types';
import { readSpecFile } from '../utils/filesystem';

export class TranslationService {
  private openaiClient: OpenAIClient;

  constructor(options: AITranslationOptions) {
    this.openaiClient = new OpenAIClient(options);
  }

  async translateFile(filePath: string): Promise<AITranslationResult> {
    try {
      // Read the file content
      const specFile = await readSpecFile(filePath);
      const content = specFile.content;

      // Parse human-readable sections
      const parseResult = parseHumanReadableSections(content);

      if (parseResult.humanSections.length === 0) {
        return {
          success: false,
          error: 'No human-readable sections found in the file',
        };
      }

      // Format sections for AI
      const prompt = formatSectionsForAI(parseResult.humanSections);

      // Translate to JSON using OpenAI
      const result = await this.openaiClient.translateToJSON(prompt);

      if (result.success && result.jsonBlock) {
        // Validate the generated JSON
        const isValid = await this.openaiClient.validateJSON(result.jsonBlock);
        if (!isValid) {
          return {
            success: false,
            error: 'Generated JSON failed validation',
          };
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error during translation',
      };
    }
  }

  async updateFileWithJSON(
    filePath: string,
    jsonBlock: string
  ): Promise<boolean> {
    try {
      const specFile = await readSpecFile(filePath);
      const content = specFile.content;
      const parseResult = parseHumanReadableSections(content);

      let newContent: string;

      if (parseResult.hasJsonBlock) {
        // Replace existing JSON block
        const beforeBlock = content.substring(
          0,
          content.indexOf('```readerspec')
        );
        const afterBlock = content.substring(content.lastIndexOf('```') + 3);
        newContent =
          beforeBlock + '```readerspec\n' + jsonBlock + '\n```' + afterBlock;
      } else {
        // Add JSON block at the end
        newContent = content + '\n\n```readerspec\n' + jsonBlock + '\n```';
      }

      // Write the updated content back to the file
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, newContent, 'utf8');

      return true;
    } catch (error) {
      console.error('Error updating file:', error);
      return false;
    }
  }

  async translateAndUpdate(filePath: string): Promise<AITranslationResult> {
    const result = await this.translateFile(filePath);

    if (result.success && result.jsonBlock) {
      const updateSuccess = await this.updateFileWithJSON(
        filePath,
        result.jsonBlock
      );
      if (!updateSuccess) {
        return {
          success: false,
          error: 'Failed to update file with generated JSON',
        };
      }
    }

    return result;
  }
}
