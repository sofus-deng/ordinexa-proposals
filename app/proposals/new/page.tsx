"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Button,
  Card,
  FieldWrapper,
  Input,
  PageHeader,
  SectionBlock,
  Select,
} from "@/components/ui";
import { projectTypes, styleOptions, activePricingRuleSet } from "@/data";
import {
  checkGeminiStatus,
  createMockProvider,
  createProvider,
  generateProposal,
  isProviderAvailable,
} from "@/lib/ai-generation";
import {
  calculateEstimate,
  createMockPricingRepository,
  validateEstimationInput,
} from "@/lib/estimation";
import type { EstimationInput, EstimateSummary } from "@/lib/estimation";
import { createMockProposalRepository } from "@/lib/proposals";
import type {
  AIGenerationConfig,
  GeneratedProposalContent,
  ProposalGenerationInput,
  RiskOrAssumption,
  SpatialRecommendation,
} from "@/types/proposal-generation";
import type { ProviderStatus } from "@/lib/ai-generation";

/**
 * Step indicator for the 3-step proposal creation flow
 */
function StepIndicator({
  steps,
  currentStep,
}: {
  steps: Array<{ number: number; label: string; description: string }>;
  currentStep: number;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--color-accent)] text-white shadow-md ring-4 ring-[var(--color-accent-subtle)]"
                      : isCompleted
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-surface)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-border)]"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-semibold ${
                      isActive
                        ? "text-[var(--color-accent)]"
                        : isCompleted
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="hidden text-[11px] text-[var(--color-text-secondary)] sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 w-8 sm:w-16 transition-colors ${
                    isCompleted ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Success state component shown after proposal is saved
 */
function SaveSuccessState({
  proposalId,
  onNewProposal,
}: {
  proposalId: string | null;
  onNewProposal: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-6 text-xl font-semibold text-[var(--color-text-primary)]">
        Proposal saved
      </h2>
      <p className="mt-2 max-w-md text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        Your proposal has been saved and is ready to share with your client.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {proposalId && (
          <>
            <Button onClick={() => (window.location.href = `/proposals/${proposalId}`)}>
              View proposal
            </Button>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = `/proposals/${proposalId}/export`)}
            >
              Export view
            </Button>
          </>
        )}
        <Button variant="secondary" onClick={onNewProposal}>
          Create another
        </Button>
      </div>
    </div>
  );
}

/**
 * Default form state for estimation inputs
 */
const defaultFormData: EstimationInput = {
  projectTypeId: "office-fit-out",
  styleMultiplierId: "modern-corporate",
  areaPing: 100,
  meetingRoomCount: 3,
  includeReceptionArea: false,
  includePantry: false,
  includeGlassPartitions: false,
  includeCustomStorage: false,
  includeSmartOfficeSetup: false,
  includeMEPWork: false,
  rushProject: false,
};

type ProviderOption = AIGenerationConfig["provider"];

const providerOptions: Array<{ value: ProviderOption; label: string; description: string }> = [
  {
    value: "gemini",
    label: "Gemini AI",
    description: "AI-powered proposal generation with smart fallback for demos.",
  },
  {
    value: "mock",
    label: "Demo preview",
    description: "Deterministic content for consistent demo presentations.",
  },
];

function toTitleCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSelectedScopeLabels(input: EstimationInput): string[] {
  return [
    input.includeReceptionArea ? "Reception area" : null,
    input.includePantry ? "Pantry facilities" : null,
    input.includeGlassPartitions ? "Glass partitions" : null,
    input.includeCustomStorage ? "Custom storage" : null,
    input.includeSmartOfficeSetup ? "Smart office setup" : null,
    input.includeMEPWork ? "MEP work" : null,
    input.rushProject ? "Rush project delivery" : null,
  ].filter((value): value is string => Boolean(value));
}

function buildProposalGenerationInput(
  formData: EstimationInput,
  estimate: EstimateSummary
): ProposalGenerationInput {
  const selectedScope = getSelectedScopeLabels(formData);

  return {
    projectContext: {
      title: `${estimate.projectType.name} Proposal`,
      clientName: "Prospective Client",
      contactName: "Project Lead",
      industry: "Commercial Workplace",
      projectTypeName: estimate.projectType.name,
      styleOptionName: estimate.styleOption.name,
      scope: [
        `${estimate.projectType.name} for ${estimate.input.areaPing} ping`,
        `${estimate.input.meetingRoomCount} meeting room${estimate.input.meetingRoomCount === 1 ? "" : "s"}`,
        ...selectedScope,
      ],
    },
    estimationContext: {
      areaPing: estimate.input.areaPing,
      meetingRoomCount: estimate.input.meetingRoomCount,
      includedOptions: estimate.input.includedOptions,
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
      isRushProject: formData.rushProject,
    },
    fitOutOptions: {
      includeReceptionArea: formData.includeReceptionArea,
      includePantry: formData.includePantry,
      includeGlassPartitions: formData.includeGlassPartitions,
      includeCustomStorage: formData.includeCustomStorage,
      includeSmartOfficeSetup: formData.includeSmartOfficeSetup,
      includeMEPWork: formData.includeMEPWork,
    },
    domainContext: {
      designPreferences: [estimate.styleOption.name, estimate.projectType.name],
      specialRequirements: selectedScope,
    },
  };
}

async function generateProposalWithFallback(
  input: ProposalGenerationInput,
  selectedProvider: ProviderOption
): Promise<{ content: GeneratedProposalContent; providerUsed: "gemini" | "mock" }> {
  if (selectedProvider === "mock") {
    const content = await generateProposal(createMockProvider({ deterministic: true }), input);
    return { content, providerUsed: "mock" };
  }

  const geminiProvider = createProvider({
    provider: "gemini",
    temperature: 0.7,
  });

  if (await isProviderAvailable(geminiProvider)) {
    try {
      const content = await generateProposal(geminiProvider, input);
      return { content, providerUsed: "gemini" };
    } catch (error) {
      console.warn("Gemini generation failed, falling back to mock provider.", error);
    }
  }

  const content = await generateProposal(createMockProvider({ deterministic: true }), input);
  return { content, providerUsed: "mock" };
}

function PreviewSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4 space-y-1">
        <h3 className="text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{title}</h3>
        {description ? (
          <p className="text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4 text-[var(--text-sm)] leading-6 text-[var(--color-text-primary)]">{children}</div>
    </section>
  );
}

function PreviewList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ImpactBadge({ impact }: { impact: RiskOrAssumption["impact"] }) {
  const tone = {
    low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    medium: "bg-amber-50 text-amber-700 ring-amber-200",
    high: "bg-rose-50 text-rose-700 ring-rose-200",
  }[impact];

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${tone}`}>
      {impact}
    </span>
  );
}

function RecommendationCard({ recommendation }: { recommendation: SpatialRecommendation }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]">{recommendation.area}</p>
      </div>
      <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-primary)]">{recommendation.recommendation}</p>
      <p className="mt-2 text-[var(--text-xs)] leading-6 text-[var(--color-text-secondary)]">{recommendation.rationale}</p>
    </div>
  );
}

function RiskAssumptionList({
  title,
  items,
}: {
  title: string;
  items: RiskOrAssumption[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]">{title}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${title}-${item.description}`}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-medium text-[var(--color-text-primary)]">{item.description}</p>
              <ImpactBadge impact={item.impact} />
            </div>
            <p className="mt-2 text-[var(--text-xs)] leading-6 text-[var(--color-text-secondary)]">
              {item.mitigationOrValidation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProposalPreview({ content }: { content: GeneratedProposalContent }) {
  return (
    <div className="space-y-5">
      <PreviewSection
        title="Executive summary"
        description="High-level positioning for the current project brief, budget, and timeline context."
      >
        <p>{content.executiveSummary.overview}</p>
        <p>{content.executiveSummary.valueProposition}</p>
        <p>{content.executiveSummary.recommendation}</p>
      </PreviewSection>

      <PreviewSection title="Project understanding">
        <p>{content.projectUnderstanding.businessContext}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Objectives
            </p>
            <PreviewList items={content.projectUnderstanding.objectives} />
          </div>
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Constraints
            </p>
            <PreviewList items={content.projectUnderstanding.constraints} />
          </div>
        </div>
        <p>{content.projectUnderstanding.spatialRequirements}</p>
      </PreviewSection>

      <PreviewSection title="Design direction">
        <p>{content.designDirection.philosophy}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Materials & finishes
            </p>
            <PreviewList items={content.designDirection.materialsFinishes} />
          </div>
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Furniture & equipment
            </p>
            <PreviewList items={content.designDirection.furnitureEquipment} />
          </div>
        </div>
        <p><span className="font-semibold">Color palette:</span> {content.designDirection.colorPalette}</p>
        <p><span className="font-semibold">Lighting approach:</span> {content.designDirection.lightingApproach}</p>
      </PreviewSection>

      <PreviewSection title="Spatial planning recommendations">
        <p>{content.spatialPlanningRecommendations.overallStrategy}</p>
        <div className="space-y-3">
          {content.spatialPlanningRecommendations.areaRecommendations.map((recommendation) => (
            <RecommendationCard
              key={`${recommendation.area}-${recommendation.recommendation}`}
              recommendation={recommendation}
            />
          ))}
        </div>
        <p><span className="font-semibold">Circulation flow:</span> {content.spatialPlanningRecommendations.circulationFlow}</p>
        <p><span className="font-semibold">Flexibility:</span> {content.spatialPlanningRecommendations.flexibilityConsiderations}</p>
      </PreviewSection>

      <PreviewSection title="Budget narrative">
        <p>{content.budgetNarrative.overview}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Cost breakdown
            </p>
            <PreviewList items={content.budgetNarrative.costBreakdown} />
          </div>
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Value engineering
            </p>
            <PreviewList items={content.budgetNarrative.valueEngineeringOptions} />
          </div>
        </div>
        <p>{content.budgetNarrative.confidenceExplanation}</p>
      </PreviewSection>

      <PreviewSection title="Timeline narrative">
        <p>{content.timelineNarrative.overview}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Milestones
            </p>
            <PreviewList items={content.timelineNarrative.milestones} />
          </div>
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Critical path
            </p>
            <PreviewList items={content.timelineNarrative.criticalPath} />
          </div>
        </div>
        <p>{content.timelineNarrative.confidenceExplanation}</p>
      </PreviewSection>

      <PreviewSection title="Risks and assumptions">
        <div className="grid gap-4 lg:grid-cols-2">
          <RiskAssumptionList title="Risks" items={content.risksAndAssumptions.risks} />
          <RiskAssumptionList title="Assumptions" items={content.risksAndAssumptions.assumptions} />
        </div>
      </PreviewSection>

      <PreviewSection title="Recommended next steps">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Immediate
            </p>
            <PreviewList items={content.recommendedNextSteps.immediate} />
          </div>
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Short term
            </p>
            <PreviewList items={content.recommendedNextSteps.shortTerm} />
          </div>
          <div>
            <p className="mb-2 text-[var(--text-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Decision points
            </p>
            <PreviewList items={content.recommendedNextSteps.decisionPoints} />
          </div>
        </div>
      </PreviewSection>
    </div>
  );
}

/**
 * Formats a budget range for display
 */
function formatBudgetRange(min: number, max: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

/**
 * Formats a timeline range for display
 */
function formatTimelineRange(minWeeks: number, maxWeeks: number): string {
  return `${minWeeks} - ${maxWeeks} weeks`;
}

/**
 * Formats a percentage impact for display
 */
function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(0)}%`;
}

const STEPS = [
  { number: 1, label: "Estimate", description: "Calculate budget & timeline" },
  { number: 2, label: "Preview", description: "Generate proposal content" },
  { number: 3, label: "Save", description: "Save and share" },
];

export default function NewProposalPage() {
  const [formData, setFormData] = useState<EstimationInput>(defaultFormData);
  const [estimate, setEstimate] = useState<EstimateSummary | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption>("gemini");
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposalContent | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [actualProviderUsed, setActualProviderUsed] = useState<"gemini" | "mock" | null>(null);

  const repository = useMemo(() => createMockPricingRepository(), []);
  const proposalRepository = useMemo(() => createMockProposalRepository(), []);

  // Calculate current step based on state
  const currentStep = useMemo(() => {
    if (savedProposalId) return 3;
    if (generatedProposal) return 3;
    if (estimate) return 2;
    return 1;
  }, [estimate, generatedProposal, savedProposalId]);

  // Check provider status on mount
  useEffect(() => {
    checkGeminiStatus().then(setProviderStatus);
  }, []);

  const updateField = useCallback(<K extends keyof EstimationInput>(
    field: K,
    value: EstimationInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]);
    setGenerationError(null);
  }, []);

  const toggleBoolean = useCallback((field: keyof EstimationInput) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
    setValidationErrors([]);
    setGenerationError(null);
  }, []);

  const handleCalculateEstimate = useCallback(async () => {
    const errors = validateEstimationInput(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsCalculating(true);
    setValidationErrors([]);

    try {
      const result = await calculateEstimate(repository, formData);
      setEstimate(result);
      setGeneratedProposal(null);
      setSavedProposalId(null);
    } catch (error) {
      console.error("Estimation failed:", error);
      setValidationErrors(["Failed to calculate estimate. Please try again."]);
    } finally {
      setIsCalculating(false);
    }
  }, [formData, repository]);

  const handleGenerateProposal = useCallback(async () => {
    const errors = validateEstimationInput(formData);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setGenerationError(null);
    setIsGeneratingProposal(true);

    try {
      let resolvedEstimate = estimate;

      if (!resolvedEstimate) {
        resolvedEstimate = await calculateEstimate(repository, formData);
        setEstimate(resolvedEstimate);
      }

      if (!resolvedEstimate) {
        throw new Error("Estimate generation failed before proposal generation.");
      }

      const input = buildProposalGenerationInput(formData, resolvedEstimate);
      const result = await generateProposalWithFallback(input, selectedProvider);

      setGeneratedProposal(result.content);
      setActualProviderUsed(result.providerUsed);
      setSavedProposalId(null);
    } catch (error) {
      console.error("Proposal generation failed:", error);
      setGenerationError("Failed to generate proposal content. Please retry.");
    } finally {
      setIsGeneratingProposal(false);
    }
  }, [estimate, formData, repository, selectedProvider]);

  const handleSaveProposal = useCallback(async () => {
    const errors = validateEstimationInput(formData);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!estimate) {
      setGenerationError("Please generate an estimate before saving.");
      return;
    }

    setIsSaving(true);
    setValidationErrors([]);

    try {
      const input = buildProposalGenerationInput(formData, estimate);

      const savedProposal = await proposalRepository.create({
        title: input.projectContext.title,
        clientName: input.projectContext.clientName,
        contactName: input.projectContext.contactName,
        industry: input.projectContext.industry,
        scope: input.projectContext.scope,
        estimationInput: formData,
        estimationResult: estimate,
        generatedContent: generatedProposal ?? undefined,
        generationMetadata: generatedProposal ? {
          provider: generatedProposal.metadata.provider,
          model: generatedProposal.metadata.modelUsed,
          generatedAt: generatedProposal.metadata.generatedAt,
        } : undefined,
      });

      setSavedProposalId(savedProposal.id);
    } catch (error) {
      console.error("Save failed:", error);
      setGenerationError("Failed to save proposal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [formData, estimate, generatedProposal, proposalRepository]);

  const handleReset = useCallback(() => {
    setFormData(defaultFormData);
    setEstimate(null);
    setGeneratedProposal(null);
    setGenerationError(null);
    setValidationErrors([]);
    setSelectedProvider("gemini");
    setSavedProposalId(null);
    setActualProviderUsed(null);
  }, []);

  // Show success state after save
  if (savedProposalId) {
    return (
      <AppShell>
        <div className="space-y-8">
          <PageHeader
            title="Proposal created"
            description="Your proposal has been saved and is ready to share."
          />
          <Card>
            <SaveSuccessState
              proposalId={savedProposalId}
              onNewProposal={handleReset}
            />
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Create proposal"
          description="Configure your project requirements, generate a budget estimate, and create a polished proposal ready for client presentation."
        />

        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_400px]">
          <Card title="Project details" eyebrow="Step 1">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCalculateEstimate(); }}>
              <SectionBlock title="Project parameters" description="Core inputs that define the baseline budget and timeline.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldWrapper label="Project type" required>
                    <Select
                      value={formData.projectTypeId}
                      onChange={(e) => updateField("projectTypeId", e.target.value)}
                    >
                      {projectTypes.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.name}
                        </option>
                      ))}
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper label="Interior style" required>
                    <Select
                      value={formData.styleMultiplierId}
                      onChange={(e) => updateField("styleMultiplierId", e.target.value)}
                    >
                      {styleOptions.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper label="Area (ping)" required>
                    <Input
                      type="number"
                      min={1}
                      max={10000}
                      value={formData.areaPing}
                      onChange={(e) => updateField("areaPing", Number(e.target.value))}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Meeting rooms" required>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={formData.meetingRoomCount}
                      onChange={(e) => updateField("meetingRoomCount", Number(e.target.value))}
                    />
                  </FieldWrapper>
                </div>
              </SectionBlock>

              <SectionBlock title="Additional scope" description="Optional features that enhance the project scope.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "includeReceptionArea" as const, label: "Reception area", desc: "Front-of-house welcome zone" },
                    { key: "includePantry" as const, label: "Pantry facilities", desc: "Break room and kitchenette" },
                    { key: "includeGlassPartitions" as const, label: "Glass partitions", desc: "Glazed room dividers" },
                    { key: "includeCustomStorage" as const, label: "Custom storage", desc: "Built-in cabinetry" },
                    { key: "includeSmartOfficeSetup" as const, label: "Smart office", desc: "IoT and automation systems" },
                    { key: "includeMEPWork" as const, label: "MEP work", desc: "Mechanical, electrical, plumbing" },
                  ].map(({ key, label, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleBoolean(key)}
                      className={`flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-all ${
                        formData[key]
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)]"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border ${
                          formData[key]
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {formData[key] && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]">{label}</p>
                        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock title="Timeline" description="Project delivery requirements.">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleBoolean("rushProject")}
                    className={`flex items-center gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-all ${
                      formData.rushProject
                        ? "border-amber-500 bg-amber-50"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)]"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border ${
                        formData.rushProject
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-[var(--color-border)]"
                      }`}
                    >
                      {formData.rushProject && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]">Rush project</p>
                      <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">Compressed timeline with premium pricing</p>
                    </div>
                  </button>
                </div>
              </SectionBlock>

              <SectionBlock
                title="Content generation"
                description="Choose how proposal content is generated."
              >
                <div className="space-y-3">
                  {providerOptions.map((option) => {
                    const isSelected = selectedProvider === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedProvider(option.value)}
                        className={`w-full rounded-[var(--radius-lg)] border p-4 text-left transition-all ${
                          isSelected
                            ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                            : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]">{option.label}</p>
                            <p className="mt-1 text-[var(--text-xs)] leading-5 text-[var(--color-text-secondary)]">
                              {option.description}
                            </p>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                              isSelected
                                ? "bg-white text-[var(--color-accent)]"
                                : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
                            }`}
                          >
                            {option.value === "gemini" ? "AI" : "Demo"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Provider status indicator */}
                {providerStatus && (
                  <div className={`mt-4 rounded-[var(--radius-lg)] border p-4 ${
                    providerStatus.isAvailable
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-amber-200 bg-amber-50"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        providerStatus.isAvailable
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}>
                        {providerStatus.isAvailable ? (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-[var(--text-sm)] font-semibold ${
                          providerStatus.isAvailable
                            ? "text-emerald-800"
                            : "text-amber-800"
                        }`}>
                          {providerStatus.isAvailable ? "Ready to generate" : "Demo mode"}
                        </p>
                        <p className={`mt-1 text-[var(--text-xs)] leading-5 ${
                          providerStatus.isAvailable
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}>
                          {providerStatus.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </SectionBlock>

              {validationErrors.length > 0 && (
                <div className="rounded-[var(--radius-lg)] bg-red-50 border border-red-200 p-4">
                  <p className="text-[var(--text-sm)] font-medium text-red-800">Please fix the following issues:</p>
                  <ul className="mt-2 list-inside list-disc text-[var(--text-sm)] text-red-700">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generationError && (
                <div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-[var(--text-sm)] font-medium text-amber-800">Unable to complete action</p>
                  <p className="mt-1 text-[var(--text-sm)] text-amber-700">{generationError}</p>
                </div>
              )}

              {/* Action buttons with clear hierarchy */}
              <div className="space-y-4">
                {/* Primary action area */}
                <div className="flex flex-wrap gap-3">
                  {!estimate ? (
                    <Button type="submit" disabled={isCalculating}>
                      {isCalculating ? "Calculating..." : "Generate estimate"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        onClick={handleGenerateProposal}
                        disabled={isGeneratingProposal}
                      >
                        {isGeneratingProposal ? "Generating..." : "Generate proposal preview"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCalculateEstimate}
                        disabled={isCalculating}
                      >
                        {isCalculating ? "Recalculating..." : "Recalculate estimate"}
                      </Button>
                    </>
                  )}
                </div>

                {/* Secondary action area - gated by proposal preview */}
                {estimate && (
                  <div className="flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-4">
                    <Button
                      type="button"
                      onClick={handleSaveProposal}
                      disabled={isSaving || !generatedProposal}
                      variant={generatedProposal ? "primary" : "secondary"}
                    >
                      {isSaving ? "Saving..." : "Save proposal"}
                    </Button>
                    {!generatedProposal && (
                      <p className="flex items-center text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                        Generate a proposal preview first to enable saving.
                      </p>
                    )}
                  </div>
                )}

                {/* Reset action */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                  >
                    Start over
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          <div className="space-y-6">
            <Card title="Budget estimate" eyebrow={estimate ? "Calculated" : "Pending"}>
              {estimate ? (
                <div className="space-y-6">
                  {/* Primary metrics */}
                  <div className="space-y-4">
                    <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                      <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Estimated budget
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {formatBudgetRange(
                          estimate.budget.final.min,
                          estimate.budget.final.max,
                          estimate.currency
                        )}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                      <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Estimated timeline
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {formatTimelineRange(
                          estimate.timeline.final.minWeeks,
                          estimate.timeline.final.maxWeeks
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Project configuration summary */}
                  <div className="space-y-2">
                    <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Configuration
                    </p>
                    <div className="space-y-1 text-[var(--text-sm)]">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Project type</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{estimate.projectType.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Style</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{estimate.styleOption.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Area</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{estimate.input.areaPing} ping</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Meeting rooms</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{estimate.input.meetingRoomCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget breakdown */}
                  <div className="space-y-2">
                    <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Budget breakdown
                    </p>
                    <div className="space-y-1 text-[var(--text-sm)]">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Baseline</span>
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {formatBudgetRange(
                            estimate.budget.baseline.min,
                            estimate.budget.baseline.max,
                            estimate.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Area impact</span>
                        <span className={`font-medium ${estimate.budget.areaImpact >= 0 ? "text-amber-600" : "text-green-600"}`}>
                          {formatPercentage(estimate.budget.areaImpact)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Style impact</span>
                        <span className={`font-medium ${estimate.budget.styleImpact >= 0 ? "text-amber-600" : "text-green-600"}`}>
                          {formatPercentage(estimate.budget.styleImpact)}
                        </span>
                      </div>
                      {estimate.budget.adjustmentsImpact.min !== 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-secondary)]">Options impact</span>
                          <span className={`font-medium ${estimate.budget.adjustmentsImpact.min >= 0 ? "text-amber-600" : "text-green-600"}`}>
                            {formatBudgetRange(
                              estimate.budget.adjustmentsImpact.min,
                              estimate.budget.adjustmentsImpact.max,
                              estimate.currency
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline breakdown */}
                  <div className="space-y-2">
                    <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Timeline breakdown
                    </p>
                    <div className="space-y-1 text-[var(--text-sm)]">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Baseline</span>
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {formatTimelineRange(
                            estimate.timeline.baseline.minWeeks,
                            estimate.timeline.baseline.maxWeeks
                          )}
                        </span>
                      </div>
                      {estimate.timeline.adjustmentsWeeks > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-secondary)]">Options added</span>
                          <span className="font-medium text-amber-600">
                            +{estimate.timeline.adjustmentsWeeks} weeks
                          </span>
                        </div>
                      )}
                      {estimate.timeline.rushCompression > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-secondary)]">Rush compression</span>
                          <span className="font-medium text-green-600">
                            -{Math.round(estimate.timeline.rushCompression * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected options */}
                  {estimate.input.includedOptions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Selected options
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {estimate.input.includedOptions.map((option) => (
                          <span
                            key={option}
                            className="inline-flex items-center rounded-full bg-[var(--color-accent-subtle)] px-3 py-1 text-[var(--text-xs)] font-medium text-[var(--color-accent)]"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
              <div className="space-y-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-[var(--color-text-primary)]">Configure your project to generate an estimate</p>
                    <p className="mt-1">Select project type, style, area, and any additional scope options to calculate budget and timeline.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-[var(--color-text-primary)]">Quick guide</p>
                    <ul className="space-y-2 leading-6">
                      <li>Choose project type and interior style.</li>
                      <li>Enter the total area in ping.</li>
                      <li>Add optional scope items as needed.</li>
                      <li>Click Generate estimate to see results.</li>
                    </ul>
                  </div>
                </div>
              )}
            </Card>

            <Card title="Proposal preview" eyebrow={generatedProposal ? "Ready" : "Pending"}>
              {generatedProposal ? (
                <div className="space-y-5">
                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]">
                          Proposal ready for review
                        </p>
                        <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                          Source: {toTitleCase(generatedProposal.metadata.provider)} · {generatedProposal.metadata.modelUsed}
                        </p>
                        {actualProviderUsed === "mock" && (
                          <p className="mt-2 text-[var(--text-xs)] text-amber-700">
                            <span className="font-semibold">Demo mode:</span> This proposal was generated using demo content for presentation purposes.
                          </p>
                        )}
                      </div>
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)]">
                        {new Date(generatedProposal.metadata.generatedAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <ProposalPreview content={generatedProposal} />
                </div>
              ) : (
                <div className="space-y-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[var(--color-text-primary)]">Generate a proposal preview</p>
                    <p className="mt-1">
                      After generating an estimate, click Generate proposal preview to create structured content for your client presentation.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-[var(--color-text-primary)]">Includes</p>
                    <ul className="space-y-2 leading-6">
                      <li>Executive summary and project understanding</li>
                      <li>Design direction and spatial planning</li>
                      <li>Budget and timeline narratives</li>
                      <li>Risks, assumptions, and next steps</li>
                    </ul>
                  </div>
                </div>
              )}
            </Card>

            <Card title="Pricing reference" eyebrow="Active">
              <div className="space-y-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">
                    {activePricingRuleSet.name}
                  </p>
                  <p className="mt-1 leading-6">{activePricingRuleSet.notes}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-[var(--color-text-primary)]">How estimates work</p>
                  <ul className="space-y-2 leading-6">
                    <li>Budget and timeline are calculated from base rates.</li>
                    <li>Style selection adjusts finish level pricing.</li>
                    <li>Scope options add percentage adjustments.</li>
                    <li>All calculations are deterministic and repeatable.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
