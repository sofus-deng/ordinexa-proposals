import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink, Card, PageHeader, SectionBlock } from "@/components/ui";
import { getProposalById } from "@/data";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  calculateEstimate,
  createMockPricingRepository,
  proposalToEstimationInput,
  getIncludedOptionsList,
} from "@/lib/estimation";
import type { EstimateSummary } from "@/lib/estimation";
import {
  createDefaultProvider,
  generateProposal,
} from "@/lib/ai-generation";
import { createMockProposalRepository } from "@/lib/proposals";
import type { GeneratedProposalContent, ProposalGenerationInput } from "@/types/proposal-generation";

/**
 * Calculates the estimate summary for a proposal.
 * Uses the deterministic estimation engine.
 */
async function getProposalEstimate(proposal: {
  projectTypeId: string;
  styleOptionId: string;
  areaPing: number;
  meetingRoomCount: number;
  includeReceptionArea: boolean;
  includePantry: boolean;
  includeGlassPartitions: boolean;
  includeCustomStorage: boolean;
  includeSmartOfficeSetup: boolean;
  includeMEPWork: boolean;
  rushProject: boolean;
}): Promise<EstimateSummary | null> {
  const repository = createMockPricingRepository();
  const input = proposalToEstimationInput(proposal);
  return calculateEstimate(repository, input);
}

/**
 * Formats a budget range for display.
 */
function formatBudgetRange(min: number, max: number, currency: string): string {
  if (min === max) {
    return formatCurrency(min, currency);
  }
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
}

/**
 * Formats a timeline range for display.
 */
function formatTimelineRange(minWeeks: number, maxWeeks: number): string {
  if (minWeeks === maxWeeks) {
    return `${minWeeks} weeks`;
  }
  return `${minWeeks} – ${maxWeeks} weeks`;
}

/**
 * Calculates confidence label based on estimate characteristics.
 */
function getConfidenceLabel(estimate: EstimateSummary): "Low" | "Medium" | "High" {
  const rangeSpread = (estimate.budget.final.max - estimate.budget.final.min) / estimate.budget.final.min;
  
  if (rangeSpread > 0.3) return "Low";
  if (rangeSpread > 0.15) return "Medium";
  return "High";
}

/**
 * Builds the AI generation input from proposal and estimate data.
 */
function buildAIGenerationInput(
  proposal: {
    title: string;
    clientName: string;
    contactName: string;
    industry: string;
    scope: string[];
    projectTypeId: string;
    styleOptionId: string;
    areaPing: number;
    meetingRoomCount: number;
    includeReceptionArea: boolean;
    includePantry: boolean;
    includeGlassPartitions: boolean;
    includeCustomStorage: boolean;
    includeSmartOfficeSetup: boolean;
    includeMEPWork: boolean;
    rushProject: boolean;
  },
  estimate: EstimateSummary
): ProposalGenerationInput {
  const includedOptions = getIncludedOptionsList(proposalToEstimationInput(proposal));
  
  return {
    projectContext: {
      title: proposal.title,
      clientName: proposal.clientName,
      contactName: proposal.contactName,
      industry: proposal.industry,
      projectTypeName: estimate.projectType.name,
      styleOptionName: estimate.styleOption.name,
      scope: proposal.scope,
    },
    estimationContext: {
      areaPing: proposal.areaPing,
      meetingRoomCount: proposal.meetingRoomCount,
      includedOptions,
      budgetRange: {
        min: estimate.budget.final.min,
        max: estimate.budget.final.max,
        currency: estimate.currency,
      },
      timelineRange: {
        minWeeks: estimate.timeline.final.minWeeks,
        maxWeeks: estimate.timeline.final.maxWeeks,
      },
      styleMultiplier: estimate.styleOption.multiplier,
      isRushProject: proposal.rushProject,
    },
    fitOutOptions: {
      includeReceptionArea: proposal.includeReceptionArea,
      includePantry: proposal.includePantry,
      includeGlassPartitions: proposal.includeGlassPartitions,
      includeCustomStorage: proposal.includeCustomStorage,
      includeSmartOfficeSetup: proposal.includeSmartOfficeSetup,
      includeMEPWork: proposal.includeMEPWork,
    },
  };
}

/**
 * Generates AI proposal content using the default provider.
 * Falls back to mock if Gemini is unavailable.
 */
async function getAIProposalContent(input: ProposalGenerationInput): Promise<GeneratedProposalContent> {
  const provider = createDefaultProvider();
  return generateProposal(provider, input);
}

/**
 * Renders a list of items with bullet styling.
 */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Renders a risk or assumption item with impact badge.
 */
function ImpactBadge({ impact }: { impact: "low" | "medium" | "high" }) {
  const colors = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-red-50 text-red-700 border-red-200",
  };
  
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[var(--text-xs)] font-medium ${colors[impact]}`}>
      {impact.charAt(0).toUpperCase() + impact.slice(1)} impact
    </span>
  );
}

/**
 * Renders the AI-generated executive summary section.
 */
function AIExecutiveSummary({ content }: { content: GeneratedProposalContent["executiveSummary"] }) {
  return (
    <Card title="AI-Generated Executive Summary" eyebrow="Strategic overview">
      <div className="space-y-5 text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Overview
          </h4>
          <p>{content.overview}</p>
        </div>
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Value Proposition
          </h4>
          <p>{content.valueProposition}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary-soft)] p-4">
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-emphasis)]">
            Recommendation
          </h4>
          <p className="text-[var(--color-text-primary)]">{content.recommendation}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Renders the AI-generated project understanding section.
 */
function AIProjectUnderstanding({ content }: { content: GeneratedProposalContent["projectUnderstanding"] }) {
  return (
    <Card title="Project Understanding" eyebrow="AI-analyzed context">
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Business Context
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.businessContext}</p>
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Objectives
          </h4>
          <BulletList items={content.objectives} />
        </div>
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Spatial Requirements
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.spatialRequirements}</p>
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Constraints
          </h4>
          <BulletList items={content.constraints} />
        </div>
      </div>
    </Card>
  );
}

/**
 * Renders the AI-generated design direction section.
 */
function AIDesignDirection({ content }: { content: GeneratedProposalContent["designDirection"] }) {
  return (
    <Card title="Design Direction" eyebrow="AI-recommended approach">
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Philosophy
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.philosophy}</p>
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Materials & Finishes
          </h4>
          <BulletList items={content.materialsFinishes} />
        </div>
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Color Palette
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.colorPalette}</p>
        </div>
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Lighting Approach
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.lightingApproach}</p>
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Furniture & Equipment
          </h4>
          <BulletList items={content.furnitureEquipment} />
        </div>
      </div>
    </Card>
  );
}

/**
 * Renders the AI-generated spatial planning section.
 */
function AISpatialPlanning({ content }: { content: GeneratedProposalContent["spatialPlanningRecommendations"] }) {
  return (
    <Card title="Spatial Planning" eyebrow="AI-generated recommendations">
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Overall Strategy
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.overallStrategy}</p>
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Area Recommendations
          </h4>
          <div className="space-y-3">
            {content.areaRecommendations.map((rec, index) => (
              <div
                key={index}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <h5 className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]">{rec.area}</h5>
                <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">{rec.recommendation}</p>
                <p className="mt-2 text-[var(--text-xs)] italic text-[var(--color-text-muted)]">{rec.rationale}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Circulation & Flow
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.circulationFlow}</p>
        </div>
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Flexibility Considerations
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.flexibilityConsiderations}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Renders the AI-generated budget narrative section.
 */
function AIBudgetNarrative({ content }: { content: GeneratedProposalContent["budgetNarrative"] }) {
  return (
    <Card title="Budget Narrative" eyebrow="AI-generated cost explanation">
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Overview
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.overview}</p>
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Cost Breakdown
          </h4>
          <BulletList items={content.costBreakdown} />
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Value Engineering Options
          </h4>
          <BulletList items={content.valueEngineeringOptions} />
        </div>
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Confidence Explanation
          </h4>
          <p className="text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">{content.confidenceExplanation}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Renders the AI-generated timeline narrative section.
 */
function AITimelineNarrative({ content }: { content: GeneratedProposalContent["timelineNarrative"] }) {
  return (
    <Card title="Timeline Narrative" eyebrow="AI-generated schedule">
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Overview
          </h4>
          <p className="text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">{content.overview}</p>
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Key Milestones
          </h4>
          <BulletList items={content.milestones} />
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Critical Path
          </h4>
          <BulletList items={content.criticalPath} />
        </div>
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
          <h4 className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Confidence Explanation
          </h4>
          <p className="text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">{content.confidenceExplanation}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Renders the AI-generated risks and assumptions section.
 */
function AIRisksAndAssumptions({ content }: { content: GeneratedProposalContent["risksAndAssumptions"] }) {
  return (
    <Card title="Risks & Assumptions" eyebrow="AI-identified factors">
      <div className="space-y-6">
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Risks
          </h4>
          <div className="space-y-3">
            {content.risks.map((risk, index) => (
              <div
                key={index}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">{risk.description}</p>
                  <ImpactBadge impact={risk.impact} />
                </div>
                <p className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
                  <span className="font-medium">Mitigation:</span> {risk.mitigationOrValidation}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Assumptions
          </h4>
          <div className="space-y-3">
            {content.assumptions.map((assumption, index) => (
              <div
                key={index}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">{assumption.description}</p>
                  <ImpactBadge impact={assumption.impact} />
                </div>
                <p className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
                  <span className="font-medium">Validation:</span> {assumption.mitigationOrValidation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Renders the AI-generated next steps section.
 */
function AINextSteps({ content }: { content: GeneratedProposalContent["recommendedNextSteps"] }) {
  return (
    <Card title="Recommended Next Steps" eyebrow="AI-suggested actions">
      <div className="space-y-5">
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Immediate Actions
          </h4>
          <BulletList items={content.immediate} />
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Short-Term Actions
          </h4>
          <BulletList items={content.shortTerm} />
        </div>
        <div>
          <h4 className="mb-3 text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Decision Points
          </h4>
          <BulletList items={content.decisionPoints} />
        </div>
      </div>
    </Card>
  );
}

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Try to get the proposal record from the repository first
  const proposalRepository = createMockProposalRepository();
  const proposalRecord = await proposalRepository.getById(id);
  
  let proposal = getProposalById(id);
  let estimate: EstimateSummary | null = null;
  let aiContent: GeneratedProposalContent | null = null;

  // If we have a saved proposal record, use its data
  if (proposalRecord) {
    proposal = {
      id: proposalRecord.id,
      title: proposalRecord.title,
      clientName: proposalRecord.clientName,
      contactName: proposalRecord.contactName,
      industry: proposalRecord.industry,
      status: proposalRecord.status,
      summary: proposalRecord.summary,
      scope: proposalRecord.scope,
      createdAt: proposalRecord.createdAt,
      updatedAt: proposalRecord.updatedAt,
      dueDate: proposalRecord.dueDate,
      projectTypeId: proposalRecord.estimationInput.projectTypeId,
      styleOptionId: proposalRecord.estimationInput.styleMultiplierId,
      areaPing: proposalRecord.estimationInput.areaPing,
      meetingRoomCount: proposalRecord.estimationInput.meetingRoomCount,
      includeReceptionArea: proposalRecord.estimationInput.includeReceptionArea,
      includePantry: proposalRecord.estimationInput.includePantry,
      includeGlassPartitions: proposalRecord.estimationInput.includeGlassPartitions,
      includeCustomStorage: proposalRecord.estimationInput.includeCustomStorage,
      includeSmartOfficeSetup: proposalRecord.estimationInput.includeSmartOfficeSetup,
      includeMEPWork: proposalRecord.estimationInput.includeMEPWork,
      rushProject: proposalRecord.estimationInput.rushProject,
      estimate: {
        subtotal: proposalRecord.estimationResult.budget.final.min,
        adjustmentTotal: proposalRecord.estimationResult.budget.adjustmentsImpact.min,
        estimatedTotal: proposalRecord.estimationResult.budget.final.max,
        confidenceLabel: getConfidenceLabel(proposalRecord.estimationResult),
      },
    };
    estimate = proposalRecord.estimationResult;
    aiContent = proposalRecord.generatedContent ?? null;
  } else if (proposal) {
    // Fall back to the legacy mock data if no record found
    estimate = await getProposalEstimate(proposal);
    if (!estimate) {
      notFound();
    }
    const aiInput = buildAIGenerationInput(proposal, estimate);
    aiContent = await getAIProposalContent(aiInput);
  } else {
    notFound();
  }

  if (!proposal) {
    notFound();
  }

  const confidenceLabel = getConfidenceLabel(estimate);
  const includedOptions = getIncludedOptionsList(proposalToEstimationInput(proposal));

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title={proposal.title}
          description="Comprehensive proposal with AI-generated narrative and calculated estimates."
          action={<ButtonLink href="/proposals/new" variant="secondary">Duplicate into new draft</ButtonLink>}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
          <div className="space-y-6">
            {aiContent && (
              <>
                {/* AI-Generated Executive Summary */}
                <AIExecutiveSummary content={aiContent.executiveSummary} />

                {/* AI-Generated Project Understanding */}
                <AIProjectUnderstanding content={aiContent.projectUnderstanding} />

                {/* AI-Generated Design Direction */}
                <AIDesignDirection content={aiContent.designDirection} />

                {/* AI-Generated Spatial Planning */}
                <AISpatialPlanning content={aiContent.spatialPlanningRecommendations} />

                {/* AI-Generated Budget Narrative */}
                <AIBudgetNarrative content={aiContent.budgetNarrative} />

                {/* AI-Generated Timeline Narrative */}
                <AITimelineNarrative content={aiContent.timelineNarrative} />

                {/* AI-Generated Risks & Assumptions */}
                <AIRisksAndAssumptions content={aiContent.risksAndAssumptions} />

                {/* AI-Generated Next Steps */}
                <AINextSteps content={aiContent.recommendedNextSteps} />
              </>
            )}

            {/* Original Scope Priorities */}
            <SectionBlock title="Scope priorities" description="Structured summary of fit-out scope themes for generation and pricing automation.">
              <ul className="space-y-3 text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
                {proposal.scope.map((scopeItem) => (
                  <li key={scopeItem} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                    {scopeItem}
                  </li>
                ))}
              </ul>
            </SectionBlock>

            {/* Original Fit-out Options */}
            <Card title="Fit-out options" eyebrow="Selected scope items">
              {includedOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {includedOptions.map((option) => (
                    <span
                      key={option}
                      className="inline-flex items-center rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-[var(--text-xs)] font-medium text-[var(--color-primary-emphasis)]"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                  No additional fit-out options selected.
                </p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            {/* Deterministic Budget Estimate */}
            <Card title="Budget estimate" eyebrow="Calculated range">
              <div className="space-y-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    Baseline ({estimate.projectType.name})
                  </p>
                  <p className="mt-1 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">
                    {formatBudgetRange(estimate.budget.baseline.min, estimate.budget.baseline.max, estimate.currency)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Area impact ({estimate.input.areaPing} ping)</span>
                    <span className={`font-semibold ${estimate.budget.areaImpact >= 0 ? "text-[var(--color-text-primary)]" : "text-green-600"}`}>
                      {estimate.budget.areaImpact >= 0 ? "+" : ""}{Math.round(estimate.budget.areaImpact * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Style ({estimate.styleOption.name})</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      +{Math.round(estimate.budget.styleImpact * 100)}%
                    </span>
                  </div>
                  {estimate.budget.adjustmentsImpact.min !== 0 || estimate.budget.adjustmentsImpact.max !== 0 ? (
                    <div className="flex items-center justify-between">
                      <span>Options impact</span>
                      <span className={`font-semibold ${estimate.budget.adjustmentsImpact.min >= 0 ? "text-[var(--color-text-primary)]" : "text-green-600"}`}>
                        {formatBudgetRange(estimate.budget.adjustmentsImpact.min, estimate.budget.adjustmentsImpact.max, estimate.currency)}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                  <span className="font-semibold text-[var(--color-text-primary)]">Estimated budget</span>
                  <span className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
                    {formatBudgetRange(estimate.budget.final.min, estimate.budget.final.max, estimate.currency)}
                  </span>
                </div>

                <div className={`rounded-[var(--radius-lg)] p-4 ${
                  confidenceLabel === "High" 
                    ? "bg-green-50 text-green-800" 
                    : confidenceLabel === "Medium" 
                      ? "bg-amber-50 text-amber-800" 
                      : "bg-red-50 text-red-800"
                }`}>
                  Confidence: {confidenceLabel}
                </div>
              </div>
            </Card>

            {/* Deterministic Timeline Estimate */}
            <Card title="Timeline estimate" eyebrow="Projected duration">
              <div className="space-y-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    Baseline
                  </p>
                  <p className="mt-1 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">
                    {formatTimelineRange(estimate.timeline.baseline.minWeeks, estimate.timeline.baseline.maxWeeks)}
                  </p>
                </div>

                <div className="space-y-2">
                  {estimate.timeline.adjustmentsWeeks > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Options added</span>
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        +{estimate.timeline.adjustmentsWeeks} weeks
                      </span>
                    </div>
                  )}
                  {estimate.timeline.rushCompression > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Rush compression</span>
                      <span className="font-semibold text-green-600">
                        -{Math.round(estimate.timeline.rushCompression * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                  <span className="font-semibold text-[var(--color-text-primary)]">Estimated timeline</span>
                  <span className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
                    {formatTimelineRange(estimate.timeline.final.minWeeks, estimate.timeline.final.maxWeeks)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Internal Notes */}
            <Card title="Internal notes" eyebrow="Readiness">
              <div className="space-y-3 text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
                <p>Created {formatDate(proposal.createdAt)}</p>
                <p>Last updated {formatDate(proposal.updatedAt)}</p>
                <p>Industry: {proposal.industry}</p>
                <p>Area: {proposal.areaPing} ping</p>
                <p>Meeting rooms: {proposal.meetingRoomCount}</p>
                <p className="text-[var(--color-text-muted)]">
                  Budget and timeline are calculated dynamically from project parameters using the estimation engine.
                </p>
              </div>
            </Card>

            {aiContent && (
              <Card title="AI Generation" eyebrow="Content metadata">
                <div className="space-y-3 text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
                  <p>Provider: <span className="font-medium text-[var(--color-text-primary)]">{aiContent.metadata.provider}</span></p>
                  <p>Model: <span className="font-medium text-[var(--color-text-primary)]">{aiContent.metadata.modelUsed}</span></p>
                  <p>Generated: <span className="font-medium text-[var(--color-text-primary)]">{formatDate(aiContent.metadata.generatedAt)}</span></p>
                  {aiContent.metadata.tokenUsage && (
                    <p className="text-[var(--color-text-muted)]">
                      Tokens: {aiContent.metadata.tokenUsage.totalTokens.toLocaleString()}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
