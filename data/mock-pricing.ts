import type {
  PricingAdjustment,
  PricingProjectType,
  PricingRuleSet,
  PricingStyleOption,
} from "@/types";

export const projectTypes: PricingProjectType[] = [
  {
    id: "strategic-initiative",
    name: "Strategic Initiative",
    description: "Comprehensive end-to-end engagement baseline for large, multi-phase proposal scopes.",
    budgetBaselineMin: 85000,
    budgetBaselineMax: 180000,
    timelineBaselineMinWeeks: 8,
    timelineBaselineMaxWeeks: 16,
  },
  {
    id: "service-modernization",
    name: "Service Modernization",
    description: "Transformation engagement baseline for improving an existing service, workflow, or operating model.",
    budgetBaselineMin: 60000,
    budgetBaselineMax: 140000,
    timelineBaselineMinWeeks: 6,
    timelineBaselineMaxWeeks: 12,
  },
  {
    id: "customer-experience-program",
    name: "Customer Experience Program",
    description: "Client-facing engagement baseline for externally visible initiatives requiring strong coordination and polish.",
    budgetBaselineMin: 95000,
    budgetBaselineMax: 220000,
    timelineBaselineMinWeeks: 10,
    timelineBaselineMaxWeeks: 18,
  },
  {
    id: "targeted-enhancement",
    name: "Targeted Enhancement",
    description: "Focused improvement baseline for a contained engagement with visible near-term value.",
    budgetBaselineMin: 25000,
    budgetBaselineMax: 70000,
    timelineBaselineMinWeeks: 3,
    timelineBaselineMaxWeeks: 8,
  },
  {
    id: "continuous-improvement-engagement",
    name: "Continuous Improvement Engagement",
    description: "Light-to-medium engagement baseline for iterative improvements and incremental delivery outcomes.",
    budgetBaselineMin: 35000,
    budgetBaselineMax: 90000,
    timelineBaselineMinWeeks: 4,
    timelineBaselineMaxWeeks: 10,
  },
];

export const styleOptions: PricingStyleOption[] = [
  {
    id: "standard-delivery",
    name: "Standard Delivery",
    description: "Balanced delivery model focused on dependable execution, practical scope control, and predictable outcomes.",
    multiplier: 1,
  },
  {
    id: "advisory-led",
    name: "Advisory-Led",
    description: "Higher-touch engagement model with more strategic guidance, stakeholder facilitation, and premium support.",
    multiplier: 1.18,
  },
  {
    id: "lean-delivery",
    name: "Lean Delivery",
    description: "Streamlined engagement model prioritizing efficiency, speed, and focused deliverables.",
    multiplier: 0.94,
  },
];

export const pricingAdjustments: PricingAdjustment[] = [
  {
    id: "cross-functional-alignment",
    name: "Cross-Functional Alignment",
    description: "Additional alignment effort to coordinate multiple teams, approvers, and operating constraints.",
    budgetImpactType: "percentage",
    budgetImpactValue: 12,
    timelineImpactWeeks: 1,
  },
  {
    id: "governance-package",
    name: "Governance Package",
    description: "Additional documentation package for review boards, steering groups, or formal approval checkpoints.",
    budgetImpactType: "flat",
    budgetImpactValue: 4500,
    timelineImpactWeeks: 1,
  },
  {
    id: "systems-integration",
    name: "Systems Integration",
    description: "Coordination allowance for platform integrations, automations, and operational handoff dependencies.",
    budgetImpactType: "percentage",
    budgetImpactValue: 9,
    timelineImpactWeeks: 2,
  },
  {
    id: "existing-assets-reuse",
    name: "Existing Assets Reuse",
    description: "Credit for incorporating reusable customer-owned assets, templates, or previously developed materials.",
    budgetImpactType: "percentage",
    budgetImpactValue: -6,
    timelineImpactWeeks: 0,
  },
];

export const activePricingRuleSet: PricingRuleSet = {
  id: "pricing-2026-q2",
  name: "2026 Q2 Cross-Industry Baseline",
  status: "active",
  effectiveFrom: "2026-04-01",
  currency: "USD",
  notes:
    "Default cross-industry proposal baseline for Ordinexa Proposals. Values remain mock-backed, estimation-ready, and shaped to map cleanly to Prisma-backed repositories later.",
  projectTypes,
  styleOptions,
  adjustments: pricingAdjustments,
};
