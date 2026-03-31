import type { ReactNode } from "react";

interface FieldWrapperProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function FieldWrapper({ label, hint, children }: FieldWrapperProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]">{label}</span>
      {children}
      {hint ? <span className="text-[var(--text-xs)] leading-5 text-[var(--color-text-muted)]">{hint}</span> : null}
    </label>
  );
}
