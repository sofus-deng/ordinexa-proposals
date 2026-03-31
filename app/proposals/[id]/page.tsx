import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink, Card, PageHeader, SectionBlock, StatusBadge } from "@/components/ui";
import { getProposalById } from "@/data";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  calculateEstimate,
  createMockPricingRepository,
  proposalToEstimationInput,
  getIncludedOptionsList,
} from "@/lib/estimation";
import type { EstimateSummary } from "@/lib/estimation";

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

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = getProposalById(id);

  if (!proposal) {
    notFound();
  }

  const estimate = await getProposalEstimate(proposal);

  if (!estimate) {
    notFound();
  }

  const confidenceLabel = getConfidenceLabel(estimate);
  const includedOptions = getIncludedOptionsList(proposalToEstimationInput(proposal));

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title={proposal.title}
          description="Calculated estimate derived from project parameters using the deterministic estimation engine."
          action={<ButtonLink href="/proposals/new" variant="secondary">Duplicate into new draft</ButtonLink>}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
          <div className="space-y-6">
            <Card
              title="Executive proposal summary"
              eyebrow="Client-facing preview"
              action={<StatusBadge status={proposal.status} />}
            >
              <div className="space-y-5 text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">
                <p>
                  {proposal.clientName} is evaluating an interior project proposal with a calculated budget range
                  of {formatBudgetRange(estimate.budget.final.min, estimate.budget.final.max, estimate.currency)} and
                  estimated timeline of {formatTimelineRange(estimate.timeline.final.minWeeks, estimate.timeline.final.maxWeeks)}.
                </p>
                <p>
                  This estimate is derived deterministically from project type, style selection, area, and selected
                  fit-out options using the Ordinexa estimation engine.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Client</p>
                    <p className="mt-2 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{proposal.clientName}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Contact</p>
                    <p className="mt-2 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{proposal.contactName}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Due date</p>
                    <p className="mt-2 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{formatDate(proposal.dueDate)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <SectionBlock title="Scope priorities" description="Structured summary of fit-out scope themes for generation and pricing automation.">
              <ul className="space-y-3 text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
                {proposal.scope.map((scopeItem) => (
                  <li key={scopeItem} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                    {scopeItem}
                  </li>
                ))}
              </ul>
            </SectionBlock>

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
          </div>
        </div>
      </div>
    </AppShell>
  );
}
