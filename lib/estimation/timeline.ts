/**
 * Timeline Calculation Module (ORDX-013C)
 *
 * Deterministic timeline calculation logic for interior fit-out projects.
 * All calculations are pure functions with no side effects.
 */

import type {
  TimelineRange,
  TimelineBreakdown,
  EstimationInput,
  PricingRepository,
} from "./types";
import {
  MEETING_ROOM_WEEKS_PER_ROOM,
  FEATURE_ADJUSTMENTS,
} from "./repository";

/**
 * Rush project timeline compression factor.
 * Rush projects compress timeline by this percentage.
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

  // Check each feature flag
  if (input.includeReceptionArea) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeReceptionArea.id,
      name: FEATURE_ADJUSTMENTS.includeReceptionArea.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeReceptionArea.timelineImpactWeeks,
    });
  }
  if (input.includePantry) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includePantry.id,
      name: FEATURE_ADJUSTMENTS.includePantry.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includePantry.timelineImpactWeeks,
    });
  }
  if (input.includeGlassPartitions) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeGlassPartitions.id,
      name: FEATURE_ADJUSTMENTS.includeGlassPartitions.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeGlassPartitions.timelineImpactWeeks,
    });
  }
  if (input.includeCustomStorage) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeCustomStorage.id,
      name: FEATURE_ADJUSTMENTS.includeCustomStorage.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeCustomStorage.timelineImpactWeeks,
    });
  }
  if (input.includeSmartOfficeSetup) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeSmartOfficeSetup.id,
      name: FEATURE_ADJUSTMENTS.includeSmartOfficeSetup.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeSmartOfficeSetup.timelineImpactWeeks,
    });
  }
  if (input.includeMEPWork) {
    adjustments.push({
      id: FEATURE_ADJUSTMENTS.includeMEPWork.id,
      name: FEATURE_ADJUSTMENTS.includeMEPWork.name,
      timelineImpactWeeks: FEATURE_ADJUSTMENTS.includeMEPWork.timelineImpactWeeks,
    });
  }

  return adjustments;
}

/**
 * Calculates the meeting room timeline addition.
 *
 * @param meetingRoomCount - Number of meeting rooms
 * @returns Additional weeks for meeting rooms
 */
export function calculateMeetingRoomTimelineAddition(
  meetingRoomCount: number
): number {
  return meetingRoomCount * MEETING_ROOM_WEEKS_PER_ROOM;
}

/**
 * Calculates the complete timeline breakdown for an estimation.
 *
 * Calculation order:
 * 1. Start with project type baseline
 * 2. Add meeting room weeks
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

  const rushCompression = input.rushProject ? RUSH_COMPRESSION_FACTOR : 1;

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
 * @param meetingRoomCount - Number of meeting rooms
 * @returns Final timeline range
 */
export function calculateFinalTimeline(
  breakdown: TimelineBreakdown,
  meetingRoomCount: number
): TimelineRange {
  // Start with baseline
  let minWeeks = breakdown.baseline.minWeeks;
  let maxWeeks = breakdown.baseline.maxWeeks;

  // Add meeting room weeks
  const meetingRoomWeeks = calculateMeetingRoomTimelineAddition(meetingRoomCount);
  minWeeks += meetingRoomWeeks;
  maxWeeks += meetingRoomWeeks;

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
  const final = calculateFinalTimeline(breakdown, input.meetingRoomCount);

  return {
    breakdown,
    final,
    projectTypeName: projectType.name,
  };
}
