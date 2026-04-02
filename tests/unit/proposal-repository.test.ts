/**
 * Unit Tests for Proposal Repository (ORDX-022E, ORDX-023D)
 *
 * Tests cover:
 * - Creating proposals with estimation snapshot and AI content
 * - Reading proposals by ID
 * - Listing all proposals
 * - Listing proposals with sorting and filtering (dashboard queries)
 * - Updating proposals
 * - Deleting proposals
 * - Mock data seeding
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  createMockProposalRepository,
  resetMockProposalRepository,
} from "@/lib/proposals/mock-repository";
import type {
  CreateProposalInput,
  EstimationInputSnapshot,
} from "@/types/proposal-record";

/**
 * Creates a test estimation input snapshot.
 */
function createTestEstimationInput(
  overrides: Partial<EstimationInputSnapshot> = {}
): EstimationInputSnapshot {
  return {
    projectTypeId: "strategic-initiative",
    styleMultiplierId: "standard-delivery",
    scopeSize: 100,
    complexityLevel: 3,
    stakeholderCount: 3,
    includeDiscoveryWorkshop: false,
    includeTrainingEnablement: false,
    includeImplementationSupport: false,
    includeCustomDeliverables: false,
    includeAutomationIntegration: false,
    includeComplianceReview: false,
    expeditedDelivery: false,
    ...overrides,
  };
}

/**
 * Creates a test proposal input.
 */
function createTestProposalInput(
  overrides: Partial<CreateProposalInput> = {}
): CreateProposalInput {
  return {
    clientName: "Test Client",
    contactName: "Test Contact",
    industry: "Technology",
    scope: ["Test scope item 1", "Test scope item 2"],
    estimationInput: createTestEstimationInput(),
    estimationResult: {
      projectType: {
        id: "strategic-initiative",
        name: "Strategic Initiative",
      },
      styleOption: {
        id: "standard-delivery",
        name: "Standard Delivery",
        multiplier: 1.0,
      },
      input: {
        scopeSize: 100,
        complexityLevel: 3,
        stakeholderCount: 3,
        includedOptions: [],
      },
      budget: {
        baseline: { min: 100000, max: 150000 },
        areaImpact: 0,
        styleImpact: 0,
        adjustmentsImpact: { min: 0, max: 0 },
        final: { min: 100000, max: 150000 },
        breakdown: {
          baseline: { min: 100000, max: 150000 },
          areaFactor: 1.0,
          styleMultiplier: 1.0,
          adjustments: [],
          totalAdjustmentImpact: { min: 0, max: 0 },
        },
      },
      timeline: {
        baseline: { minWeeks: 8, maxWeeks: 12 },
        adjustmentsWeeks: 0,
        rushCompression: 0,
        final: { minWeeks: 8, maxWeeks: 12 },
        breakdown: {
          baseline: { minWeeks: 8, maxWeeks: 12 },
          adjustments: [],
          rushCompression: 0,
          totalAdjustmentWeeks: 0,
        },
      },
      currency: "TWD",
    },
    ...overrides,
  };
}

describe("Proposal Repository", () => {
  beforeEach(() => {
    // Reset the repository before each test
    resetMockProposalRepository();
  });

  describe("create", () => {
    it("should create a proposal with generated ID", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput();

      const result = await repository.create(input);

      assert.ok(result.id, "Should have an ID");
      assert.strictEqual(result.clientName, input.clientName);
      assert.strictEqual(result.contactName, input.contactName);
      assert.strictEqual(result.industry, input.industry);
      assert.strictEqual(result.status, "draft");
      assert.ok(result.createdAt, "Should have createdAt timestamp");
      assert.ok(result.updatedAt, "Should have updatedAt timestamp");
      assert.ok(result.dueDate, "Should have dueDate");
    });

    it("should create a proposal with custom title", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput({
        title: "Custom Proposal Title",
      });

      const result = await repository.create(input);

      assert.strictEqual(result.title, "Custom Proposal Title");
    });

    it("should create a proposal with default title", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput();

      const result = await repository.create(input);

      assert.ok(result.title, "Should have a default title");
      assert.ok(result.title.includes("Proposal"), "Default title should include 'Proposal'");
    });

    it("should create a proposal with AI-generated content", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput({
        generatedContent: {
          executiveSummary: {
            overview: "Test overview",
            valueProposition: "Test value",
            recommendation: "Test recommendation",
          },
          projectUnderstanding: {
            businessContext: "Test context",
            objectives: ["Objective 1"],
            operationalNeeds: "Test requirements",
            constraints: ["Constraint 1"],
          },
          proposedApproach: {
            approachSummary: "Test approachSummary",
            workstreams: ["Material 1"],
            engagementModel: "Test palette",
            deliveryApproach: "Test lighting",
            capabilityEnablers: ["Furniture 1"],
          },
          scopeRecommendations: {
            overallStrategy: "Test strategy",
            areaRecommendations: [],
            circulationFlow: "Test flow",
            flexibilityConsiderations: "Test flexibility",
          },
          budgetNarrative: {
            overview: "Test budget overview",
            costBreakdown: ["Item 1"],
            valueEngineeringOptions: ["Option 1"],
            confidenceExplanation: "Test confidence",
          },
          timelineNarrative: {
            overview: "Test timeline overview",
            milestones: ["Milestone 1"],
            criticalPath: ["Critical item 1"],
            confidenceExplanation: "Test timeline confidence",
          },
          risksAndAssumptions: {
            risks: [],
            assumptions: [],
          },
          recommendedNextSteps: {
            immediate: ["Immediate 1"],
            shortTerm: ["Short term 1"],
            decisionPoints: ["Decision 1"],
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            modelUsed: "test-model",
            provider: "mock",
          },
        },
        generationMetadata: {
          provider: "mock",
          model: "test-model",
          generatedAt: new Date().toISOString(),
        },
      });

      const result = await repository.create(input);

      assert.ok(result.generatedContent, "Should have AI-generated content");
      assert.strictEqual(
        result.generatedContent?.executiveSummary.overview,
        "Test overview"
      );
      assert.ok(result.generationMetadata, "Should have generation metadata");
      assert.strictEqual(result.generationMetadata?.provider, "mock");
    });

    it("should create proposals with sequential IDs", async () => {
      const repository = createMockProposalRepository();
      const input1 = createTestProposalInput();
      const input2 = createTestProposalInput();

      const result1 = await repository.create(input1);
      const result2 = await repository.create(input2);

      assert.notStrictEqual(result1.id, result2.id, "IDs should be unique");
      assert.ok(result1.id.startsWith("ordx-"), "ID should start with 'ordx-'");
      assert.ok(result2.id.startsWith("ordx-"), "ID should start with 'ordx-'");
    });
  });

  describe("getById", () => {
    it("should return a proposal by ID", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput();
      const created = await repository.create(input);

      const result = await repository.getById(created.id);

      assert.ok(result, "Should find the proposal");
      assert.strictEqual(result?.id, created.id);
      assert.strictEqual(result?.clientName, created.clientName);
    });

    it("should return null for non-existent ID", async () => {
      const repository = createMockProposalRepository();

      const result = await repository.getById("non-existent-id");

      assert.strictEqual(result, null);
    });

    it("should return mock seeded proposals", async () => {
      const repository = createMockProposalRepository();

      const result = await repository.getById("ordx-1001");

      assert.ok(result, "Should find the seeded mock proposal");
      assert.strictEqual(result?.id, "ordx-1001");
    });
  });

  describe("getAll", () => {
    it("should return all proposals including seeded ones", async () => {
      const repository = createMockProposalRepository();

      const result = await repository.getAll();

      assert.ok(result.length > 0, "Should have proposals");
      assert.ok(
        result.some((p) => p.id === "ordx-1001"),
        "Should include seeded mock proposal"
      );
    });

    it("should return newly created proposals", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput();
      const created = await repository.create(input);

      const all = await repository.getAll();

      assert.ok(
        all.some((p) => p.id === created.id),
        "Should include newly created proposal"
      );
    });

    it("should return a copy of the store", async () => {
      const repository = createMockProposalRepository();
      const first = await repository.getAll();
      const second = await repository.getAll();

      assert.notStrictEqual(first, second, "Should return different array instances");
    });
  });

  describe("list", () => {
    it("should return proposals sorted by updatedAt descending by default", async () => {
      const repository = createMockProposalRepository();
      const input1 = createTestProposalInput({ clientName: "Client 1" });
      const input2 = createTestProposalInput({ clientName: "Client 2" });

      await repository.create(input1);
      await repository.create(input2);

      const result = await repository.list();

      assert.ok(result.length > 0, "Should have proposals");
      
      // Verify sorted by updatedAt descending
      for (let i = 1; i < result.length; i++) {
        assert.ok(
          result[i - 1].updatedAt >= result[i].updatedAt,
          `Proposal at index ${i - 1} should have updatedAt >= proposal at index ${i}`
        );
      }
    });

    it("should sort by createdAt ascending", async () => {
      const repository = createMockProposalRepository();
      const input1 = createTestProposalInput({ clientName: "Client 1" });
      const input2 = createTestProposalInput({ clientName: "Client 2" });

      await repository.create(input1);
      await repository.create(input2);

      const result = await repository.list({
        sort: { field: "createdAt", direction: "asc" },
      });

      assert.ok(result.length > 0, "Should have proposals");
      
      // Verify sorted by createdAt ascending
      for (let i = 1; i < result.length; i++) {
        assert.ok(
          result[i - 1].createdAt <= result[i].createdAt,
          `Proposal at index ${i - 1} should have createdAt <= proposal at index ${i}`
        );
      }
    });

    it("should sort by title alphabetically", async () => {
      const repository = createMockProposalRepository();
      const input1 = createTestProposalInput({ title: "Zebra Proposal", clientName: "Client 1" });
      const input2 = createTestProposalInput({ title: "Alpha Proposal", clientName: "Client 2" });

      await repository.create(input1);
      await repository.create(input2);

      const result = await repository.list({
        sort: { field: "title", direction: "asc" },
      });

      assert.ok(result.length > 0, "Should have proposals");
      
      // Find our created proposals
      const alphaProposal = result.find((p) => p.title === "Alpha Proposal");
      const zebraProposal = result.find((p) => p.title === "Zebra Proposal");
      
      assert.ok(alphaProposal, "Should find Alpha Proposal");
      assert.ok(zebraProposal, "Should find Zebra Proposal");
      
      // Alpha should come before Zebra
      const alphaIndex = result.indexOf(alphaProposal);
      const zebraIndex = result.indexOf(zebraProposal);
      assert.ok(
        alphaIndex < zebraIndex,
        "Alpha Proposal should come before Zebra Proposal"
      );
    });

    it("should filter by status", async () => {
      const repository = createMockProposalRepository();
      const input1 = createTestProposalInput({ clientName: "Client 1" });
      const input2 = createTestProposalInput({ clientName: "Client 2" });

      const created1 = await repository.create(input1);
      const created2 = await repository.create(input2);

      // Update one to review status
      await repository.update(created1.id, { status: "review" });

      const result = await repository.list({
        filter: { status: ["review"] },
      });

      assert.ok(result.length > 0, "Should have filtered proposals");
      assert.ok(
        result.every((p) => p.status === "review"),
        "All proposals should have review status"
      );
      assert.ok(
        result.some((p) => p.id === created1.id),
        "Should include the review proposal"
      );
      assert.ok(
        !result.some((p) => p.id === created2.id),
        "Should not include the draft proposal"
      );
    });

    it("should filter by multiple statuses", async () => {
      const repository = createMockProposalRepository();
      const input1 = createTestProposalInput({ clientName: "Client 1" });
      const input2 = createTestProposalInput({ clientName: "Client 2" });
      const input3 = createTestProposalInput({ clientName: "Client 3" });

      const created1 = await repository.create(input1);
      const created2 = await repository.create(input2);
      await repository.create(input3);

      // Update statuses
      await repository.update(created1.id, { status: "review" });
      await repository.update(created2.id, { status: "sent" });

      const result = await repository.list({
        filter: { status: ["review", "sent"] },
      });

      assert.ok(result.length >= 2, "Should have at least 2 filtered proposals");
      assert.ok(
        result.every((p) => p.status === "review" || p.status === "sent"),
        "All proposals should have review or sent status"
      );
    });

    it("should filter by client name (case insensitive)", async () => {
      const repository = createMockProposalRepository();
      const input1 = createTestProposalInput({ clientName: "Acme Corporation" });
      const input2 = createTestProposalInput({ clientName: "Beta Industries" });

      const created1 = await repository.create(input1);
      await repository.create(input2);

      const result = await repository.list({
        filter: { clientName: "acme" },
      });

      assert.ok(result.length > 0, "Should have filtered proposals");
      assert.ok(
        result.some((p) => p.id === created1.id),
        "Should include Acme Corporation"
      );
      assert.ok(
        result.every((p) => p.clientName.toLowerCase().includes("acme")),
        "All proposals should include 'acme' in client name"
      );
    });

    it("should apply both filter and sort", async () => {
      const repository = createMockProposalRepository();
      const input1 = createTestProposalInput({ clientName: "Acme Corp", title: "Zebra" });
      const input2 = createTestProposalInput({ clientName: "Acme Inc", title: "Alpha" });

      const created1 = await repository.create(input1);
      const created2 = await repository.create(input2);

      await repository.update(created1.id, { status: "review" });
      await repository.update(created2.id, { status: "review" });

      const result = await repository.list({
        filter: { status: ["review"] },
        sort: { field: "title", direction: "asc" },
      });

      assert.ok(result.length >= 2, "Should have filtered proposals");
      assert.ok(
        result.every((p) => p.status === "review"),
        "All proposals should have review status"
      );
      
      // Verify sorted by title
      for (let i = 1; i < result.length; i++) {
        assert.ok(
          result[i - 1].title <= result[i].title,
          `Proposal at index ${i - 1} should have title <= proposal at index ${i}`
        );
      }
    });

    it("should apply limit", async () => {
      const repository = createMockProposalRepository();

      const result = await repository.list({
        limit: 2,
      });

      assert.strictEqual(result.length, 2, "Should return exactly 2 proposals");
    });

    it("should apply offset", async () => {
      const repository = createMockProposalRepository();

      const firstPage = await repository.list({
        limit: 2,
        offset: 0,
      });

      const secondPage = await repository.list({
        limit: 2,
        offset: 2,
      });

      assert.ok(firstPage.length > 0, "First page should have proposals");
      assert.ok(secondPage.length > 0, "Second page should have proposals");
      
      // Verify different proposals
      const firstIds = new Set(firstPage.map((p) => p.id));
      const secondIds = new Set(secondPage.map((p) => p.id));
      
      const intersection = [...firstIds].filter((id) => secondIds.has(id));
      assert.strictEqual(intersection.length, 0, "Pages should not overlap");
    });

    it("should return all proposals when no options provided", async () => {
      const repository = createMockProposalRepository();

      const result = await repository.list();
      const all = await repository.getAll();

      assert.strictEqual(result.length, all.length, "Should return all proposals");
    });

    it("should return seeded proposals in list", async () => {
      const repository = createMockProposalRepository();

      const result = await repository.list();

      assert.ok(
        result.some((p) => p.id === "ordx-1001"),
        "Should include seeded mock proposal ordx-1001"
      );
      assert.ok(
        result.some((p) => p.id === "ordx-1002"),
        "Should include seeded mock proposal ordx-1002"
      );
    });
  });

  describe("update", () => {
    it("should update proposal fields", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput();
      const created = await repository.create(input);

      const updated = await repository.update(created.id, {
        title: "Updated Title",
        status: "review",
      });

      assert.ok(updated, "Should return updated proposal");
      assert.strictEqual(updated?.title, "Updated Title");
      assert.strictEqual(updated?.status, "review");
      assert.strictEqual(updated?.id, created.id);
    });

    it("should update estimation input and result", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput();
      const created = await repository.create(input);

      const newEstimationInput = createTestEstimationInput({
        scopeSize: 200,
      });

      const updated = await repository.update(created.id, {
        estimationInput: newEstimationInput,
      });

      assert.ok(updated, "Should return updated proposal");
      assert.strictEqual(
        updated?.estimationInput.scopeSize,
        200,
        "Should update estimation input"
      );
    });

    it("should update AI-generated content", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput();
      const created = await repository.create(input);

      const updated = await repository.update(created.id, {
        generatedContent: {
          executiveSummary: {
            overview: "Updated overview",
            valueProposition: "Updated value",
            recommendation: "Updated recommendation",
          },
          projectUnderstanding: {
            businessContext: "Updated context",
            objectives: ["Updated objective"],
            operationalNeeds: "Updated requirements",
            constraints: ["Updated constraint"],
          },
          proposedApproach: {
            approachSummary: "Updated approachSummary",
            workstreams: ["Updated material"],
            engagementModel: "Updated palette",
            deliveryApproach: "Updated lighting",
            capabilityEnablers: ["Updated furniture"],
          },
          scopeRecommendations: {
            overallStrategy: "Updated strategy",
            areaRecommendations: [],
            circulationFlow: "Updated flow",
            flexibilityConsiderations: "Updated flexibility",
          },
          budgetNarrative: {
            overview: "Updated budget overview",
            costBreakdown: ["Updated item"],
            valueEngineeringOptions: ["Updated option"],
            confidenceExplanation: "Updated confidence",
          },
          timelineNarrative: {
            overview: "Updated timeline overview",
            milestones: ["Updated milestone"],
            criticalPath: ["Updated critical item"],
            confidenceExplanation: "Updated timeline confidence",
          },
          risksAndAssumptions: {
            risks: [],
            assumptions: [],
          },
          recommendedNextSteps: {
            immediate: ["Updated immediate"],
            shortTerm: ["Updated short term"],
            decisionPoints: ["Updated decision"],
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            modelUsed: "updated-model",
            provider: "mock",
          },
        },
      });

      assert.ok(updated, "Should return updated proposal");
      assert.strictEqual(
        updated?.generatedContent?.executiveSummary.overview,
        "Updated overview"
      );
    });

    it("should return null for non-existent ID", async () => {
      const repository = createMockProposalRepository();

      const result = await repository.update("non-existent-id", {
        title: "New Title",
      });

      assert.strictEqual(result, null);
    });

    it("should update the updatedAt timestamp", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput();
      const created = await repository.create(input);

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await repository.update(created.id, {
        title: "Updated Title",
      });

      assert.ok(updated, "Should return updated proposal");
      assert.ok(
        updated?.updatedAt > created.updatedAt,
        "updatedAt should be after original createdAt"
      );
    });
  });

  describe("delete", () => {
    it("should delete a proposal", async () => {
      const repository = createMockProposalRepository();
      const input = createTestProposalInput();
      const created = await repository.create(input);

      const deleted = await repository.delete(created.id);

      assert.strictEqual(deleted, true, "Should return true on successful delete");

      const found = await repository.getById(created.id);
      assert.strictEqual(found, null, "Should not find deleted proposal");
    });

    it("should return false for non-existent ID", async () => {
      const repository = createMockProposalRepository();

      const deleted = await repository.delete("non-existent-id");

      assert.strictEqual(deleted, false);
    });

    it("should not affect other proposals", async () => {
      const repository = createMockProposalRepository();
      const input1 = createTestProposalInput({ clientName: "Client 1" });
      const input2 = createTestProposalInput({ clientName: "Client 2" });

      const created1 = await repository.create(input1);
      const created2 = await repository.create(input2);

      await repository.delete(created1.id);

      const found2 = await repository.getById(created2.id);
      assert.ok(found2, "Other proposals should remain");
      assert.strictEqual(found2?.clientName, "Client 2");
    });
  });

  describe("mock data seeding", () => {
    it("should seed with existing mock proposals on first creation", async () => {
      const repository = createMockProposalRepository();

      const all = await repository.getAll();

      assert.ok(all.length >= 4, "Should have at least 4 seeded proposals");
      assert.ok(
        all.some((p) => p.id === "ordx-1001"),
        "Should have ordx-1001"
      );
      assert.ok(
        all.some((p) => p.id === "ordx-1002"),
        "Should have ordx-1002"
      );
      assert.ok(
        all.some((p) => p.id === "ordx-1003"),
        "Should have ordx-1003"
      );
      assert.ok(
        all.some((p) => p.id === "ordx-1004"),
        "Should have ordx-1004"
      );
    });

    it("should maintain seeded data across repository instances", async () => {
      const repo1 = createMockProposalRepository();
      const repo2 = createMockProposalRepository();

      const all1 = await repo1.getAll();
      const all2 = await repo2.getAll();

      assert.strictEqual(
        all1.length,
        all2.length,
        "Both instances should have same number of proposals"
      );
    });
  });
});
