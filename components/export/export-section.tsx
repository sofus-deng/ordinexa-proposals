/**
 * Export Section Component (ORDX-024B)
 *
 * A reusable section container for export layouts.
 * Designed for clean, print-friendly output with consistent spacing.
 */

import { type ReactNode } from "react";

interface ExportSectionProps {
  /** Section title */
  title: string;

  /** Optional subtitle or description */
  subtitle?: string;

  /** Section content */
  children: ReactNode;
}

export function ExportSection({ title, subtitle, children }: ExportSectionProps) {
  return (
    <section className="mb-10 break-inside-avoid">
      <div className="mb-4 border-b-2 border-[var(--color-primary)] pb-2">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
        )}
      </div>
      <div className="text-sm leading-6 text-[var(--color-text-secondary)]">
        {children}
      </div>
    </section>
  );
}
