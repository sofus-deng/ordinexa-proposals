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
          description="Configure pricing rules and baselines for project estimation."
          action={<Button type="button">Save changes</Button>}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-6">
            <SectionBlock
              title="Rule set overview"
              description="Active pricing baseline for proposal estimation."
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

            <Card title="Project type baselines" eyebrow="Budget and timeline baselines">
              <div className="space-y-4">
                {activePricingRuleSet.projectTypes.map((item) => (
                  <PricingRuleCard key={item.id} item={item} />
                ))}
              </div>
            </Card>

            <Card title="Style options" eyebrow="Interior finish posture">
              <div className="space-y-4">
                {activePricingRuleSet.styleOptions.map((item) => (
                  <PricingRuleCard key={item.id} item={item} />
                ))}
              </div>
            </Card>

            <Card title="Adjustments" eyebrow="Budget and timeline modifiers">
              <div className="space-y-4">
                {activePricingRuleSet.adjustments.map((item) => (
                  <PricingRuleCard key={item.id} item={item} />
                ))}
              </div>
            </Card>
          </div>

          <Card title="Notes" eyebrow="Reference">
            <div className="space-y-4 text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
              <p>{activePricingRuleSet.notes}</p>
              <div className="rounded-[var(--radius-lg)] bg-[var(--color-secondary-soft)] p-4 text-[var(--color-secondary)]">
                Pricing rules establish the baseline for budget and timeline calculations in new proposals.
              </div>
              <ul className="space-y-2">
                <li>Project type baselines define default budget and timeline ranges.</li>
                <li>Style options adjust estimates based on finish level and complexity.</li>
                <li>Adjustments provide modifiers for project-specific factors.</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
