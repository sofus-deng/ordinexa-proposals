/**
 * Provider Status Utility (ORDX-027A)
 *
 * Lightweight utility for checking and reporting AI provider availability.
 * Provides demo-friendly status information without exposing technical error noise.
 */

import { createGeminiProvider } from "./providers/gemini-provider";
import type { AIGenerationProvider } from "@/types/proposal-generation";

/**
 * Provider status information for UI display.
 */
export interface ProviderStatus {
  /** Whether the provider is available and ready */
  isAvailable: boolean;
  /** Display-friendly status message */
  message: string;
  /** Provider identifier */
  provider: string;
  /** Whether this is a fallback to mock */
  isFallback: boolean;
}

/**
 * Check Gemini provider availability.
 *
 * @returns Promise resolving to provider status
 */
export async function checkGeminiStatus(): Promise<ProviderStatus> {
  const geminiProvider = createGeminiProvider();

  try {
    const available = await geminiProvider.isAvailable();

    if (available) {
      return {
        isAvailable: true,
        message: "Live generation is ready for proposal creation.",
        provider: "gemini",
        isFallback: false,
      };
    }

    return {
      isAvailable: false,
      message: "Demo generation is available for proposal creation.",
      provider: "mock",
      isFallback: true,
    };
  } catch {
    return {
      isAvailable: false,
      message: "Demo generation is available for proposal creation.",
      provider: "mock",
      isFallback: true,
    };
  }
}

/**
 * Get the default provider with status information.
 *
 * @returns Provider instance and status information
 */
export async function getProviderWithStatus(): Promise<{
  provider: AIGenerationProvider;
  status: ProviderStatus;
}> {
  const status = await checkGeminiStatus();

  if (status.isAvailable) {
    return {
      provider: createGeminiProvider(),
      status,
    };
  }

  // Import mock provider dynamically to avoid circular dependency
  const { createMockProvider } = await import("./providers/mock-provider");
  return {
    provider: createMockProvider({ deterministic: true }),
    status,
  };
}

/**
 * Create a user-friendly status badge component props.
 *
 * @param status - Provider status
 * @returns Badge styling and text for UI
 */
export function getProviderStatusBadge(status: ProviderStatus): {
  text: string;
  variant: "success" | "warning" | "neutral";
} {
  if (status.isAvailable) {
    return {
      text: "Live generation",
      variant: "success",
    };
  }

  return {
    text: "Demo generation",
    variant: "warning",
  };
}
