/**
 * Export Risks & Assumptions Component (ORDX-024B)
 *
 * Displays the AI-generated risks and assumptions in a clean format.
 */

import type { RisksAndAssumptions } from "@/types/proposal-generation";

interface ExportRisksAndAssumptionsProps {
  content: RisksAndAssumptions;
}

function ImpactBadge({ impact }: { impact: "low" | "medium" | "high" }) {
  const colors = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${colors[impact]}`}>
      {impact.charAt(0).toUpperCase() + impact.slice(1)} impact
    </span>
  );
}

export function ExportRisksAndAssumptions({ content }: ExportRisksAndAssumptionsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Risks</h4>
        <div className="space-y-3">
          {content.risks.map((risk, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-sm text-[var(--color-text-secondary)]">{risk.description}</p>
                <ImpactBadge impact={risk.impact} />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                <span className="font-medium">Mitigation:</span> {risk.mitigationOrValidation}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Assumptions</h4>
        <div className="space-y-3">
          {content.assumptions.map((assumption, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-sm text-[var(--color-text-secondary)]">{assumption.description}</p>
                <ImpactBadge impact={assumption.impact} />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                <span className="font-medium">Validation:</span> {assumption.mitigationOrValidation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
