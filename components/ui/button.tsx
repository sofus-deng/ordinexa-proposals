import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

const buttonStyles = {
  primary:
    "bg-[var(--color-primary)] !text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-emphasis)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
  ghost: "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
};

const baseStyles =
  "inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-sm)] font-semibold transition-colors";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonStyles;
  children: ReactNode;
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(baseStyles, buttonStyles[variant], className)} {...props}>
      {children}
    </button>
  );
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: keyof typeof buttonStyles;
  children: ReactNode;
}

export function ButtonLink({ href, variant = "primary", className, children, ...props }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(baseStyles, buttonStyles[variant], className)} {...props}>
      {children}
    </Link>
  );
}
