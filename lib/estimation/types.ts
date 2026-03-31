/**
 * Estimation Input Model (ORDX-013A)
 *
 * This defines the input structure for the deterministic estimation engine.
 * All fields are explicitly typed to ensure calculation consistency.
 */

/**
 * Input model for estimation calculations.
 * Maps directly to the proposal form fields and pricing rule lookups.
 */
export interface EstimationInput {
  /** Project type identifier (e.g., "office-fit-out") */
  projectTypeId: string;

  /** Style multiplier identifier (e.g., "modern-corporate") */
  styleMultiplierId: string;

  /** Area in ping (1 ping ≈ 3.3 m² / 35.6 ft²) */
  areaPing: number;

  /** Number of meeting rooms required */
  meetingRoomCount: number;

  /** Whether to include reception area in scope */
  includeReceptionArea: boolean;

  /** Whether to include pantry facilities */
  includePantry: boolean;

  /** Whether to include glass partition systems */
  includeGlassPartitions: boolean;

  /** Whether to include custom storage solutions */
  includeCustomStorage: boolean;

  /** Whether to include smart office integration */
  includeSmartOfficeSetup: boolean;

  /** Whether to include MEP (mechanical, electrical, plumbing) work */
  includeMEPWork: boolean;

  /** Whether this is a rush project with compressed timeline */
  rushProject: boolean;
}

/**
 * Budget range with min and max values.
 */
export interface BudgetRange {
  min: number;
  max: number;
}

/**
 * Timeline range with min and max values in weeks.
 */
export interface TimelineRange {
  minWeeks: number;
  maxWeeks: number;
}

/**
 * Details about how the budget was calculated.
 */
export interface BudgetBreakdown {
  /** Baseline budget from project type */
  baseline: BudgetRange;

  /** Area-based adjustment factor (1.0 = no change) */
  areaFactor: number;

  /** Style multiplier applied */
  styleMultiplier: number;

  /** Individual adjustment impacts */
  adjustments: Array<{
    id: string;
    name: string;
    impactType: "percentage" | "flat";
    impactValue: number;
    budgetImpact: BudgetRange;
  }>;

  /** Total adjustment impact on budget */
  totalAdjustmentImpact: BudgetRange;
}

/**
 * Details about how the timeline was calculated.
 */
export interface TimelineBreakdown {
  /** Baseline timeline from project type */
  baseline: TimelineRange;

  /** Individual adjustment impacts */
  adjustments: Array<{
    id: string;
    name: string;
    weeksAdded: number;
  }>;

  /** Rush project compression if applicable */
  rushCompression: number;

  /** Total additional weeks from adjustments */
  totalAdjustmentWeeks: number;
}

/**
 * Complete estimate summary output (ORDX-013D).
 */
export interface EstimateSummary {
  /** Selected project type information */
  projectType: {
    id: string;
    name: string;
  };

  /** Selected style option information */
  styleOption: {
    id: string;
    name: string;
    multiplier: number;
  };

  /** Input parameters used for calculation */
  input: {
    areaPing: number;
    meetingRoomCount: number;
    includedOptions: string[];
  };

  /** Budget calculation breakdown */
  budget: {
    baseline: BudgetRange;
    areaImpact: number;
    styleImpact: number;
    adjustmentsImpact: BudgetRange;
    final: BudgetRange;
    breakdown: BudgetBreakdown;
  };

  /** Timeline calculation breakdown */
  timeline: {
    baseline: TimelineRange;
    adjustmentsWeeks: number;
    rushCompression: number;
    final: TimelineRange;
    breakdown: TimelineBreakdown;
  };

  /** Currency for display purposes */
  currency: string;
}

/**
 * Repository interface for loading pricing rules.
 * Designed to be implemented by mock data or Prisma-backed repositories.
 */
export interface PricingRepository {
  getProjectType(id: string): Promise<{ id: string; name: string; description: string; budgetBaselineMin: number; budgetBaselineMax: number; timelineBaselineMinWeeks: number; timelineBaselineMaxWeeks: number } | null>;

  getStyleOption(id: string): Promise<{ id: string; name: string; description: string; multiplier: number } | null>;

  getAdjustment(id: string): Promise<{ id: string; name: string; description: string; budgetImpactType: "percentage" | "flat"; budgetImpactValue: number; timelineImpactWeeks: number } | null>;

  getCurrency(): Promise<string>;
}
