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
  includeAutomationIntegration: "systems-integration",
} as const;

/**
 * Rush project adjustment configuration.
 * Applied when expeditedDelivery is true.
 */
export const RUSH_ADJUSTMENT = {
  id: "expedited-delivery",
  name: "Expedited Delivery",
  budgetImpactType: "percentage" as const,
  budgetImpactValue: 15,
  timelineImpactWeeks: 0,
};

/**
 * Area-based adjustment thresholds and factors.
 * Adjusts budget based on project size relative to baseline.
 */
export const AREA_THRESHOLDS = {
  /** Baseline scope size for standard pricing */
  baselineSize: 50,

  /** Minimum area factor (for very small projects) */
  minFactor: 0.7,

  /** Maximum area factor (for very large projects) */
  maxFactor: 1.5,

  /** Factor increment per 10 size points deviation from baseline */
  factorPerTenUnits: 0.05,
};

/**
 * Stakeholder coordination timeline addition per stakeholder.
 * Each stakeholder/track adds this many weeks to the timeline.
 */
export const STAKEHOLDER_WEEKS_PER_PERSON = 0.5;

/**
 * Additional adjustment configurations for optional features.
 * These are not in the main pricing adjustments list but are triggered by input flags.
 */
export const FEATURE_ADJUSTMENTS = {
  includeDiscoveryWorkshop: {
    id: "discovery-workshop",
    name: "Discovery Workshop",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 8,
    timelineImpactWeeks: 1,
  },
  includeTrainingEnablement: {
    id: "training-enablement",
    name: "Training & Enablement",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 5,
    timelineImpactWeeks: 0.5,
  },
  includeImplementationSupport: {
    id: "implementation-support",
    name: "Implementation Support",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 7,
    timelineImpactWeeks: 1,
  },
  includeCustomDeliverables: {
    id: "custom-deliverables",
    name: "Custom Deliverables",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 4,
    timelineImpactWeeks: 0.5,
  },
  includeAutomationIntegration: {
    id: "systems-integration",
    name: "Automation Integration",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 9,
    timelineImpactWeeks: 2,
  },
  includeComplianceReview: {
    id: "compliance-review",
    name: "Compliance Review",
    budgetImpactType: "percentage" as const,
    budgetImpactValue: 12,
    timelineImpactWeeks: 2,
  },
} as const;
