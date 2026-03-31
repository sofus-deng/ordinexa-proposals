import type {
  PricingAdjustment,
  PricingProjectType,
  PricingRuleSet,
  PricingStyleMultiplier,
} from "@/types";

export const projectTypes: PricingProjectType[] = [
  {
    id: "web-platform",
    name: "Web Platform",
    description: "Core web product delivery for portal, dashboard, and workflow systems.",
    baseRate: 28000,
    complexityBand: "Growth",
  },
  {
    id: "ai-workspace",
    name: "AI Workspace",
    description: "Proposal drafting and internal knowledge workflows with AI touchpoints.",
    baseRate: 42000,
    complexityBand: "Strategic",
  },
  {
    id: "ops-automation",
    name: "Operations Automation",
    description: "Internal tooling, approvals, and operational automation initiatives.",
    baseRate: 22500,
    complexityBand: "Core",
  },
];

export const styleMultipliers: PricingStyleMultiplier[] = [
  {
    id: "standard-delivery",
    name: "Standard Delivery",
    description: "Balanced delivery cadence with expected collaboration checkpoints.",
    multiplier: 1,
  },
  {
    id: "executive-fast-track",
    name: "Executive Fast Track",
    description: "Accelerated delivery with tighter review windows and prioritised staffing.",
    multiplier: 1.22,
  },
  {
    id: "embedded-retainer",
    name: "Embedded Retainer",
    description: "Longer advisory engagement with iterative proposal and pricing refinement.",
    multiplier: 0.92,
  },
];

export const pricingAdjustments: PricingAdjustment[] = [
  {
    id: "stakeholder-workshop",
    name: "Stakeholder Workshop",
    description: "Discovery workshop with senior stakeholders before scope signoff.",
    type: "flat",
    value: 3500,
  },
  {
    id: "multi-region-rollout",
    name: "Multi-region Rollout",
    description: "Additional enablement and rollout preparation across multiple business units.",
    type: "percentage",
    value: 12,
  },
  {
    id: "reference-discount",
    name: "Reference Discount",
    description: "Commercial adjustment for early lighthouse or reference partnerships.",
    type: "percentage",
    value: -8,
  },
];

export const activePricingRuleSet: PricingRuleSet = {
  id: "pricing-2026-q2",
  name: "2026 Q2 Commercial Baseline",
  status: "active",
  effectiveFrom: "2026-04-01",
  currency: "USD",
  notes:
    "Default pricing baseline for Ordinexa Proposals launch accounts. Values are mock-backed in Step 1 and designed to map cleanly to Prisma-backed repositories later.",
  projectTypes,
  styleMultipliers,
  adjustments: pricingAdjustments,
};
