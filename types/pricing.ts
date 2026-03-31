export interface PricingProjectType {
  id: string;
  name: string;
  description: string;
  budgetBaselineMin: number;
  budgetBaselineMax: number;
  timelineBaselineMinWeeks: number;
  timelineBaselineMaxWeeks: number;
}

export interface PricingStyleOption {
  id: string;
  name: string;
  description: string;
  multiplier: number;
}

export interface PricingAdjustment {
  id: string;
  name: string;
  description: string;
  budgetImpactType: "percentage" | "flat";
  budgetImpactValue: number;
  timelineImpactWeeks: number;
}

export interface PricingRuleSet {
  id: string;
  name: string;
  status: "active" | "draft";
  effectiveFrom: string;
  currency: string;
  notes: string;
  projectTypes: PricingProjectType[];
  styleOptions: PricingStyleOption[];
  adjustments: PricingAdjustment[];
}
