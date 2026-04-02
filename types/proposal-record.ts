/**
 * Proposal Record Types (ORDX-022A-ORDX-022F)
 *
 * Defines types for saved proposal records that include:
 * - Project/form input data
 * - Deterministic estimation snapshot
 * - AI-generated structured proposal content
 *
 * These types support both mock and Prisma-backed implementations.
 */

import type { ProposalStatus } from "./proposal";
import type { EstimateSummary } from "@/lib/estimation/types";
import type { GeneratedProposalContent } from "./proposal-generation";

/**
 * Estimation input snapshot for reproducibility.
 * Captures the exact inputs used to generate the estimate.
 */
export interface EstimationInputSnapshot {
  /** Project type identifier */
  projectTypeId: string;

  /** Style multiplier identifier */
  styleMultiplierId: string;

  /** Relative scope size used for sizing-based estimate adjustments */
  scopeSize: number;

  /** Delivery complexity on a 1-5 scale */
  complexityLevel: number;

  /** Number of primary stakeholders or coordination tracks */
  stakeholderCount: number;

  /** Whether to include discovery workshop facilitation */
  includeDiscoveryWorkshop: boolean;

  /** Whether to include training and enablement support */
  includeTrainingEnablement: boolean;

  /** Whether to include implementation support */
  includeImplementationSupport: boolean;

  /** Whether to include custom deliverables */
  includeCustomDeliverables: boolean;

  /** Whether to include automation or systems integration */
  includeAutomationIntegration: boolean;

  /** Whether to include compliance and governance review */
  includeComplianceReview: boolean;

  /** Whether this engagement requires accelerated delivery */
  expeditedDelivery: boolean;
}

/**
 * Complete proposal record with all snapshots.
 * This is the primary type for saved proposals.
 */
export interface ProposalRecord {
  /** Unique proposal identifier */
  id: string;

  /** Proposal title */
  title: string;

  /** Client name */
  clientName: string;

  /** Contact name */
  contactName: string;

  /** Industry sector */
  industry: string;

  /** Current status */
  status: ProposalStatus;

  /** Brief summary */
  summary: string;

  /** Project scope items */
  scope: string[];

  /** ISO timestamp of creation */
  createdAt: string;

  /** ISO timestamp of last update */
  updatedAt: string;

  /** ISO timestamp for due date */
  dueDate: string;

  /** Estimation input snapshot for reproducibility */
  estimationInput: EstimationInputSnapshot;

  /** Complete estimation result snapshot */
  estimationResult: EstimateSummary;

  /** AI-generated proposal content (if available) */
  generatedContent?: GeneratedProposalContent;

  /** Metadata about the generation */
  generationMetadata?: {
    /** Provider used for generation */
    provider: string;

    /** Model used for generation */
    model: string;

    /** ISO timestamp of generation */
    generatedAt: string;
  };
}

/**
 * Input for creating a new proposal record.
 */
export interface CreateProposalInput {
  /** Proposal title (optional, will generate default if not provided) */
  title?: string;

  /** Client name */
  clientName: string;

  /** Contact name */
  contactName: string;

  /** Industry sector */
  industry: string;

  /** Project scope items */
  scope: string[];

  /** Due date (optional, will default to 2 weeks from now) */
  dueDate?: string;

  /** Estimation input snapshot */
  estimationInput: EstimationInputSnapshot;

  /** Complete estimation result snapshot */
  estimationResult: EstimateSummary;

  /** AI-generated proposal content (optional) */
  generatedContent?: GeneratedProposalContent;

  /** Metadata about the generation (optional) */
  generationMetadata?: {
    /** Provider used for generation */
    provider: string;

    /** Model used for generation */
    model: string;

    /** ISO timestamp of generation */
    generatedAt: string;
  };
}

/**
 * Update input for an existing proposal record.
 */
export interface UpdateProposalInput {
  /** New title (optional) */
  title?: string;

  /** New status (optional) */
  status?: ProposalStatus;

  /** New summary (optional) */
  summary?: string;

  /** New scope items (optional) */
  scope?: string[];

  /** New due date (optional) */
  dueDate?: string;

  /** Updated estimation input snapshot (optional) */
  estimationInput?: EstimationInputSnapshot;

  /** Updated estimation result snapshot (optional) */
  estimationResult?: EstimateSummary;

  /** Updated AI-generated content (optional) */
  generatedContent?: GeneratedProposalContent;

  /** Updated generation metadata (optional) */
  generationMetadata?: {
    /** Provider used for generation */
    provider: string;

    /** Model used for generation */
    model: string;

    /** ISO timestamp of generation */
    generatedAt: string;
  };
}
