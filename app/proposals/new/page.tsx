import { AppShell } from "@/components/layout/app-shell";
import { activePricingRuleSet, projectTypes, styleOptions } from "@/data";
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
          description="Capture an interior project brief with enough commercial context to support future estimation and proposal generation."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <Card title="Proposal intake form" eyebrow="Interior brief">
            <form className="space-y-6">
              <SectionBlock title="Client context" description="Core project inputs used to anchor pricing, scope, and internal review.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldWrapper label="Proposal title">
                    <Input placeholder="e.g. Regional HQ office fit-out" />
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

              <SectionBlock title="Project setup" description="Mocked inputs for Step 2A, intentionally aligned to the future estimation engine.">
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
                  <FieldWrapper label="Interior style">
                    <Select defaultValue={styleOptions[0]?.id}>
                      {styleOptions.map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </Select>
                  </FieldWrapper>
                  <FieldWrapper label="Target timeline window">
                    <Input placeholder="8-12 weeks" />
                  </FieldWrapper>
                  <FieldWrapper label="Target budget range">
                    <Input placeholder="$80k - $150k" />
                  </FieldWrapper>
                </div>
              </SectionBlock>

              <SectionBlock title="Scope outline" description="Gather enough structured detail for later proposal generation without overbuilding this step.">
                <div className="grid gap-4">
                  <FieldWrapper label="Project objective">
                    <Textarea placeholder="Describe the interior outcome the project should achieve for the client." />
                  </FieldWrapper>
                  <FieldWrapper label="Requested works">
                    <Textarea placeholder="List key fit-out works, room types, and required deliverables." />
                  </FieldWrapper>
                  <FieldWrapper label="Known constraints or site considerations">
                    <Textarea placeholder="Add budget, access, landlord, authority, or stakeholder considerations." />
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
                  <li>Use the form to lock down project structure first; generation remains mocked in this step.</li>
                  <li>Interior pricing inputs already map to future Prisma-backed pricing records.</li>
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
