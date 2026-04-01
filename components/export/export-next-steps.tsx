/**
 * Export Next Steps Component (ORDX-024B)
 *
 * Displays the AI-generated recommended next steps in a clean format.
 */

import type { RecommendedNextSteps } from "@/types/proposal-generation";

interface ExportNextStepsProps {
  content: RecommendedNextSteps;
}

export function ExportNextSteps({ content }: ExportNextStepsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Immediate Actions</h4>
        <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
          {content.immediate.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Short-Term Actions</h4>
        <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
          {content.shortTerm.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Decision Points</h4>
        <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
          {content.decisionPoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
