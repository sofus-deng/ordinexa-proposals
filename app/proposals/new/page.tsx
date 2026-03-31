import { AppShell } from "@/components/layout/app-shell";
import { activePricingRuleSet, projectTypes, styleMultipliers } from "@/data";
import {
  Button,
  Card,
  FieldWrapper,
  Input,
  PageHeader,
  SectionBlock,
  Select,
  Textarea,
} from "@/components/ui";

export default function NewProposalPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="New proposal"
          description="Capture a complete proposal brief with enough commercial context to support future estimation and AI-assisted proposal generation."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <Card title="Proposal intake form" eyebrow="Structured form">
            <form className="space-y-6">
              <SectionBlock title="Client context" description="Core commercial inputs used to anchor pricing, scope, and internal review.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldWrapper label="Proposal title">
                    <Input placeholder="e.g. APAC proposal workspace rollout" />
                  </FieldWrapper>
                  <FieldWrapper label="Client company">
                    <Input placeholder="Northstar Advisory Group" />
                  </FieldWrapper>
                  <FieldWrapper label="Primary contact">
                    <Input placeholder="Maya Chen" />
                  </FieldWrapper>
                  <FieldWrapper label="Industry">
                    <Input placeholder="Professional Services" />
                  </FieldWrapper>
                </div>
              </SectionBlock>

              <SectionBlock title="Commercial setup" description="Mocked inputs for Step 1, intentionally aligned to the future pricing engine.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldWrapper label="Project type">
                    <Select defaultValue={projectTypes[0]?.id}>
                      {projectTypes.map((projectType) => (
                        <option key={projectType.id} value={projectType.id}>
                          {projectType.name}
                        </option>
                      ))}
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper label="Commercial style">
                    <Select defaultValue={styleMultipliers[0]?.id}>
                      {styleMultipliers.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper label="Target delivery window">
                    <Input placeholder="6-8 weeks" />
                  </FieldWrapper>
                  <FieldWrapper label="Target budget range">
                    <Input placeholder="$30k - $55k" />
                  </FieldWrapper>
                </div>
              </SectionBlock>

              <SectionBlock title="Scope outline" description="Gather enough structured detail for later AI proposal generation without overbuilding Step 1.">
                <div className="grid gap-4">
                  <FieldWrapper label="Business objective">
                    <Textarea placeholder="Describe the outcome the proposal should achieve for the client." />
                  </FieldWrapper>
                  <FieldWrapper label="Requested deliverables">
                    <Textarea placeholder="List core deliverables, expected workstreams, or key modules." />
                  </FieldWrapper>
                  <FieldWrapper label="Known constraints or review considerations">
                    <Textarea placeholder="Add budget, legal, procurement, or stakeholder considerations." />
                  </FieldWrapper>
                </div>
              </SectionBlock>

              <div className="flex flex-wrap gap-3">
                <Button type="button">Mock generate proposal</Button>
                <Button type="button" variant="secondary">
                  Save draft shell
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Pricing baseline" eyebrow="Active rule set">
            <div className="space-y-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] p-4">
                <p className="text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">{activePricingRuleSet.name}</p>
                <p className="mt-1 leading-6">{activePricingRuleSet.notes}</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-[var(--color-text-primary)]">Current guidance</p>
                <ul className="space-y-2 leading-6">
                  <li>Use the form to lock down structure first; generation remains mocked in Step 1.</li>
                  <li>Commercial inputs already map to future Prisma-backed pricing records.</li>
                  <li>UI is intentionally editable-looking while persistence is deferred.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
