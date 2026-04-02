/**
 * Mock Provider for Local Development (ORDX-018E)
 *
 * Provides realistic mock proposal generation for local development
 * without requiring a live Gemini API connection.
 *
 * Features:
 * - Realistic cross-industry proposal content
 * - Consistent output structure
 * - Simulated latency for realistic testing
 * - Deterministic output based on input (for testing)
 */

import type {
  AIGenerationProvider,
  GeneratedProposalContent,
  ProposalGenerationInput,
} from "@/types/proposal-generation";
import { buildProposalPrompt } from "../prompt-builder";

/**
 * Configuration for mock provider.
 */
export interface MockProviderConfig {
  /** Simulated latency in milliseconds (default: 500-1500ms random) */
  latencyMs?: number;
  /** Whether to use deterministic output (based on input hash) */
  deterministic?: boolean;
  /** Fixed model name to report in metadata */
  model?: string;
}

/**
 * Default configuration.
 */
const DEFAULT_CONFIG = {
  latencyMs: undefined, // Random between 500-1500
  deterministic: false,
  model: "mock-provider-v1",
} as const;

/**
 * Cross-industry domain templates for realistic mock content.
 */
const DOMAIN_TEMPLATES = {
  executiveSummary: {
    overview: (client: string, scopeSize: number, projectType: string) =>
      `This proposal outlines a comprehensive ${projectType.toLowerCase()} engagement for ${client}, covering a scope sized at ${scopeSize} units. Our approach balances strategic clarity, execution readiness, and stakeholder alignment to support durable outcomes.`,
    valueProposition: (style: string) =>
      `By leveraging our expertise in ${style.toLowerCase()} delivery and proven project methodologies, we create value through clear scope framing, focused prioritization, and execution practices that reduce delivery risk while supporting measurable results.`,
    recommendation: (budget: { min: number; max: number }, weeks: { minWeeks: number; maxWeeks: number }) =>
      `We recommend proceeding with the proposed engagement approach within the NT$${Math.round(budget.min / 1000)}K-${Math.round(budget.max / 1000)}K budget range, targeting a ${weeks.minWeeks}-${weeks.maxWeeks} week delivery window to align investment with operational outcomes.`,
  },

  projectUnderstanding: {
    businessContext: (industry: string) =>
      `As an organization operating in the ${industry} sector, your team requires a proposal approach that balances stakeholder expectations, delivery discipline, and practical implementation readiness. The engagement should support current priorities while preserving flexibility for evolving needs.`,
    objectives: [
      "Create a professional environment that enhances employee productivity and well-being",
      "Maximize space efficiency while maintaining comfortable circulation and collaboration zones",
      "Reflect corporate brand identity through thoughtful design elements and material selection",
      "Ensure scalability for future team growth without major structural changes",
      "Achieve project completion within budget and timeline constraints",
    ],
    spatialRequirements: (scopeSize: number, stakeholderCount: number) =>
      `The engagement scope of ${scopeSize} units must support ${stakeholderCount} stakeholder tracks, coordinated decision-making, and clear rollout sequencing while maintaining manageable execution overhead.`,
    constraints: [
      "Key approvals may introduce additional review cycles before implementation begins",
      "Operational, compliance, or governance constraints may affect delivery sequencing",
      "Stakeholder availability may influence workshop cadence and decision timing",
      "Specialized dependencies may affect schedule confidence for higher-complexity scopes",
    ],
  },

  designDirection: {
    philosophy: (style: string) =>
      `Our recommended approach uses a ${style.toLowerCase()} model that balances strategic guidance with delivery accountability. We prioritize practical sequencing, clearly defined outputs, and customer-friendly governance throughout the engagement.`,
    materialsFinishes: [
      "Discovery and alignment activities to clarify objectives and constraints",
      "Core delivery workstreams structured around measurable outcomes",
      "Implementation support to improve follow-through and adoption readiness",
      "Governance checkpoints to support timely reviews and decisions",
      "Customer-facing summaries tailored for stakeholder communication",
    ],
    colorPalette: (style: string) =>
      `The ${style.toLowerCase()} engagement model combines focused advisory input, structured delivery routines, and transparent reporting to maintain momentum and confidence.`,
    lightingApproach:
      "Our delivery approach combines clear phase gates, recurring stakeholder alignment, and practical feedback loops so decisions can be made quickly without losing traceability.",
    furnitureEquipment: [
      "Decision logs and working-session summaries",
      "Phased delivery plans with milestone checkpoints",
      "Stakeholder-ready artifacts for reviews and approvals",
      "Enablement materials to support adoption and handoff",
      "Risk, assumption, and dependency tracking artifacts",
    ],
  },

  spatialPlanning: {
    overallStrategy: (scopeSize: number) =>
      `The ${scopeSize} unit engagement is organized around a clear delivery spine: discovery first, prioritized workstreams second, and implementation readiness throughout. This structure keeps the scope manageable while preserving flexibility for revisions and follow-on phases.`,
    areaRecommendations: [
      {
        area: "Discovery & Alignment",
        recommendation:
          "Use early workshops to confirm objectives, constraints, success measures, and decision-makers before deeper execution begins.",
        rationale:
          "Early alignment reduces rework and gives later recommendations a stronger operational foundation.",
      },
      {
        area: "Core Delivery Workstream",
        recommendation:
          "Sequence the main workstream into tightly scoped phases with explicit checkpoints, owners, and review criteria.",
        rationale:
          "Phased delivery improves predictability and helps stakeholders absorb decisions incrementally.",
      },
      {
        area: "Stakeholder Review Layer",
        recommendation:
          "Create lightweight stakeholder review artifacts that support fast decisions without adding unnecessary approval burden.",
        rationale:
          "Focused review materials keep engagement momentum while preserving accountability.",
      },
      {
        area: "Enablement & Handoff",
        recommendation:
          "Package rollout guidance, enablement support, and post-delivery recommendations into a clear handoff path.",
        rationale:
          "Structured handoff reduces adoption friction and helps the customer sustain value after delivery.",
      },
    ],
    circulationFlow:
      "Primary coordination flows through a central cadence of checkpoints and stakeholder reviews, while secondary coordination happens inside individual workstreams. This keeps decisions visible without overwhelming contributors.",
    flexibilityConsiderations:
      "The engagement structure supports phased expansion, revised priorities, and future work packages by keeping deliverables modular and assumptions explicit.",
  },

  budgetNarrative: {
    overview: (budget: { min: number; max: number }) =>
      `The estimated budget of NT$${Math.round(budget.min / 1000)}K-${Math.round(budget.max / 1000)}K encompasses all design, construction, furniture, and equipment costs. This range reflects the selected quality tier and scope inclusions.`,
    costBreakdown: [
      "Construction & Fit-out (45-50%): Partitions, flooring, ceiling, MEP work, and built-in cabinetry",
      "Furniture & Equipment (25-30%): Workstations, seating, storage, and AV equipment",
      "Design & Professional Fees (10-15%): Interior design, engineering consultants, and project management",
      "Contingency (10%): Allowance for unforeseen conditions and client-requested changes",
    ],
    valueEngineeringOptions: [
      "Substitute premium carpet for vinyl flooring in back-of-house areas (savings: 5-8%)",
      "Reduce glass partition extent and use drywall for internal meeting rooms (savings: 8-12%)",
      "Phase furniture procurement to spread capital expenditure over two budget cycles",
      "Select standard furniture lines instead of fully custom pieces (savings: 15-20% on furniture)",
    ],
    confidenceExplanation:
      "Budget estimates are based on current market rates and similar completed projects. Final pricing will be confirmed through competitive tender. The range accounts for material selection variations and potential scope refinements during design development.",
  },

  timelineNarrative: {
    overview: (weeks: { minWeeks: number; maxWeeks: number }) =>
      `The project is estimated to span ${weeks.minWeeks} – ${weeks.maxWeeks} weeks from design confirmation to final handover, organized into distinct phases with clear milestones and decision points.`,
    milestones: [
      "Week 1-2: Design finalization and material selection approval",
      "Week 3-4: Permit submissions and contractor procurement",
      "Week 5-6: Site preparation and demolition (if required)",
      "Week 7-12: Construction and MEP installation",
      "Week 13-14: Furniture installation and final touches",
      "Week 15: Final inspection, punch list, and handover",
    ],
    criticalPath: [
      "Building management approval for construction plans",
      "Long-lead material procurement (glass, specialty finishes)",
      "MEP coordination and installation sequence",
      "Furniture delivery scheduling aligned with construction completion",
    ],
    confidenceExplanation:
      "Timeline estimates assume prompt decision-making on design and material selections. Delays in approvals or material availability may extend the schedule. Rush project compression is possible but may incur cost premiums.",
  },

  risksAndAssumptions: {
    risks: [
      {
        description:
          "Building management may require design modifications for code compliance or building standards",
        impact: "medium" as const,
        mitigationOrValidation:
          "Early engagement with building management and pre-submission design review",
      },
      {
        description:
          "Long-lead materials may extend project timeline if not ordered promptly",
        impact: "high" as const,
        mitigationOrValidation:
          "Identify and order long-lead items during design finalization phase",
      },
      {
        description:
          "Existing site conditions may differ from as-built documentation",
        impact: "medium" as const,
        mitigationOrValidation:
          "Conduct detailed site survey before finalizing construction drawings",
      },
    ],
    assumptions: [
      {
        description:
          "Client will provide brand guidelines and any specific design requirements within the first week",
        impact: "high" as const,
        mitigationOrValidation:
          "Confirm design requirements checklist during kick-off meeting",
      },
      {
        description:
          "Building management approval process takes approximately 2-3 weeks",
        impact: "medium" as const,
        mitigationOrValidation:
          "Verify approval timeline with building management during site survey",
      },
      {
        description: "Site will be available for exclusive access during construction",
        impact: "high" as const,
        mitigationOrValidation:
          "Confirm access arrangements and any shared space constraints",
      },
    ],
  },

  nextSteps: {
    immediate: [
      "Review and approve this proposal",
      "Confirm project scope and budget range",
      "Provide brand guidelines and design preferences",
      "Schedule site survey and building management introduction",
    ],
    shortTerm: [
      "Finalize design direction and material selections",
      "Complete detailed space planning",
      "Obtain building management approvals",
      "Issue tender documents to qualified contractors",
    ],
    decisionPoints: [
      "Design concept selection (Week 1)",
      "Material and finish approval (Week 2)",
      "Contractor selection and contract award (Week 4)",
      "Furniture selection confirmation (Week 6)",
    ],
  },
};

/**
 * Generate mock proposal content based on input.
 */
export function generateMockContent(
  input: ProposalGenerationInput,
  model: string
): GeneratedProposalContent {
  const { projectContext, estimationContext } = input;
  const budget = estimationContext.budgetRange;
  const timeline = estimationContext.timelineRange;

  return {
    executiveSummary: {
      overview: DOMAIN_TEMPLATES.executiveSummary.overview(
        projectContext.clientName,
        estimationContext.scopeSize,
        projectContext.projectTypeName
      ),
      valueProposition: DOMAIN_TEMPLATES.executiveSummary.valueProposition(
        projectContext.styleOptionName
      ),
      recommendation: DOMAIN_TEMPLATES.executiveSummary.recommendation(
        budget,
        timeline
      ),
    },
    projectUnderstanding: {
      businessContext: DOMAIN_TEMPLATES.projectUnderstanding.businessContext(
        projectContext.industry
      ),
      objectives: DOMAIN_TEMPLATES.projectUnderstanding.objectives,
      operationalNeeds: DOMAIN_TEMPLATES.projectUnderstanding.spatialRequirements(
        estimationContext.scopeSize,
        estimationContext.stakeholderCount
      ),
      constraints: DOMAIN_TEMPLATES.projectUnderstanding.constraints,
    },
    proposedApproach: {
      approachSummary: DOMAIN_TEMPLATES.designDirection.philosophy(
        projectContext.styleOptionName
      ),
      workstreams: DOMAIN_TEMPLATES.designDirection.materialsFinishes,
      engagementModel: DOMAIN_TEMPLATES.designDirection.colorPalette(
        projectContext.styleOptionName
      ),
      deliveryApproach: DOMAIN_TEMPLATES.designDirection.lightingApproach,
      capabilityEnablers: DOMAIN_TEMPLATES.designDirection.furnitureEquipment,
    },
    scopeRecommendations: {
      overallStrategy: DOMAIN_TEMPLATES.spatialPlanning.overallStrategy(
        estimationContext.scopeSize
      ),
      areaRecommendations: DOMAIN_TEMPLATES.spatialPlanning.areaRecommendations,
      circulationFlow: DOMAIN_TEMPLATES.spatialPlanning.circulationFlow,
      flexibilityConsiderations:
        DOMAIN_TEMPLATES.spatialPlanning.flexibilityConsiderations,
    },
    budgetNarrative: {
      overview: DOMAIN_TEMPLATES.budgetNarrative.overview(budget),
      costBreakdown: DOMAIN_TEMPLATES.budgetNarrative.costBreakdown,
      valueEngineeringOptions:
        DOMAIN_TEMPLATES.budgetNarrative.valueEngineeringOptions,
      confidenceExplanation:
        DOMAIN_TEMPLATES.budgetNarrative.confidenceExplanation,
    },
    timelineNarrative: {
      overview: DOMAIN_TEMPLATES.timelineNarrative.overview(timeline),
      milestones: DOMAIN_TEMPLATES.timelineNarrative.milestones.slice(
        0,
        Math.min(Math.ceil(timeline.maxWeeks / 3), 6)
      ),
      criticalPath: DOMAIN_TEMPLATES.timelineNarrative.criticalPath,
      confidenceExplanation:
        DOMAIN_TEMPLATES.timelineNarrative.confidenceExplanation,
    },
    risksAndAssumptions: {
      risks: DOMAIN_TEMPLATES.risksAndAssumptions.risks,
      assumptions: DOMAIN_TEMPLATES.risksAndAssumptions.assumptions,
    },
    recommendedNextSteps: {
      immediate: DOMAIN_TEMPLATES.nextSteps.immediate,
      shortTerm: DOMAIN_TEMPLATES.nextSteps.shortTerm,
      decisionPoints: DOMAIN_TEMPLATES.nextSteps.decisionPoints,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      modelUsed: model,
      provider: "mock",
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    },
  };
}

/**
 * Simulate network latency.
 */
async function simulateLatency(latencyMs?: number): Promise<void> {
  const delay =
    latencyMs ?? Math.floor(Math.random() * 1000) + 500; // 500-1500ms
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Mock provider implementation for local development.
 *
 * Usage:
 * ```typescript
 * const provider = new MockProvider();
 * const content = await provider.generateProposalContent(input);
 * ```
 */
export class MockProvider implements AIGenerationProvider {
  readonly providerId = "mock";

  private readonly latencyMs?: number;
  private readonly deterministic: boolean;
  private readonly model: string;

  constructor(config: MockProviderConfig = {}) {
    this.latencyMs = config.latencyMs;
    this.deterministic = config.deterministic ?? DEFAULT_CONFIG.deterministic;
    this.model = config.model ?? DEFAULT_CONFIG.model;
  }

  /**
   * Mock provider is always available.
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * Generate mock proposal content.
   *
   * @param input - Proposal generation input
   * @returns Mock generated proposal content
   */
  async generateProposalContent(
    input: ProposalGenerationInput
  ): Promise<GeneratedProposalContent> {
    // Build prompt to validate input (but don't use it for generation)
    buildProposalPrompt(input);

    // Simulate network latency
    await simulateLatency(this.latencyMs);

    // Generate mock content
    return generateMockContent(input, this.model);
  }
}

/**
 * Factory function to create a mock provider.
 */
export function createMockProvider(
  config?: MockProviderConfig
): AIGenerationProvider {
  return new MockProvider(config);
}
