/**
 * Gemini Provider Foundation (ORDX-018C)
 *
 * Implements the AI generation provider interface for Google Gemini.
 * This is the primary provider for Ordinexa proposal generation.
 *
 * Architecture:
 * - Provider-agnostic interface allows swapping implementations
 * - Gemini is the first implementation, not a hard-coded dependency
 * - Configuration via environment variables
 */

import type {
  AIGenerationProvider,
  GeneratedProposalContent,
  ProposalGenerationInput,
} from "@/types/proposal-generation";
import { buildProposalPrompt } from "../prompt-builder";
import { parseGeneratedContent, createFallbackContent } from "../schemas";

/**
 * Configuration for Gemini provider.
 */
export interface GeminiProviderConfig {
  /** API key for Gemini (defaults to GEMINI_API_KEY env var) */
  apiKey?: string;
  /** Model to use (defaults to gemini-3.1-flash-lite-preview) */
  model?: string;
  /** Maximum output tokens */
  maxOutputTokens?: number;
  /** Temperature for generation (0.0 - 2.0) */
  temperature?: number;
  /** Base URL for API (for testing or alternative endpoints) */
  baseUrl?: string;
}

/**
 * Default configuration values.
 */
const DEFAULT_CONFIG = {
  model: "gemini-3.1-flash-lite-preview",
  maxOutputTokens: 8192,
  temperature: 0.7,
  baseUrl: "https://generativelanguage.googleapis.com/v1beta",
} as const;

/**
 * Gemini API response structure (simplified).
 */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Gemini API request structure.
 */
interface GeminiRequest {
  contents: Array<{
    role: string;
    parts: Array<{
      text: string;
    }>;
  }>;
  systemInstruction?: {
    parts: Array<{
      text: string;
    }>;
  };
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    responseMimeType: "application/json";
  };
}

/**
 * Gemini provider implementation for AI proposal generation.
 *
 * Usage:
 * ```typescript
 * const provider = new GeminiProvider();
 * if (await provider.isAvailable()) {
 *   const content = await provider.generateProposalContent(input);
 * }
 * ```
 */
export class GeminiProvider implements AIGenerationProvider {
  readonly providerId = "gemini";

  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly maxOutputTokens: number;
  private readonly temperature: number;
  private readonly baseUrl: string;

  constructor(config: GeminiProviderConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.GEMINI_API_KEY;
    this.model = config.model ?? DEFAULT_CONFIG.model;
    this.maxOutputTokens = config.maxOutputTokens ?? DEFAULT_CONFIG.maxOutputTokens;
    this.temperature = config.temperature ?? DEFAULT_CONFIG.temperature;
    this.baseUrl = config.baseUrl ?? DEFAULT_CONFIG.baseUrl;
  }

  /**
   * Check if the Gemini provider is available and configured.
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      // Simple availability check - verify API key by listing models
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.apiKey}`,
        { method: "GET" }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generate proposal content using Gemini.
   *
   * @param input - Proposal generation input
   * @returns Generated proposal content
   * @throws Error if API call fails or response is invalid
   */
  async generateProposalContent(
    input: ProposalGenerationInput
  ): Promise<GeneratedProposalContent> {
    if (!this.apiKey) {
      throw new Error(
        "Gemini API key not configured. Set GEMINI_API_KEY environment variable."
      );
    }

    const prompt = buildProposalPrompt(input);
    const request = this.buildRequest(prompt);

    try {
      const response = await this.callGeminiApi(request);
      
      const metadata: GeneratedProposalContent["metadata"] = {
        generatedAt: new Date().toISOString(),
        modelUsed: this.model,
        provider: this.providerId,
        tokenUsage: response.usageMetadata
          ? {
              promptTokens: response.usageMetadata.promptTokenCount,
              completionTokens: response.usageMetadata.candidatesTokenCount,
              totalTokens: response.usageMetadata.totalTokenCount,
            }
          : undefined,
      };

      const responseText = this.extractResponseText(response);
      
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const parseResult = parseGeneratedContent(responseText, metadata);

      if (!parseResult.content) {
        console.warn(
          "Gemini response validation failed:",
          parseResult.validation.errors
        );
        // Return fallback with any partial content we might have
        return createFallbackContent(metadata, parseResult.raw as Partial<GeneratedProposalContent>);
      }

      return parseResult.content;
    } catch (error) {
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Gemini generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Build the Gemini API request from prompt.
   */
  private buildRequest(prompt: ReturnType<typeof buildProposalPrompt>): GeminiRequest {
    return {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt.userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: prompt.systemPrompt }],
      },
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxOutputTokens,
        responseMimeType: "application/json",
      },
    };
  }

  /**
   * Call the Gemini API.
   */
  private async callGeminiApi(request: GeminiRequest): Promise<GeminiResponse> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API error (${response.status}): ${errorText}`
      );
    }

    return response.json() as Promise<GeminiResponse>;
  }

  /**
   * Extract text from Gemini response.
   */
  private extractResponseText(response: GeminiResponse): string | null {
    if (response.error) {
      throw new Error(`Gemini API error: ${response.error.message}`);
    }

    const candidate = response.candidates?.[0];
    if (!candidate) {
      return null;
    }

    if (candidate.finishReason === "SAFETY") {
      throw new Error("Generation blocked by safety filters");
    }

    return candidate.content?.parts?.[0]?.text ?? null;
  }
}

/**
 * Factory function to create a Gemini provider.
 */
export function createGeminiProvider(
  config?: GeminiProviderConfig
): AIGenerationProvider {
  return new GeminiProvider(config);
}
