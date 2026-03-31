/**
 * Budget Calculation Module (ORDX-013B)
 *
 * Deterministic budget calculation logic for interior fit-out projects.
 * All calculations are pure functions with no side effects.
 */

import type {
  BudgetRange,
  BudgetBreakdown,
  EstimationInput,
  PricingRepository,
} from "./types";
import {
  AREA_THRESHOLDS,
  FEATURE_ADJUSTMENTS,
  RUSH_ADJUSTMENT,
} from "./repository";

/**
 * Calculates the area-based adjustment factor.
 *
 * Logic:
 * - Baseline (50 ping) = factor of 1.0
 * - Smaller projects have reduced factor (economies of scale work in reverse)
 * - Larger projects have increased factor (more complexity)
 * - Factor is clamped between min and max thresholds
 *
 * @param areaPing - Project area in ping
 * @returns Area adjustment factor
 */
export function calculateAreaFactor(areaPing: number): number {
  const deltaPing = areaPing - AREA_THRESHOLDS.baselinePing;
  const factorAdjustment = (deltaPing / 10) * AREA_THRESHOLDS.factorPerTenPing;
  const rawFactor = 1 + factorAdjustment;

  return Math.max(
    AREA_THRESHOLDS.minFactor,
    Math.min(AREA_THRESHOLDS.maxFactor, rawFactor)
  );
}

/**
 * Applies a percentage adjustment to a budget range.
 *
 * @param range - Original budget range
 * @param percentage - Percentage to adjust (e.g., 10 for +10%, -5 for -5%)
 * @returns Adjusted budget range
 */
export function applyPercentageAdjustment(
  range: BudgetRange,
  percentage: number
): BudgetRange {
  const multiplier = 1 + percentage / 100;
  return {
    min: Math.round(range.min * multiplier),
    max: Math.round(range.max * multiplier),
  };
}

/**
 * Applies a flat adjustment to a budget range.
 *
 * @param range - Original budget range
 * @param flatAmount - Flat amount to add (can be negative)
 * @returns Adjusted budget range
 */
export function applyFlatAdjustment(
  range: BudgetRange,
  flatAmount: number
): BudgetRange {
  return {
    min: range.min + flatAmount,
    max: range.max + flatAmount,
  };
}

/**
 * Applies a style multiplier to a budget range.
 *
 * @param range - Original budget range
 * @param multiplier - Style multiplier (e.g., 1.18 for premium)
 * @returns Adjusted budget range
 */
export function applyStyleMultiplier(
  range: BudgetRange,
  multiplier: number
): BudgetRange {
  return {
    min: Math.round(range.min * multiplier),
    max: Math.round(range.max * multiplier),
  };
}

/**
 * Gets the list of applicable adjustments based on input flags.
 *
 * @param input - Estimation input
 * @returns Array of adjustment configurations
 */
export function getApplicableAdjustments(
  input: EstimationInput
): Array<{
  id: string;
  name: string;
  budgetImpactType: "percentage" | "flat";
  budgetImpactValue: number;
}> {
  const adjustments: Array<{
    id: string;
    name: string;
    budgetImpactType: "percentage" | "flat";
    budgetImpactValue: number;
  }> = [];

  // Check each feature flag
  if (input.includeReceptionArea) {
    adjustments.push(FEATURE_ADJUSTMENTS.includeReceptionArea);
  }
  if (input.includePantry) {
    adjustments.push(FEATURE_ADJUSTMENTS.includePantry);
  }
  if (input.includeGlassPartitions) {
    adjustments.push(FEATURE_ADJUSTMENTS.includeGlassPartitions);
  }
  if (input.includeCustomStorage) {
    adjustments.push(FEATURE_ADJUSTMENTS.includeCustomStorage);
  }
  if (input.includeSmartOfficeSetup) {
    adjustments.push(FEATURE_ADJUSTMENTS.includeSmartOfficeSetup);
  }
  if (input.includeMEPWork) {
    adjustments.push(FEATURE_ADJUSTMENTS.includeMEPWork);
  }
  if (input.rushProject) {
    adjustments.push(RUSH_ADJUSTMENT);
  }

  return adjustments;
}

/**
 * Calculates the complete budget breakdown for an estimation.
 *
 * Calculation order:
 * 1. Start with project type baseline
 * 2. Apply area factor
 * 3. Apply style multiplier
 * 4. Apply each adjustment (percentage adjustments compound, flat adds to total)
 *
 * @param baseline - Project type baseline budget range
 * @param areaPing - Project area in ping
 * @param styleMultiplier - Style option multiplier
 * @param input - Full estimation input for adjustment determination
 * @returns Complete budget breakdown
 */
export function calculateBudgetBreakdown(
  baseline: BudgetRange,
  areaPing: number,
  styleMultiplier: number,
  input: EstimationInput
): BudgetBreakdown {
  const areaFactor = calculateAreaFactor(areaPing);
  const applicableAdjustments = getApplicableAdjustments(input);

  // Track cumulative adjustments
  let cumulativePercentage = 0;
  let totalFlatImpact = 0;

  const adjustmentImpacts = applicableAdjustments.map((adj) => {
    let budgetImpact: BudgetRange;

    if (adj.budgetImpactType === "percentage") {
      cumulativePercentage += adj.budgetImpactValue;
      // Calculate impact relative to baseline for display
      budgetImpact = applyPercentageAdjustment(baseline, adj.budgetImpactValue);
    } else {
      totalFlatImpact += adj.budgetImpactValue;
      budgetImpact = applyFlatAdjustment(baseline, adj.budgetImpactValue);
    }

    return {
      id: adj.id,
      name: adj.name,
      impactType: adj.budgetImpactType as "percentage" | "flat",
      impactValue: adj.budgetImpactValue,
      budgetImpact,
    };
  });

  // Calculate total adjustment impact
  // For the total, we apply percentage adjustments to the style-adjusted baseline
  // then add flat amounts
  let adjustedForPercentage = { ...baseline };
  if (cumulativePercentage !== 0) {
    adjustedForPercentage = applyPercentageAdjustment(
      adjustedForPercentage,
      cumulativePercentage
    );
  }

  const totalAdjustmentImpact: BudgetRange = {
    min: adjustedForPercentage.min - baseline.min + totalFlatImpact,
    max: adjustedForPercentage.max - baseline.max + totalFlatImpact,
  };

  return {
    baseline,
    areaFactor,
    styleMultiplier,
    adjustments: adjustmentImpacts,
    totalAdjustmentImpact,
  };
}

/**
 * Calculates the final budget range applying all factors.
 *
 * @param breakdown - Budget breakdown with all factors
 * @returns Final budget range
 */
export function calculateFinalBudget(breakdown: BudgetBreakdown): BudgetRange {
  // Start with baseline
  let result = { ...breakdown.baseline };

  // Apply area factor
  result = {
    min: Math.round(result.min * breakdown.areaFactor),
    max: Math.round(result.max * breakdown.areaFactor),
  };

  // Apply style multiplier
  result = applyStyleMultiplier(result, breakdown.styleMultiplier);

  // Apply adjustments
  let cumulativePercentage = 0;
  let totalFlat = 0;

  for (const adj of breakdown.adjustments) {
    if (adj.impactType === "percentage") {
      cumulativePercentage += adj.impactValue;
    } else {
      totalFlat += adj.impactValue;
    }
  }

  if (cumulativePercentage !== 0) {
    result = applyPercentageAdjustment(result, cumulativePercentage);
  }

  if (totalFlat !== 0) {
    result = applyFlatAdjustment(result, totalFlat);
  }

  // Ensure minimum values
  return {
    min: Math.max(0, result.min),
    max: Math.max(0, result.max),
  };
}

/**
 * Main budget calculation function.
 * Orchestrates the full budget calculation pipeline.
 *
 * @param repository - Pricing data repository
 * @param input - Estimation input
 * @returns Budget breakdown and final range, or null if project type/style not found
 */
export async function calculateBudget(
  repository: PricingRepository,
  input: EstimationInput
): Promise<{
  breakdown: BudgetBreakdown;
  final: BudgetRange;
  projectTypeName: string;
  styleOptionName: string;
} | null> {
  const projectType = await repository.getProjectType(input.projectTypeId);
  const styleOption = await repository.getStyleOption(input.styleMultiplierId);

  if (!projectType || !styleOption) {
    return null;
  }

  const baseline: BudgetRange = {
    min: projectType.budgetBaselineMin,
    max: projectType.budgetBaselineMax,
  };

  const breakdown = calculateBudgetBreakdown(
    baseline,
    input.areaPing,
    styleOption.multiplier,
    input
  );

  const final = calculateFinalBudget(breakdown);

  return {
    breakdown,
    final,
    projectTypeName: projectType.name,
    styleOptionName: styleOption.name,
  };
}
