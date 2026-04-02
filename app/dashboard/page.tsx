import { AppShell } from "@/components/layout/app-shell";
import { ProposalListCard, StatChip } from "@/components/domain";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { createMockProposalRepository } from "@/lib/proposals";
import { formatCurrency } from "@/lib/format";

// Initialize repository instance
const proposalRepository = createMockProposalRepository();

async function getDashboardData() {
  // Fetch proposals from repository (sorted by updatedAt descending)
  const proposals = await proposalRepository.list({
    sort: { field: "updatedAt", direction: "desc" },
  });

  // Calculate pipeline metrics
  const totalPipeline = proposals.reduce((total, proposal) => {
    const budgetRange = proposal.estimationResult.budget.final;
    const estimatedTotal = (budgetRange.min + budgetRange.max) / 2;
    return total + estimatedTotal;
  }, 0);

  const inReviewCount = proposals.filter((proposal) => proposal.status === "review").length;
  const sentCount = proposals.filter((proposal) => proposal.status === "sent").length;

  return {
    proposals,
    totalPipeline,
    inReviewCount,
    sentCount,
  };
}

export default async function DashboardPage() {
  const { proposals, totalPipeline, inReviewCount, sentCount } = await getDashboardData();

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Track your proposals, review estimates, and create new project proposals."
          action={<ButtonLink href="/proposals/new">Create new proposal</ButtonLink>}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatChip label="Open proposals" value={`${proposals.length}`} tone="primary" />
          <StatChip label="In review" value={`${inReviewCount}`} />
          <StatChip label="Sent" value={`${sentCount}`} tone="secondary" />
          <StatChip label="Pipeline value" value={formatCurrency(totalPipeline, "TWD")} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
          <Card title="Active proposals" eyebrow="Proposal pipeline">
            <div className="space-y-4">
              {proposals.length === 0 ? (
                <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  No proposals yet. Create your first proposal to get started.
                </p>
              ) : (
                proposals.map((proposal) => (
                  <ProposalListCard key={proposal.id} proposal={proposal} />
                ))
              )}
            </div>
          </Card>

          <Card title="Getting started" eyebrow="Quick guide">
            <div className="space-y-5 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              <div className="rounded-[var(--radius-lg)] bg-[var(--color-primary-soft)] p-4 text-[var(--color-primary-emphasis)]">
                <p className="font-semibold">Create your first proposal</p>
                <p className="mt-1 leading-6">Start by entering project details to generate estimates and AI-powered proposal content.</p>
              </div>

              <div className="space-y-3">
                <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]">What you can do</p>
                <ul className="space-y-3 leading-6">
                  <li>Create new proposals with project specifications and scope details.</li>
                  <li>Review estimates for budget and timeline.</li>
                  <li>Export polished proposals for presentation.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
