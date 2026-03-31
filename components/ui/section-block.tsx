import type { ReactNode } from "react";

interface SectionBlockProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionBlock({ title, description, children }: SectionBlockProps) {
  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="space-y-1">
        <h2 className="text-[var(--text-lg)] font-semibold text-[var(--color-text-primary)]">{title}</h2>
        {description ? <p className="text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
