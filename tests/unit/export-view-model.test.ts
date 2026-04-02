/**
 * Unit Tests for Export View Model (ORDX-024A)
 *
 * Tests the export view model builder function that transforms proposal records
 * into presentation-ready export view models.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildExportViewModel } from "@/lib/proposals/export-view-model";
import type { ProposalRecord } from "@/types/proposal-record";
import type { GeneratedProposalContent } from "@/types/proposal-generation";

describe("buildExportViewModel", () => {
  const mockGeneratedContent: GeneratedProposalContent = {
    executiveSummary: {
      overview: "Test overview",
      valueProposition: "Test value proposition",
      recommendation: "Test recommendation",
    },
    projectUnderstanding: {
      businessContext: "Test business context",
      objectives: ["Objective 1", "Objective 2"],
      operationalNeeds: "Test spatial requirements",
      constraints: ["Constraint 1", "Constraint 2"],
    },
    proposedApproach: {
      approachSummary: "Test approachSummary",
      workstreams: ["Material 1", "Material 2"],
      engagementModel: "Test color palette",
      deliveryApproach: "Test lighting approach",
      capabilityEnablers: ["Furniture 1", "Furniture 2"],
    },
    scopeRecommendations: {
      overallStrategy: "Test overall strategy",
      areaRecommendations: [
        {
          area: "Office Area",
          recommendation: "Test recommendation",
          rationale: "Test rationale",
        },
      ],
      circulationFlow: "Test circulation flow",
      flexibilityConsiderations: "Test flexibility considerations",
    },
    budgetNarrative: {
      overview: "Test budget overview",
      costBreakdown: ["Cost 1", "Cost 2"],
      valueEngineeringOptions: ["Option 1", "Option 2"],
      confidenceExplanation: "Test confidence explanation",
    },
    timelineNarrative: {
      overview: "Test timeline overview",
      milestones: ["Milestone 1", "Milestone 2"],
      criticalPath: ["Critical 1", "Critical 2"],
      confidenceExplanation: "Test timeline confidence explanation",
    },
    risksAndAssumptions: {
      risks: [
        {
          description: "Test risk",
          impact: "medium",
          mitigationOrValidation: "Test mitigation",
        },
      ],
      assumptions: [
        {
          description: "Test assumption",
          impact: "low",
          mitigationOrValidation: "Test validation",
        },
      ],
    },
    recommendedNextSteps: {
      immediate: ["Immediate 1", "Immediate 2"],
      shortTerm: ["Short-term 1", "Short-term 2"],
      decisionPoints: ["Decision 1", "Decision 2"],
    },
    metadata: {
      generatedAt: "2024-01-01T00:00:00Z",
      modelUsed: "test-model",
      provider: "test-provider",
      tokenUsage: {
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300,
      },
    },
  };

  const mockProposalRecord: ProposalRecord = {
    id: "test-proposal-1",
    title: "Test Proposal",
    clientName: "Test Client",
    contactName: "John Doe",
    industry: "Technology",
    status: "draft",
    summary: "Test summary",
    scope: ["Scope item 1", "Scope item 2"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    dueDate: "2024-01-15T00:00:00Z",
    estimationInput: {
      projectTypeId: "office-fit-out",
      styleMultiplierId: "modern-corporate",
      scopeSize: 100,
      complexityLevel: 3,
      stakeholderCount: 3,
      includeDiscoveryWorkshop: true,
      includeTrainingEnablement: true,
      includeImplementationSupport: false,
      includeCustomDeliverables: true,
      includeAutomationIntegration: false,
      includeComplianceReview: true,
      expeditedDelivery: false,
    },
    estimationResult: {
      projectType: {
        id: "office-fit-out",
        name: "Office Fit-Out",
      },
      styleOption: {
        id: "modern-corporate",
        name: "Modern Corporate",
        multiplier: 1.2,
      },
      input: {
        scopeSize: 100,
        complexityLevel: 3,
        stakeholderCount: 3,
        includedOptions: ["Reception Area", "Pantry", "Custom Storage", "MEP Work"],
      },
      budget: {
        baseline: { min: 100000, max: 120000 },
        areaImpact: 1.0,
        styleImpact: 1.2,
        adjustmentsImpact: { min: 20000, max: 25000 },
        final: { min: 140000, max: 169000 },
        breakdown: {
          baseline: { min: 100000, max: 120000 },
          areaFactor: 1.0,
          styleMultiplier: 1.2,
          adjustments: [
            {
              id: "reception",
              name: "Reception Area",
              impactType: "percentage",
              impactValue: 0.1,
              budgetImpact: { min: 10000, max: 12000 },
            },
          ],
          totalAdjustmentImpact: { min: 20000, max: 25000 },
        },
      },
      timeline: {
        baseline: { minWeeks: 8, maxWeeks: 10 },
        adjustmentsWeeks: 2,
        rushCompression: 0,
        final: { minWeeks: 10, maxWeeks: 12 },
        breakdown: {
          baseline: { minWeeks: 8, maxWeeks: 10 },
          adjustments: [
            {
              id: "reception",
              name: "Reception Area",
              weeksAdded: 1,
            },
          ],
          rushCompression: 0,
          totalAdjustmentWeeks: 2,
        },
      },
      currency: "USD",
    },
    generatedContent: mockGeneratedContent,
    generationMetadata: {
      provider: "test-provider",
      model: "test-model",
      generatedAt: "2024-01-01T00:00:00Z",
    },
  };

  it("should build export view model from proposal record", () => {
    const viewModel = buildExportViewModel(mockProposalRecord);

    assert.ok(viewModel);
    assert.equal(viewModel.id, "test-proposal-1");
  });

  it("should correctly map metadata from proposal record", () => {
    const viewModel = buildExportViewModel(mockProposalRecord);

    assert.equal(viewModel.metadata.title, "Test Proposal");
    assert.equal(viewModel.metadata.clientName, "Test Client");
    assert.equal(viewModel.metadata.contactName, "John Doe");
    assert.equal(viewModel.metadata.industry, "Technology");
    assert.equal(viewModel.metadata.status, "Draft");
    assert.equal(viewModel.metadata.summary, "Test summary");
    assert.deepEqual(viewModel.metadata.scope, ["Scope item 1", "Scope item 2"]);
    assert.equal(viewModel.metadata.createdAt, "2024-01-01T00:00:00Z");
    assert.equal(viewModel.metadata.updatedAt, "2024-01-02T00:00:00Z");
    assert.equal(viewModel.metadata.dueDate, "2024-01-15T00:00:00Z");
    assert.equal(viewModel.metadata.projectTypeName, "office-fit-out");
    assert.equal(viewModel.metadata.styleOptionName, "modern-corporate");
    assert.equal(viewModel.metadata.scopeSize, 100);
    assert.equal(viewModel.metadata.stakeholderCount, 3);
    assert.equal(viewModel.metadata.includeDiscoveryWorkshop, true);
    assert.equal(viewModel.metadata.includeTrainingEnablement, true);
    assert.equal(viewModel.metadata.includeImplementationSupport, false);
    assert.equal(viewModel.metadata.includeCustomDeliverables, true);
    assert.equal(viewModel.metadata.includeAutomationIntegration, false);
    assert.equal(viewModel.metadata.includeComplianceReview, true);
    assert.equal(viewModel.metadata.expeditedDelivery, false);
  });

  it("should correctly map estimation summary from proposal record", () => {
    const viewModel = buildExportViewModel(mockProposalRecord);

    assert.equal(viewModel.estimationSummary.currency, "USD");
    assert.equal(viewModel.estimationSummary.budgetRange.min, 140000);
    assert.equal(viewModel.estimationSummary.budgetRange.max, 169000);
    assert.equal(viewModel.estimationSummary.timelineRange.minWeeks, 10);
    assert.equal(viewModel.estimationSummary.timelineRange.maxWeeks, 12);
    assert.equal(viewModel.estimationSummary.confidenceLabel, "Medium"); // ~20% spread
    assert.deepEqual(viewModel.estimationSummary.includedOptions, [
      "Discovery Workshop",
      "Training & Enablement",
      "Custom Deliverables",
      "Compliance Review",
    ]);
  });

  it("should correctly map generated content from proposal record", () => {
    const viewModel = buildExportViewModel(mockProposalRecord);

    assert.ok(viewModel.generatedContent);
    assert.deepEqual(viewModel.generatedContent, mockGeneratedContent);
    assert.equal(viewModel.hasGeneratedContent, true);
  });

  it("should handle proposal without generated content", () => {
    const proposalWithoutContent = {
      ...mockProposalRecord,
      generatedContent: undefined,
    };

    const viewModel = buildExportViewModel(proposalWithoutContent);

    assert.equal(viewModel.generatedContent, null);
    assert.equal(viewModel.hasGeneratedContent, false);
  });

  it("should calculate confidence label correctly for high confidence", () => {
    const highConfidenceProposal = {
      ...mockProposalRecord,
      estimationResult: {
        ...mockProposalRecord.estimationResult,
        budget: {
          ...mockProposalRecord.estimationResult.budget,
          final: { min: 140000, max: 150000 }, // ~7% spread
        },
      },
    };

    const viewModel = buildExportViewModel(highConfidenceProposal);

    assert.equal(viewModel.estimationSummary.confidenceLabel, "High");
  });

  it("should calculate confidence label correctly for low confidence", () => {
    const lowConfidenceProposal = {
      ...mockProposalRecord,
      estimationResult: {
        ...mockProposalRecord.estimationResult,
        budget: {
          ...mockProposalRecord.estimationResult.budget,
          final: { min: 140000, max: 190000 }, // ~36% spread
        },
      },
    };

    const viewModel = buildExportViewModel(lowConfidenceProposal);

    assert.equal(viewModel.estimationSummary.confidenceLabel, "Low");
  });
});
