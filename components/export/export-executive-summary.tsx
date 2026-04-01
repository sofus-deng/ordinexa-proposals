/**
 * Export Executive Summary Component (ORDX-024B)
 *
 * Displays the AI-generated executive summary in a clean format.
 */

import type { ExecutiveSummary } from "@/types/proposal-generation";

interface ExportExecutiveSummaryProps {
  content: ExecutiveSummary;
}

export function ExportExecutiveSummary({ content }: ExportExecutiveSummaryProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Overview</h4>
        <p className="text-[var(--color-text-secondary)]">{content.overview}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Value Proposition</h4>
        <p className="text-[var(--color-text-secondary)]">{content.valueProposition}</p>
      </div>
      <div className="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-surface-muted)] p-4">
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-primary-emphasis)]">Recommendation</h4>
        <p className="text-[var(--color-text-primary)]">{content.recommendation}</p>
      </div>
    </div>
  );
}
