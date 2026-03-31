import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
          Ordinexa Proposals
        </p>
        <h1 className="text-[var(--text-3xl)] font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">{title}</h1>
        <p className="max-w-3xl text-[var(--text-base)] leading-7 text-[var(--color-text-secondary)]">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
