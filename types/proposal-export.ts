/**
 * Proposal Export View Model (ORDX-024A)
 *
 * Defines a clean, presentation-ready view model for exporting saved proposals.
 * This type combines proposal context, estimation snapshot, and AI-generated content
 * into a coherent structure suitable for client-facing output (print, PDF, etc.).
 */

import type { GeneratedProposalContent } from "./proposal-generation";

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

  /** Current proposal status (client-facing label) */
  status: string;

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

  /** Relative scope size */
  scopeSize: number;

  /** Delivery complexity on a 1-5 scale */
  complexityLevel: number;

  /** Stakeholder or coordination track count */
  stakeholderCount: number;

  /** Whether discovery workshop facilitation is included */
  includeDiscoveryWorkshop: boolean;

  /** Whether training and enablement support is included */
  includeTrainingEnablement: boolean;

  /** Whether implementation support is included */
  includeImplementationSupport: boolean;

  /** Whether custom deliverables are included */
  includeCustomDeliverables: boolean;

  /** Whether automation integration is included */
  includeAutomationIntegration: boolean;

  /** Whether compliance review is included */
  includeComplianceReview: boolean;

  /** Whether this is an expedited delivery engagement */
  expeditedDelivery: boolean;
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
