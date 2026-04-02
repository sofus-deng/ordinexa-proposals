/**
 * Estimation Engine Module
 *
 * Deterministic estimation calculations for cross-industry proposal engagements.
 * This module provides pure, testable functions for budget and timeline estimation.
 *
 * Usage:
 * ```typescript
 * import { calculateEstimate, createMockPricingRepository } from "@/lib/estimation";
 *
 * const repository = createMockPricingRepository();
 * const summary = await calculateEstimate(repository, {
 *   projectTypeId: "strategic-initiative",
 *   styleMultiplierId: "standard-delivery",
 *   scopeSize: 100,
 *   complexityLevel: 3,
 *   stakeholderCount: 5,
 *   includeDiscoveryWorkshop: true,
 *   includeTrainingEnablement: true,
 *   includeImplementationSupport: false,
 *   includeCustomDeliverables: true,
 *   includeAutomationIntegration: false,
 *   includeComplianceReview: true,
 *   expeditedDelivery: false,
 * });
 * ```
 */

// Main engine exports
export {
  calculateEstimate,
  validateEstimationInput,
  calculateBudget,
  calculateFinalBudget,
  calculateTimeline,
  calculateFinalTimeline,
  createMockPricingRepository,
} from "./engine";

// Type exports
export type {
  EstimationInput,
  EstimateSummary,
  BudgetRange,
  TimelineRange,
  BudgetBreakdown,
  TimelineBreakdown,
  PricingRepository,
} from "./types";

// Internal calculation exports (for advanced use/testing)
export { getIncludedOptionsList } from "./engine";

/**
 * Converts a Proposal object to EstimationInput for the estimation engine.
 * Maps proposal fields to the expected estimation input structure.
 *
 * @param proposal - Proposal object with styleOptionId and other fields
 * @returns EstimationInput ready for calculateEstimate()
 */
export function proposalToEstimationInput(proposal: {
  projectTypeId: string;
  styleOptionId: string;
  scopeSize: number;
  complexityLevel: number;
  stakeholderCount: number;
  includeDiscoveryWorkshop: boolean;
  includeTrainingEnablement: boolean;
  includeImplementationSupport: boolean;
  includeCustomDeliverables: boolean;
  includeAutomationIntegration: boolean;
  includeComplianceReview: boolean;
  expeditedDelivery: boolean;
}): import("./types").EstimationInput {
  return {
    projectTypeId: proposal.projectTypeId,
    styleMultiplierId: proposal.styleOptionId,
    scopeSize: proposal.scopeSize,
    complexityLevel: proposal.complexityLevel,
    stakeholderCount: proposal.stakeholderCount,
    includeDiscoveryWorkshop: proposal.includeDiscoveryWorkshop,
    includeTrainingEnablement: proposal.includeTrainingEnablement,
    includeImplementationSupport: proposal.includeImplementationSupport,
    includeCustomDeliverables: proposal.includeCustomDeliverables,
    includeAutomationIntegration: proposal.includeAutomationIntegration,
    includeComplianceReview: proposal.includeComplianceReview,
    expeditedDelivery: proposal.expeditedDelivery,
  };
}

export {
  calculateAreaFactor,
  applyPercentageAdjustment,
  applyFlatAdjustment,
  applyStyleMultiplier,
  getApplicableAdjustments,
  calculateBudgetBreakdown,
} from "./budget";

export {
  calculateMeetingRoomTimelineAddition,
  getApplicableTimelineAdjustments,
  calculateTimelineBreakdown,
  RUSH_COMPRESSION_FACTOR,
  MINIMUM_TIMELINE_WEEKS,
} from "./timeline";

// Configuration exports (for testing/overrides)
export {
  AREA_THRESHOLDS,
  STAKEHOLDER_WEEKS_PER_PERSON,
  FEATURE_ADJUSTMENTS,
  RUSH_ADJUSTMENT,
} from "./repository";
