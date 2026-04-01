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
 * Interior fit-out domain expertise for system prompt.
 */
const INTERIOR_DESIGN_DOMAIN_EXPERTISE = `
You are an expert interior fit-out consultant specializing in commercial and office spaces in Taiwan.
Your expertise includes:
- Space planning and workplace strategy
- Material selection and specification
- Budget optimization and value engineering
- Project timeline management
- Building codes and regulations in Taiwan
- Sustainable design practices
- Modern workplace trends and employee experience

When generating proposal content:
1. Be specific and actionable in recommendations
2. Reference local Taiwan market conditions where relevant
3. Consider the 1 ping ≈ 3.3 m² conversion for area calculations
4. Balance aesthetics with functionality and budget
5. Address client's industry-specific needs
6. Provide clear rationale for design decisions
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
    "spatialRequirements": "string - understanding of space needs",
    "constraints": ["string - identified constraint 1"]
  },
  "designDirection": {
    "philosophy": "string - overall design philosophy",
    "materialsFinishes": ["string - material recommendation 1"],
    "colorPalette": "string - color palette description",
    "lightingApproach": "string - lighting design approach",
    "furnitureEquipment": ["string - furniture recommendation 1"]
  },
  "spatialPlanningRecommendations": {
    "overallStrategy": "string - overall spatial strategy",
    "areaRecommendations": [
      {
        "area": "string - area/zone name",
        "recommendation": "string - specific recommendation",
        "rationale": "string - rationale for this recommendation"
      }
    ],
    "circulationFlow": "string - circulation and flow considerations",
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
 * Format area with both ping and square meters.
 */
function formatArea(areaPing: number): string {
  const squareMeters = Math.round(areaPing * 3.3);
  return `${areaPing} ping (${squareMeters} m²)`;
}

/**
 * Build fit-out options description.
 */
function buildFitOutOptionsDescription(
  options: ProposalGenerationInput["fitOutOptions"]
): string {
  const selectedOptions: string[] = [];

  if (options.includeReceptionArea) {
    selectedOptions.push("Reception area design and build");
  }
  if (options.includePantry) {
    selectedOptions.push("Pantry/tea point facilities");
  }
  if (options.includeGlassPartitions) {
    selectedOptions.push("Glass partition systems");
  }
  if (options.includeCustomStorage) {
    selectedOptions.push("Custom storage solutions");
  }
  if (options.includeSmartOfficeSetup) {
    selectedOptions.push("Smart office technology integration");
  }
  if (options.includeMEPWork) {
    selectedOptions.push(
      "MEP (Mechanical, Electrical, Plumbing) engineering works"
    );
  }

  return selectedOptions.length > 0
    ? selectedOptions.map((opt) => `- ${opt}`).join("\n")
    : "- Standard fit-out scope only";
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

  // Space Requirements Section
  sections.push("## SPACE REQUIREMENTS");
  sections.push(
    `**Total Area:** ${formatArea(input.estimationContext.areaPing)}`
  );
  sections.push(
    `**Meeting Rooms:** ${input.estimationContext.meetingRoomCount} rooms`
  );
  sections.push("");

  // Fit-out Options Section
  sections.push("## SELECTED FIT-OUT OPTIONS");
  sections.push(buildFitOutOptionsDescription(input.fitOutOptions));
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
  if (input.estimationContext.isRushProject) {
    sections.push("**Note:** This is a rush project with compressed timeline");
  }
  sections.push("");

  // Timeline Context Section (pre-calculated)
  sections.push("## TIMELINE CONTEXT");
  const timeline = input.estimationContext.timelineRange;
  sections.push(
    `**Estimated Duration:** ${timeline.minWeeks} - ${timeline.maxWeeks} weeks`
  );
  if (input.estimationContext.isRushProject) {
    sections.push("**Note:** Timeline has been compressed due to rush status");
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
      input.domainContext.designPreferences &&
      input.domainContext.designPreferences.length > 0
    ) {
      sections.push("### Design Preferences");
      input.domainContext.designPreferences.forEach((pref) => {
        sections.push(`- ${pref}`);
      });
    }

    if (input.domainContext.brandGuidelines) {
      sections.push("### Brand Guidelines");
      sections.push(input.domainContext.brandGuidelines);
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
    "Based on the above project context, generate a comprehensive interior fit-out proposal following the structured output format. Ensure all recommendations are specific to this project and client."
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
  const systemPrompt = `${INTERIOR_DESIGN_DOMAIN_EXPERTISE}

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
  const systemPrompt = `You are an interior fit-out proposal generator.
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
    areaPing: input.estimationContext.areaPing,
    budgetMin: input.estimationContext.budgetRange.min,
    budgetMax: input.estimationContext.budgetRange.max,
  };
}
