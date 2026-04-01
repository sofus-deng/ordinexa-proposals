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
          Interior Fit-Out Proposal
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
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Project Specifications</h3>
          <div className="space-y-1 text-[var(--color-text-secondary)]">
            <p><span className="font-medium">Type:</span> {metadata.projectTypeName}</p>
            <p><span className="font-medium">Style:</span> {metadata.styleOptionName}</p>
            <p><span className="font-medium">Area:</span> {metadata.areaPing} ping</p>
            <p><span className="font-medium">Meeting Rooms:</span> {metadata.meetingRoomCount}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Included Features</h3>
          <ul className="space-y-1 text-[var(--color-text-secondary)]">
            {metadata.includeReceptionArea && <li>• Reception area</li>}
            {metadata.includePantry && <li>• Pantry</li>}
            {metadata.includeGlassPartitions && <li>• Glass partitions</li>}
            {metadata.includeCustomStorage && <li>• Custom storage</li>}
            {metadata.includeSmartOfficeSetup && <li>• Smart office setup</li>}
            {metadata.includeMEPWork && <li>• MEP work</li>}
            {metadata.rushProject && <li>• Rush project</li>}
          </ul>
        </div>
      </div>

      {metadata.summary && (
        <div className="mt-6 rounded-lg bg-[var(--color-surface-muted)] p-4">
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Project Summary</h3>
          <p className="text-[var(--color-text-secondary)]">{metadata.summary}</p>
        </div>
      )}

      {metadata.scope.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">Project Scope</h3>
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
