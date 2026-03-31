import { AppShell } from "@/components/layout/app-shell";
import { PricingRuleCard } from "@/components/domain";
import { Button, Card, PageHeader, SectionBlock } from "@/components/ui";
import { activePricingRuleSet } from "@/data";

export default function PricingSettingsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Pricing settings"
          description="Editable-looking pricing controls that establish the commercial operating surface for future calculation and persistence layers."
          action={<Button type="button">Mock save changes</Button>}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-6">
            <SectionBlock
              title="Rule set overview"
              description="The active commercial baseline for Ordinexa Proposals. Persistence and audit history land in later steps."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Rule set</p>
                  <p className="mt-2 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{activePricingRuleSet.name}</p>
                </div>
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Status</p>
                  <p className="mt-2 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)] capitalize">{activePricingRuleSet.status}</p>
                </div>
                <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Currency</p>
                  <p className="mt-2 text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{activePricingRuleSet.currency}</p>
                </div>
              </div>
            </SectionBlock>

            <Card title="Project type baselines" eyebrow="Base pricing">
              <div className="space-y-4">
                {activePricingRuleSet.projectTypes.map((item) => (
                  <PricingRuleCard key={item.id} item={item} />
                ))}
              </div>
            </Card>

            <Card title="Style multipliers" eyebrow="Commercial posture">
              <div className="space-y-4">
                {activePricingRuleSet.styleMultipliers.map((item) => (
                  <PricingRuleCard key={item.id} item={item} />
                ))}
              </div>
            </Card>

            <Card title="Adjustments" eyebrow="Commercial modifiers">
              <div className="space-y-4">
                {activePricingRuleSet.adjustments.map((item) => (
                  <PricingRuleCard key={item.id} item={item} />
                ))}
              </div>
            </Card>
          </div>

          <Card title="Operator notes" eyebrow="Step 1 posture">
            <div className="space-y-4 text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
              <p>{activePricingRuleSet.notes}</p>
              <div className="rounded-[var(--radius-lg)] bg-[var(--color-secondary-soft)] p-4 text-[var(--color-secondary)]">
                Pricing sections are intentionally editable-looking to support realistic smoke coverage before save flows exist.
              </div>
              <ul className="space-y-2">
                <li>Schema and types are aligned for a future Prisma repository implementation.</li>
                <li>UI remains mock-backed in this step to avoid blocking on live PostgreSQL setup.</li>
                <li>Field structure is ready for future validation, versioning, and approval workflows.</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
