/**
 * Mock Provider for Local Development (ORDX-018E)
 *
 * Provides realistic mock proposal generation for local development
 * without requiring a live Gemini API connection.
 *
 * Features:
 * - Realistic interior fit-out domain content
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
 * Interior fit-out domain templates for realistic mock content.
 */
const DOMAIN_TEMPLATES = {
  executiveSummary: {
    overview: (client: string, area: number, projectType: string) =>
      `This proposal outlines a comprehensive ${projectType.toLowerCase()} solution for ${client}, covering ${area} ping of premium commercial space. Our approach combines functional excellence with aesthetic sophistication to create a workspace that enhances productivity and reflects your corporate identity.`,
    valueProposition: (style: string) =>
      `By leveraging our expertise in ${style.toLowerCase()} design and proven project delivery methodologies, we deliver exceptional value through optimized space utilization, sustainable material selection, and efficient project execution that minimizes business disruption.`,
    recommendation: (budget: { min: number; max: number }, weeks: { minWeeks: number; maxWeeks: number }) =>
      `We recommend proceeding with the proposed design direction within the NT$${Math.round(budget.min / 1000)}K-${Math.round(budget.max / 1000)}K budget range, targeting a ${weeks.minWeeks}-${weeks.maxWeeks} week implementation timeline to achieve optimal results for your business objectives.`,
  },

  projectUnderstanding: {
    businessContext: (industry: string) =>
      `As a leader in the ${industry} sector, your organization requires a workspace that supports both collaborative innovation and focused individual work. The new office design should reinforce your brand values while providing flexibility for future growth and evolving work patterns.`,
    objectives: [
      "Create a professional environment that enhances employee productivity and well-being",
      "Maximize space efficiency while maintaining comfortable circulation and collaboration zones",
      "Reflect corporate brand identity through thoughtful design elements and material selection",
      "Ensure scalability for future team growth without major structural changes",
      "Achieve project completion within budget and timeline constraints",
    ],
    spatialRequirements: (area: number, meetingRooms: number) =>
      `The ${area} ping space must accommodate ${meetingRooms} meeting rooms, open work areas, and supporting facilities while maintaining optimal circulation and natural light distribution throughout.`,
    constraints: [
      "Building management approval required for structural modifications",
      "MEP work must comply with local building codes and fire safety regulations",
      "Construction noise and activities must minimize disruption to neighboring tenants",
      "Material lead times may impact project schedule for premium finishes",
    ],
  },

  designDirection: {
    philosophy: (style: string) =>
      `Our design philosophy centers on creating a ${style.toLowerCase()} aesthetic that balances form and function. We emphasize clean lines, natural materials, and thoughtful spatial planning to create an environment that inspires creativity while supporting daily operational needs.`,
    materialsFinishes: [
      "Premium low-emission carpet tiles with acoustic backing for open areas",
      "Engineered hardwood flooring for executive and meeting spaces",
      "Floor-to-ceiling glass partitions with integrated blinds for meeting rooms",
      "Natural stone or quartz reception desk with integrated lighting",
      "Acoustic wall panels in brand-aligned colors for noise control",
    ],
    colorPalette: (style: string) =>
      `The ${style.toLowerCase()} palette features warm neutrals (taupe, warm gray, soft white) as the foundation, accented by your brand colors and natural wood tones. Metallic accents in brushed brass or matte black hardware add sophistication.`,
    lightingApproach:
      "Our lighting strategy combines abundant natural light with layered artificial lighting: ambient LED panels for general illumination, task lighting at workstations, and decorative fixtures in reception and collaborative areas. All lighting is dimmable and tunable for circadian rhythm support.",
    furnitureEquipment: [
      "Height-adjustable desks with integrated cable management for all workstations",
      "Ergonomic task chairs with lumbar support and adjustable armrests",
      "Modular sofa systems for collaborative areas with power integration",
      "Conference tables with integrated AV and power capabilities",
      "Storage solutions including personal lockers and filing systems",
    ],
  },

  spatialPlanning: {
    overallStrategy: (area: number) =>
      `The ${area} ping floor plate is organized around a central circulation spine, with open workspace radiating outward to maximize natural light penetration. Meeting rooms and private offices are positioned along the core, while collaborative zones anchor the corners with views.`,
    areaRecommendations: [
      {
        area: "Reception",
        recommendation:
          "Create an impressive entry experience with a feature wall, comfortable waiting seating, and clear wayfinding to meeting rooms and work areas.",
        rationale:
          "First impressions matter - the reception sets the tone for client visits and candidate interviews.",
      },
      {
        area: "Open Workspace",
        recommendation:
          "Organize workstations in clusters of 4-6 with shared amenities nearby, maintaining minimum 1.8m circulation paths.",
        rationale:
          "Clustered arrangements balance collaboration opportunities with acoustic management and efficient space utilization.",
      },
      {
        area: "Meeting Rooms",
        recommendation:
          "Size meeting rooms for 4-6, 8-10, and 12-16 person capacities with appropriate AV equipment and acoustic treatment.",
        rationale:
          "Varied room sizes accommodate different meeting types while maximizing utilization rates.",
      },
      {
        area: "Pantry",
        recommendation:
          "Position pantry as a social hub with varied seating options, natural light, and connection to outdoor space if available.",
        rationale:
          "The pantry serves as the office 'town square' for informal collaboration and breaks.",
      },
    ],
    circulationFlow:
      "Primary circulation follows a clear loop around the core, with secondary paths through open workspace. Sight lines are maintained from reception to major destinations, and glass partitions provide visual connection while maintaining acoustic separation.",
    flexibilityConsiderations:
      "The design incorporates modular furniture systems and demountable partitions where possible, allowing future reconfiguration as team sizes change. Infrastructure includes spare conduit capacity for technology upgrades.",
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
      `The project is estimated to span ${weeks.minWeeks}-${weeks.maxWeeks} weeks from design confirmation to final handover, organized into distinct phases with clear milestones and decision points.`,
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
function generateMockContent(
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
        estimationContext.areaPing,
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
      spatialRequirements: DOMAIN_TEMPLATES.projectUnderstanding.spatialRequirements(
        estimationContext.areaPing,
        estimationContext.meetingRoomCount
      ),
      constraints: DOMAIN_TEMPLATES.projectUnderstanding.constraints,
    },
    designDirection: {
      philosophy: DOMAIN_TEMPLATES.designDirection.philosophy(
        projectContext.styleOptionName
      ),
      materialsFinishes: DOMAIN_TEMPLATES.designDirection.materialsFinishes,
      colorPalette: DOMAIN_TEMPLATES.designDirection.colorPalette(
        projectContext.styleOptionName
      ),
      lightingApproach: DOMAIN_TEMPLATES.designDirection.lightingApproach,
      furnitureEquipment: DOMAIN_TEMPLATES.designDirection.furnitureEquipment,
    },
    spatialPlanningRecommendations: {
      overallStrategy: DOMAIN_TEMPLATES.spatialPlanning.overallStrategy(
        estimationContext.areaPing
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
