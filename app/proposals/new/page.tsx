"use client";

import { useCallback, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Button,
  Card,
  FieldWrapper,
  Input,
  PageHeader,
  SectionBlock,
  Select,
} from "@/components/ui";
import { projectTypes, styleOptions, activePricingRuleSet } from "@/data";
import {
  calculateEstimate,
  createMockPricingRepository,
  validateEstimationInput,
} from "@/lib/estimation";
import type { EstimationInput, EstimateSummary } from "@/lib/estimation";

/**
 * Default form state for estimation inputs
 */
const defaultFormData: EstimationInput = {
  projectTypeId: "office-fit-out",
  styleMultiplierId: "modern-corporate",
  areaPing: 100,
  meetingRoomCount: 3,
  includeReceptionArea: false,
  includePantry: false,
  includeGlassPartitions: false,
  includeCustomStorage: false,
  includeSmartOfficeSetup: false,
  includeMEPWork: false,
  rushProject: false,
};

/**
 * Formats a budget range for display
 */
function formatBudgetRange(min: number, max: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

/**
 * Formats a timeline range for display
 */
function formatTimelineRange(minWeeks: number, maxWeeks: number): string {
  return `${minWeeks} - ${maxWeeks} weeks`;
}

/**
 * Formats a percentage impact for display
 */
function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(0)}%`;
}

export default function NewProposalPage() {
  const [formData, setFormData] = useState<EstimationInput>(defaultFormData);
  const [estimate, setEstimate] = useState<EstimateSummary | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const repository = useMemo(() => createMockPricingRepository(), []);

  const updateField = useCallback(<K extends keyof EstimationInput>(
    field: K,
    value: EstimationInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  }, []);

  const toggleBoolean = useCallback((field: keyof EstimationInput) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
    setValidationErrors([]);
  }, []);

  const handleCalculateEstimate = useCallback(async () => {
    const errors = validateEstimationInput(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsCalculating(true);
    setValidationErrors([]);

    try {
      const result = await calculateEstimate(repository, formData);
      setEstimate(result);
    } catch (error) {
      console.error("Estimation failed:", error);
      setValidationErrors(["Failed to calculate estimate. Please try again."]);
    } finally {
      setIsCalculating(false);
    }
  }, [formData, repository]);

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="New proposal"
          description="Configure the interior fit-out parameters to generate a deterministic budget and timeline estimate."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_400px]">
          <Card title="Estimation inputs" eyebrow="Interior fit-out">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCalculateEstimate(); }}>
              <SectionBlock title="Project parameters" description="Core inputs that define the baseline budget and timeline.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldWrapper label="Project type" required>
                    <Select
                      value={formData.projectTypeId}
                      onChange={(e) => updateField("projectTypeId", e.target.value)}
                    >
                      {projectTypes.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.name}
                        </option>
                      ))}
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper label="Interior style" required>
                    <Select
                      value={formData.styleMultiplierId}
                      onChange={(e) => updateField("styleMultiplierId", e.target.value)}
                    >
                      {styleOptions.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper label="Area (ping)" required>
                    <Input
                      type="number"
                      min={1}
                      max={10000}
                      value={formData.areaPing}
                      onChange={(e) => updateField("areaPing", Number(e.target.value))}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Meeting rooms" required>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={formData.meetingRoomCount}
                      onChange={(e) => updateField("meetingRoomCount", Number(e.target.value))}
                    />
                  </FieldWrapper>
                </div>
              </SectionBlock>

              <SectionBlock title="Scope options" description="Additional features and scope items that adjust the baseline estimate.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "includeReceptionArea" as const, label: "Reception area", desc: "Front-of-house welcome zone" },
                    { key: "includePantry" as const, label: "Pantry facilities", desc: "Break room and kitchenette" },
                    { key: "includeGlassPartitions" as const, label: "Glass partitions", desc: "Glazed room dividers" },
                    { key: "includeCustomStorage" as const, label: "Custom storage", desc: "Built-in cabinetry" },
                    { key: "includeSmartOfficeSetup" as const, label: "Smart office", desc: "IoT and automation systems" },
                    { key: "includeMEPWork" as const, label: "MEP work", desc: "Mechanical, electrical, plumbing" },
                  ].map(({ key, label, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleBoolean(key)}
                      className={`flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-all ${
                        formData[key]
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)]"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border ${
                          formData[key]
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {formData[key] && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]">{label}</p>
                        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock title="Timeline constraints" description="Project delivery requirements that may impact pricing.">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleBoolean("rushProject")}
                    className={`flex items-center gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-all ${
                      formData.rushProject
                        ? "border-amber-500 bg-amber-50"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)]"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border ${
                        formData.rushProject
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-[var(--color-border)]"
                      }`}
                    >
                      {formData.rushProject && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]">Rush project</p>
                      <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">Compressed timeline with premium pricing</p>
                    </div>
                  </button>
                </div>
              </SectionBlock>

              {validationErrors.length > 0 && (
                <div className="rounded-[var(--radius-lg)] bg-red-50 border border-red-200 p-4">
                  <p className="text-[var(--text-sm)] font-medium text-red-800">Please fix the following issues:</p>
                  <ul className="mt-2 list-inside list-disc text-[var(--text-sm)] text-red-700">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isCalculating}>
                  {isCalculating ? "Calculating..." : "Generate estimate"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setFormData(defaultFormData);
                    setEstimate(null);
                    setValidationErrors([]);
                  }}
                >
                  Reset form
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-6">
            <Card title="Estimate result" eyebrow="Calculated">
              {estimate ? (
                <div className="space-y-6">
                  {/* Primary metrics */}
                  <div className="space-y-4">
                    <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                      <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Estimated budget
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {formatBudgetRange(
                          estimate.budget.final.min,
                          estimate.budget.final.max,
                          estimate.currency
                        )}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                      <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Estimated timeline
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">
                        {formatTimelineRange(
                          estimate.timeline.final.minWeeks,
                          estimate.timeline.final.maxWeeks
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Project configuration summary */}
                  <div className="space-y-2">
                    <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Configuration
                    </p>
                    <div className="space-y-1 text-[var(--text-sm)]">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Project type</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{estimate.projectType.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Style</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{estimate.styleOption.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Area</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{estimate.input.areaPing} ping</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Meeting rooms</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{estimate.input.meetingRoomCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget breakdown */}
                  <div className="space-y-2">
                    <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Budget breakdown
                    </p>
                    <div className="space-y-1 text-[var(--text-sm)]">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Baseline</span>
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {formatBudgetRange(
                            estimate.budget.baseline.min,
                            estimate.budget.baseline.max,
                            estimate.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Area impact</span>
                        <span className={`font-medium ${estimate.budget.areaImpact >= 0 ? "text-amber-600" : "text-green-600"}`}>
                          {formatPercentage(estimate.budget.areaImpact)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Style impact</span>
                        <span className={`font-medium ${estimate.budget.styleImpact >= 0 ? "text-amber-600" : "text-green-600"}`}>
                          {formatPercentage(estimate.budget.styleImpact)}
                        </span>
                      </div>
                      {estimate.budget.adjustmentsImpact.min !== 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-secondary)]">Options impact</span>
                          <span className={`font-medium ${estimate.budget.adjustmentsImpact.min >= 0 ? "text-amber-600" : "text-green-600"}`}>
                            {formatBudgetRange(
                              estimate.budget.adjustmentsImpact.min,
                              estimate.budget.adjustmentsImpact.max,
                              estimate.currency
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline breakdown */}
                  <div className="space-y-2">
                    <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Timeline breakdown
                    </p>
                    <div className="space-y-1 text-[var(--text-sm)]">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Baseline</span>
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {formatTimelineRange(
                            estimate.timeline.baseline.minWeeks,
                            estimate.timeline.baseline.maxWeeks
                          )}
                        </span>
                      </div>
                      {estimate.timeline.adjustmentsWeeks > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-secondary)]">Options added</span>
                          <span className="font-medium text-amber-600">
                            +{estimate.timeline.adjustmentsWeeks} weeks
                          </span>
                        </div>
                      )}
                      {estimate.timeline.rushCompression > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-secondary)]">Rush compression</span>
                          <span className="font-medium text-green-600">
                            -{Math.round(estimate.timeline.rushCompression * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected options */}
                  {estimate.input.includedOptions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[var(--text-xs)] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Selected options
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {estimate.input.includedOptions.map((option) => (
                          <span
                            key={option}
                            className="inline-flex items-center rounded-full bg-[var(--color-accent-subtle)] px-3 py-1 text-[var(--text-xs)] font-medium text-[var(--color-accent)]"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[var(--color-text-primary)]">No estimate generated yet</p>
                    <p className="mt-1">Configure the project parameters and click Generate estimate to see results.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-[var(--color-text-primary)]">How it works</p>
                    <ul className="space-y-2 leading-6">
                      <li>Select project type and style to set the baseline.</li>
                      <li>Enter area and meeting room count for scope sizing.</li>
                      <li>Toggle scope options to adjust the estimate.</li>
                      <li>Mark as rush for compressed timeline pricing.</li>
                    </ul>
                  </div>
                </div>
              )}
            </Card>

            <Card title="Pricing baseline" eyebrow="Active rule set">
              <div className="space-y-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">
                    {activePricingRuleSet.name}
                  </p>
                  <p className="mt-1 leading-6">{activePricingRuleSet.notes}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-[var(--color-text-primary)]">Estimation engine</p>
                  <ul className="space-y-2 leading-6">
                    <li>All calculations are deterministic and repeatable.</li>
                    <li>Budget and timeline derive from the active pricing rule set.</li>
                    <li>Style multipliers adjust finish level pricing.</li>
                    <li>Scope options add percentage or flat adjustments.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
