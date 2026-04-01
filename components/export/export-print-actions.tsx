/**
 * Export Print Actions Component (ORDX-025B)
 *
 * Client component providing print/save-as-PDF functionality.
 * Hidden during actual printing to keep the output clean.
 */

"use client";

import { Button } from "@/components/ui/button";

export function ExportPrintActions() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 print:hidden">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Export Options
        </h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Print or save this proposal as a PDF
        </p>
      </div>
      <Button onClick={handlePrint} className="gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        Print / Save as PDF
      </Button>
    </div>
  );
}
