import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { ButtonLink, Card, PageHeader, SectionBlock, StatusBadge } from "@/components/ui";
import { getProposalById } from "@/data";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = getProposalById(id);

  if (!proposal) {
    notFound();
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title={proposal.title}
          description="Believable interior proposal preview with estimate placeholders, structured scope, and pricing context ready for deeper implementation."
          action={<ButtonLink href="/proposals/new" variant="secondary">Duplicate into new draft</ButtonLink>}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
          <div className="space-y-6">
            <Card
              title="Executive proposal summary"
              eyebrow="Client-facing preview"
              action={<StatusBadge status={proposal.status} />}
            >
              <div className="space-y-5 text-[var(--text-sm)] leading-7 text-[var(--color-text-secondary)]">
                <p>
                  {proposal.clientName} is evaluating an interior project proposal that improves scope clarity,
                  pricing confidence, and readiness for future estimation outputs.
                </p>
                <p>
                  This Step 2A preview intentionally uses mock-backed values while establishing a modular foundation for
                  future estimation logic, persistence, and export flows.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Client</p>
                    <p className="mt-2 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{proposal.clientName}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Contact</p>
                    <p className="mt-2 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{proposal.contactName}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                    <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Due date</p>
                    <p className="mt-2 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{formatDate(proposal.dueDate)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <SectionBlock title="Scope priorities" description="Structured summary of fit-out scope themes for later generation and pricing automation.">
              <ul className="space-y-3 text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
                {proposal.scope.map((scopeItem) => (
                  <li key={scopeItem} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                    {scopeItem}
                  </li>
                ))}
              </ul>
            </SectionBlock>
          </div>

          <div className="space-y-6">
            <Card title="Estimate summary" eyebrow="Mocked values">
              <div className="space-y-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(proposal.estimate.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Adjustments</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(proposal.estimate.adjustmentTotal)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                  <span className="font-semibold text-[var(--color-text-primary)]">Estimated total</span>
                  <span className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
                    {formatCurrency(proposal.estimate.estimatedTotal)}
                  </span>
                </div>
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary-soft)] p-4 text-[var(--color-primary-emphasis)]">
                  Confidence: {proposal.estimate.confidenceLabel}
                </div>
              </div>
            </Card>

            <Card title="Internal notes" eyebrow="Readiness">
              <div className="space-y-3 text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
                <p>Created {formatDate(proposal.createdAt)}</p>
                <p>Last updated {formatDate(proposal.updatedAt)}</p>
                <p>Industry: {proposal.industry}</p>
                <p>Area: {proposal.areaPing} ping</p>
                <p>Meeting rooms: {proposal.meetingRoomCount}</p>
                <p>Project detail remains mocked today, but the screen is structured for future persistence and estimation engine outputs.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
