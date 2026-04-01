/**
 * AI Generation Module
 *
 * Provides structured proposal generation using AI providers.
 * The architecture is provider-agnostic, allowing Gemini, OpenAI,
 * or mock implementations to be swapped in.
 *
 * Usage:
 * ```typescript
 * import { createProvider, generateProposal } from "@/lib/ai-generation";
 *
 * // Use mock for development
 * const provider = createProvider("mock");
 *
 * // Or use Gemini in production
 * // const provider = createProvider("gemini");
 *
 * const content = await generateProposal(provider, input);
 * ```
 */

// Provider implementations
export { GeminiProvider, createGeminiProvider } from "./providers/gemini-provider";
export type { GeminiProviderConfig } from "./providers/gemini-provider";

export { MockProvider, createMockProvider } from "./providers/mock-provider";
export type { MockProviderConfig } from "./providers/mock-provider";

// Provider status utility
export {
  checkGeminiStatus,
  getProviderWithStatus,
  getProviderStatusBadge,
} from "./provider-status";
export type { ProviderStatus } from "./provider-status";

// Prompt builder
export {
  buildProposalPrompt,
  buildMinimalPrompt,
  extractProjectIdentifiers,
} from "./prompt-builder";
export type { BuiltPrompt } from "./prompt-builder";

// Schema validation
export {
  validateGeneratedContent,
  parseGeneratedContent,
  createFallbackContent,
} from "./schemas";
export type { ValidationError, ValidationResult, ParseResult } from "./schemas";

// Re-export types for convenience
export type {
  AIGenerationProvider,
  GeneratedProposalContent,
  ProposalGenerationInput,
  AIGenerationConfig,
  ExecutiveSummary,
  ProjectUnderstanding,
  DesignDirection,
  SpatialPlanningRecommendations,
  BudgetNarrative,
  TimelineNarrative,
  RisksAndAssumptions,
  RecommendedNextSteps,
} from "@/types/proposal-generation";

import type {
  AIGenerationProvider,
  GeneratedProposalContent,
  ProposalGenerationInput,
  AIGenerationConfig,
} from "@/types/proposal-generation";
import { createGeminiProvider } from "./providers/gemini-provider";
import { createMockProvider } from "./providers/mock-provider";

/**
 * Create an AI generation provider based on configuration.
 *
 * @param config - Generation configuration specifying provider type
 * @returns Configured provider instance
 */
export function createProvider(config: AIGenerationConfig): AIGenerationProvider {
  switch (config.provider) {
    case "gemini":
      return createGeminiProvider({
        model: config.model,
        temperature: config.temperature,
      });
    case "mock":
      return createMockProvider({
        model: config.model,
      });
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Create the default provider based on environment.
 * Uses Gemini if API key is available, otherwise falls back to mock.
 */
export function createDefaultProvider(): AIGenerationProvider {
  if (process.env.GEMINI_API_KEY) {
    return createGeminiProvider();
  }
  return createMockProvider();
}

/**
 * Generate proposal content using the specified provider.
 *
 * @param provider - AI generation provider to use
 * @param input - Proposal generation input
 * @returns Generated proposal content
 */
export async function generateProposal(
  provider: AIGenerationProvider,
  input: ProposalGenerationInput
): Promise<GeneratedProposalContent> {
  return provider.generateProposalContent(input);
}

/**
 * Check if a provider is available for use.
 *
 * @param provider - Provider to check
 * @returns True if provider is available
 */
export async function isProviderAvailable(
  provider: AIGenerationProvider
): Promise<boolean> {
  return provider.isAvailable();
}
