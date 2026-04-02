/**
 * Proposal Export Page Component (ORDX-024B)
 *
 * Main export page component that renders a complete, print-friendly proposal.
 * Combines all export sections in a coherent order for client-facing output.
 */

import type { ProposalExportViewModel } from "@/types/proposal-export";
import { ExportHeader } from "./export-header";
import { ExportSection } from "./export-section";
import { ExportExecutiveSummary } from "./export-executive-summary";
import { ExportProjectUnderstanding } from "./export-project-understanding";
import { ExportDesignDirection } from "./export-design-direction";
import { ExportSpatialPlanning } from "./export-spatial-planning";
import { ExportBudgetTimeline } from "./export-budget-timeline";
import { ExportRisksAndAssumptions } from "./export-risks-assumptions";
import { ExportNextSteps } from "./export-next-steps";
import { ExportPrintActions } from "./export-print-actions";

interface ProposalExportPageProps {
  viewModel: ProposalExportViewModel;
}

export function ProposalExportLayout({ viewModel }: ProposalExportPageProps) {
  return (
    <div className="mx-auto max-w-4xl bg-[var(--color-surface)] p-8 text-[var(--color-text-primary)] print:p-0 print:bg-white">
      {/* Print Actions - Hidden during actual printing */}
      <ExportPrintActions />

      {/* Header with metadata */}
      <ExportHeader metadata={viewModel.metadata} />

      {/* Executive Summary */}
      <ExportSection title="Executive Summary" subtitle="Strategic overview">
        {viewModel.generatedContent ? (
          <ExportExecutiveSummary content={viewModel.generatedContent.executiveSummary} />
        ) : (
          <p className="text-[var(--color-text-muted)]">Executive summary not available.</p>
        )}
      </ExportSection>

      {/* Project Understanding */}
      <ExportSection title="Project Understanding" subtitle="Project context">
        {viewModel.generatedContent ? (
          <ExportProjectUnderstanding content={viewModel.generatedContent.projectUnderstanding} />
        ) : (
          <p className="text-[var(--color-text-muted)]">Project understanding not available.</p>
        )}
      </ExportSection>

      {/* Proposed Approach */}
      <ExportSection title="Proposed Approach" subtitle="Recommended approach">
        {viewModel.generatedContent ? (
          <ExportDesignDirection content={viewModel.generatedContent.proposedApproach} />
        ) : (
          <p className="text-[var(--color-text-muted)]">Proposed approach not available.</p>
        )}
      </ExportSection>

      {/* Scope Recommendations */}
      <ExportSection title="Scope Recommendations" subtitle="Recommendations">
        {viewModel.generatedContent ? (
          <ExportSpatialPlanning content={viewModel.generatedContent.scopeRecommendations} />
        ) : (
          <p className="text-[var(--color-text-muted)]">Scope recommendations not available.</p>
        )}
      </ExportSection>

      {/* Budget and Timeline Summary */}
      <ExportSection title="Budget & Timeline" subtitle="Cost and schedule overview">
        {viewModel.generatedContent ? (
          <ExportBudgetTimeline
            estimationSummary={viewModel.estimationSummary}
            budgetNarrative={viewModel.generatedContent.budgetNarrative}
            timelineNarrative={viewModel.generatedContent.timelineNarrative}
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
              <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Budget Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[var(--color-text-muted)]">Minimum</p>
                  <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {viewModel.estimationSummary.budgetRange.min.toLocaleString()} {viewModel.estimationSummary.currency}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Maximum</p>
                  <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {viewModel.estimationSummary.budgetRange.max.toLocaleString()} {viewModel.estimationSummary.currency}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Confidence</p>
                  <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {viewModel.estimationSummary.confidenceLabel}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
              <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Timeline Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--color-text-muted)]">Minimum Duration</p>
                  <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {viewModel.estimationSummary.timelineRange.minWeeks} weeks
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Maximum Duration</p>
                  <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {viewModel.estimationSummary.timelineRange.maxWeeks} weeks
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[var(--color-text-muted)]">Budget and timeline narratives not available.</p>
          </div>
        )}
      </ExportSection>

      {/* Risks and Assumptions */}
      <ExportSection title="Risks & Assumptions" subtitle="AI-identified factors">
        {viewModel.generatedContent ? (
          <ExportRisksAndAssumptions content={viewModel.generatedContent.risksAndAssumptions} />
        ) : (
          <p className="text-[var(--color-text-muted)]">Risks and assumptions not available.</p>
        )}
      </ExportSection>

      {/* Recommended Next Steps */}
      <ExportSection title="Recommended Next Steps" subtitle="AI-suggested actions">
        {viewModel.generatedContent ? (
          <ExportNextSteps content={viewModel.generatedContent.recommendedNextSteps} />
        ) : (
          <p className="text-[var(--color-text-muted)]">Next steps not available.</p>
        )}
      </ExportSection>

      {/* Footer */}
      <footer className="mt-12 border-t border-[var(--color-border)] pt-6 text-center text-xs text-[var(--color-text-muted)]">
        <p>Generated by Ordinexa Proposals</p>
        <p className="mt-1">This proposal is confidential and intended solely for the addressee.</p>
      </footer>
    </div>
  );
}
