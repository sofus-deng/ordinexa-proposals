/**
 * Proposal Prompt Builder (ORDX-018B)
 *
 * Composes structured prompts for AI proposal generation.
 * The prompt builder is explicit and readable, separating concerns:
 * - Estimation logic is pre-calculated and passed in as context
 * - Domain expertise is encoded in the system prompt
 * - Project-specific context is structured for AI comprehension
 */

import type { ProposalGenerationInput } from "@/types/proposal-generation";

/**
 * Built prompt structure containing system and user messages.
 */
export interface BuiltPrompt {
  /** System prompt with domain expertise and output format instructions */
  systemPrompt: string;
  /** User prompt with project-specific context */
  userPrompt: string;
  /** Estimated token count (approximate) */
  estimatedTokens: number;
}

/**
 * Cross-industry proposal expertise for system prompt.
 */
const CROSS_INDUSTRY_PROPOSAL_EXPERTISE = `
You are an expert proposal strategist supporting cross-industry customer engagements.
Your expertise includes:
- Discovery and stakeholder alignment
- Scope framing and service design
- Budget optimization and value engineering
- Project timeline management
- Governance and implementation readiness
- Change enablement and operational adoption
- Cross-functional coordination and delivery planning

When generating proposal content:
1. Be specific and actionable in recommendations
2. Use neutral, professional language suitable across industries
3. Treat scope size, complexity, and stakeholder count as estimation anchors
4. Balance ambition with practicality and budget
5. Address the customer's context without relying on sector-specific jargon
6. Provide clear rationale for recommendations
`;

/**
 * Output format instructions for structured JSON response.
 */
const OUTPUT_FORMAT_INSTRUCTIONS = `
You must respond with a valid JSON object matching this exact structure:

{
  "executiveSummary": {
    "overview": "string - 2-3 sentence project overview",
    "valueProposition": "string - key value proposition for client",
    "recommendation": "string - primary recommendation summary"
  },
  "projectUnderstanding": {
    "businessContext": "string - understanding of client's business",
    "objectives": ["string - project objective 1", "string - project objective 2"],
    "operationalNeeds": "string - understanding of operational needs and engagement context",
    "constraints": ["string - identified constraint 1"]
  },
  "proposedApproach": {
    "approachSummary": "string - overall recommended approach",
    "workstreams": ["string - recommended workstream 1"],
    "engagementModel": "string - suggested engagement model",
    "deliveryApproach": "string - recommended delivery approach",
    "capabilityEnablers": ["string - capability enabler 1"]
  },
  "scopeRecommendations": {
    "overallStrategy": "string - overall scope strategy",
    "areaRecommendations": [
      {
        "area": "string - workstream or focus area name",
        "recommendation": "string - specific recommendation",
        "rationale": "string - rationale for this recommendation"
      }
    ],
    "circulationFlow": "string - coordination and sequencing considerations",
    "flexibilityConsiderations": "string - future flexibility notes"
  },
  "budgetNarrative": {
    "overview": "string - budget allocation overview",
    "costBreakdown": ["string - major cost category 1 with explanation"],
    "valueEngineeringOptions": ["string - value engineering option 1"],
    "confidenceExplanation": "string - explanation of budget confidence"
  },
  "timelineNarrative": {
    "overview": "string - project phases overview",
    "milestones": ["string - key milestone 1"],
    "criticalPath": ["string - critical path item 1"],
    "confidenceExplanation": "string - timeline confidence explanation"
  },
  "risksAndAssumptions": {
    "risks": [
      {
        "description": "string - risk description",
        "impact": "low" | "medium" | "high",
        "mitigationOrValidation": "string - mitigation strategy"
      }
    ],
    "assumptions": [
      {
        "description": "string - assumption description",
        "impact": "low" | "medium" | "high",
        "mitigationOrValidation": "string - validation approach"
      }
    ]
  },
  "recommendedNextSteps": {
    "immediate": ["string - immediate action 1"],
    "shortTerm": ["string - short-term action 1"],
    "decisionPoints": ["string - decision point 1"]
  }
}

Important:
- All string fields should contain substantive, meaningful content
- Arrays should contain 2-5 items unless more are genuinely needed
- Be specific to the project context, not generic
- Use professional language appropriate for B2B proposals
`;

/**
 * Format currency value for display in prompt.
 */
function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format scope size for prompt display.
 */
function formatScopeSize(scopeSize: number): string {
  return `${scopeSize} scope units`;
}

/**
 * Build service modules description.
 */
function buildServiceModulesDescription(
  options: ProposalGenerationInput["serviceModules"]
): string {
  const selectedOptions: string[] = [];

  if (options.includeDiscoveryWorkshop) {
    selectedOptions.push("Discovery workshop facilitation");
  }
  if (options.includeTrainingEnablement) {
    selectedOptions.push("Training and enablement support");
  }
  if (options.includeImplementationSupport) {
    selectedOptions.push("Implementation support and rollout assistance");
  }
  if (options.includeCustomDeliverables) {
    selectedOptions.push("Custom deliverables for unique stakeholder needs");
  }
  if (options.includeAutomationIntegration) {
    selectedOptions.push("Automation and systems integration");
  }
  if (options.includeComplianceReview) {
    selectedOptions.push("Compliance and governance review");
  }

  return selectedOptions.length > 0
    ? selectedOptions.map((opt) => `- ${opt}`).join("\n")
    : "- Core engagement scope only";
}

/**
 * Build the user prompt with project-specific context.
 */
function buildUserPrompt(input: ProposalGenerationInput): string {
  const sections: string[] = [];

  // Project Overview Section
  sections.push("## PROJECT OVERVIEW");
  sections.push(`**Project Title:** ${input.projectContext.title}`);
  sections.push(`**Client:** ${input.projectContext.clientName}`);
  sections.push(`**Contact Person:** ${input.projectContext.contactName}`);
  sections.push(`**Industry:** ${input.projectContext.industry}`);
  sections.push(`**Project Type:** ${input.projectContext.projectTypeName}`);
  sections.push(`**Design Style:** ${input.projectContext.styleOptionName}`);
  sections.push("");

  // Scope Section
  sections.push("## PROJECT SCOPE");
  input.projectContext.scope.forEach((item) => {
    sections.push(`- ${item}`);
  });
  sections.push("");

  // Estimation Anchors Section
  sections.push("## ESTIMATION ANCHORS");
  sections.push(
    `**Scope Size:** ${formatScopeSize(input.estimationContext.scopeSize)}`
  );
  sections.push(
    `**Complexity Level:** ${input.estimationContext.complexityLevel} / 5`
  );
  sections.push(
    `**Stakeholder Count:** ${input.estimationContext.stakeholderCount}`
  );
  sections.push("");

  // Service Modules Section
  sections.push("## SELECTED SERVICE MODULES");
  sections.push(buildServiceModulesDescription(input.serviceModules));
  sections.push("");

  // Budget Context Section (pre-calculated, not computed by AI)
  sections.push("## BUDGET CONTEXT");
  const budget = input.estimationContext.budgetRange;
  sections.push(
    `**Estimated Budget Range:** ${formatCurrency(budget.min, budget.currency)} - ${formatCurrency(budget.max, budget.currency)}`
  );
  sections.push(
    `**Style Multiplier Applied:** ${input.estimationContext.styleMultiplier}x`
  );
  if (input.estimationContext.isExpeditedDelivery) {
    sections.push("**Note:** This engagement requires expedited delivery with compressed timeline");
  }
  sections.push("");

  // Timeline Context Section (pre-calculated)
  sections.push("## TIMELINE CONTEXT");
  const timeline = input.estimationContext.timelineRange;
  sections.push(
    `**Estimated Duration:** ${timeline.minWeeks} - ${timeline.maxWeeks} weeks`
  );
  if (input.estimationContext.isExpeditedDelivery) {
    sections.push("**Note:** Timeline has been compressed due to expedited delivery requirements");
  }
  sections.push("");

  // Included Options Summary
  if (input.estimationContext.includedOptions.length > 0) {
    sections.push("## INCLUDED OPTIONS");
    input.estimationContext.includedOptions.forEach((opt) => {
      sections.push(`- ${opt}`);
    });
    sections.push("");
  }

  // Domain Context Section (optional)
  if (input.domainContext) {
    sections.push("## ADDITIONAL CONTEXT");

    if (
      input.domainContext.deliveryPreferences &&
      input.domainContext.deliveryPreferences.length > 0
    ) {
      sections.push("### Delivery Preferences");
      input.domainContext.deliveryPreferences.forEach((pref: string) => {
        sections.push(`- ${pref}`);
      });
    }

    if (input.domainContext.referenceGuidelines) {
      sections.push("### Reference Guidelines");
      sections.push(input.domainContext.referenceGuidelines);
    }

    if (
      input.domainContext.specialRequirements &&
      input.domainContext.specialRequirements.length > 0
    ) {
      sections.push("### Special Requirements");
      input.domainContext.specialRequirements.forEach((req) => {
        sections.push(`- ${req}`);
      });
    }
    sections.push("");
  }

  // Generation Request
  sections.push("## GENERATION REQUEST");
  sections.push(
    "Based on the above project context, generate a comprehensive cross-industry proposal following the structured output format. Ensure all recommendations are specific to this project and client."
  );

  return sections.join("\n");
}

/**
 * Estimate token count for a string (approximate).
 * Uses a simple heuristic: ~4 characters per token on average.
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Build a complete prompt for proposal generation.
 *
 * @param input - Proposal generation input with project and estimation context
 * @returns Built prompt with system and user messages
 */
export function buildProposalPrompt(
  input: ProposalGenerationInput
): BuiltPrompt {
  const systemPrompt = `${CROSS_INDUSTRY_PROPOSAL_EXPERTISE}

${OUTPUT_FORMAT_INSTRUCTIONS}`;

  const userPrompt = buildUserPrompt(input);

  const estimatedTokens =
    estimateTokenCount(systemPrompt) + estimateTokenCount(userPrompt);

  return {
    systemPrompt,
    userPrompt,
    estimatedTokens,
  };
}

/**
 * Build a minimal prompt for testing purposes.
 * Contains only essential context without full domain expertise.
 */
export function buildMinimalPrompt(
  input: ProposalGenerationInput
): BuiltPrompt {
  const systemPrompt = `You are a cross-industry proposal generator.
Generate proposal content in the specified JSON format based on the project context provided.
${OUTPUT_FORMAT_INSTRUCTIONS}`;

  const userPrompt = buildUserPrompt(input);

  return {
    systemPrompt,
    userPrompt,
    estimatedTokens:
      estimateTokenCount(systemPrompt) + estimateTokenCount(userPrompt),
  };
}

/**
 * Extract key project identifiers for logging/debugging.
 */
export function extractProjectIdentifiers(
  input: ProposalGenerationInput
): Record<string, string | number> {
  return {
    clientName: input.projectContext.clientName,
    projectType: input.projectContext.projectTypeName,
    scopeSize: input.estimationContext.scopeSize,
    budgetMin: input.estimationContext.budgetRange.min,
    budgetMax: input.estimationContext.budgetRange.max,
  };
}
