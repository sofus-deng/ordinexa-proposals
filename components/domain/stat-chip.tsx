interface StatChipProps {
  label: string;
  value: string;
  tone?: "primary" | "neutral" | "secondary";
}

const toneClasses = {
  primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary-emphasis)]",
  neutral: "bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)]",
  secondary: "bg-[var(--color-secondary-soft)] text-[var(--color-secondary)]",
};

export function StatChip({ label, value, tone = "neutral" }: StatChipProps) {
  return (
    <div className={`rounded-[var(--radius-lg)] px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.12em] opacity-75">{label}</p>
      <p className="mt-1 text-[var(--text-lg)] font-semibold">{value}</p>
    </div>
  );
}
