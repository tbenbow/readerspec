import OpenAI from 'openai';
import { AITranslationOptions, AITranslationResult } from '../types';

export class OpenAIClient {
  private client: OpenAI;
  private options: AITranslationOptions;

  constructor(options: AITranslationOptions) {
    this.options = {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 1000,
      ...options,
    };

    this.client = new OpenAI({
      apiKey: this.options.openaiApiKey,
    });
  }

  async translateToJSON(prompt: string): Promise<AITranslationResult> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.options.model!,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert API designer who converts human-readable API specifications into structured JSON. Always return valid JSON that follows the exact schema provided. Do not include explanations or markdown formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.options.temperature,
        max_tokens: this.options.maxTokens,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        return {
          success: false,
          error: 'No response from OpenAI',
        };
      }

      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'No JSON found in response',
        };
      }

      const jsonString = jsonMatch[0];

      // Validate that it's actually valid JSON
      try {
        JSON.parse(jsonString);
        return {
          success: true,
          jsonBlock: jsonString,
          confidence: 0.9, // High confidence for valid JSON
        };
      } catch (parseError) {
        return {
          success: false,
          error: `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateJSON(jsonString: string): Promise<boolean> {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }
}
