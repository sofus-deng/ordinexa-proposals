"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", short: "DB" },
  { href: "/proposals/new", label: "New Proposal", short: "NP" },
  { href: "/settings/pricing", label: "Pricing Settings", short: "PS" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 lg:flex lg:flex-col">
          <div className="mb-8 space-y-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-sm font-semibold text-white shadow-[var(--shadow-sm)]">
              OR
            </div>
            <div>
              <p className="text-[var(--text-lg)] font-semibold text-[var(--color-text-primary)]">Ordinexa</p>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">Proposals workspace</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-[var(--text-sm)] font-medium transition-colors",
                    active
                      ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-emphasis)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]",
                  )}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-subtle)] text-[var(--text-xs)] font-semibold">
                    {item.short}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]">Workspace overview</p>
            <p className="mt-1 text-[var(--text-xs)] leading-5 text-[var(--color-text-secondary)]">
              Create proposals, review estimates, and manage your project pipeline.
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_88%,white)] px-4 py-4 backdrop-blur-sm lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  Ordinexa Workspace
                </p>
                <h1 className="text-[var(--text-lg)] font-semibold text-[var(--color-text-primary)]">Proposals</h1>
              </div>

              <nav className="flex flex-wrap gap-2 lg:hidden">
                {navItems.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-[var(--radius-full)] px-3 py-2 text-[var(--text-xs)] font-semibold",
                        active
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)]",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-3">
                <div className="rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)]">
                  Demo
                </div>
                <div className="hidden rounded-[var(--radius-full)] bg-[var(--color-primary-soft)] px-3 py-2 text-[var(--text-xs)] font-semibold text-[var(--color-primary-emphasis)] sm:block">
                  Workspace
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
