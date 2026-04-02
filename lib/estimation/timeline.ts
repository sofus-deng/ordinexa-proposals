/**
 * Timeline Calculation Module (ORDX-013C)
 *
 * Deterministic timeline calculation logic for cross-industry proposal engagements.
 * All calculations are pure functions with no side effects.
 */

import type {
  TimelineRange,
  TimelineBreakdown,
  EstimationInput,
  PricingRepository,
} from "./types";
import {
  STAKEHOLDER_WEEKS_PER_PERSON,
  FEATURE_ADJUSTMENTS,
} from "./repository";

/**
 * Expedited delivery timeline compression factor.
 * Expedited engagements compress timeline by this percentage.
 */
export const RUSH_COMPRESSION_FACTOR = 0.75; // 25% reduction

/**
 * Minimum timeline in weeks regardless of compression.
 */
export const MINIMUM_TIMELINE_WEEKS = 3;

/**
 * Gets the list of applicable timeline adjustments based on input flags.
 *
 * @param input - Estimation input
 * @returns Array of adjustment configurations with timeline impacts
 */
export function getApplicableTimelineAdjustments(
  input: EstimationInput
): Array<{
  id: string;
  name: string;
  timelineImpactWeeks: number;
}> {
  const adjustments: Array<{
    id: string;
    name: string;
    timelineImpactWeeks: number;
  }> = [];

  // Check each optional service module
  if (input.includeDiscoveryWorkshop) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeDiscoveryWorkshop.id,
      name: FEATURE_ADJUSTMENTS.includeDiscoveryWorkshop.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeDiscoveryWorkshop.timelineImpactWeeks,
    });
  }
  if (input.includeTrainingEnablement) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeTrainingEnablement.id,
      name: FEATURE_ADJUSTMENTS.includeTrainingEnablement.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeTrainingEnablement.timelineImpactWeeks,
    });
  }
  if (input.includeImplementationSupport) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeImplementationSupport.id,
      name: FEATURE_ADJUSTMENTS.includeImplementationSupport.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeImplementationSupport.timelineImpactWeeks,
    });
  }
  if (input.includeCustomDeliverables) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeCustomDeliverables.id,
      name: FEATURE_ADJUSTMENTS.includeCustomDeliverables.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeCustomDeliverables.timelineImpactWeeks,
    });
  }
  if (input.includeAutomationIntegration) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeAutomationIntegration.id,
      name: FEATURE_ADJUSTMENTS.includeAutomationIntegration.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeAutomationIntegration.timelineImpactWeeks,
    });
  }
  if (input.includeComplianceReview) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeComplianceReview.id,
      name: FEATURE_ADJUSTMENTS.includeComplianceReview.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeComplianceReview.timelineImpactWeeks,
    });
  }

  return adjustments;
}

/**
 * Calculates the stakeholder coordination timeline addition.
 *
 * @param stakeholderCount - Number of stakeholders or coordination tracks
 * @returns Additional weeks for stakeholder coordination
 */
export function calculateMeetingRoomTimelineAddition(
  stakeholderCount: number
): number {
  return stakeholderCount * STAKEHOLDER_WEEKS_PER_PERSON;
}

/**
 * Calculates the complete timeline breakdown for an estimation.
 *
 * Calculation order:
 * 1. Start with project type baseline
 * 2. Add stakeholder coordination weeks
 * 3. Add adjustment weeks
 * 4. Apply rush compression if applicable
 *
 * @param baseline - Project type baseline timeline range
 * @param input - Full estimation input
 * @returns Complete timeline breakdown
 */
export function calculateTimelineBreakdown(
  baseline: TimelineRange,
  input: EstimationInput
): TimelineBreakdown {
  const applicableAdjustments = getApplicableTimelineAdjustments(input);

  const adjustmentImpacts = applicableAdjustments.map((adj) => ({
    id: adj.id,
    name: adj.name,
    weeksAdded: adj.timelineImpactWeeks,
  }));

  const totalAdjustmentWeeks = adjustmentImpacts.reduce(
    (sum, adj) => sum + adj.weeksAdded,
    0
  );

  const rushCompression = input.expeditedDelivery ? RUSH_COMPRESSION_FACTOR : 1;

  return {
    baseline,
    adjustments: adjustmentImpacts,
    rushCompression,
    totalAdjustmentWeeks,
  };
}

/**
 * Calculates the final timeline range applying all factors.
 *
 * @param breakdown - Timeline breakdown with all factors
 * @param stakeholderCount - Number of stakeholders or coordination tracks
 * @returns Final timeline range
 */
export function calculateFinalTimeline(
  breakdown: TimelineBreakdown,
  stakeholderCount: number
): TimelineRange {
  // Start with baseline
  let minWeeks = breakdown.baseline.minWeeks;
  let maxWeeks = breakdown.baseline.maxWeeks;

  // Add stakeholder coordination weeks
  const stakeholderWeeks = calculateMeetingRoomTimelineAddition(stakeholderCount);
  minWeeks += stakeholderWeeks;
  maxWeeks += stakeholderWeeks;

  // Add adjustment weeks
  minWeeks += breakdown.totalAdjustmentWeeks;
  maxWeeks += breakdown.totalAdjustmentWeeks;

  // Apply rush compression
  if (breakdown.rushCompression < 1) {
    minWeeks = Math.round(minWeeks * breakdown.rushCompression);
    maxWeeks = Math.round(maxWeeks * breakdown.rushCompression);
  }

  // Ensure minimum values
  return {
    minWeeks: Math.max(MINIMUM_TIMELINE_WEEKS, minWeeks),
    maxWeeks: Math.max(MINIMUM_TIMELINE_WEEKS, maxWeeks),
  };
}

/**
 * Main timeline calculation function.
 * Orchestrates the full timeline calculation pipeline.
 *
 * @param repository - Pricing data repository
 * @param input - Estimation input
 * @returns Timeline breakdown and final range, or null if project type not found
 */
export async function calculateTimeline(
  repository: PricingRepository,
  input: EstimationInput
): Promise<{
  breakdown: TimelineBreakdown;
  final: TimelineRange;
  projectTypeName: string;
} | null> {
  const projectType = await repository.getProjectType(input.projectTypeId);

  if (!projectType) {
    return null;
  }

  const baseline: TimelineRange = {
    minWeeks: projectType.timelineBaselineMinWeeks,
    maxWeeks: projectType.timelineBaselineMaxWeeks,
  };

  const breakdown = calculateTimelineBreakdown(baseline, input);
   const final = calculateFinalTimeline(breakdown, input.stakeholderCount);

  return {
    breakdown,
    final,
    projectTypeName: projectType.name,
  };
}
