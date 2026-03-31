import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-primary)_18%,white)]",
        props.className,
      )}
    />
  );
}
