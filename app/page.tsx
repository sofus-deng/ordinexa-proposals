import { ButtonLink, Card } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col items-center justify-center px-6 py-16">
        {/* Hero Section */}
        <div className="mb-12 max-w-2xl text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-lg font-semibold text-white shadow-[var(--shadow-sm)]">
            OR
          </div>
          <h1 className="mb-4 text-[var(--text-4xl)] font-semibold text-[var(--color-text-primary)]">
            Ordinexa Proposals
          </h1>
          <p className="text-[var(--text-lg)] leading-relaxed text-[var(--color-text-secondary)]">
            Proposal operations platform with AI-powered estimation and polished deliverables.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="/dashboard" variant="primary">
            Open workspace
          </ButtonLink>
          <ButtonLink href="/proposals/ordx-1001" variant="secondary">
            View sample proposal
          </ButtonLink>
          <ButtonLink href="/proposals/ordx-1001/export" variant="secondary">
            Export preview
          </ButtonLink>
        </div>

        {/* What You Can Try Section */}
        <Card className="max-w-2xl">
          <h2 className="mb-4 text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
            What you can try
          </h2>
          <ul className="space-y-3 text-[var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--text-xs)] font-semibold text-[var(--color-primary-emphasis)]">
                1
              </span>
              <span>
                <strong className="text-[var(--color-text-primary)]">Explore the workspace</strong> — Navigate proposals, review estimates, and track pipeline metrics.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--text-xs)] font-semibold text-[var(--color-primary-emphasis)]">
                2
              </span>
              <span>
                <strong className="text-[var(--color-text-primary)]">View a sample proposal</strong> — See a complete proposal with budget, timeline, and project details.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--text-xs)] font-semibold text-[var(--color-primary-emphasis)]">
                3
              </span>
              <span>
                <strong className="text-[var(--color-text-primary)]">Preview the export view</strong> — Experience the print-ready client presentation format.
              </span>
            </li>
          </ul>
        </Card>

        {/* Footer Note */}
        <p className="mt-12 text-center text-[var(--text-xs)] text-[var(--color-text-muted)]">
          Proposal workspace • Powered by Ordinexa
        </p>
      </div>
    </div>
  );
}
