import Link from "next/link";

import type { Proposal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui";

export function ProposalListCard({ proposal }: { proposal: Proposal }) {
  return (
    <Link
      href={`/proposals/${proposal.id}`}
      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)] lg:grid-cols-[minmax(0,1fr)_180px_140px]"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-[var(--text-lg)] font-semibold text-[var(--color-text-primary)]">{proposal.title}</h3>
          <StatusBadge status={proposal.status} />
        </div>
        <p className="text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">{proposal.summary}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
          <span>{proposal.clientName}</span>
          <span>{proposal.industry}</span>
          <span>Due {formatDate(proposal.dueDate)}</span>
        </div>
      </div>

      <div className="space-y-2 text-[var(--text-sm)]">
        <p className="text-[var(--color-text-muted)]">Estimate</p>
        <p className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
          {formatCurrency(proposal.estimate.estimatedTotal)}
        </p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          Confidence {proposal.estimate.confidenceLabel}
        </p>
      </div>

      <div className="space-y-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        <p>Updated {formatDate(proposal.updatedAt)}</p>
        <p>Owner {proposal.contactName}</p>
      </div>
    </Link>
  );
}
