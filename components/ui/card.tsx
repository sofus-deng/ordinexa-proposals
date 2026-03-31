import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface CardProps {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Card({ title, eyebrow, action, className, children }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {(title || eyebrow || action) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {eyebrow ? (
              <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]">{title}</h2> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
