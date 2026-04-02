/**
 * Export View Model Builder (ORDX-024A)
 *
 * Provides functions to build a clean, presentation-ready export view model
 * from saved proposal records. This layer transforms the internal data structure
 * into a client-facing format suitable for print/PDF output.
 */

import type { ProposalRecord } from "@/types/proposal-record";
import type { ProposalExportViewModel, ExportMetadata, ExportEstimationSummary } from "@/types/proposal-export";
import { getIncludedOptionsList } from "@/lib/estimation";
import { formatStatus, formatProjectType, formatStyle } from "@/lib/format";

/**
 * Calculates confidence label based on estimate spread.
 * A narrower spread indicates higher confidence.
 */
function calculateConfidenceLabel(estimate: {
  budget: { final: { min: number; max: number } };
}): "Low" | "Medium" | "High" {
  const rangeSpread = (estimate.budget.final.max - estimate.budget.final.min) / estimate.budget.final.min;

  if (rangeSpread > 0.3) return "Low";
  if (rangeSpread > 0.15) return "Medium";
  return "High";
}

/**
 * Builds the export metadata from a proposal record.
 */
function buildExportMetadata(record: ProposalRecord): ExportMetadata {
  return {
    title: record.title,
    clientName: record.clientName,
    contactName: record.contactName,
    industry: record.industry,
    status: formatStatus(record.status),
    summary: record.summary,
    scope: record.scope,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    dueDate: record.dueDate,
    projectTypeName: formatProjectType(record.estimationResult.projectType.id),
    styleOptionName: formatStyle(record.estimationResult.styleOption.id),
    scopeSize: record.estimationInput.scopeSize,
    complexityLevel: record.estimationInput.complexityLevel,
    stakeholderCount: record.estimationInput.stakeholderCount,
    includeDiscoveryWorkshop: record.estimationInput.includeDiscoveryWorkshop,
    includeTrainingEnablement: record.estimationInput.includeTrainingEnablement,
    includeImplementationSupport: record.estimationInput.includeImplementationSupport,
    includeCustomDeliverables: record.estimationInput.includeCustomDeliverables,
    includeAutomationIntegration: record.estimationInput.includeAutomationIntegration,
    includeComplianceReview: record.estimationInput.includeComplianceReview,
    expeditedDelivery: record.estimationInput.expeditedDelivery,
  };
}

/**
 * Builds the export estimation summary from a proposal record.
 */
function buildExportEstimationSummary(record: ProposalRecord): ExportEstimationSummary {
  const includedOptions = getIncludedOptionsList({
      projectTypeId: record.estimationInput.projectTypeId,
      styleMultiplierId: record.estimationInput.styleMultiplierId,
      scopeSize: record.estimationInput.scopeSize,
      complexityLevel: record.estimationInput.complexityLevel,
      stakeholderCount: record.estimationInput.stakeholderCount,
      includeDiscoveryWorkshop: record.estimationInput.includeDiscoveryWorkshop,
      includeTrainingEnablement: record.estimationInput.includeTrainingEnablement,
      includeImplementationSupport: record.estimationInput.includeImplementationSupport,
      includeCustomDeliverables: record.estimationInput.includeCustomDeliverables,
      includeAutomationIntegration: record.estimationInput.includeAutomationIntegration,
      includeComplianceReview: record.estimationInput.includeComplianceReview,
      expeditedDelivery: record.estimationInput.expeditedDelivery,
    });

  return {
    currency: record.estimationResult.currency,
    budgetRange: {
      min: record.estimationResult.budget.final.min,
      max: record.estimationResult.budget.final.max,
    },
    timelineRange: {
      minWeeks: record.estimationResult.timeline.final.minWeeks,
      maxWeeks: record.estimationResult.timeline.final.maxWeeks,
    },
    confidenceLabel: calculateConfidenceLabel(record.estimationResult),
    includedOptions,
  };
}

/**
 * Builds a complete export view model from a proposal record.
 * This is the primary function for creating client-facing proposal exports.
 *
 * @param record - The saved proposal record to export
 * @returns A presentation-ready export view model
 */
export function buildExportViewModel(record: ProposalRecord): ProposalExportViewModel {
  return {
    id: record.id,
    metadata: buildExportMetadata(record),
    estimationSummary: buildExportEstimationSummary(record),
    generatedContent: record.generatedContent ?? null,
    hasGeneratedContent: record.generatedContent !== undefined,
  };
}
