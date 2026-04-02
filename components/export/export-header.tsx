/**
 * Export Header Component (ORDX-024B)
 *
 * Displays proposal metadata in a clean, client-facing header.
 * Includes title, client info, and key project details.
 */

import type { ExportMetadata } from "@/types/proposal-export";
import { formatDate } from "@/lib/format";

interface ExportHeaderProps {
  metadata: ExportMetadata;
}

export function ExportHeader({ metadata }: ExportHeaderProps) {
  return (
    <header className="mb-8 border-b border-[var(--color-border)] pb-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
          {metadata.title}
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
          Cross-Industry Proposal
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Client Information</h3>
          <div className="space-y-1 text-[var(--color-text-secondary)]">
            <p><span className="font-medium">Company:</span> {metadata.clientName}</p>
            <p><span className="font-medium">Contact:</span> {metadata.contactName}</p>
            <p><span className="font-medium">Industry:</span> {metadata.industry}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Proposal Details</h3>
          <div className="space-y-1 text-[var(--color-text-secondary)]">
            <p><span className="font-medium">Status:</span> {metadata.status}</p>
            <p><span className="font-medium">Created:</span> {formatDate(metadata.createdAt)}</p>
            <p><span className="font-medium">Due Date:</span> {formatDate(metadata.dueDate)}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Engagement Specifications</h3>
          <div className="space-y-1 text-[var(--color-text-secondary)]">
            <p><span className="font-medium">Type:</span> {metadata.projectTypeName}</p>
            <p><span className="font-medium">Delivery Model:</span> {metadata.styleOptionName}</p>
            <p><span className="font-medium">Scope Size:</span> {metadata.scopeSize}</p>
            <p><span className="font-medium">Complexity:</span> {metadata.complexityLevel}</p>
            <p><span className="font-medium">Stakeholders:</span> {metadata.stakeholderCount}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Included Modules</h3>
          <ul className="space-y-1 text-[var(--color-text-secondary)]">
            {metadata.includeDiscoveryWorkshop && <li>• Discovery workshop</li>}
            {metadata.includeTrainingEnablement && <li>• Training and enablement</li>}
            {metadata.includeImplementationSupport && <li>• Implementation support</li>}
            {metadata.includeCustomDeliverables && <li>• Custom deliverables</li>}
            {metadata.includeAutomationIntegration && <li>• Automation integration</li>}
            {metadata.includeComplianceReview && <li>• Compliance review</li>}
            {metadata.expeditedDelivery && <li>• Expedited delivery</li>}
          </ul>
        </div>
      </div>

      {metadata.summary && (
        <div className="mt-6 rounded-lg bg-[var(--color-surface-muted)] p-4">
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Engagement Summary</h3>
          <p className="text-[var(--color-text-secondary)]">{metadata.summary}</p>
        </div>
      )}

      {metadata.scope.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Proposal Scope</h3>
          <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
            {metadata.scope.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
