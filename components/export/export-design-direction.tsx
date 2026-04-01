/**
 * Export Design Direction Component (ORDX-024B)
 *
 * Displays the AI-generated design direction in a clean format.
 */

import type { DesignDirection } from "@/types/proposal-generation";

interface ExportDesignDirectionProps {
  content: DesignDirection;
}

export function ExportDesignDirection({ content }: ExportDesignDirectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Philosophy</h4>
        <p className="text-[var(--color-text-secondary)]">{content.philosophy}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Materials & Finishes</h4>
        <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
          {content.materialsFinishes.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Color Palette</h4>
        <p className="text-[var(--color-text-secondary)]">{content.colorPalette}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Lighting Approach</h4>
        <p className="text-[var(--color-text-secondary)]">{content.lightingApproach}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">Furniture & Equipment</h4>
        <ul className="ml-4 list-disc space-y-1 text-[var(--color-text-secondary)]">
          {content.furnitureEquipment.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
