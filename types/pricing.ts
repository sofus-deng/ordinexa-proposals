export interface PricingProjectType {
  id: string;
  name: string;
  description: string;
  baseRate: number;
  complexityBand: "Core" | "Growth" | "Strategic";
}

export interface PricingStyleMultiplier {
  id: string;
  name: string;
  description: string;
  multiplier: number;
}

export interface PricingAdjustment {
  id: string;
  name: string;
  description: string;
  type: "percentage" | "flat";
  value: number;
}

export interface PricingRuleSet {
  id: string;
  name: string;
  status: "active" | "draft";
  effectiveFrom: string;
  currency: string;
  notes: string;
  projectTypes: PricingProjectType[];
  styleMultipliers: PricingStyleMultiplier[];
  adjustments: PricingAdjustment[];
}
