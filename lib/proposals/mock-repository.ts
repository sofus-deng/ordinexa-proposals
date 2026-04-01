/**
 * Mock Proposal Repository Implementation (ORDX-022A, ORDX-022B)
 *
 * Provides proposal persistence using in-memory storage.
 * Designed to be replaced by Prisma-backed repositories with minimal refactoring.
 *
 * This implementation:
 * - Stores proposals in memory
 * - Generates deterministic IDs
 * - Provides seed data from existing mock proposals
 * - Maintains backward compatibility with existing mock data
 * - Supports list queries with sorting and filtering for dashboard use
 */

import type {
  ProposalRepository,
  ProposalListOptions,
} from "./repository";
import type {
  ProposalRecord,
  CreateProposalInput,
  UpdateProposalInput,
} from "@/types/proposal-record";
import type { Proposal } from "@/types/proposal";
import { proposals as mockProposals } from "@/data/mock-proposals";

/**
 * In-memory storage for proposals.
 * In a real implementation, this would be replaced by database queries.
 */
let proposalsStore: ProposalRecord[] = [];

/**
 * Counter for generating sequential IDs.
 */
let idCounter = 1005;

/**
 * Generates a unique proposal ID.
 */
function generateId(): string {
  return `ordx-${idCounter++}`;
}

/**
 * Converts a legacy Proposal type to a ProposalRecord.
 * Used for backward compatibility with existing mock data.
 */
function legacyToRecord(proposal: Proposal): ProposalRecord {
  return {
    id: proposal.id,
    title: proposal.title,
    clientName: proposal.clientName,
    contactName: proposal.contactName,
    industry: proposal.industry,
    status: proposal.status,
    summary: proposal.summary,
    scope: proposal.scope,
    createdAt: proposal.createdAt,
    updatedAt: proposal.updatedAt,
    dueDate: proposal.dueDate,
    estimationInput: {
      projectTypeId: proposal.projectTypeId,
      styleMultiplierId: proposal.styleOptionId,
      areaPing: proposal.areaPing,
      meetingRoomCount: proposal.meetingRoomCount,
      includeReceptionArea: proposal.includeReceptionArea,
      includePantry: proposal.includePantry,
      includeGlassPartitions: proposal.includeGlassPartitions,
      includeCustomStorage: proposal.includeCustomStorage,
      includeSmartOfficeSetup: proposal.includeSmartOfficeSetup,
      includeMEPWork: proposal.includeMEPWork,
      rushProject: proposal.rushProject,
    },
    estimationResult: {
      projectType: {
        id: proposal.projectTypeId,
        name: proposal.projectTypeId, // Simplified for mock
      },
      styleOption: {
        id: proposal.styleOptionId,
        name: proposal.styleOptionId, // Simplified for mock
        multiplier: 1.0, // Default for mock
      },
      input: {
        areaPing: proposal.areaPing,
        meetingRoomCount: proposal.meetingRoomCount,
        includedOptions: [], // Simplified for mock
      },
      budget: {
        baseline: {
          min: proposal.estimate.subtotal,
          max: proposal.estimate.subtotal,
        },
        areaImpact: 0,
        styleImpact: 0,
        adjustmentsImpact: {
          min: proposal.estimate.adjustmentTotal,
          max: proposal.estimate.adjustmentTotal,
        },
        final: {
          min: proposal.estimate.estimatedTotal,
          max: proposal.estimate.estimatedTotal,
        },
        breakdown: {
          baseline: {
            min: proposal.estimate.subtotal,
            max: proposal.estimate.subtotal,
          },
          areaFactor: 1.0,
          styleMultiplier: 1.0,
          adjustments: [],
          totalAdjustmentImpact: {
            min: proposal.estimate.adjustmentTotal,
            max: proposal.estimate.adjustmentTotal,
          },
        },
      },
      timeline: {
        baseline: {
          minWeeks: 8,
          maxWeeks: 12,
        },
        adjustmentsWeeks: 0,
        rushCompression: 0,
        final: {
          minWeeks: 8,
          maxWeeks: 12,
        },
        breakdown: {
          baseline: {
            minWeeks: 8,
            maxWeeks: 12,
          },
          adjustments: [],
          rushCompression: 0,
          totalAdjustmentWeeks: 0,
        },
      },
      currency: "TWD",
    },
  };
}

/**
 * Seeds the repository with existing mock proposals.
 * Called during initialization.
 */
function seedMockData(): void {
  if (proposalsStore.length === 0) {
    proposalsStore = mockProposals.map(legacyToRecord);
    idCounter = 1005; // Continue from the last mock ID
  }
}

/**
 * Sorts proposals based on the provided sort options.
 */
function sortProposals(
  proposals: ProposalRecord[],
  sort: NonNullable<ProposalListOptions["sort"]>
): ProposalRecord[] {
  return [...proposals].sort((a, b) => {
    const aVal = a[sort.field];
    const bVal = b[sort.field];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal < bVal ? -1 : 1;
    return sort.direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Filters proposals based on the provided filter options.
 */
function filterProposals(
  proposals: ProposalRecord[],
  filter: NonNullable<ProposalListOptions["filter"]>
): ProposalRecord[] {
  return proposals.filter((proposal) => {
    if (filter.status && filter.status.length > 0) {
      if (!filter.status.includes(proposal.status)) {
        return false;
      }
    }
    
    if (filter.clientName) {
      const searchLower = filter.clientName.toLowerCase();
      if (!proposal.clientName.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Creates a mock proposal repository.
 * This can later be replaced with a Prisma-backed implementation.
 */
export function createMockProposalRepository(): ProposalRepository {
  // Initialize with mock data
  seedMockData();

  return {
    async getById(id: string): Promise<ProposalRecord | null> {
      return proposalsStore.find((p) => p.id === id) ?? null;
    },

    async getAll(): Promise<ProposalRecord[]> {
      return [...proposalsStore];
    },

    async list(options?: ProposalListOptions): Promise<ProposalRecord[]> {
      let results = [...proposalsStore];
      
      // Apply filters
      if (options?.filter) {
        results = filterProposals(results, options.filter);
      }
      
      // Apply sorting
      const sortOptions = options?.sort ?? { field: "updatedAt", direction: "desc" };
      results = sortProposals(results, sortOptions);
      
      // Apply pagination
      if (options?.offset !== undefined) {
        results = results.slice(options.offset);
      }
      
      if (options?.limit !== undefined) {
        results = results.slice(0, options.limit);
      }
      
      return results;
    },

    async create(input: CreateProposalInput): Promise<ProposalRecord> {
      const now = new Date().toISOString();
      const id = generateId();

      // Generate default title if not provided
      const title = input.title ?? `Proposal ${id}`;

      // Generate default due date (2 weeks from now) if not provided
      const dueDate = input.dueDate ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const newProposal: ProposalRecord = {
        id,
        title,
        clientName: input.clientName,
        contactName: input.contactName,
        industry: input.industry,
        status: "draft",
        summary: input.scope.join("; "),
        scope: input.scope,
        createdAt: now,
        updatedAt: now,
        dueDate,
        estimationInput: input.estimationInput,
        estimationResult: input.estimationResult,
        generatedContent: input.generatedContent,
        generationMetadata: input.generationMetadata,
      };

      proposalsStore.push(newProposal);
      return newProposal;
    },

    async update(id: string, input: UpdateProposalInput): Promise<ProposalRecord | null> {
      const index = proposalsStore.findIndex((p) => p.id === id);
      if (index === -1) {
        return null;
      }

      const existing = proposalsStore[index];
      const updated: ProposalRecord = {
        ...existing,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      proposalsStore[index] = updated;
      return updated;
    },

    async delete(id: string): Promise<boolean> {
      const index = proposalsStore.findIndex((p) => p.id === id);
      if (index === -1) {
        return false;
      }

      proposalsStore.splice(index, 1);
      return true;
    },
  };
}

/**
 * Resets the mock repository storage.
 * Useful for testing to ensure a clean state.
 */
export function resetMockProposalRepository(): void {
  proposalsStore = [];
  idCounter = 1005;
}
