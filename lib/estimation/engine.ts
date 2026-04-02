/**
 * Estimation Engine Module (ORDX-013D)
 *
 * Main orchestration module that combines budget and timeline calculations
 * into a complete estimate summary output.
 */

import type {
  EstimationInput,
  EstimateSummary,
  PricingRepository,
} from "./types";
import { calculateBudget } from "./budget";
import { calculateTimeline } from "./timeline";

/**
 * Gets the list of included option names for display in summary.
 *
 * @param input - Estimation input
 * @returns Array of human-readable option names
 */
export function getIncludedOptionsList(input: EstimationInput): string[] {
  const options: string[] = [];

  if (input.includeDiscoveryWorkshop) {
    options.push("Discovery Workshop");
  }
  if (input.includeTrainingEnablement) {
    options.push("Training & Enablement");
  }
  if (input.includeImplementationSupport) {
    options.push("Implementation Support");
  }
  if (input.includeCustomDeliverables) {
    options.push("Custom Deliverables");
  }
  if (input.includeAutomationIntegration) {
    options.push("Automation Integration");
  }
  if (input.includeComplianceReview) {
    options.push("Compliance Review");
  }
  if (input.expeditedDelivery) {
    options.push("Expedited Delivery");
  }

  return options;
}

/**
 * Main estimation function.
 * Calculates complete estimate summary from input parameters.
 *
 * @param repository - Pricing data repository
 * @param input - Estimation input parameters
 * @returns Complete estimate summary or null if invalid project type/style
 */
export async function calculateEstimate(
  repository: PricingRepository,
  input: EstimationInput
): Promise<EstimateSummary | null> {
  // Calculate budget
  const budgetResult = await calculateBudget(repository, input);
  if (!budgetResult) {
    return null;
  }

  // Calculate timeline
  const timelineResult = await calculateTimeline(repository, input);
  if (!timelineResult) {
    return null;
  }

  // Get style option for display
  const styleOption = await repository.getStyleOption(input.styleMultiplierId);
  if (!styleOption) {
    return null;
  }

  // Get currency
  const currency = await repository.getCurrency();

  // Calculate impacts for summary
  const areaImpact = budgetResult.breakdown.areaFactor - 1; // Convert to percentage delta
  const styleImpact = styleOption.multiplier - 1; // Convert to percentage delta

  // Build the complete summary
  const summary: EstimateSummary = {
    projectType: {
      id: input.projectTypeId,
      name: budgetResult.projectTypeName,
    },
    styleOption: {
      id: input.styleMultiplierId,
      name: styleOption.name,
      multiplier: styleOption.multiplier,
    },
    input: {
      scopeSize: input.scopeSize,
      complexityLevel: input.complexityLevel,
      stakeholderCount: input.stakeholderCount,
      includedOptions: getIncludedOptionsList(input),
    },
    budget: {
      baseline: budgetResult.breakdown.baseline,
      areaImpact,
      styleImpact,
      adjustmentsImpact: budgetResult.breakdown.totalAdjustmentImpact,
      final: budgetResult.final,
      breakdown: budgetResult.breakdown,
    },
    timeline: {
      baseline: timelineResult.breakdown.baseline,
      adjustmentsWeeks: timelineResult.breakdown.totalAdjustmentWeeks,
      rushCompression: timelineResult.breakdown.rushCompression,
      final: timelineResult.final,
      breakdown: timelineResult.breakdown,
    },
    currency,
  };

  return summary;
}

/**
 * Validates estimation input before calculation.
 * Returns array of validation errors, empty if valid.
 *
 * @param input - Estimation input to validate
 * @returns Array of validation error messages
 */
export function validateEstimationInput(input: EstimationInput): string[] {
  const errors: string[] = [];

  if (!input.projectTypeId || input.projectTypeId.trim() === "") {
    errors.push("Project type is required");
  }

  if (!input.styleMultiplierId || input.styleMultiplierId.trim() === "") {
    errors.push("Style option is required");
  }

  if (input.scopeSize <= 0) {
    errors.push("Scope size must be greater than 0");
  }

  if (input.scopeSize > 10000) {
    errors.push("Scope size cannot exceed 10,000 units");
  }

  if (input.complexityLevel < 1 || input.complexityLevel > 5) {
    errors.push("Complexity level must be between 1 and 5");
  }

  if (input.stakeholderCount < 0) {
    errors.push("Stakeholder count cannot be negative");
  }

  if (input.stakeholderCount > 50) {
    errors.push("Stakeholder count cannot exceed 50");
  }

  return errors;
}

/**
 * Re-exports for convenience
 */
export { calculateBudget, calculateFinalBudget } from "./budget";
export { calculateTimeline, calculateFinalTimeline } from "./timeline";
export { createMockPricingRepository } from "./repository";
export type {
  EstimationInput,
  EstimateSummary,
  BudgetRange,
  TimelineRange,
  BudgetBreakdown,
  TimelineBreakdown,
  PricingRepository,
} from "./types";
