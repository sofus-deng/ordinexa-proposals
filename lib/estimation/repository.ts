/**
 * Mock Pricing Repository Implementation
 *
 * Provides pricing data from mock sources. Designed to be replaced
 * by Prisma-backed repositories with minimal refactoring.
 */

import { projectTypes, styleOptions, pricingAdjustments, activePricingRuleSet } from "@/data/mock-pricing";
import type { PricingRepository } from "./types";

/**
 * Creates a pricing repository that uses mock data.
 * This can later be replaced with a Prisma-backed implementation.
 */
export function createMockPricingRepository(): PricingRepository {
  return {
    async getProjectType(id: string) {
      return projectTypes.find((pt) => pt.id === id) ?? null;
    },

    async getStyleOption(id: string) {
      return styleOptions.find((so) => so.id === id) ?? null;
    },

    async getAdjustment(id: string) {
      return pricingAdjustments.find((adj) => adj.id === id) ?? null;
    },

    async getCurrency() {
      return activePricingRuleSet.currency;
    },
  };
}

/**
 * Mapping of boolean input flags to their corresponding adjustment IDs.
 * This defines which adjustments are triggered by which input options.
 */
export const INPUT_TO_ADJUSTMENT_MAP: Record<string, string> = {
  includeSmartOfficeSetup: "smart-office-integration",
} as const;

/**
 * Rush project adjustment configuration.
 * Applied when rushProject is true.
 */
export const RUSH_ADJUSTMENT = {
  id: "rush-project",
  name: "Rush Project",
  budgetImpactType: "percentage" as const,
  budgetImpactValue: 15, // 15% premium for rush
  timelineImpactWeeks: 0, // Timeline compression handled separately
};

/**
 * Area-based adjustment thresholds and factors.
 * Adjusts budget based on project size relative to baseline.
 */
export const AREA_THRESHOLDS = {
  /** Baseline area in ping for standard pricing */
  baselinePing: 50,

  /** Minimum area factor (for very small projects) */
  minFactor: 0.7,

  /** Maximum area factor (for very large projects) */
  maxFactor: 1.5,

  /** Factor increment per 10 ping deviation from baseline */
  factorPerTenPing: 0.05,
};

/**
 * Meeting room timeline addition per room.
 * Each meeting room adds this many weeks to the timeline.
 */
export const MEETING_ROOM_WEEKS_PER_ROOM = 0.5;

/**
 * Additional adjustment configurations for optional features.
 * These are not in the main pricing adjustments list but are triggered by input flags.
 */
export const FEATURE_ADJUSTMENTS = {
  includeReceptionArea: {
    id: "reception-area",
    name: "Reception Area",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 8,
    timelineImpactWeeks: 1,
  },
  includePantry: {
    id: "pantry-facilities",
    name: "Pantry Facilities",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 5,
    timelineImpactWeeks: 0.5,
  },
  includeGlassPartitions: {
    id: "glass-partitions",
    name: "Glass Partitions",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 7,
    timelineImpactWeeks: 1,
  },
  includeCustomStorage: {
    id: "custom-storage",
    name: "Custom Storage",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 4,
    timelineImpactWeeks: 0.5,
  },
  includeSmartOfficeSetup: {
    id: "smart-office-integration",
    name: "Smart Office Integration",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 9,
    timelineImpactWeeks: 2,
  },
  includeMEPWork: {
    id: "mep-work",
    name: "MEP Work",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 12,
    timelineImpactWeeks: 2,
  },
} as const;
