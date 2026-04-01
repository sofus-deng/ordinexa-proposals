/**
 * Proposal Repository Abstraction (ORDX-022D)
 *
 * Provides a clean interface for proposal persistence operations.
 * Designed to be implemented by mock data or Prisma-backed repositories
 * with minimal refactoring when switching implementations.
 */

import type {
  ProposalRecord,
  CreateProposalInput,
  UpdateProposalInput,
} from "@/types/proposal-record";
import type { ProposalStatus } from "@/types/proposal";

/**
 * Sorting options for proposal list queries.
 */
export interface ProposalListSortOptions {
  /** Field to sort by */
  field: "createdAt" | "updatedAt" | "dueDate" | "title";
  /** Sort direction */
  direction: "asc" | "desc";
}

/**
 * Filter options for proposal list queries.
 */
export interface ProposalListFilterOptions {
  /** Filter by status */
  status?: ProposalStatus[];
  /** Filter by client name (partial match) */
  clientName?: string;
}

/**
 * Query options for listing proposals.
 */
export interface ProposalListOptions {
  /** Sorting options */
  sort?: ProposalListSortOptions;
  /** Filter options */
  filter?: ProposalListFilterOptions;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Repository interface for proposal persistence.
 * All operations are async to support both in-memory and database implementations.
 */
export interface ProposalRepository {
  /**
   * Get a proposal by its ID.
   * Returns null if not found.
   */
  getById(id: string): Promise<ProposalRecord | null>;

  /**
   * Get all proposals.
   * Returns an empty array if no proposals exist.
   */
  getAll(): Promise<ProposalRecord[]>;

  /**
   * List proposals with optional sorting and filtering.
   * This is the primary method for dashboard queries.
   * Returns proposals sorted by updatedAt descending by default.
   */
  list(options?: ProposalListOptions): Promise<ProposalRecord[]>;

  /**
   * Create a new proposal record.
   * Returns the created proposal with generated ID and timestamps.
   */
  create(input: CreateProposalInput): Promise<ProposalRecord>;

  /**
   * Update an existing proposal record.
   * Returns null if the proposal doesn't exist.
   */
  update(id: string, input: UpdateProposalInput): Promise<ProposalRecord | null>;

  /**
   * Delete a proposal by its ID.
   * Returns true if deleted, false if not found.
   */
  delete(id: string): Promise<boolean>;
}
