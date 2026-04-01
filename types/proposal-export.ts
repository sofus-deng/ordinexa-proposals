/**
 * Proposal Export View Model (ORDX-024A)
 *
 * Defines a clean, presentation-ready view model for exporting saved proposals.
 * This type combines proposal context, estimation snapshot, and AI-generated content
 * into a coherent structure suitable for client-facing output (print, PDF, etc.).
 */

import type { GeneratedProposalContent } from "./proposal-generation";
import type { ProposalStatus } from "./proposal";

/**
 * Client-facing metadata for the proposal export.
 */
export interface ExportMetadata {
  /** Proposal title */
  title: string;

  /** Client organization name */
  clientName: string;

  /** Primary contact person */
  contactName: string;

  /** Industry sector */
  industry: string;

  /** Current proposal status */
  status: ProposalStatus;

  /** Brief project summary */
  summary: string;

  /** Project scope items */
  scope: string[];

  /** ISO timestamp when proposal was created */
  createdAt: string;

  /** ISO timestamp when proposal was last updated */
  updatedAt: string;

  /** ISO timestamp for proposal due date */
  dueDate: string;

  /** Project type name */
  projectTypeName: string;

  /** Style option name */
  styleOptionName: string;

  /** Area in ping */
  areaPing: number;

  /** Number of meeting rooms */
  meetingRoomCount: number;

  /** Whether reception area is included */
  includeReceptionArea: boolean;

  /** Whether pantry is included */
  includePantry: boolean;

  /** Whether glass partitions are included */
  includeGlassPartitions: boolean;

  /** Whether custom storage is included */
  includeCustomStorage: boolean;

  /** Whether smart office setup is included */
  includeSmartOfficeSetup: boolean;

  /** Whether MEP work is included */
  includeMEPWork: boolean;

  /** Whether this is a rush project */
  rushProject: boolean;
}

/**
 * Budget and timeline summary for export.
 */
export interface ExportEstimationSummary {
  /** Currency code (e.g., "USD", "TWD") */
  currency: string;

  /** Final budget range */
  budgetRange: {
    min: number;
    max: number;
  };

  /** Final timeline range in weeks */
  timelineRange: {
    minWeeks: number;
    maxWeeks: number;
  };

  /** Confidence level based on estimate spread */
  confidenceLabel: "Low" | "Medium" | "High";

  /** List of included options */
  includedOptions: string[];
}

/**
 * Complete export view model for a proposal.
 * This is the primary type for client-facing proposal exports.
 */
export interface ProposalExportViewModel {
  /** Unique proposal identifier */
  id: string;

  /** Client-facing metadata */
  metadata: ExportMetadata;

  /** Budget and timeline summary */
  estimationSummary: ExportEstimationSummary;

  /** AI-generated proposal content (if available) */
  generatedContent: GeneratedProposalContent | null;

  /** Whether AI content was generated */
  hasGeneratedContent: boolean;
}
