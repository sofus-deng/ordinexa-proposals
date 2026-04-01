import type { ProposalStatus } from "@/types";

import { cn } from "@/lib/cn";
import { formatStatus } from "@/lib/format";

const statusStyles: Record<ProposalStatus, string> = {
  draft: "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
  review: "bg-[var(--color-primary-soft)] text-[var(--color-primary-emphasis)] border-[color:color-mix(in_srgb,var(--color-primary)_30%,white)]",
  sent: "bg-[color:color-mix(in_srgb,var(--color-secondary)_12%,white)] text-[var(--color-secondary)] border-[color:color-mix(in_srgb,var(--color-secondary)_28%,white)]",
  won: "bg-[color:color-mix(in_srgb,var(--color-success)_14%,white)] text-[var(--color-success)] border-[color:color-mix(in_srgb,var(--color-success)_28%,white)]",
  archived: "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)]",
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] border px-3 py-1 text-[var(--text-xs)] font-semibold tracking-[0.04em]",
        statusStyles[status],
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
