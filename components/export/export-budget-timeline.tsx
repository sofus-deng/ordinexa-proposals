/**
 * Export Budget & Timeline Component (ORDX-024B)
 *
 * Displays the budget and timeline summary with narratives.
 */

import type { BudgetNarrative, TimelineNarrative } from "@/types/proposal-generation";
import type { ExportEstimationSummary } from "@/types/proposal-export";
import { formatCurrencyRange, formatTimelineRange } from "@/lib/format";

interface ExportBudgetTimelineProps {
  estimationSummary: ExportEstimationSummary;
  budgetNarrative: BudgetNarrative;
  timelineNarrative: TimelineNarrative;
}

export function ExportBudgetTimeline({
  estimationSummary,
  budgetNarrative,
  timelineNarrative,
}: ExportBudgetTimelineProps) {
  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
        <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Budget Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-muted)]">Budget Range</p>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {formatCurrencyRange(estimationSummary.budgetRange.min, estimationSummary.budgetRange.max, estimationSummary.currency)}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)]">Timeline Range</p>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {formatTimelineRange(estimationSummary.timelineRange.minWeeks, estimationSummary.timelineRange.maxWeeks)}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)]">Confidence</p>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              {estimationSummary.confidenceLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Budget Narrative */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Budget Narrative</h4>
        <p className="mb-3 text-[var(--color-text-secondary)]">{budgetNarrative.overview}</p>
        <div className="mb-3">
          <h5 className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">Cost Breakdown</h5>
          <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
            {budgetNarrative.costBreakdown.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="mb-3">
          <h5 className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">Value Engineering Options</h5>
          <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
            {budgetNarrative.valueEngineeringOptions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border-l-4 border-[var(--color-secondary)] bg-[var(--color-surface-muted)] p-3">
          <h5 className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">Confidence Explanation</h5>
          <p className="text-sm text-[var(--color-text-secondary)]">{budgetNarrative.confidenceExplanation}</p>
        </div>
      </div>

      {/* Timeline Narrative */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Timeline Narrative</h4>
        <p className="mb-3 text-[var(--color-text-secondary)]">{timelineNarrative.overview}</p>
        <div className="mb-3">
          <h5 className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">Key Milestones</h5>
          <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
            {timelineNarrative.milestones.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="mb-3">
          <h5 className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">Critical Path</h5>
          <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
            {timelineNarrative.criticalPath.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border-l-4 border-[var(--color-secondary)] bg-[var(--color-surface-muted)] p-3">
          <h5 className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">Confidence Explanation</h5>
          <p className="text-sm text-[var(--color-text-secondary)]">{timelineNarrative.confidenceExplanation}</p>
        </div>
      </div>
    </div>
  );
}
