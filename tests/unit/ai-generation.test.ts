/**
 * Unit Tests for AI Generation Module (ORDX-018F)
 *
 * Tests cover:
 * - Prompt builder output shape
 * - Structured output validation/parsing
 * - Mock provider behavior
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildProposalPrompt,
  buildMinimalPrompt,
  extractProjectIdentifiers,
} from "@/lib/ai-generation/prompt-builder";
import {
  validateGeneratedContent,
  parseGeneratedContent,
  createFallbackContent,
} from "@/lib/ai-generation/schemas";
import { MockProvider, createMockProvider } from "@/lib/ai-generation/providers/mock-provider";
import {
  createProvider,
  createDefaultProvider,
  generateProposal,
  isProviderAvailable,
} from "@/lib/ai-generation/index";
import type { ProposalGenerationInput, GeneratedProposalContent } from "@/types/proposal-generation";

// Standard test input
const createTestInput = (
  overrides: Partial<ProposalGenerationInput> = {}
): ProposalGenerationInput => ({
  projectContext: {
    title: "TechCorp Transformation Program",
    clientName: "TechCorp Inc.",
    contactName: "Jane Smith",
    industry: "Technology",
    projectTypeName: "Strategic Initiative",
    styleOptionName: "Standard Delivery",
    scope: ["Cross-functional transformation engagement", "Enablement workstream", "Implementation coordination"],
  },
  estimationContext: {
    scopeSize: 100,
    complexityLevel: 3,
    stakeholderCount: 4,
    includedOptions: ["Discovery Workshop", "Training & Enablement", "Implementation Support"],
    budgetRange: {
      min: 5000000,
      max: 8000000,
      currency: "TWD",
    },
    timelineRange: {
      minWeeks: 12,
      maxWeeks: 16,
    },
    styleMultiplier: 1.2,
    isExpeditedDelivery: false,
  },
  serviceModules: {
    includeDiscoveryWorkshop: true,
    includeTrainingEnablement: true,
    includeImplementationSupport: true,
    includeCustomDeliverables: false,
    includeAutomationIntegration: false,
    includeComplianceReview: true,
  },
  ...overrides,
});

describe("Prompt Builder", () => {
  describe("buildProposalPrompt", () => {
    it("should return a prompt with system and user components", () => {
      const input = createTestInput();
      const prompt = buildProposalPrompt(input);

      assert.ok(prompt.systemPrompt, "Should have system prompt");
      assert.ok(prompt.userPrompt, "Should have user prompt");
      assert.ok(prompt.estimatedTokens > 0, "Should have token estimate");
    });

    it("should include domain expertise in system prompt", () => {
      const input = createTestInput();
      const prompt = buildProposalPrompt(input);

      assert.ok(
        prompt.systemPrompt.includes("cross-industry"),
        "Should include domain expertise"
      );
      assert.ok(
        prompt.systemPrompt.includes("stakeholder"),
        "Should include Taiwan context"
      );
    });

    it("should include JSON output format instructions", () => {
      const input = createTestInput();
      const prompt = buildProposalPrompt(input);

      assert.ok(
        prompt.systemPrompt.includes("JSON"),
        "Should specify JSON output"
      );
      assert.ok(
        prompt.systemPrompt.includes("executiveSummary"),
        "Should include output schema"
      );
    });

    it("should include project context in user prompt", () => {
      const input = createTestInput();
      const prompt = buildProposalPrompt(input);

      assert.ok(
        prompt.userPrompt.includes("TechCorp Inc."),
        "Should include client name"
      );
      assert.ok(
        prompt.userPrompt.includes("Technology"),
        "Should include industry"
      );
      assert.ok(
        prompt.userPrompt.includes("Strategic Initiative"),
        "Should include project type"
      );
    });

    it("should include estimation context in user prompt", () => {
      const input = createTestInput();
      const prompt = buildProposalPrompt(input);

      assert.ok(
        prompt.userPrompt.includes("100 scope units"),
        "Should include scope size"
      );
      assert.ok(
        prompt.userPrompt.includes("4"),
        "Should include stakeholder count"
      );
      // Currency format varies by locale (NT$, $, etc.) - check for numbers with commas
      assert.ok(
        /\$5,000,000/.test(prompt.userPrompt),
        "Should include budget minimum with commas"
      );
      assert.ok(
        /\$8,000,000/.test(prompt.userPrompt),
        "Should include budget maximum with commas"
      );
      assert.ok(
        prompt.userPrompt.includes("12") && prompt.userPrompt.includes("16"),
        "Should include timeline weeks"
      );
    });

    it("should include fit-out options in user prompt", () => {
      const input = createTestInput();
      const prompt = buildProposalPrompt(input);

      assert.ok(
        prompt.userPrompt.includes("Discovery workshop facilitation"),
        "Should include discovery workshop option"
      );
      assert.ok(
        prompt.userPrompt.includes("Training & Enablement"),
        "Should include pantry option"
      );
      assert.ok(
        prompt.userPrompt.includes("Implementation support"),
        "Should include glass partition option"
      );
    });

    it("should mark expedited deliverys in user prompt", () => {
      const input = createTestInput({
        estimationContext: {
          ...createTestInput().estimationContext,
          isExpeditedDelivery: true,
        },
      });
      const prompt = buildProposalPrompt(input);

      assert.ok(
        prompt.userPrompt.includes("expedited delivery"),
        "Should mark as expedited delivery"
      );
    });

    it("should include domain context when provided", () => {
      const input = createTestInput({
        domainContext: {
          deliveryPreferences: ["Sustainable materials", "Biophilic design"],
          referenceGuidelines: "Use company colors: blue and green",
          specialRequirements: ["LEED certification target"],
        },
      });
      const prompt = buildProposalPrompt(input);

      assert.ok(
        prompt.userPrompt.includes("Sustainable materials"),
        "Should include design preferences"
      );
      assert.ok(
        prompt.userPrompt.includes("blue and green"),
        "Should include brand guidelines"
      );
      assert.ok(
        prompt.userPrompt.includes("LEED certification"),
        "Should include special requirements"
      );
    });

    it("should format currency in Taiwan locale", () => {
      const input = createTestInput();
      const prompt = buildProposalPrompt(input);

      // Should format numbers with commas (locale-dependent format)
      assert.ok(
        /\d,\d{3}/.test(prompt.userPrompt),
        "Should format budget with thousand separators"
      );
      assert.ok(
        prompt.userPrompt.includes("5") && prompt.userPrompt.includes("8"),
        "Should include budget range values"
      );
    });

    it("should convert ping to square meters", () => {
      const input = createTestInput();
      const prompt = buildProposalPrompt(input);

      // 100 scope units * 3.3 = scope units
      assert.ok(
        prompt.userPrompt.includes("scope units"),
        "Should include square meter conversion"
      );
    });
  });

  describe("buildMinimalPrompt", () => {
    it("should return a shorter prompt for testing", () => {
      const input = createTestInput();
      const prompt = buildMinimalPrompt(input);

      assert.ok(prompt.systemPrompt.length > 0, "Should have system prompt");
      assert.ok(
        prompt.systemPrompt.length < buildProposalPrompt(input).systemPrompt.length,
        "Should be shorter than full prompt"
      );
    });
  });

  describe("extractProjectIdentifiers", () => {
    it("should extract key project information", () => {
      const input = createTestInput();
      const identifiers = extractProjectIdentifiers(input);

      assert.strictEqual(identifiers.clientName, "TechCorp Inc.");
      assert.strictEqual(identifiers.projectType, "Strategic Initiative");
      assert.strictEqual(identifiers.scopeSize, 100);
      assert.strictEqual(identifiers.budgetMin, 5000000);
      assert.strictEqual(identifiers.budgetMax, 8000000);
    });
  });
});

describe("Schema Validation", () => {
  describe("validateGeneratedContent", () => {
    it("should validate complete valid content", () => {
      const validContent: GeneratedProposalContent = {
        executiveSummary: {
          overview: "Test overview",
          valueProposition: "Test value",
          recommendation: "Test recommendation",
        },
        projectUnderstanding: {
          businessContext: "Test context",
          objectives: ["Objective 1", "Objective 2"],
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
          areaRecommendations: [
            {
              area: "Reception",
              recommendation: "Test recommendation",
              rationale: "Test rationale",
            },
          ],
          circulationFlow: "Test circulation",
          flexibilityConsiderations: "Test flexibility",
        },
        budgetNarrative: {
          overview: "Test overview",
          costBreakdown: ["Cost 1"],
          valueEngineeringOptions: ["Option 1"],
          confidenceExplanation: "Test explanation",
        },
        timelineNarrative: {
          overview: "Test overview",
          milestones: ["Milestone 1"],
          criticalPath: ["Path 1"],
          confidenceExplanation: "Test explanation",
        },
        risksAndAssumptions: {
          risks: [
            {
              description: "Risk 1",
              impact: "medium",
              mitigationOrValidation: "Mitigation 1",
            },
          ],
          assumptions: [
            {
              description: "Assumption 1",
              impact: "low",
              mitigationOrValidation: "Validation 1",
            },
          ],
        },
        recommendedNextSteps: {
          immediate: ["Step 1"],
          shortTerm: ["Step 2"],
          decisionPoints: ["Decision 1"],
        },
        metadata: {
          generatedAt: "2024-01-01T00:00:00Z",
          modelUsed: "test-model",
          provider: "test",
        },
      };

      const result = validateGeneratedContent(validContent);
      assert.strictEqual(result.valid, true, "Should be valid");
      assert.strictEqual(result.errors.length, 0, "Should have no errors");
    });

    it("should reject null input", () => {
      const result = validateGeneratedContent(null);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some((e) => e.path === "root"));
    });

    it("should reject missing required fields", () => {
      const result = validateGeneratedContent({});
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
    });

    it("should reject empty strings", () => {
      const content = {
        executiveSummary: {
          overview: "",
          valueProposition: "Test",
          recommendation: "Test",
        },
        // ... other required fields omitted for brevity
      };

      const result = validateGeneratedContent(content);
      assert.strictEqual(result.valid, false);
      assert.ok(
        result.errors.some(
          (e) => e.path === "executiveSummary.overview" && e.message.includes("non-empty")
        )
      );
    });

    it("should validate impact levels", () => {
      const content = {
        // ... minimal valid structure
        risksAndAssumptions: {
          risks: [
            {
              description: "Risk",
              impact: "invalid",
              mitigationOrValidation: "Mitigation",
            },
          ],
          assumptions: [],
        },
      };

      const result = validateGeneratedContent(content);
      assert.strictEqual(result.valid, false);
      assert.ok(
        result.errors.some((e) => e.path.includes("impact"))
      );
    });
  });

  describe("parseGeneratedContent", () => {
    it("should parse valid JSON string", () => {
      const validJson = JSON.stringify({
        executiveSummary: {
          overview: "Test",
          valueProposition: "Test",
          recommendation: "Test",
        },
        projectUnderstanding: {
          businessContext: "Test",
          objectives: ["Obj 1"],
          operationalNeeds: "Test",
          constraints: ["Con 1"],
        },
        proposedApproach: {
          approachSummary: "Test",
          workstreams: ["Mat 1"],
          engagementModel: "Test",
          deliveryApproach: "Test",
          capabilityEnablers: ["Furn 1"],
        },
        scopeRecommendations: {
          overallStrategy: "Test",
          areaRecommendations: [
            { area: "Test", recommendation: "Test", rationale: "Test" },
          ],
          circulationFlow: "Test",
          flexibilityConsiderations: "Test",
        },
        budgetNarrative: {
          overview: "Test",
          costBreakdown: ["Cost 1"],
          valueEngineeringOptions: ["Opt 1"],
          confidenceExplanation: "Test",
        },
        timelineNarrative: {
          overview: "Test",
          milestones: ["M 1"],
          criticalPath: ["C 1"],
          confidenceExplanation: "Test",
        },
        risksAndAssumptions: {
          risks: [
            { description: "R", impact: "low", mitigationOrValidation: "M" },
          ],
          assumptions: [
            { description: "A", impact: "low", mitigationOrValidation: "V" },
          ],
        },
        recommendedNextSteps: {
          immediate: ["I 1"],
          shortTerm: ["S 1"],
          decisionPoints: ["D 1"],
        },
      });

      const metadata = {
        generatedAt: "2024-01-01T00:00:00Z",
        modelUsed: "test",
        provider: "test",
      };

      const result = parseGeneratedContent(validJson, metadata);
      assert.strictEqual(result.validation.valid, true);
      assert.ok(result.content, "Should have content");
      assert.strictEqual(result.content?.metadata.provider, "test");
    });

    it("should reject invalid JSON", () => {
      const invalidJson = "not valid json";
      const metadata = {
        generatedAt: "2024-01-01T00:00:00Z",
        modelUsed: "test",
        provider: "test",
      };

      const result = parseGeneratedContent(invalidJson, metadata);
      assert.strictEqual(result.validation.valid, false);
      assert.strictEqual(result.content, null);
      assert.ok(
        result.validation.errors.some((e) => e.message.includes("Invalid JSON"))
      );
    });

    it("should include metadata in parsed content", () => {
      const validJson = JSON.stringify({
        executiveSummary: {
          overview: "Test",
          valueProposition: "Test",
          recommendation: "Test",
        },
        projectUnderstanding: {
          businessContext: "Test",
          objectives: ["Obj 1"],
          operationalNeeds: "Test",
          constraints: ["Con 1"],
        },
        proposedApproach: {
          approachSummary: "Test",
          workstreams: ["Mat 1"],
          engagementModel: "Test",
          deliveryApproach: "Test",
          capabilityEnablers: ["Furn 1"],
        },
        scopeRecommendations: {
          overallStrategy: "Test",
          areaRecommendations: [
            { area: "Test", recommendation: "Test", rationale: "Test" },
          ],
          circulationFlow: "Test",
          flexibilityConsiderations: "Test",
        },
        budgetNarrative: {
          overview: "Test",
          costBreakdown: ["Cost 1"],
          valueEngineeringOptions: ["Opt 1"],
          confidenceExplanation: "Test",
        },
        timelineNarrative: {
          overview: "Test",
          milestones: ["M 1"],
          criticalPath: ["C 1"],
          confidenceExplanation: "Test",
        },
        risksAndAssumptions: {
          risks: [
            { description: "R", impact: "low" as const, mitigationOrValidation: "M" },
          ],
          assumptions: [
            { description: "A", impact: "low" as const, mitigationOrValidation: "V" },
          ],
        },
        recommendedNextSteps: {
          immediate: ["I 1"],
          shortTerm: ["S 1"],
          decisionPoints: ["D 1"],
        },
      });
      const metadata = {
        generatedAt: "2024-01-01T00:00:00Z",
        modelUsed: "gemini-3.1-flash-lite-preview",
        provider: "gemini",
        tokenUsage: {
          promptTokens: 100,
          completionTokens: 200,
          totalTokens: 300,
        },
      };

      const result = parseGeneratedContent(validJson, metadata);
      assert.ok(result.content);
      assert.strictEqual(result.content.metadata.modelUsed, "gemini-3.1-flash-lite-preview");
      assert.strictEqual(result.content.metadata.tokenUsage?.totalTokens, 300);
    });
  });

  describe("createFallbackContent", () => {
    it("should create valid fallback content", () => {
      const metadata = {
        generatedAt: "2024-01-01T00:00:00Z",
        modelUsed: "test",
        provider: "test",
      };

      const fallback = createFallbackContent(metadata);
      const result = validateGeneratedContent(fallback);

      assert.strictEqual(result.valid, true, "Fallback should be valid");
      assert.ok(fallback.executiveSummary.overview.length > 0);
    });

    it("should include error indication in fallback", () => {
      const metadata = {
        generatedAt: "2024-01-01T00:00:00Z",
        modelUsed: "test",
        provider: "test",
      };

      const fallback = createFallbackContent(metadata);

      // Fallback should indicate generation failure
      assert.ok(
        fallback.executiveSummary.overview.toLowerCase().includes("unable") ||
        fallback.executiveSummary.overview.toLowerCase().includes("failed") ||
        fallback.executiveSummary.overview.toLowerCase().includes("regenerate")
      );
    });
  });
});

describe("Mock Provider", () => {
  describe("createMockProvider", () => {
    it("should create a mock provider instance", () => {
      const provider = createMockProvider();
      assert.strictEqual(provider.providerId, "mock");
    });

    it("should accept configuration", () => {
      const provider = createMockProvider({
        model: "custom-mock-v1",
        latencyMs: 100,
      });
      assert.strictEqual(provider.providerId, "mock");
    });
  });

  describe("isAvailable", () => {
    it("should always be available", async () => {
      const provider = new MockProvider();
      const available = await provider.isAvailable();
      assert.strictEqual(available, true);
    });
  });

  describe("generateProposalContent", () => {
    it("should generate valid proposal content", async () => {
      const provider = new MockProvider({ latencyMs: 0 });
      const input = createTestInput();
      const content = await provider.generateProposalContent(input);

      assert.ok(content.executiveSummary, "Should have executive summary");
      assert.ok(content.projectUnderstanding, "Should have project understanding");
      assert.ok(content.proposedApproach, "Should have design direction");
      assert.ok(content.metadata, "Should have metadata");
      assert.strictEqual(content.metadata.provider, "mock");
    });

    it("should include client-specific content", async () => {
      const provider = new MockProvider({ latencyMs: 0 });
      const input = createTestInput();
      const content = await provider.generateProposalContent(input);

      // Content should reference the client
      assert.ok(
        content.executiveSummary.overview.includes("TechCorp"),
        "Should include client name"
      );
    });

    it("should include industry-specific content", async () => {
      const provider = new MockProvider({ latencyMs: 0 });
      const input = createTestInput();
      const content = await provider.generateProposalContent(input);

      // Business context should reference the industry
      assert.ok(
        content.projectUnderstanding.businessContext.includes("Technology"),
        "Should include industry"
      );
    });

    it("should include scope size-specific content", async () => {
      const provider = new MockProvider({ latencyMs: 0 });
      const input = createTestInput();
      const content = await provider.generateProposalContent(input);

      // Content should reference the scope size
      assert.ok(
        content.scopeRecommendations.overallStrategy.includes("100"),
        "Should include scope size"
      );
    });

    it("should include budget information", async () => {
      const provider = new MockProvider({ latencyMs: 0 });
      const input = createTestInput();
      const content = await provider.generateProposalContent(input);

      // Budget narrative should reference the budget range (values divided by 1000 for K formatting)
      assert.ok(
        content.budgetNarrative.overview.includes("5,000") ||
        content.budgetNarrative.overview.includes("8,000") ||
        content.budgetNarrative.overview.includes("5000") ||
        content.budgetNarrative.overview.includes("8000"),
        "Should include budget figures"
      );
    });

    it("should include timeline information", async () => {
      const provider = new MockProvider({ latencyMs: 0 });
      const input = createTestInput();
      const content = await provider.generateProposalContent(input);

      // Timeline narrative should reference the weeks
      assert.ok(
        content.timelineNarrative.overview.includes("12") ||
        content.timelineNarrative.overview.includes("16"),
        "Should include timeline"
      );
    });

    it("should generate valid risks with proper impact levels", async () => {
      const provider = new MockProvider({ latencyMs: 0 });
      const input = createTestInput();
      const content = await provider.generateProposalContent(input);

      const validImpacts = ["low", "medium", "high"];
      for (const risk of content.risksAndAssumptions.risks) {
        assert.ok(
          validImpacts.includes(risk.impact),
          `Risk impact should be valid: ${risk.impact}`
        );
      }
      for (const assumption of content.risksAndAssumptions.assumptions) {
        assert.ok(
          validImpacts.includes(assumption.impact),
          `Assumption impact should be valid: ${assumption.impact}`
        );
      }
    });

    it("should validate against schema", async () => {
      const provider = new MockProvider({ latencyMs: 0 });
      const input = createTestInput();
      const content = await provider.generateProposalContent(input);

      const result = validateGeneratedContent(content);
      assert.strictEqual(result.valid, true, `Generated content should be valid: ${JSON.stringify(result.errors)}`);
    });

    it("should respect custom latency setting", async () => {
      const provider = new MockProvider({ latencyMs: 50 });
      const input = createTestInput();

      const start = Date.now();
      await provider.generateProposalContent(input);
      const elapsed = Date.now() - start;

      // Should have at least some delay (allowing for some variance)
      assert.ok(elapsed >= 40, `Should have delay, got ${elapsed}ms`);
    });
  });
});

describe("Module Integration", () => {
  describe("createProvider", () => {
    it("should create mock provider when specified", () => {
      const provider = createProvider({ provider: "mock" });
      assert.strictEqual(provider.providerId, "mock");
    });

    it("should create gemini provider when specified", () => {
      const provider = createProvider({ provider: "gemini" });
      assert.strictEqual(provider.providerId, "gemini");
    });

    it("should throw for unknown provider", () => {
      assert.throws(() => {
        createProvider({ provider: "unknown" as "mock" });
      }, /Unknown provider/);
    });
  });

  describe("createDefaultProvider", () => {
    it("should create mock provider when no API key", () => {
      // Ensure no API key is set
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const provider = createDefaultProvider();
      assert.strictEqual(provider.providerId, "mock");

      // Restore if was set
      if (originalKey) {
        process.env.GEMINI_API_KEY = originalKey;
      }
    });
  });

  describe("generateProposal", () => {
    it("should generate proposal using provider", async () => {
      const provider = createMockProvider({ latencyMs: 0 });
      const input = createTestInput();
      const content = await generateProposal(provider, input);

      assert.ok(content.executiveSummary);
      assert.strictEqual(content.metadata.provider, "mock");
    });
  });

  describe("isProviderAvailable", () => {
    it("should return true for mock provider", async () => {
      const provider = createMockProvider();
      const available = await isProviderAvailable(provider);
      assert.strictEqual(available, true);
    });
  });
});
