/**
 * Export Spatial Planning Component (ORDX-024B)
 *
 * Displays the AI-generated spatial planning recommendations in a clean format.
 */

import type { ScopeRecommendations } from "@/types/proposal-generation";

interface ExportSpatialPlanningProps {
  content: ScopeRecommendations;
}

export function ExportSpatialPlanning({ content }: ExportSpatialPlanningProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Overall Strategy</h4>
        <p className="text-[var(--color-text-secondary)]">{content.overallStrategy}</p>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Scope Recommendations</h4>
        <div className="space-y-3">
          {content.areaRecommendations.map((rec, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
            >
              <h5 className="text-sm font-semibold text-[var(--color-text-primary)]">{rec.area}</h5>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{rec.recommendation}</p>
              <p className="mt-2 text-xs italic text-[var(--color-text-muted)]">{rec.rationale}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Coordination Approach</h4>
        <p className="text-[var(--color-text-secondary)]">{content.circulationFlow}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Flexibility Considerations</h4>
        <p className="text-[var(--color-text-secondary)]">{content.flexibilityConsiderations}</p>
      </div>
    </div>
  );
}
