/**
 * Structured Output Schema (ORDX-018D)
 *
 * Provides validation and parsing for AI-generated proposal content.
 * Ensures the app does not depend on loose free-form text from AI.
 */

import type {
  GeneratedProposalContent,
  ExecutiveSummary,
  ProjectUnderstanding,
  DesignDirection,
  SpatialPlanningRecommendations,
  BudgetNarrative,
  TimelineNarrative,
  RisksAndAssumptions,
  RecommendedNextSteps,
  RiskOrAssumption,
  SpatialRecommendation,
} from "@/types/proposal-generation";

/**
 * Validation error with field path and message.
 */
export interface ValidationError {
  /** Dot-notation path to the invalid field */
  path: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Result of validating parsed content.
 */
export interface ValidationResult {
  /** Whether the content is valid */
  valid: boolean;
  /** Validation errors if any */
  errors: ValidationError[];
}

/**
 * Result of parsing AI output.
 */
export interface ParseResult {
  /** Successfully parsed content, if parsing succeeded */
  content: GeneratedProposalContent | null;
  /** Raw parsed JSON (may be partial) */
  raw: unknown;
  /** Validation result */
  validation: ValidationResult;
}

/**
 * Check if a value is a non-empty string.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Check if a value is an array of non-empty strings.
 */
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

/**
 * Check if impact level is valid.
 */
function isValidImpact(value: unknown): value is "low" | "medium" | "high" {
  return value === "low" || value === "medium" || value === "high";
}

/**
 * Validate executive summary section.
 */
function validateExecutiveSummary(
  data: unknown,
  errors: ValidationError[]
): data is ExecutiveSummary {
  if (typeof data !== "object" || data === null) {
    errors.push({ path: "executiveSummary", message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isNonEmptyString(obj.overview)) {
    errors.push({
      path: "executiveSummary.overview",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.valueProposition)) {
    errors.push({
      path: "executiveSummary.valueProposition",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.recommendation)) {
    errors.push({
      path: "executiveSummary.recommendation",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  return valid;
}

/**
 * Validate project understanding section.
 */
function validateProjectUnderstanding(
  data: unknown,
  errors: ValidationError[]
): data is ProjectUnderstanding {
  if (typeof data !== "object" || data === null) {
    errors.push({ path: "projectUnderstanding", message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isNonEmptyString(obj.businessContext)) {
    errors.push({
      path: "projectUnderstanding.businessContext",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isStringArray(obj.objectives)) {
    errors.push({
      path: "projectUnderstanding.objectives",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.spatialRequirements)) {
    errors.push({
      path: "projectUnderstanding.spatialRequirements",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isStringArray(obj.constraints)) {
    errors.push({
      path: "projectUnderstanding.constraints",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  return valid;
}

/**
 * Validate design direction section.
 */
function validateDesignDirection(
  data: unknown,
  errors: ValidationError[]
): data is DesignDirection {
  if (typeof data !== "object" || data === null) {
    errors.push({ path: "designDirection", message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isNonEmptyString(obj.philosophy)) {
    errors.push({
      path: "designDirection.philosophy",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isStringArray(obj.materialsFinishes)) {
    errors.push({
      path: "designDirection.materialsFinishes",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.colorPalette)) {
    errors.push({
      path: "designDirection.colorPalette",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.lightingApproach)) {
    errors.push({
      path: "designDirection.lightingApproach",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isStringArray(obj.furnitureEquipment)) {
    errors.push({
      path: "designDirection.furnitureEquipment",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  return valid;
}

/**
 * Validate spatial recommendation item.
 */
function validateSpatialRecommendation(
  data: unknown,
  path: string,
  errors: ValidationError[]
): data is SpatialRecommendation {
  if (typeof data !== "object" || data === null) {
    errors.push({ path, message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isNonEmptyString(obj.area)) {
    errors.push({ path: `${path}.area`, message: "Must be a non-empty string" });
    valid = false;
  }

  if (!isNonEmptyString(obj.recommendation)) {
    errors.push({
      path: `${path}.recommendation`,
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.rationale)) {
    errors.push({
      path: `${path}.rationale`,
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  return valid;
}

/**
 * Validate spatial planning recommendations section.
 */
function validateSpatialPlanningRecommendations(
  data: unknown,
  errors: ValidationError[]
): data is SpatialPlanningRecommendations {
  if (typeof data !== "object" || data === null) {
    errors.push({
      path: "spatialPlanningRecommendations",
      message: "Must be an object",
    });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isNonEmptyString(obj.overallStrategy)) {
    errors.push({
      path: "spatialPlanningRecommendations.overallStrategy",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!Array.isArray(obj.areaRecommendations)) {
    errors.push({
      path: "spatialPlanningRecommendations.areaRecommendations",
      message: "Must be an array",
    });
    valid = false;
  } else {
    obj.areaRecommendations.forEach((item, index) => {
      if (
        !validateSpatialRecommendation(
          item,
          `spatialPlanningRecommendations.areaRecommendations[${index}]`,
          errors
        )
      ) {
        valid = false;
      }
    });
  }

  if (!isNonEmptyString(obj.circulationFlow)) {
    errors.push({
      path: "spatialPlanningRecommendations.circulationFlow",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.flexibilityConsiderations)) {
    errors.push({
      path: "spatialPlanningRecommendations.flexibilityConsiderations",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  return valid;
}

/**
 * Validate budget narrative section.
 */
function validateBudgetNarrative(
  data: unknown,
  errors: ValidationError[]
): data is BudgetNarrative {
  if (typeof data !== "object" || data === null) {
    errors.push({ path: "budgetNarrative", message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isNonEmptyString(obj.overview)) {
    errors.push({
      path: "budgetNarrative.overview",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isStringArray(obj.costBreakdown)) {
    errors.push({
      path: "budgetNarrative.costBreakdown",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  if (!isStringArray(obj.valueEngineeringOptions)) {
    errors.push({
      path: "budgetNarrative.valueEngineeringOptions",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.confidenceExplanation)) {
    errors.push({
      path: "budgetNarrative.confidenceExplanation",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  return valid;
}

/**
 * Validate timeline narrative section.
 */
function validateTimelineNarrative(
  data: unknown,
  errors: ValidationError[]
): data is TimelineNarrative {
  if (typeof data !== "object" || data === null) {
    errors.push({ path: "timelineNarrative", message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isNonEmptyString(obj.overview)) {
    errors.push({
      path: "timelineNarrative.overview",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isStringArray(obj.milestones)) {
    errors.push({
      path: "timelineNarrative.milestones",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  if (!isStringArray(obj.criticalPath)) {
    errors.push({
      path: "timelineNarrative.criticalPath",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.confidenceExplanation)) {
    errors.push({
      path: "timelineNarrative.confidenceExplanation",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  return valid;
}

/**
 * Validate risk or assumption item.
 */
function validateRiskOrAssumption(
  data: unknown,
  path: string,
  errors: ValidationError[]
): data is RiskOrAssumption {
  if (typeof data !== "object" || data === null) {
    errors.push({ path, message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isNonEmptyString(obj.description)) {
    errors.push({
      path: `${path}.description`,
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isValidImpact(obj.impact)) {
    errors.push({
      path: `${path}.impact`,
      message: "Must be 'low', 'medium', or 'high'",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.mitigationOrValidation)) {
    errors.push({
      path: `${path}.mitigationOrValidation`,
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  return valid;
}

/**
 * Validate risks and assumptions section.
 */
function validateRisksAndAssumptions(
  data: unknown,
  errors: ValidationError[]
): data is RisksAndAssumptions {
  if (typeof data !== "object" || data === null) {
    errors.push({ path: "risksAndAssumptions", message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!Array.isArray(obj.risks)) {
    errors.push({
      path: "risksAndAssumptions.risks",
      message: "Must be an array",
    });
    valid = false;
  } else {
    obj.risks.forEach((item, index) => {
      if (
        !validateRiskOrAssumption(
          item,
          `risksAndAssumptions.risks[${index}]`,
          errors
        )
      ) {
        valid = false;
      }
    });
  }

  if (!Array.isArray(obj.assumptions)) {
    errors.push({
      path: "risksAndAssumptions.assumptions",
      message: "Must be an array",
    });
    valid = false;
  } else {
    obj.assumptions.forEach((item, index) => {
      if (
        !validateRiskOrAssumption(
          item,
          `risksAndAssumptions.assumptions[${index}]`,
          errors
        )
      ) {
        valid = false;
      }
    });
  }

  return valid;
}

/**
 * Validate recommended next steps section.
 */
function validateRecommendedNextSteps(
  data: unknown,
  errors: ValidationError[]
): data is RecommendedNextSteps {
  if (typeof data !== "object" || data === null) {
    errors.push({ path: "recommendedNextSteps", message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isStringArray(obj.immediate)) {
    errors.push({
      path: "recommendedNextSteps.immediate",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  if (!isStringArray(obj.shortTerm)) {
    errors.push({
      path: "recommendedNextSteps.shortTerm",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  if (!isStringArray(obj.decisionPoints)) {
    errors.push({
      path: "recommendedNextSteps.decisionPoints",
      message: "Must be an array of non-empty strings",
    });
    valid = false;
  }

  return valid;
}

/**
 * Validate metadata section.
 */
function validateMetadata(
  data: unknown,
  errors: ValidationError[]
): boolean {
  if (typeof data !== "object" || data === null) {
    errors.push({ path: "metadata", message: "Must be an object" });
    return false;
  }

  const obj = data as Record<string, unknown>;
  let valid = true;

  if (!isNonEmptyString(obj.generatedAt)) {
    errors.push({
      path: "metadata.generatedAt",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.modelUsed)) {
    errors.push({
      path: "metadata.modelUsed",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  if (!isNonEmptyString(obj.provider)) {
    errors.push({
      path: "metadata.provider",
      message: "Must be a non-empty string",
    });
    valid = false;
  }

  // Token usage is optional but must be valid if present
  if (obj.tokenUsage !== undefined) {
    if (typeof obj.tokenUsage !== "object" || obj.tokenUsage === null) {
      errors.push({
        path: "metadata.tokenUsage",
        message: "Must be an object if present",
      });
      valid = false;
    } else {
      const tokenUsage = obj.tokenUsage as Record<string, unknown>;
      if (typeof tokenUsage.promptTokens !== "number") {
        errors.push({
          path: "metadata.tokenUsage.promptTokens",
          message: "Must be a number",
        });
        valid = false;
      }
      if (typeof tokenUsage.completionTokens !== "number") {
        errors.push({
          path: "metadata.tokenUsage.completionTokens",
          message: "Must be a number",
        });
        valid = false;
      }
      if (typeof tokenUsage.totalTokens !== "number") {
        errors.push({
          path: "metadata.tokenUsage.totalTokens",
          message: "Must be a number",
        });
        valid = false;
      }
    }
  }

  return valid;
}

/**
 * Validate complete generated proposal content.
 * @param data - The data to validate
 * @param requireMetadata - Whether to require metadata in validation (default: true)
 */
export function validateGeneratedContent(
  data: unknown,
  requireMetadata: boolean = true
): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof data !== "object" || data === null) {
    return {
      valid: false,
      errors: [{ path: "root", message: "Content must be a non-null object" }],
    };
  }

  const obj = data as Record<string, unknown>;

  validateExecutiveSummary(obj.executiveSummary, errors);
  validateProjectUnderstanding(obj.projectUnderstanding, errors);
  validateDesignDirection(obj.designDirection, errors);
  validateSpatialPlanningRecommendations(obj.spatialPlanningRecommendations, errors);
  validateBudgetNarrative(obj.budgetNarrative, errors);
  validateTimelineNarrative(obj.timelineNarrative, errors);
  validateRisksAndAssumptions(obj.risksAndAssumptions, errors);
  validateRecommendedNextSteps(obj.recommendedNextSteps, errors);
  
  // Metadata is optional during parsing since it's added separately
  if (requireMetadata) {
    validateMetadata(obj.metadata, errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse AI output string into structured proposal content.
 *
 * @param jsonString - Raw JSON string from AI output
 * @param metadata - Metadata to attach to parsed content
 * @returns Parse result with validation status
 */
export function parseGeneratedContent(
  jsonString: string,
  metadata: GeneratedProposalContent["metadata"]
): ParseResult {
  let raw: unknown;
  
  try {
    raw = JSON.parse(jsonString);
  } catch {
    return {
      content: null,
      raw: null,
      validation: {
        valid: false,
        errors: [{ path: "root", message: "Invalid JSON: unable to parse" }],
      },
    };
  }

  const validation = validateGeneratedContent(raw, false);

  if (!validation.valid) {
    return {
      content: null,
      raw,
      validation,
    };
  }

  // Attach metadata (AI output doesn't include metadata)
  const content = raw as Omit<GeneratedProposalContent, "metadata">;
  const fullContent: GeneratedProposalContent = {
    ...content,
    metadata,
  };

  return {
    content: fullContent,
    raw,
    validation,
  };
}

/**
 * Create a safe fallback content when parsing fails.
 * Returns minimal valid content structure.
 */
export function createFallbackContent(
  metadata: GeneratedProposalContent["metadata"],
  partialContent?: Partial<GeneratedProposalContent>
): GeneratedProposalContent {
  return {
    executiveSummary: partialContent?.executiveSummary ?? {
      overview: "Unable to generate executive summary.",
      valueProposition: "Please try regenerating the proposal.",
      recommendation: "Contact support if the issue persists.",
    },
    projectUnderstanding: partialContent?.projectUnderstanding ?? {
      businessContext: "Content generation failed.",
      objectives: ["Regenerate proposal to populate content."],
      spatialRequirements: "Content generation failed.",
      constraints: ["Technical error occurred during generation."],
    },
    designDirection: partialContent?.designDirection ?? {
      philosophy: "Content generation failed.",
      materialsFinishes: ["Regenerate to populate."],
      colorPalette: "Content generation failed.",
      lightingApproach: "Content generation failed.",
      furnitureEquipment: ["Regenerate to populate."],
    },
    spatialPlanningRecommendations: partialContent?.spatialPlanningRecommendations ?? {
      overallStrategy: "Content generation failed.",
      areaRecommendations: [
        {
          area: "General",
          recommendation: "Regenerate proposal to populate recommendations.",
          rationale: "Technical error occurred during generation.",
        },
      ],
      circulationFlow: "Content generation failed.",
      flexibilityConsiderations: "Content generation failed.",
    },
    budgetNarrative: partialContent?.budgetNarrative ?? {
      overview: "Content generation failed.",
      costBreakdown: ["Regenerate to populate budget narrative."],
      valueEngineeringOptions: ["Regenerate to populate."],
      confidenceExplanation: "Content generation failed.",
    },
    timelineNarrative: partialContent?.timelineNarrative ?? {
      overview: "Content generation failed.",
      milestones: ["Regenerate to populate timeline."],
      criticalPath: ["Regenerate to populate."],
      confidenceExplanation: "Content generation failed.",
    },
    risksAndAssumptions: partialContent?.risksAndAssumptions ?? {
      risks: [
        {
          description: "AI generation failed - manual review required.",
          impact: "high",
          mitigationOrValidation: "Regenerate proposal content.",
        },
      ],
      assumptions: [
        {
          description: "Technical error during generation.",
          impact: "medium",
          mitigationOrValidation: "Check system logs and retry.",
        },
      ],
    },
    recommendedNextSteps: partialContent?.recommendedNextSteps ?? {
      immediate: ["Regenerate proposal content."],
      shortTerm: ["Review system configuration."],
      decisionPoints: ["Retry AI generation or use manual entry."],
    },
    metadata,
  };
}
