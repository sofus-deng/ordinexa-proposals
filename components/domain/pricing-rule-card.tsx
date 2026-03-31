import type { PricingAdjustment, PricingProjectType, PricingStyleMultiplier } from "@/types";

import { formatCurrency } from "@/lib/format";

type Item = PricingProjectType | PricingStyleMultiplier | PricingAdjustment;

function getValue(item: Item) {
  if ("baseRate" in item) {
    return formatCurrency(item.baseRate);
  }

  if ("multiplier" in item) {
    return `${item.multiplier.toFixed(2)}x`;
  }

  return item.type === "flat" ? formatCurrency(item.value) : `${item.value}%`;
}

export function PricingRuleCard({ item }: { item: Item }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{item.name}</h3>
          <p className="text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">{item.description}</p>
        </div>
        <span className="rounded-[var(--radius-full)] bg-[var(--color-surface-muted)] px-3 py-1 text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)]">
          {getValue(item)}
        </span>
      </div>
    </div>
  );
}
