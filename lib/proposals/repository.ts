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
