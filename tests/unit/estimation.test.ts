/**
 * Unit Tests for Estimation Engine (ORDX-013E)
 *
 * Tests cover:
 * - Baseline project type calculation
 * - Style multiplier effect
 * - Budget adjustments (percentage and flat)
 * - Timeline adjustment behavior
 * - Summary output shape
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateAreaFactor,
  applyPercentageAdjustment,
  applyFlatAdjustment,
  applyStyleMultiplier,
  getApplicableAdjustments,
  calculateBudgetBreakdown,
  calculateFinalBudget,
} from "@/lib/estimation/budget";
import {
  calculateMeetingRoomTimelineAddition,
  getApplicableTimelineAdjustments,
  calculateTimelineBreakdown,
  calculateFinalTimeline,
  RUSH_COMPRESSION_FACTOR,
  MINIMUM_TIMELINE_WEEKS,
} from "@/lib/estimation/timeline";
import {
  calculateEstimate,
  validateEstimationInput,
  getIncludedOptionsList,
} from "@/lib/estimation/engine";
import { createMockPricingRepository } from "@/lib/estimation/repository";
import type { EstimationInput, BudgetRange, TimelineRange } from "@/lib/estimation/types";

// Standard test input
const createTestInput = (overrides: Partial<EstimationInput> = {}): EstimationInput => ({
  projectTypeId: "strategic-initiative",
  styleMultiplierId: "standard-delivery",
  scopeSize: 50,
  complexityLevel: 3,
  stakeholderCount: 2,
  includeDiscoveryWorkshop: false,
  includeTrainingEnablement: false,
  includeImplementationSupport: false,
  includeCustomDeliverables: false,
  includeAutomationIntegration: false,
  includeComplianceReview: false,
  expeditedDelivery: false,
  ...overrides,
});

describe("Budget Calculation", () => {
  describe("calculateAreaFactor", () => {
    it("should return 1.0 for baseline scope size (50 ping)", () => {
      const factor = calculateAreaFactor(50);
      assert.strictEqual(factor, 1.0);
    });

    it("should increase factor for larger scope sizes", () => {
      const factor = calculateAreaFactor(100);
      assert.ok(factor > 1.0);
      assert.ok(factor <= 1.5); // Max factor
    });

    it("should decrease factor for smaller scope sizes", () => {
      const factor = calculateAreaFactor(20);
      assert.ok(factor < 1.0);
      assert.ok(factor >= 0.7); // Min factor
    });

    it("should decrease factor for very small scope sizes", () => {
      const factor = calculateAreaFactor(1);
      assert.ok(factor < 0.8);
      assert.ok(factor >= 0.7); // Should be at or above minimum
    });

    it("should clamp to maximum factor for very large scope sizes", () => {
      const factor = calculateAreaFactor(1000);
      assert.strictEqual(factor, 1.5);
    });
  });

  describe("applyPercentageAdjustment", () => {
    it("should apply positive percentage correctly", () => {
      const range: BudgetRange = { min: 100000, max: 200000 };
      const result = applyPercentageAdjustment(range, 10);
      assert.strictEqual(result.min, 110000);
      assert.strictEqual(result.max, 220000);
    });

    it("should apply negative percentage correctly", () => {
      const range: BudgetRange = { min: 100000, max: 200000 };
      const result = applyPercentageAdjustment(range, -5);
      assert.strictEqual(result.min, 95000);
      assert.strictEqual(result.max, 190000);
    });

    it("should handle zero percentage", () => {
      const range: BudgetRange = { min: 100000, max: 200000 };
      const result = applyPercentageAdjustment(range, 0);
      assert.strictEqual(result.min, 100000);
      assert.strictEqual(result.max, 200000);
    });
  });

  describe("applyFlatAdjustment", () => {
    it("should add positive flat amount", () => {
      const range: BudgetRange = { min: 100000, max: 200000 };
      const result = applyFlatAdjustment(range, 5000);
      assert.strictEqual(result.min, 105000);
      assert.strictEqual(result.max, 205000);
    });

    it("should subtract negative flat amount", () => {
      const range: BudgetRange = { min: 100000, max: 200000 };
      const result = applyFlatAdjustment(range, -3000);
      assert.strictEqual(result.min, 97000);
      assert.strictEqual(result.max, 197000);
    });
  });

  describe("applyStyleMultiplier", () => {
    it("should apply multiplier correctly", () => {
      const range: BudgetRange = { min: 100000, max: 200000 };
      const result = applyStyleMultiplier(range, 1.18);
      assert.strictEqual(result.min, 118000);
      assert.strictEqual(result.max, 236000);
    });

    it("should handle multiplier less than 1", () => {
      const range: BudgetRange = { min: 100000, max: 200000 };
      const result = applyStyleMultiplier(range, 0.94);
      assert.strictEqual(result.min, 94000);
      assert.strictEqual(result.max, 188000);
    });
  });

  describe("getApplicableAdjustments", () => {
    it("should return empty array when no options selected", () => {
      const input = createTestInput();
      const adjustments = getApplicableAdjustments(input);
      assert.strictEqual(adjustments.length, 0);
    });

    it("should return adjustments for selected options", () => {
      const input = createTestInput({
        includeDiscoveryWorkshop: true,
        includeTrainingEnablement: true,
      });
      const adjustments = getApplicableAdjustments(input);
      assert.strictEqual(adjustments.length, 2);
      assert.ok(adjustments.some((a) => a.id === "discovery-workshop"));
      assert.ok(adjustments.some((a) => a.id === "training-enablement"));
    });

    it("should include rush adjustment when expeditedDelivery is true", () => {
      const input = createTestInput({ expeditedDelivery: true });
      const adjustments = getApplicableAdjustments(input);
      assert.ok(adjustments.some((a) => a.id === "expedited-delivery"));
    });
  });

  describe("calculateBudgetBreakdown", () => {
    it("should calculate breakdown with all components", () => {
      const baseline: BudgetRange = { min: 85000, max: 180000 };
      const input = createTestInput({
        includeDiscoveryWorkshop: true,
        styleMultiplierId: "advisory-led",
      });
      const breakdown = calculateBudgetBreakdown(baseline, 50, 1.18, input);

      assert.ok(breakdown.baseline);
      assert.strictEqual(breakdown.baseline.min, 85000);
      assert.strictEqual(breakdown.baseline.max, 180000);
      assert.strictEqual(breakdown.areaFactor, 1.0);
      assert.strictEqual(breakdown.styleMultiplier, 1.18);
      assert.ok(Array.isArray(breakdown.adjustments));
    });
  });

  describe("calculateFinalBudget", () => {
    it("should calculate final budget from breakdown", () => {
      const baseline: BudgetRange = { min: 100000, max: 200000 };
      const input = createTestInput();
      const breakdown = calculateBudgetBreakdown(baseline, 50, 1.0, input);
      const final = calculateFinalBudget(breakdown);

      assert.ok(final.min > 0);
      assert.ok(final.max > 0);
      assert.ok(final.max >= final.min);
    });
  });
});

describe("Timeline Calculation", () => {
  describe("calculateMeetingRoomTimelineAddition", () => {
    it("should add 0.5 weeks per stakeholder", () => {
      assert.strictEqual(calculateMeetingRoomTimelineAddition(0), 0);
      assert.strictEqual(calculateMeetingRoomTimelineAddition(1), 0.5);
      assert.strictEqual(calculateMeetingRoomTimelineAddition(4), 2);
    });
  });

  describe("getApplicableTimelineAdjustments", () => {
    it("should return empty array when no options selected", () => {
      const input = createTestInput();
      const adjustments = getApplicableTimelineAdjustments(input);
      assert.strictEqual(adjustments.length, 0);
    });

    it("should return adjustments with timeline impacts", () => {
      const input = createTestInput({
        includeDiscoveryWorkshop: true,
        includeComplianceReview: true,
      });
      const adjustments = getApplicableTimelineAdjustments(input);
      assert.strictEqual(adjustments.length, 2);
      assert.ok(adjustments.every((a) => typeof a.timelineImpactWeeks === "number"));
    });
  });

  describe("calculateTimelineBreakdown", () => {
    it("should calculate breakdown with all components", () => {
      const baseline: TimelineRange = { minWeeks: 8, maxWeeks: 16 };
      const input = createTestInput({
        includeDiscoveryWorkshop: true,
        stakeholderCount: 2,
      });
      const breakdown = calculateTimelineBreakdown(baseline, input);

      assert.ok(breakdown.baseline);
      assert.strictEqual(breakdown.baseline.minWeeks, 8);
      assert.strictEqual(breakdown.baseline.maxWeeks, 16);
      assert.ok(Array.isArray(breakdown.adjustments));
      assert.strictEqual(breakdown.rushCompression, 1);
    });

    it("should apply rush compression factor when expeditedDelivery is true", () => {
      const baseline: TimelineRange = { minWeeks: 8, maxWeeks: 16 };
      const input = createTestInput({ expeditedDelivery: true });
      const breakdown = calculateTimelineBreakdown(baseline, input);

      assert.strictEqual(breakdown.rushCompression, RUSH_COMPRESSION_FACTOR);
    });
  });

  describe("calculateFinalTimeline", () => {
    it("should calculate final timeline from breakdown", () => {
      const baseline: TimelineRange = { minWeeks: 8, maxWeeks: 16 };
      const input = createTestInput();
      const breakdown = calculateTimelineBreakdown(baseline, input);
      const final = calculateFinalTimeline(breakdown, input.stakeholderCount);

      assert.ok(final.minWeeks >= MINIMUM_TIMELINE_WEEKS);
      assert.ok(final.maxWeeks >= MINIMUM_TIMELINE_WEEKS);
      assert.ok(final.maxWeeks >= final.minWeeks);
    });

    it("should enforce minimum timeline", () => {
      const baseline: TimelineRange = { minWeeks: 1, maxWeeks: 2 };
      const input = createTestInput();
      const breakdown = calculateTimelineBreakdown(baseline, input);
      const final = calculateFinalTimeline(breakdown, 0);

      assert.strictEqual(final.minWeeks, MINIMUM_TIMELINE_WEEKS);
      assert.strictEqual(final.maxWeeks, MINIMUM_TIMELINE_WEEKS);
    });

    it("should add stakeholder weeks to timeline", () => {
      const baseline: TimelineRange = { minWeeks: 8, maxWeeks: 16 };
      const input = createTestInput({ stakeholderCount: 0 });
      const breakdown = calculateTimelineBreakdown(baseline, input);
      const finalNoRooms = calculateFinalTimeline(breakdown, 0);

      const inputWithRooms = createTestInput({ stakeholderCount: 4 });
      const breakdownWithRooms = calculateTimelineBreakdown(baseline, inputWithRooms);
      const finalWithRooms = calculateFinalTimeline(breakdownWithRooms, 4);

      assert.ok(finalWithRooms.minWeeks > finalNoRooms.minWeeks);
    });
  });
});

describe("Estimate Engine", () => {
  const repository = createMockPricingRepository();

  describe("validateEstimationInput", () => {
    it("should return empty array for valid input", () => {
      const input = createTestInput();
      const errors = validateEstimationInput(input);
      assert.strictEqual(errors.length, 0);
    });

    it("should require projectTypeId", () => {
      const input = createTestInput({ projectTypeId: "" });
      const errors = validateEstimationInput(input);
      assert.ok(errors.some((e) => e.includes("Project type")));
    });

    it("should require styleMultiplierId", () => {
      const input = createTestInput({ styleMultiplierId: "" });
      const errors = validateEstimationInput(input);
      assert.ok(errors.some((e) => e.includes("Style option")));
    });

    it("should require positive scope size", () => {
      const input = createTestInput({ scopeSize: 0 });
      const errors = validateEstimationInput(input);
      assert.ok(errors.some((e) => e.includes("Scope size")));
    });

    it("should cap maximum scope size", () => {
      const input = createTestInput({ scopeSize: 15000 });
      const errors = validateEstimationInput(input);
      assert.ok(errors.some((e) => e.includes("10,000 units")));
    });

    it("should not allow negative stakeholder count", () => {
      const input = createTestInput({ stakeholderCount: -1 });
      const errors = validateEstimationInput(input);
      assert.ok(errors.some((e) => e.includes("negative")));
    });

    it("should cap maximum stakeholder count", () => {
      const input = createTestInput({ stakeholderCount: 100 });
      const errors = validateEstimationInput(input);
      assert.ok(errors.some((e) => e.includes("50")));
    });
  });

  describe("getIncludedOptionsList", () => {
    it("should return empty array when no options selected", () => {
      const input = createTestInput();
      const options = getIncludedOptionsList(input);
      assert.strictEqual(options.length, 0);
    });

    it("should return selected option names", () => {
      const input = createTestInput({
        includeDiscoveryWorkshop: true,
        includeTrainingEnablement: true,
        expeditedDelivery: true,
      });
      const options = getIncludedOptionsList(input);
      assert.strictEqual(options.length, 3);
      assert.ok(options.includes("Discovery Workshop"));
      assert.ok(options.includes("Training & Enablement"));
      assert.ok(options.includes("Expedited Delivery"));
    });
  });

  describe("calculateEstimate", () => {
    it("should return null for invalid project type", async () => {
      const input = createTestInput({ projectTypeId: "nonexistent" });
      const result = await calculateEstimate(repository, input);
      assert.strictEqual(result, null);
    });

    it("should return null for invalid style option", async () => {
      const input = createTestInput({ styleMultiplierId: "nonexistent" });
      const result = await calculateEstimate(repository, input);
      assert.strictEqual(result, null);
    });

    it("should return complete estimate summary", async () => {
      const input = createTestInput();
      const result = await calculateEstimate(repository, input);

      assert.ok(result, "Should return estimate summary");
      assert.ok(result.projectType);
      assert.ok(result.styleOption);
      assert.ok(result.input);
      assert.ok(result.budget);
      assert.ok(result.timeline);
      assert.ok(result.currency);
    });

    it("should have correct summary shape", async () => {
      const input = createTestInput({
        includeDiscoveryWorkshop: true,
        stakeholderCount: 3,
      });
      const result = await calculateEstimate(repository, input);

      assert.ok(result);
      // Project type
      assert.strictEqual(result.projectType.id, "strategic-initiative");
      assert.strictEqual(typeof result.projectType.name, "string");

      // Style option
      assert.strictEqual(result.styleOption.id, "standard-delivery");
      assert.strictEqual(typeof result.styleOption.name, "string");
      assert.strictEqual(typeof result.styleOption.multiplier, "number");

      // Input
      assert.strictEqual(result.input.scopeSize, 50);
      assert.strictEqual(result.input.stakeholderCount, 3);
      assert.ok(Array.isArray(result.input.includedOptions));

      // Budget
      assert.ok(result.budget.baseline);
      assert.ok(result.budget.final);
      assert.ok(result.budget.breakdown);
      assert.strictEqual(typeof result.budget.areaImpact, "number");
      assert.strictEqual(typeof result.budget.styleImpact, "number");

      // Timeline
      assert.ok(result.timeline.baseline);
      assert.ok(result.timeline.final);
      assert.ok(result.timeline.breakdown);
      assert.strictEqual(typeof result.timeline.adjustmentsWeeks, "number");
      assert.strictEqual(typeof result.timeline.rushCompression, "number");

      // Currency
      assert.strictEqual(result.currency, "USD");
    });

    it("should calculate budget with style multiplier", async () => {
      const inputModern = createTestInput({ styleMultiplierId: "standard-delivery" });
      const inputPremium = createTestInput({ styleMultiplierId: "advisory-led" });

      const resultModern = await calculateEstimate(repository, inputModern);
      const resultPremium = await calculateEstimate(repository, inputPremium);

      assert.ok(resultModern && resultPremium);

      // Premium should be more expensive due to 1.18 multiplier
      assert.ok(
        resultPremium.budget.final.min > resultModern.budget.final.min,
        "Premium style should have higher min budget"
      );
      assert.ok(
        resultPremium.budget.final.max > resultModern.budget.final.max,
        "Premium style should have higher max budget"
      );
    });

    it("should calculate budget with adjustments", async () => {
      const inputNoOptions = createTestInput();
      const inputWithOptions = createTestInput({
        includeDiscoveryWorkshop: true,
        includeComplianceReview: true,
      });

      const resultNoOptions = await calculateEstimate(repository, inputNoOptions);
      const resultWithOptions = await calculateEstimate(repository, inputWithOptions);

      assert.ok(resultNoOptions && resultWithOptions);

      // With options should be more expensive
      assert.ok(
        resultWithOptions.budget.final.min > resultNoOptions.budget.final.min,
        "Options should increase budget"
      );
    });

    it("should calculate timeline with adjustments", async () => {
      const inputNoOptions = createTestInput();
      const inputWithOptions = createTestInput({
        includeDiscoveryWorkshop: true,
        includeComplianceReview: true,
      });

      const resultNoOptions = await calculateEstimate(repository, inputNoOptions);
      const resultWithOptions = await calculateEstimate(repository, inputWithOptions);

      assert.ok(resultNoOptions && resultWithOptions);

      // With options should take longer
      assert.ok(
        resultWithOptions.timeline.final.minWeeks > resultNoOptions.timeline.final.minWeeks,
        "Options should increase timeline"
      );
    });

    it("should apply rush compression to timeline", async () => {
      const inputNormal = createTestInput();
      const inputRush = createTestInput({ expeditedDelivery: true });

      const resultNormal = await calculateEstimate(repository, inputNormal);
      const resultRush = await calculateEstimate(repository, inputRush);

      assert.ok(resultNormal && resultRush);

      // Rush should compress timeline
      assert.ok(
        resultRush.timeline.final.minWeeks < resultNormal.timeline.final.minWeeks,
        "Rush should compress timeline"
      );
      assert.strictEqual(resultRush.timeline.rushCompression, RUSH_COMPRESSION_FACTOR);

      // Rush should increase budget
      assert.ok(
        resultRush.budget.final.min > resultNormal.budget.final.min,
        "Rush should increase budget"
      );
    });

    it("should handle different project types", async () => {
      const officeFitOut = createTestInput({ projectTypeId: "strategic-initiative" });
      const receptionUpgrade = createTestInput({ projectTypeId: "targeted-enhancement" });

      const resultOffice = await calculateEstimate(repository, officeFitOut);
      const resultReception = await calculateEstimate(repository, receptionUpgrade);

      assert.ok(resultOffice && resultReception);

      // Office fit-out should be more expensive than reception upgrade
      assert.ok(
        resultOffice.budget.baseline.min > resultReception.budget.baseline.min,
        "Office fit-out baseline should be higher"
      );
    });
  });
});

describe("Integration: Full Estimation Flow", () => {
  const repository = createMockPricingRepository();

  it("should produce consistent results for same input", async () => {
    const input = createTestInput({
      includeDiscoveryWorkshop: true,
      includeTrainingEnablement: true,
      stakeholderCount: 4,
    });

    const result1 = await calculateEstimate(repository, input);
    const result2 = await calculateEstimate(repository, input);

    assert.deepStrictEqual(result1, result2);
  });

  it("should handle all options enabled", async () => {
    const input = createTestInput({
      includeDiscoveryWorkshop: true,
      includeTrainingEnablement: true,
      includeImplementationSupport: true,
      includeCustomDeliverables: true,
      includeAutomationIntegration: true,
      includeComplianceReview: true,
      expeditedDelivery: true,
      stakeholderCount: 10,
      scopeSize: 200,
    });

    const result = await calculateEstimate(repository, input);

    assert.ok(result);
    assert.ok(result.budget.final.min > 0);
    assert.ok(result.budget.final.max > 0);
    assert.ok(result.timeline.final.minWeeks >= MINIMUM_TIMELINE_WEEKS);
    assert.ok(result.timeline.final.maxWeeks >= MINIMUM_TIMELINE_WEEKS);
    assert.strictEqual(result.input.includedOptions.length, 7);
  });
});
