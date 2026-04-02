/**
 * Export Project Understanding Component (ORDX-024B)
 *
 * Displays the AI-generated project understanding in a clean format.
 */

import type { ProjectUnderstanding } from "@/types/proposal-generation";

interface ExportProjectUnderstandingProps {
  content: ProjectUnderstanding;
}

export function ExportProjectUnderstanding({ content }: ExportProjectUnderstandingProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Business Context</h4>
        <p className="text-[var(--color-text-secondary)]">{content.businessContext}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Objectives</h4>
        <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
          {content.objectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Operational Needs</h4>
        <p className="text-[var(--color-text-secondary)]">{content.operationalNeeds}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Constraints</h4>
        <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
          {content.constraints.map((constraint, index) => (
            <li key={index}>{constraint}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
