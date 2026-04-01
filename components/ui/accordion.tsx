"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface AccordionItemProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({
  id,
  title,
  description,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-[var(--color-surface-muted)]"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
      >
        <div className="flex-1 space-y-1">
          <h3 className="text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">
            {title}
          </h3>
          {description && (
            <p className="text-[var(--text-sm)] leading-6 text-[var(--color-text-secondary)]">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
        >
          <svg
            className="h-5 w-5 text-[var(--color-text-secondary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div
          id={`accordion-content-${id}`}
          className="border-t border-[var(--color-border)] px-5 pb-5"
        >
          <div className="pt-4 space-y-4 text-[var(--text-sm)] leading-6 text-[var(--color-text-primary)]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export interface AccordionProps {
  items?: AccordionItemProps[];
  children?: React.ReactNode;
  className?: string;
}

export function Accordion({ items, children, className }: AccordionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items ? (
        items.map((item) => (
          <AccordionItem key={item.id} {...item} />
        ))
      ) : (
        children
      )}
    </div>
  );
}
