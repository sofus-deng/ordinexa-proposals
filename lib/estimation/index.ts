/**
 * Estimation Engine Module
 *
 * Deterministic estimation calculations for interior fit-out projects.
 * This module provides pure, testable functions for budget and timeline estimation.
 *
 * Usage:
 * ```typescript
 * import { calculateEstimate, createMockPricingRepository } from "@/lib/estimation";
 *
 * const repository = createMockPricingRepository();
 * const summary = await calculateEstimate(repository, {
 *   projectTypeId: "office-fit-out",
 *   styleMultiplierId: "modern-corporate",
 *   areaPing: 100,
 *   meetingRoomCount: 3,
 *   includeReceptionArea: true,
 *   includePantry: true,
 *   includeGlassPartitions: false,
 *   includeCustomStorage: true,
 *   includeSmartOfficeSetup: false,
 *   includeMEPWork: true,
 *   rushProject: false,
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
  MEETING_ROOM_WEEKS_PER_ROOM,
  FEATURE_ADJUSTMENTS,
  RUSH_ADJUSTMENT,
} from "./repository";
