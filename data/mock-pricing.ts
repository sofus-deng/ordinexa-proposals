import type {
  PricingAdjustment,
  PricingProjectType,
  PricingRuleSet,
  PricingStyleOption,
} from "@/types";

export const projectTypes: PricingProjectType[] = [
  {
    id: "office-fit-out",
    name: "Office Fit-out",
    description: "Full workplace fit-out baseline for shell-to-operational office delivery.",
    budgetBaselineMin: 85000,
    budgetBaselineMax: 180000,
    timelineBaselineMinWeeks: 8,
    timelineBaselineMaxWeeks: 16,
  },
  {
    id: "office-renovation",
    name: "Office Renovation",
    description: "Interior upgrade baseline for occupied office refurbishment and layout renewal.",
    budgetBaselineMin: 60000,
    budgetBaselineMax: 140000,
    timelineBaselineMinWeeks: 6,
    timelineBaselineMaxWeeks: 12,
  },
  {
    id: "commercial-showroom",
    name: "Commercial Showroom",
    description: "Client-facing display and product showcase environment with branded presentation zones.",
    budgetBaselineMin: 95000,
    budgetBaselineMax: 220000,
    timelineBaselineMinWeeks: 10,
    timelineBaselineMaxWeeks: 18,
  },
  {
    id: "reception-upgrade",
    name: "Reception Upgrade",
    description: "Front-of-house enhancement baseline for lobby, reception, and waiting areas.",
    budgetBaselineMin: 25000,
    budgetBaselineMax: 70000,
    timelineBaselineMinWeeks: 3,
    timelineBaselineMaxWeeks: 8,
  },
  {
    id: "workspace-refresh",
    name: "Workspace Refresh",
    description: "Light-to-medium workplace refresh baseline for finishes, furniture, and minor partition updates.",
    budgetBaselineMin: 35000,
    budgetBaselineMax: 90000,
    timelineBaselineMinWeeks: 4,
    timelineBaselineMaxWeeks: 10,
  },
];

export const styleOptions: PricingStyleOption[] = [
  {
    id: "modern-corporate",
    name: "Modern Corporate",
    description: "Balanced office finish palette with efficient detailing and durable commercial materials.",
    multiplier: 1,
  },
  {
    id: "premium-executive",
    name: "Premium Executive",
    description: "Higher-spec finish level with statement joinery, upgraded materials, and executive detailing.",
    multiplier: 1.18,
  },
  {
    id: "industrial-minimal",
    name: "Industrial Minimal",
    description: "Simplified exposed-material approach with efficient fit-out detailing and practical finishes.",
    multiplier: 0.94,
  },
];

export const pricingAdjustments: PricingAdjustment[] = [
  {
    id: "after-hours-phasing",
    name: "After-hours Phasing",
    description: "Night or weekend works to reduce disruption in occupied commercial premises.",
    budgetImpactType: "percentage",
    budgetImpactValue: 12,
    timelineImpactWeeks: 1,
  },
  {
    id: "landlord-submission-package",
    name: "Landlord Submission Package",
    description: "Additional coordination drawings and compliance pack for landlord review and approval.",
    budgetImpactType: "flat",
    budgetImpactValue: 4500,
    timelineImpactWeeks: 1,
  },
  {
    id: "smart-office-integration",
    name: "Smart Office Integration",
    description: "Coordination allowance for access control, room booking panels, sensors, and workplace tech setup.",
    budgetImpactType: "percentage",
    budgetImpactValue: 9,
    timelineImpactWeeks: 2,
  },
  {
    id: "existing-furniture-reuse",
    name: "Existing Furniture Reuse",
    description: "Commercial credit for incorporating reusable client-owned furniture and loose items.",
    budgetImpactType: "percentage",
    budgetImpactValue: -6,
    timelineImpactWeeks: 0,
  },
];

export const activePricingRuleSet: PricingRuleSet = {
  id: "pricing-2026-q2",
  name: "2026 Q2 Commercial Baseline",
  status: "active",
  effectiveFrom: "2026-04-01",
  currency: "USD",
  notes:
    "Default interior fit-out pricing baseline for Ordinexa Proposals. Values remain mock-backed, estimation-ready, and shaped to map cleanly to Prisma-backed repositories later.",
  projectTypes,
  styleOptions,
  adjustments: pricingAdjustments,
};
