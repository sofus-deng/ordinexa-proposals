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
  /** Project type identifier */
  projectTypeId: string;

  /** Delivery model identifier */
  styleMultiplierId: string;

  /** Relative scope size used for sizing-based estimate adjustments */
  scopeSize: number;

  /** Delivery complexity on a 1-5 scale */
  complexityLevel: number;

  /** Number of primary stakeholders or coordination tracks */
  stakeholderCount: number;

  /** Whether to include discovery workshop facilitation */
  includeDiscoveryWorkshop: boolean;

  /** Whether to include training and enablement support */
  includeTrainingEnablement: boolean;

  /** Whether to include implementation support */
  includeImplementationSupport: boolean;

  /** Whether to include custom deliverables */
  includeCustomDeliverables: boolean;

  /** Whether to include automation or systems integration */
  includeAutomationIntegration: boolean;

  /** Whether to include compliance and governance review */
  includeComplianceReview: boolean;

  /** Whether this is an accelerated delivery engagement */
  expeditedDelivery: boolean;
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
    scopeSize: number;
    complexityLevel: number;
    stakeholderCount: number;
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
