/**
 * Export Design Direction Component (ORDX-024B)
 *
 * Displays the AI-generated design direction in a clean format.
 */

import type { ProposedApproach } from "@/types/proposal-generation";

interface ExportDesignDirectionProps {
  content: ProposedApproach;
}

export function ExportDesignDirection({ content }: ExportDesignDirectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Approach Summary</h4>
        <p className="text-[var(--color-text-secondary)]">{content.approachSummary}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Workstreams</h4>
        <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
          {content.workstreams.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Engagement Model</h4>
        <p className="text-[var(--color-text-secondary)]">{content.engagementModel}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Delivery Approach</h4>
        <p className="text-[var(--color-text-secondary)]">{content.deliveryApproach}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Capability Enablers</h4>
        <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
          {content.capabilityEnablers.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
